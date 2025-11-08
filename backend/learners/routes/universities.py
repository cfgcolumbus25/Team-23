from flask import Blueprint, jsonify
from services.supabase_client import supabase
from typing import List, Dict, Any

universities_bp = Blueprint("universities", __name__, url_prefix='api/universities')


@universities_bp.route("", methods=["GET"])
def list_universities():
    try:
        response = supabase.table("institutions").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500