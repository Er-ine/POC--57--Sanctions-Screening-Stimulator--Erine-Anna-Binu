from typing import Any, Dict, List
from rapidfuzz import fuzz, process


def screen_name(cur, name: str, threshold: float = 70.0) -> Dict[str, Any]:
    """
    Screen a single counterparty name against the OFAC sanctions list.
    Uses RapidFuzz token_sort_ratio to catch reorderings, typos, and variants.
    """
    sanctioned_df = cur.execute(
        "SELECT name, sdn_uid, sdn_type, program FROM sanctions_list"
    ).df()
    sanctioned_names = sanctioned_df["name"].tolist()

    if not name or not name.strip():
        return {
            "query": name,
            "matches": [],
            "match_found": False,
            "confidence_score": 0.0,
            "explainability": "Empty or whitespace-only query provided.",
        }

    matches = process.extract(
        name.strip(), sanctioned_names, scorer=fuzz.token_sort_ratio, limit=5
    )

    results = []
    meta_lookup = sanctioned_df.set_index("name").to_dict(orient="index")

    for m in matches:
        matched_name = m[0]
        score = round(float(m[1]), 1)
        meta = meta_lookup.get(matched_name, {})
        results.append(
            {
                "matched_name": matched_name,
                "score": score,
                "above_threshold": score >= threshold,
                "sdn_uid": meta.get("sdn_uid", ""),
                "sdn_type": meta.get("sdn_type", ""),
                "program": meta.get("program", ""),
            }
        )

    top = results[0] if results else None

    return {
        "query": name,
        "matches": results,
        "match_found": bool(top and top["above_threshold"]),
        "confidence_score": top["score"] if top else 0.0,
        "explainability": _explain(name, top)
        if top
        else "No candidates found in sanctions list.",
    }


def _explain(query: str, top: Dict[str, Any] | None) -> str:
    if not top:
        return "No candidates found in sanctions list."
    score = top["score"]
    matched = top["matched_name"]
    if score >= 95:
        return f"Near-exact match to '{matched}' ({score}%) — high confidence flag. Immediate compliance escalation recommended."
    elif score >= 70:
        return f"Partial similarity to '{matched}' ({score}%) — potential transliteration, alias, or spelling variant. Manual compliance review recommended."
    elif score >= 50:
        return f"Moderate lexical overlap with '{matched}' ({score}%) — below default threshold. Candidate flagged only if threshold lowered."
    else:
        return f"Low similarity to closest candidate '{matched}' ({score}%) — likely benign entity. Cleared under standard risk appetite."


def screen_all_counterparties(cur, threshold: float = 70.0) -> List[Dict[str, Any]]:
    """
    Screen all synthetic counterparties in the database against the OFAC list.
    Enriches with confidence scores, match candidate names, and reviewer decisions.
    """
    counterparties = cur.execute(
        "SELECT id, name, decision, reviewer_notes, decision_timestamp FROM counterparties ORDER BY id ASC"
    ).df()
    sanctioned = cur.execute("SELECT name FROM sanctions_list").df()["name"].tolist()

    cases = []
    for _, row in counterparties.iterrows():
        name = row["name"]
        matches = process.extract(
            name, sanctioned, scorer=fuzz.token_sort_ratio, limit=3
        )
        top = matches[0] if matches else None
        score = round(float(top[1]), 1) if top else 0.0
        match_found = bool(top and score >= threshold)
        top_dict = {"matched_name": top[0], "score": score} if top else None
        explainability = _explain(name, top_dict)

        auto_status = "escalated" if match_found else "cleared"
        persisted_decision = row.get("decision")
        if not persisted_decision or persisted_decision == "pending":
            effective_status = auto_status
        else:
            effective_status = persisted_decision

        cases.append(
            {
                "id": int(row["id"]),
                "name": name,
                "matched_name": top[0] if top else "None",
                "confidence_score": score,
                "status": effective_status,
                "auto_status": auto_status,
                "decision": persisted_decision or "pending",
                "reviewer_notes": row.get("reviewer_notes") or "",
                "decision_timestamp": row.get("decision_timestamp"),
                "explainability": explainability,
            }
        )
    return cases
