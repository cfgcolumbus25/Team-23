from fastapi import APIRouter, Header, HTTPException
from ...learners.services.supabase_service import supabase
from ...learners.models import LearnerExamRequest, SearchRequest, FavoriteRequest
from ...learners.config import settings
import jwt
import datetime

router = APIRouter(prefix="/learners", tags=["learners"])


def decode_supabase_jwt(auth_header: str) -> str:
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(401, "Missing Authorization Header")

    token = auth_header.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.SUPABASE_JWT_AUD,
        )
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid JWT")


@router.get("/exams")
def list_exams():
    res = supabase.table("exams").select("*").execute()
    return res.data


@router.post("/exams")
def save_learner_exams(payload: LearnerExamRequest, authorization: str = Header(...)):
    user_id = decode_supabase_jwt(authorization)

    rows = [{"user_id": user_id, "eid": e.eid, "score": e.score} for e in payload.exams]

    supabase.table("learner_exams").upsert(rows, on_conflict="user_id,eid").execute()

    return {"status": "saved", "count": len(rows)}


@router.post("/matches")
def get_matches(body: SearchRequest, authorization: str = Header(...)):
    user_id = decode_supabase_jwt(authorization)

    exam_ids = [e.eid for e in body.exams]
    scores = {e.eid: e.score for e in body.exams}

    acceptance = (
        supabase.table("acceptance").select("*").in_("eid", exam_ids).execute().data
    )

    final_rows = []
    for row in acceptance:
        if scores[row["eid"]] < row["cut_score"]:
            continue
        row["learner_score"] = scores[row["eid"]]
        final_rows.append(row)

    if not final_rows:
        return []

    inst_ids = list({a["msea_org_id"] for a in final_rows})
    institutions = (
        supabase.table("institutions")
        .select("*")
        .in_("msea_org_id", inst_ids)
        .execute()
        .data
    )

    inst_map = {i["msea_org_id"]: i for i in institutions}
    exams = supabase.table("exams").select("*").in_("eid", exam_ids).execute().data
    exam_map = {e["eid"]: e["name"] for e in exams}

    results = []
    for row in final_rows:
        inst = inst_map.get(row["msea_org_id"])
        if not inst:
            continue

        if body.zipcode and inst["zip"] != body.zipcode:
            continue

        def freshness(ts):
            if not ts:
                return "old"
            dt = datetime.datetime.fromisoformat(ts.replace(" ", "T"))
            delta = datetime.datetime.now() - dt
            if delta.days < 180:
                return "fresh"
            elif delta.days < 365:
                return "stale"
            return "old"

        results.append(
            {
                "msea_org_id": inst["msea_org_id"],
                "name": inst["name"],
                "city": inst["city"],
                "state": inst["state"],
                "zip": inst["zip"],
                "eid": row["eid"],
                "exam_name": exam_map.get(row["eid"]),
                "required_cut": row["cut_score"],
                "learner_score": row["learner_score"],
                "credits": row["credits"],
                "related_course": row["related_course"],
                "last_updated": row["last_updated"],
                "freshness": freshness(row["last_updated"]),
            }
        )

    return results


@router.get("/favorites")
def get_favorites(authorization: str = Header(...)):
    user_id = decode_supabase_jwt(authorization)
    res = (
        supabase.table("favorites")
        .select("msea_org_id, institutions(name, city, state, zip)")
        .eq("user_id", user_id)
        .execute()
    )
    return res.data or []


@router.post("/favorites")
def add_favorite(payload: FavoriteRequest, authorization: str = Header(...)):
    user_id = decode_supabase_jwt(authorization)
    supabase.table("favorites").upsert(
        {"user_id": user_id, "msea_org_id": payload.msea_org_id},
        on_conflict="user_id,msea_org_id",
    ).execute()
    return {"status": "added"}


@router.delete("/favorites/{msea_org_id}")
def delete_favorite(msea_org_id: str, authorization: str = Header(...)):
    user_id = decode_supabase_jwt(authorization)
    supabase.table("favorites").delete().match(
        {"user_id": user_id, "msea_org_id": msea_org_id}
    ).execute()
    return {"status": "removed"}
