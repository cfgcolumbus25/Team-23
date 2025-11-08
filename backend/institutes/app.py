from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy", "service": "institutes"}), 200


# 1. Validate magic token and fetch institution data
@app.route('/institution/verify', methods=['POST'])
def verify_token():
    """
    Verify magic link token and return institution data
    
    Expected body: { "token": "uuid-string" }
    Returns: Institution info + current CLEP policies
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"error": "Token is required"}), 400
        
        # Query magic_tokens table
        token_response = supabase.table('magic_tokens').select(
            '*, institutions(*)'
        ).eq('token', token).single().execute()
        
        if not token_response.data:
            return jsonify({"error": "Invalid token"}), 404
        
        token_data = token_response.data
        
        # Check if token is expired
        expires_at = datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00'))
        if datetime.now(expires_at.tzinfo) > expires_at:
            return jsonify({"error": "Token has expired"}), 401
        
        # Check if token was already used
        if token_data.get('used_at'):
            return jsonify({"error": "Token has already been used"}), 401
        
        institution_id = token_data['institution_id']
        
        # Fetch current institution policies
        policies_response = supabase.table('institution_policies').select(
            '*'
        ).eq('institution_id', institution_id).execute()
        
        return jsonify({
            "institution": token_data['institutions'],
            "policies": policies_response.data,
            "token_id": token_data['id']
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Update institution policies
@app.route('/institution/update', methods=['POST'])
def update_policies():
    """
    Update institution CLEP policies
    
    Expected body: {
        "token": "uuid-string",
        "policies": [
            {
                "exam_code": "ENGL_101",
                "cut_score": 50,
                "credits_awarded": 3,
                "notes": "Optional notes"
            }
        ],
        "verified_by": "registrar@college.edu"
    }
    """
    try:
        data = request.get_json()
        token = data.get('token')
        policies = data.get('policies', [])
        verified_by = data.get('verified_by')
        
        if not token or not policies:
            return jsonify({"error": "Token and policies are required"}), 400
        
        # Verify token again
        token_response = supabase.table('magic_tokens').select(
            'id, institution_id, expires_at, used_at'
        ).eq('token', token).single().execute()
        
        if not token_response.data:
            return jsonify({"error": "Invalid token"}), 404
        
        token_data = token_response.data
        institution_id = token_data['institution_id']
        
        # Check expiration and usage
        expires_at = datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00'))
        if datetime.now(expires_at.tzinfo) > expires_at:
            return jsonify({"error": "Token has expired"}), 401
        
        # Delete existing policies for this institution
        supabase.table('institution_policies').delete().eq(
            'institution_id', institution_id
        ).execute()
        
        # Insert new policies
        policies_to_insert = []
        for policy in policies:
            policies_to_insert.append({
                'institution_id': institution_id,
                'exam_code': policy['exam_code'],
                'cut_score': policy['cut_score'],
                'credits_awarded': policy['credits_awarded'],
                'notes': policy.get('notes', '')
            })
        
        if policies_to_insert:
            supabase.table('institution_policies').insert(
                policies_to_insert
            ).execute()
        
        # Update institution's last_updated timestamp and verified_by
        supabase.table('institutions').update({
            'last_updated': datetime.utcnow().isoformat(),
            'verified_by': verified_by
        }).eq('id', institution_id).execute()
        
        # Mark token as used
        supabase.table('magic_tokens').update({
            'used_at': datetime.utcnow().isoformat()
        }).eq('id', token_data['id']).execute()
        
        return jsonify({
            "success": True,
            "message": "Policies updated successfully",
            "institution_id": institution_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3. Get institution by ID (for confirmation page)
@app.route('/institution/<institution_id>', methods=['GET'])
def get_institution(institution_id):
    """
    Get institution details and policies by ID
    Used for confirmation page after update
    """
    try:
        # Fetch institution
        institution_response = supabase.table('institutions').select(
            '*'
        ).eq('id', institution_id).single().execute()
        
        if not institution_response.data:
            return jsonify({"error": "Institution not found"}), 404
        
        # Fetch policies
        policies_response = supabase.table('institution_policies').select(
            '*'
        ).eq('institution_id', institution_id).execute()
        
        return jsonify({
            "institution": institution_response.data,
            "policies": policies_response.data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

