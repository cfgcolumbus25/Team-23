"""
Institution API - Handles institution account management and policy updates
Uses Supabase Auth for authentication
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase
from datetime import datetime, timedelta
from flasgger import Swagger, swag_from
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
        institution_id = membership['institution_id']
        
        acceptance = {
            "institution_id": institution_id,
            "exam_id": data.get('exam_id'),
            "cut_score": data.get('cut_score'),
            "credits": data.get('credits'),
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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

