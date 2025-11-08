"""
Institution API - Handles institution account management and policy updates
Uses Supabase Auth for authentication
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase
from datetime import datetime, timedelta
from flasgger import Swagger, swag_from
from utils.email import send_email
import os
import secrets

app = Flask(__name__)
CORS(app)

# Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "CLEPBridge Institution API",
        "description": "API for institutions to manage their CLEP exam acceptances. Institutions create accounts and login to manage which CLEP exams they accept.",
        "version": "1.0.0",
        "contact": {
            "name": "Team-23",
            "url": "https://github.com/team-23/clepbridge"
        }
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
        }
    },
    "tags": [
        {
            "name": "Authentication",
            "description": "Endpoints for user signup, login, and session management"
        },
        {
            "name": "Acceptances",
            "description": "CRUD operations for CLEP exam acceptances (requires authentication)"
        },
        {
            "name": "Health",
            "description": "Service health check"
        }
    ]
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_user():
    """Extract user from JWT token in Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    try:
        user = supabase.auth.get_user(token)
        return user.user if user else None
    except:
        return None


def get_institution_membership(user_id):
    """Get institution membership for a user"""
    try:
        result = supabase.table('institution_members').select(
            '*, institutions(*)'
        ).eq('user_id', user_id).single().execute()
        return result.data
    except:
        return None


