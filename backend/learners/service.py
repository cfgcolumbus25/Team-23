from datetime import datetime, timedelta, timezone
from typing import List, Optional
from supabase_client import supabase
from .models import LearnerCreate, LearnerExam, InstitutionHit, Favorite


def _freshness(ts: Optional[str]) -> str:
    if ts is None:
        return "old"
    dt = datetime.fromisoformat(ts.replace(" ", "T"))
    now = datetime.now(timezone.utc)
    delta = now - dt.replace(tzinfo=timezone.utc)
    if delta <= timedelta(days=180):
        return "fresh"
    if delta <= timedelta(days=365):
        return "stale"
    return "old"


async def create_or_update_learner(payload: LearnerCreate):
    result = (
        supabase.table("learners")
        .upsert(
            {
                "auth_uid": payload.auth_uid,
                "name": payload.name,
                "email": payload.email,
                "zipcode": payload.zipcode,
            }
        )
        .select("*")
        .execute()
    )

    return result.data[0]


async def get_learner(auth_uid: str):
    q = supabase.table("learners").select("*").eq("auth_uid", auth_uid).execute()
    if q.data:
        return q.data[0]
    return None


async def upsert_learner_exams(learner_id: int, exams: List[LearnerExam]):
    rows = []
    for e in exams:
        rows.append({"learner_id": learner_id, "eid": e.eid, "score": e.score})
    supabase.table("learner_exams").upsert(rows).execute()
    return len(rows)


async def search_matches(
    learner_id: int,
    exams: List[LearnerExam],
    zipcode: Optional[str],
    state: Optional[str],
) -> List[InstitutionHit]:
    exam_ids = [e.eid for e in exams]
    acceptance = (
        supabase.table("acceptance").select("*").in_("eid", exam_ids).execute().data
    )

    score_map = {e.eid: e.score for e in exams}

    matched_acceptance = []
    for a in acceptance:
        learner_score = score_map.get(a["eid"])
        if learner_score is not None and learner_score >= a["cut_score"]:
            matched_acceptance.append({**a, "learner_score": learner_score})

    if not matched_acceptance:
        return []

    org_ids = list({a["msea_org_id"] for a in matched_acceptance})
    inst_rows = (
        supabase.table("institutions")
        .select("*")
        .in_("msea_org_id", org_ids)
        .execute()
        .data
    )

    inst_map = {i["msea_org_id"]: i for i in inst_rows}

    eid_list = [a["eid"] for a in matched_acceptance]
    exam_info = supabase.table("exams").select("*").in_("eid", eid_list).execute().data
    exam_map = {e["eid"]: e["name"] for e in exam_info}

    results = []
    for acc in matched_acceptance:
        inst = inst_map.get(acc["msea_org_id"])
        if not inst:
            continue

        if zipcode and inst["zip"] != zipcode:
            continue
        if state and inst["state"] != state:
            continue

        results.append(
            InstitutionHit(
                msea_org_id=acc["msea_org_id"],
                name=inst["name"],
                city=inst["city"],
                state=inst["state"],
                zip=inst["zip"],
                eid=acc["eid"],
                exam_name=exam_map.get(acc["eid"], "Unknown"),
                required_cut=acc["cut_score"],
                learner_score=acc["learner_score"],
                credits=acc["credits"],
                related_course=acc.get("related_course"),
                last_updated=acc.get("last_updated"),
                freshness=_freshness(acc.get("last_updated")),
                can_use_for_failed_courses=inst.get("can_use_for_failed_courses"),
                can_enrolled_students_use_clep=inst.get(
                    "can_enrolled_students_use_clep"
                ),
            )
        )

    return results


async def save_favorite(learner_id: int, msea_org_id: str):
    supabase.table("favorites").upsert(
        {"learner_id": learner_id, "msea_org_id": msea_org_id}
    ).execute()


async def list_favorites(learner_id: int) -> List[Favorite]:
    favs = (
        supabase.table("favorites")
        .select("*")
        .eq("learner_id", learner_id)
        .execute()
        .data
    )
    if not favs:
        return []

    org_ids = [f["msea_org_id"] for f in favs]
    inst = (
        supabase.table("institutions")
        .select("*")
        .in_("msea_org_id", org_ids)
        .execute()
        .data
    )

    return [Favorite(**i) for i in inst]
