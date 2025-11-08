from dotenv import load_dotenv
load_dotenv()

import os
from flask import Blueprint, jsonify
from supabase_client import supabase
from utils.token import generate_magic_token
from utils.email import send_magic_link

bp = Blueprint("send_verification", __name__)

@bp.route("/api/send-verification", methods=["POST"])
def send_verification():
    """Send magic links to institution contacts needing verification."""
    try:
        result = supabase.table("contacts")\
            .select("id, email, first_name, institution_id, institutions(name)")\
            .limit(5)\
            .execute()

        contacts = result.data or []
        sent, errors = 0, []

        for c in contacts:
            if not c["email"]:
                continue
            token = generate_magic_token({
                "institution_id": c["institution_id"],
                "contact_id": c["id"]
            })
            link = f"{os.getenv('FRONTEND_BASE_URL')}/verify?token={token}"

            if send_magic_link(c["email"], link, c["institutions"]["name"]):
                sent += 1
            else:
                errors.append(c["email"])

        return jsonify({
            "contacts_processed": len(contacts),
            "emails_sent": sent,
            "errors": errors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