def require_platform_admin(f):
    """Decorator to require platform_admin role for a route"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        if not membership or membership.get('role') != 'platform_admin':
            return jsonify({"error": "Platform admin access required"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/auth/signup', methods=['POST'])
def signup():
    """Create new institution account
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
            - institution_id
          properties:
            email:
              type: string
              example: registrar@college.edu
            password:
              type: string
              example: SecurePass123
            institution_id:
              type: string
              example: 149fcabb-3d3b-46de-bf3c-9c368a120d1c
            first_name:
              type: string
              example: John
            last_name:
              type: string
              example: Smith
            title:
              type: string
              example: Registrar
            phone:
              type: string
              example: 555-1234
    responses:
      201:
        description: Account created successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            user:
              type: object
            session:
              type: object
      400:
        description: Missing required fields
      404:
        description: Institution not found
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        institution_id = data.get('institution_id')
        
        if not email or not password or not institution_id:
            return jsonify({"error": "Email, password, and institution_id required"}), 400
        
        # Verify institution exists
        inst = supabase.table('institutions').select('id, name').eq(
            'id', institution_id
        ).single().execute()
        
        if not inst.data:
            return jsonify({"error": "Institution not found"}), 404
        
        # Create Supabase Auth user
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if not auth_response.user:
            return jsonify({"error": "Failed to create account"}), 500
        
        user_id = auth_response.user.id
        
        # Link user to institution in institution_members table
        member_data = {
            "institution_id": institution_id,
            "user_id": user_id,
            "role": "admin",  # First user is admin
            "first_name": data.get('first_name'),
            "last_name": data.get('last_name'),
            "title": data.get('title'),
            "phone": data.get('phone'),
            "created_via": "manual"
        }
        
        supabase.table('institution_members').insert(member_data).execute()
        
        response_data = {
            "success": True,
            "message": "Account created successfully",
            "user": {
                "id": user_id,
                "email": email,
                "institution": inst.data['name']
            }
        }
        
        # Add session if available (not available if email confirmation required)
        if auth_response.session:
            response_data["session"] = {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }
        else:
            response_data["message"] = "Account created. Please check your email to confirm."
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/auth/login', methods=['POST'])
def login():
    """Login institution user
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: admin@sunybuffalo.edu
            password:
              type: string
              example: TestPass123!
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            success:
              type: boolean
            user:
              type: object
            session:
              type: object
              properties:
                access_token:
                  type: string
                refresh_token:
                  type: string
      400:
        description: Missing credentials
      401:
        description: Invalid credentials
      403:
        description: User not linked to institution
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if not auth_response.user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        user_id = auth_response.user.id
        
        # Get institution membership
        membership = get_institution_membership(user_id)
        
        if not membership:
            return jsonify({"error": "User not linked to any institution"}), 403
        
        return jsonify({
            "success": True,
            "user": {
                "id": user_id,
                "email": email,
                "role": membership['role'],
                "institution": membership['institutions']
            },
            "session": {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/auth/logout', methods=['POST'])
def logout():
    """Logout institution user
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
      401:
        description: Not authenticated
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        supabase.auth.sign_out()
        return jsonify({"success": True, "message": "Logged out"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/auth/me', methods=['GET'])
def get_current_user_info():
    """Get current logged-in user info
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: User info retrieved successfully
        schema:
          type: object
          properties:
            user:
              type: object
              properties:
                id:
                  type: string
                email:
                  type: string
                role:
                  type: string
                institution:
                  type: object
      401:
        description: Not authenticated
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        
        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "role": membership['role'] if membership else None,
                "institution": membership['institutions'] if membership else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# INSTITUTION ACCEPTANCES CRUD ENDPOINTS (Authenticated)
# ============================================================================

@app.route('/institution/acceptances', methods=['GET'])
def get_my_acceptances():
    """Get current institution's CLEP acceptances
    ---
    tags:
      - Acceptances
    security:
      - Bearer: []
    responses:
      200:
        description: Acceptances retrieved successfully
        schema:
          type: object
          properties:
            institution:
              type: object
            acceptances:
              type: array
              items:
                type: object
      401:
        description: Not authenticated
      403:
        description: Not linked to institution
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        if not membership:
            return jsonify({"error": "Not linked to institution"}), 403
        
        institution_id = membership['institution_id']
        
        # Fetch acceptances
        acceptances = supabase.table('acceptances').select(
            '*, exams(id, name)'
        ).eq('institution_id', institution_id).execute()
        
        return jsonify({
            "institution": membership['institutions'],
            "acceptances": acceptances.data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/institution/acceptances', methods=['POST'])
def add_acceptance():
    """Add a new CLEP exam acceptance
    ---
    tags:
      - Acceptances
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - exam_id
            - cut_score
            - credits
          properties:
            exam_id:
              type: integer
              example: 14
              description: CLEP exam ID (1-38)
            cut_score:
              type: integer
              example: 50
              description: Minimum score required (20-80)
            credits:
              type: integer
              example: 3
              description: Number of credits awarded
            related_course:
              type: string
              example: "FREN 102"
              description: Course this CLEP exam replaces
    responses:
      201:
        description: Acceptance added successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            acceptance:
              type: object
      400:
        description: Missing required fields
      401:
        description: Not authenticated
      403:
        description: Insufficient permissions (requires admin or editor role)
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        if not membership:
            return jsonify({"error": "Not linked to institution"}), 403
        
        if membership['role'] not in ['admin', 'editor']:
            return jsonify({"error": "Insufficient permissions"}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "Request body required"}), 400
        
        exam_id = data.get('exam_id')
        cut_score = data.get('cut_score')
        credits = data.get('credits')
        
        if exam_id is None:
            return jsonify({"error": "exam_id is required"}), 400
        if cut_score is None:
            return jsonify({"error": "cut_score is required"}), 400
        if credits is None:
            return jsonify({"error": "credits is required"}), 400
        
        # Validate data types and ranges
        try:
            exam_id = int(exam_id)
            cut_score = int(cut_score)
            credits = int(credits)
        except (ValueError, TypeError):
            return jsonify({"error": "exam_id, cut_score, and credits must be integers"}), 400
        
        if not (1 <= exam_id <= 38):
            return jsonify({"error": "exam_id must be between 1 and 38"}), 400
        
        if not (20 <= cut_score <= 80):
            return jsonify({"error": "cut_score must be between 20 and 80"}), 400
        
        if credits < 0:
            return jsonify({"error": "credits must be a positive number"}), 400
        
        institution_id = membership['institution_id']
        
        acceptance = {
            "institution_id": institution_id,
            "exam_id": exam_id,
            "cut_score": cut_score,
            "credits": credits,
            "related_course": data.get('related_course', ''),
            "updated_by_contact_id": None  # Could link to institution_members
        }
        
        result = supabase.table('acceptances').insert(acceptance).execute()
        
        # Update institution's last_updated
        supabase.table('institutions').update({
            'last_updated': datetime.utcnow().isoformat(),
            'verified_by': user.email
        }).eq('id', institution_id).execute()
        
        return jsonify({
            "success": True,
            "acceptance": result.data[0]
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/institution/acceptances/<acceptance_id>', methods=['PUT'])
def update_acceptance(acceptance_id):
    """Update an existing acceptance
    ---
    tags:
      - Acceptances
    security:
      - Bearer: []
    parameters:
      - name: acceptance_id
        in: path
        required: true
        type: string
        description: UUID of the acceptance to update
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            cut_score:
              type: integer
              example: 55
              description: Minimum score required (20-80)
            credits:
              type: integer
              example: 4
              description: Number of credits awarded
            related_course:
              type: string
              example: "FREN 103"
              description: Course this CLEP exam replaces
    responses:
      200:
        description: Acceptance updated successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            acceptance:
              type: object
      401:
        description: Not authenticated
      403:
        description: Insufficient permissions (requires admin or editor role)
      404:
        description: Acceptance not found
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        if not membership or membership['role'] not in ['admin', 'editor']:
            return jsonify({"error": "Insufficient permissions"}), 403
        
        data = request.get_json()
        institution_id = membership['institution_id']
        
        # Verify acceptance belongs to this institution
        acceptance = supabase.table('acceptances').select('*').eq(
            'id', acceptance_id
        ).eq('institution_id', institution_id).single().execute()
        
        if not acceptance.data:
            return jsonify({"error": "Acceptance not found"}), 404
        
        updates = {}
        if 'cut_score' in data:
            updates['cut_score'] = data['cut_score']
        if 'credits' in data:
            updates['credits'] = data['credits']
        if 'related_course' in data:
            updates['related_course'] = data['related_course']
        
        result = supabase.table('acceptances').update(updates).eq(
            'id', acceptance_id
        ).execute()
        
        # Update institution's last_updated
        supabase.table('institutions').update({
            'last_updated': datetime.utcnow().isoformat(),
            'verified_by': user.email
        }).eq('id', institution_id).execute()
        
        return jsonify({"success": True, "acceptance": result.data[0]}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/institution/acceptances/<acceptance_id>', methods=['DELETE'])
def delete_acceptance(acceptance_id):
    """Delete an acceptance
    ---
    tags:
      - Acceptances
    security:
      - Bearer: []
    parameters:
      - name: acceptance_id
        in: path
        required: true
        type: string
        description: UUID of the acceptance to delete
    responses:
      200:
        description: Acceptance deleted successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
      401:
        description: Not authenticated
      403:
        description: Admin access required
      404:
        description: Acceptance not found
      500:
        description: Server error
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        
        membership = get_institution_membership(user.id)
        if not membership or membership['role'] != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        institution_id = membership['institution_id']
        
        # Verify acceptance belongs to this institution
        acceptance = supabase.table('acceptances').select('*').eq(
            'id', acceptance_id
        ).eq('institution_id', institution_id).single().execute()
        
        if not acceptance.data:
            return jsonify({"error": "Acceptance not found"}), 404
        
        supabase.table('acceptances').delete().eq('id', acceptance_id).execute()
        
        # Update institution's last_updated
        supabase.table('institutions').update({
            'last_updated': datetime.utcnow().isoformat(),
            'verified_by': user.email
        }).eq('id', institution_id).execute()
        
        return jsonify({"success": True, "message": "Acceptance deleted"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: Service is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            service:
              type: string
              example: institutions
    """
    return jsonify({"status": "healthy", "service": "institutions"}), 200


# ============================================================================
# EMAIL TEST ENDPOINT
# ============================================================================

@app.route('/email/test', methods=['POST'])
def test_email():
    """
    Test email sending functionality
    ---
    tags:
      - Health
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - to
          properties:
            to:
              type: string
              example: test@example.com
              description: Recipient email address
    responses:
      200:
        description: Email sent successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
      400:
        description: Email address required
      500:
        description: Failed to send email
    """
    try:
        data = request.get_json()
        to_email = data.get('to')
        
        if not to_email:
            return jsonify({"error": "Email address required"}), 400
        
        # Send test email
        success = send_email(
            to_email=to_email,
            subject="Test Email from CLEP Bridge",
            body="This is a test email to verify the email service is working correctly."
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": f"Test email sent to {to_email}"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Failed to send test email. Check logs for details."
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# ADMIN ENDPOINTS (Platform Admin Only)
# ============================================================================

@app.route('/admin/institutions', methods=['GET'])
@require_platform_admin
def get_admin_institutions():
    """Get list of all institutions with filters (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: state
        in: query
        type: string
        description: Filter by state (e.g., NY, CA)
      - name: last_updated_before
        in: query
        type: string
        description: Filter institutions last updated before this date (ISO format)
      - name: last_updated_after
        in: query
        type: string
        description: Filter institutions last updated after this date (ISO format)
      - name: limit
        in: query
        type: integer
        description: Limit number of results (default 100)
    responses:
      200:
        description: List of institutions
        schema:
          type: object
          properties:
            institutions:
              type: array
              items:
                type: object
            total:
              type: integer
      403:
        description: Not authorized (platform admin required)
    """
    try:
        # Build query
        query = supabase.table('institutions').select('*')
        
        # Apply filters
        state = request.args.get('state')
        if state:
            query = query.eq('state', state)
        
        last_updated_before = request.args.get('last_updated_before')
        if last_updated_before:
            query = query.lt('last_updated', last_updated_before)
        
        last_updated_after = request.args.get('last_updated_after')
        if last_updated_after:
            query = query.gt('last_updated', last_updated_after)
        
        # Apply limit
        limit = request.args.get('limit', 100, type=int)
        query = query.limit(limit)
        
        # Execute query
        result = query.execute()
        
        return jsonify({
            "institutions": result.data,
            "total": len(result.data)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/acceptances/feedback', methods=['GET'])
@require_platform_admin
def get_acceptances_feedback():
    """Get CLEP acceptances sorted by feedback (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: sort_by
        in: query
        type: string
        description: Sort by 'dislikes' (default), 'likes', or 'dislike_ratio'
      - name: limit
        in: query
        type: integer
        description: Limit number of results (default 50)
    responses:
      200:
        description: List of acceptances with feedback
        schema:
          type: object
          properties:
            acceptances:
              type: array
              items:
                type: object
      403:
        description: Not authorized (platform admin required)
    """
    try:
        sort_by = request.args.get('sort_by', 'dislikes')
        limit = request.args.get('limit', 50, type=int)
        
        # Get acceptances with institution and exam details
        result = supabase.table('acceptances').select(
            '*, institutions(id, name, city, state), exams(id, name)'
        ).limit(limit).execute()
        
        acceptances = result.data
        
        # Calculate dislike ratio and sort
        for acceptance in acceptances:
            total_votes = acceptance['likes'] + acceptance['dislikes']
            acceptance['total_votes'] = total_votes
            acceptance['dislike_ratio'] = (
                acceptance['dislikes'] / total_votes if total_votes > 0 else 0
            )
        
        # Sort based on parameter
        if sort_by == 'likes':
            acceptances.sort(key=lambda x: x['likes'], reverse=True)
        elif sort_by == 'dislike_ratio':
            acceptances.sort(key=lambda x: x['dislike_ratio'], reverse=True)
        else:  # default to dislikes
            acceptances.sort(key=lambda x: x['dislikes'], reverse=True)
        
        return jsonify({"acceptances": acceptances}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/email/send', methods=['POST'])
@require_platform_admin
def send_bulk_emails():
    """Send magic link emails to selected institutions (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - institution_ids
          properties:
            institution_ids:
              type: array
              items:
                type: string
              description: Array of institution UUIDs to send emails to
            base_url:
              type: string
              description: Base URL for magic links (default from env)
    responses:
      200:
        description: Emails sent successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            sent_count:
              type: integer
            failed_count:
              type: integer
            details:
              type: array
      403:
        description: Not authorized (platform admin required)
    """
    try:
        from utils.email_templates import create_reminder_email
        
        data = request.get_json()
        institution_ids = data.get('institution_ids', [])
        portal_url = data.get('portal_url', os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000'))
        
        print(f"[DEBUG] portal_url value: '{portal_url}'")
        print(f"[DEBUG] FRONTEND_BASE_URL env: '{os.getenv('FRONTEND_BASE_URL')}'")
        
        if not institution_ids:
            return jsonify({"error": "institution_ids required"}), 400
        
        user = get_current_user()
        sent_count = 0
        failed_count = 0
        details = []
        
        for inst_id in institution_ids:
            try:
                # Get institution details
                inst = supabase.table('institutions').select('*').eq('id', inst_id).single().execute()
                
                if not inst.data:
                    details.append({"institution_id": inst_id, "status": "failed", "error": "Institution not found"})
                    failed_count += 1
                    continue
                
                institution = inst.data
                
                # Get primary contact email
                contact = supabase.table('contacts').select('email, first_name, last_name').eq(
                    'institution_id', inst_id
                ).limit(1).execute()
                
                recipient_email = contact.data[0]['email'] if contact.data else None
                contact_name = f"{contact.data[0]['first_name']} {contact.data[0]['last_name']}" if contact.data else None
                
                if not recipient_email:
                    details.append({"institution_id": inst_id, "status": "failed", "error": "No contact email found"})
                    failed_count += 1
                    continue
                
                # Generate email content
                subject, text_body, html_body = create_reminder_email(
                    institution['name'],
                    portal_url,
                    contact_name
                )
                
                # Send email
                print(f"[DEBUG] About to send email to {recipient_email} with subject: {subject}")
                success = send_email(
                    to_email=recipient_email,
                    subject=subject,
                    body=text_body,
                    html_body=html_body
                )
                print(f"[DEBUG] Email send result: {success}")
                
                if success:
                    # Log sent email
                    supabase.table('sent_emails').insert({
                        'institution_id': inst_id,
                        'sent_to': recipient_email,
                        'subject': subject,
                        'body': text_body,
                        'sent_by': user.id
                    }).execute()
                    
                    details.append({"institution_id": inst_id, "status": "sent", "email": recipient_email})
                    sent_count += 1
                else:
                    details.append({"institution_id": inst_id, "status": "failed", "error": "Email service error"})
                    failed_count += 1
                    
            except Exception as e:
                details.append({"institution_id": inst_id, "status": "failed", "error": str(e)})
                failed_count += 1
        
        return jsonify({
            "success": True,
            "sent_count": sent_count,
            "failed_count": failed_count,
            "details": details
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/email/history', methods=['GET'])
@require_platform_admin
def get_email_history():
    """Get history of sent emails (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        description: Limit number of results (default 50)
      - name: institution_id
        in: query
        type: string
        description: Filter by institution UUID
    responses:
      200:
        description: Email history
        schema:
          type: object
          properties:
            emails:
              type: array
              items:
                type: object
      403:
        description: Not authorized (platform admin required)
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        institution_id = request.args.get('institution_id')
        
        # Build query
        query = supabase.table('sent_emails').select(
            '*, institutions(id, name, city, state)'
        ).order('sent_at', desc=True).limit(limit)
        
        # Apply institution filter if provided
        if institution_id:
            query = query.eq('institution_id', institution_id)
        
        result = query.execute()
        
        return jsonify({"emails": result.data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# LEARNER FEEDBACK ENDPOINTS
# ============================================================================

@app.route('/acceptances/<acceptance_id>/like', methods=['POST'])
def like_acceptance(acceptance_id):
    """Increment likes for an acceptance
    ---
    tags:
      - Feedback
    parameters:
      - name: acceptance_id
        in: path
        required: true
        type: string
        description: UUID of the acceptance
    responses:
      200:
        description: Like recorded successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            likes:
              type: integer
      404:
        description: Acceptance not found
    """
    try:
        # Get current likes count
        acceptance = supabase.table('acceptances').select('likes').eq(
            'id', acceptance_id
        ).single().execute()
        
        if not acceptance.data:
            return jsonify({"error": "Acceptance not found"}), 404
        
        # Increment likes
        new_likes = acceptance.data['likes'] + 1
        result = supabase.table('acceptances').update({
            'likes': new_likes
        }).eq('id', acceptance_id).execute()
        
        return jsonify({
            "success": True,
            "likes": new_likes
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/acceptances/<acceptance_id>/dislike', methods=['POST'])
def dislike_acceptance(acceptance_id):
    """Increment dislikes for an acceptance
    ---
    tags:
      - Feedback
    parameters:
      - name: acceptance_id
        in: path
        required: true
        type: string
        description: UUID of the acceptance
    responses:
      200:
        description: Dislike recorded successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            dislikes:
              type: integer
      404:
        description: Acceptance not found
    """
    try:
        # Get current dislikes count
        acceptance = supabase.table('acceptances').select('dislikes').eq(
            'id', acceptance_id
        ).single().execute()
        
        if not acceptance.data:
            return jsonify({"error": "Acceptance not found"}), 404
        
        # Increment dislikes
        new_dislikes = acceptance.data['dislikes'] + 1
        result = supabase.table('acceptances').update({
            'dislikes': new_dislikes
        }).eq('id', acceptance_id).execute()
        
        return jsonify({
            "success": True,
            "dislikes": new_dislikes
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

