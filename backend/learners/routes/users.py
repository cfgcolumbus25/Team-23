from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from models import User

users_bp = Blueprint('users', __name__, url_prefix='/learners/login')

@users_bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()
    try:
        user = User(**data)
    except TypeError as e:
        return jsonify({"error": f"Invalid data: {e}"}), 400
    if not data:
        return jsonify({"error": "missing json"}), 400

    try:
        # insert into Supabase
        response = supabase.table("learners").insert({
            "name": data.get("name"),
            "email": data.get("email"),
            "location": data.get("location"),
            "scores": data.get("scores")
        }).execute()

        return jsonify({"success": True, "row": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500