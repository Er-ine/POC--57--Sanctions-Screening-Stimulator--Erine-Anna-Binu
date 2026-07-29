from rapidfuzz import fuzz, process
import duckdb


def screen_name(con: duckdb.DuckDBPyConnection, name: str, threshold: float = 70.0):
    sanctioned = con.execute("SELECT name FROM sanctions_list").df()["name"].tolist()

    matches = process.extract(
        name, sanctioned, scorer=fuzz.token_sort_ratio, limit=5
    )

    results = [
        {"matched_name": m[0], "score": round(m[1], 1), "above_threshold": m[1] >= threshold}
        for m in matches
    ]

    top = results[0] if results else None

    return {
        "query": name,
        "matches": results,
        "match_found": bool(top and top["above_threshold"]),
        "confidence_score": top["score"] if top else 0.0,
        "explainability": _explain(name, top) if top else "No candidates found in sanctions list.",
    }


def _explain(query: str, top: dict) -> str:
    if top["score"] >= 95:
        return f"Near-exact match to '{top['matched_name']}' — high confidence."
    elif top["score"] >= 70:
        return f"Partial similarity to '{top['matched_name']}' — may be a name variant, alias, or coincidental overlap. Manual review recommended."
    else:
        return f"Low similarity to closest candidate '{top['matched_name']}' — likely not a match."


def screen_all_counterparties(con: duckdb.DuckDBPyConnection, threshold: float = 70.0):
    counterparties = con.execute("SELECT id, name FROM counterparties").df()
    cases = []
    for _, row in counterparties.iterrows():
        result = screen_name(con, row["name"], threshold)
        status = "escalated" if result["match_found"] else "cleared"
        cases.append({
            "id": int(row["id"]),
            "name": row["name"],
            "confidence_score": result["confidence_score"],
            "status": status,
            "explainability": result["explainability"],
        })
    return cases