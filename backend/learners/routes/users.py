from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from models import User

users_bp = Blueprint('users', __name__, url_prefix='/learners/login')

@users_bp.route('/login', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "missing JSON"}), 400

    try:
        
        row = {
            "name": data.get("name"),
            "email": data.get("email"),
            "zipcode": data.get("zip"),        
            "exams": data.get("exams", {}),   
            "maxcredits": data.get("maxcredits") 
        }
        response = supabase.table("users").insert(row).execute()
        return jsonify({"success": True, "row": response.data}), 201

    except Exception as e:
        print("Error inserting user:", e)
        return jsonify({"error": str(e)}), 500


