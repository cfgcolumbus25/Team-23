import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Any, List

ZIP_REGEX = re.compile(r"^\d{5}$")
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
SCORE_REGEX = re.compile(r"^\d+$")


def is_valid_zip(zipcode: str) -> bool:
    """Validate ZIP is exactly 5 numeric digits."""
    return bool(ZIP_REGEX.match(zipcode))


def is_valid_email(email: str) -> bool:
    """Check email for general validity."""
    return bool(EMAIL_REGEX.match(email))


def is_valid_score(score: str | int) -> bool:
    """Scores must be numeric between CLEP range (20 to 80)."""
    try:
        val = int(score)
        return 20 <= val <= 80
    except Exception:
        return False


def validate_onboarding_payload(payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate the onboarding payload for name, email, zip, exam scores.
    Returns: dict of field->error message. Empty dict = valid
    """
    errors: Dict[str, str] = {}

    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()
    zipcode = payload.get("zip", "")
    exams = payload.get("exams", [])
    scores = payload.get("scores", {})

    if not name:
        errors["name"] = "Name is required"

    if not email:
        errors["email"] = "Email is required"
    elif not is_valid_email(email):
        errors["email"] = "Invalid email format"

    if not zipcode or not is_valid_zip(zipcode):
        errors["zip"] = "ZIP must be 5 digits"

    for exam in exams:
        val = scores.get(exam)
        if val is None or val == "":
            # optional, but allowed
            continue
        if not is_valid_score(val):
            errors[f"score_{exam}"] = "Score must be numeric between 20 and 80"

    return errors


def freshness(timestamp_str: Optional[str]) -> str:
    if not timestamp_str:
        return "old"

    try:
        dt = datetime.fromisoformat(timestamp_str.replace(" ", "T"))
        now = datetime.now(timezone.utc)
        delta = now - dt.replace(tzinfo=timezone.utc)

        if delta.days <= 180:
            return "fresh"
        if delta.days <= 365:
            return "stale"
        return "old"
    except Exception:
        return "old"


def map_exam_names_to_eids(
    exams_table: List[Dict], scores_dict: Dict[str, int]
) -> Dict[int, int]:
    name_to_eid = {row["name"]: row["eid"] for row in exams_table}

    result: Dict[int, int] = {}
    for exam_name, score in scores_dict.items():
        if exam_name in name_to_eid:
            result[name_to_eid[exam_name]] = int(score)

    return result


def safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:
        return default


def filter_by_zip_or_state(
    inst: Dict, zipcode: Optional[str], state: Optional[str]
) -> bool:
    if zipcode:
        if inst.get("zip") != zipcode:
            return False

    if state:
        if inst.get("state") != state:
            return False

    return True
