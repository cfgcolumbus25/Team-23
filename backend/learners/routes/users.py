from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

users_bp = Blueprint('users', __name__, url_prefix='/learners')

@users_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400

    # Required fields
    required_fields = ["email", "password", "name", "zipcode"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Password validation
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    try:
        # Attempt signup
        auth_response = supabase.auth.sign_up({
            "email": data["email"],
            "password": data["password"]
        })

        # Check for errors safely
        if getattr(auth_response, "error", None):
            # Supabase sometimes puts the message directly in .error
            error_message = getattr(auth_response.error, "message", str(auth_response.error))
            return jsonify({"error": error_message}), 400

        if not getattr(auth_response, "user", None):
            return jsonify({"error": "Failed to create user"}), 400

        # Insert additional user data
        user_data = {
            "id": auth_response.user.id,
            "name": data["name"],
            "email": data["email"],
            "zipcode": data["zipcode"],
            "exams": data.get("exams", {}),
            "maxcredits": data.get("maxcredits")
        }

        insert_response = supabase.table("users").insert(user_data).execute()
        if getattr(insert_response, "error", None):
            insert_error = getattr(insert_response.error, "message", str(insert_response.error))
            return jsonify({"error": insert_error}), 500

        # Return a safe JSON-serializable user object
        user_dict = {
            "id": auth_response.user.id,
            "email": auth_response.user.email,
            "aud": auth_response.user.aud,
            "role": auth_response.user.role
        }

        return jsonify({"success": True, "user": user_dict}), 201

    except Exception as e:
        print("Error creating user:", e)
        return jsonify({"error": str(e)}), 500



@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": data["email"],
            "password": data["password"]
        })
        
        if auth_response.user:
            # Get user data from your users table
            user_data = supabase.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            return jsonify({
                "success": True,
                "session": auth_response.session,
                "user": user_data.data[0] if user_data.data else None
            }), 200
            
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("Error logging in:", e)
        return jsonify({"error": str(e)}), 500


