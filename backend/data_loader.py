import os
import random
import pandas as pd
import duckdb

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_PATHS = [
    os.path.join(BASE_DIR, "data", "ofac_sdn.csv"),
    os.path.join(os.path.dirname(BASE_DIR), "backend", "data", "ofac_sdn.csv"),
    "backend/data/ofac_sdn.csv",
    "data/ofac_sdn.csv",
]


def get_ofac_csv_path() -> str:
    for path in POSSIBLE_PATHS:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"OFAC SDN CSV not found in any of the search paths: {POSSIBLE_PATHS}"
    )


def load_ofac_list(con: duckdb.DuckDBPyConnection) -> int:
    """
    Loads OFAC SDN list into DuckDB.
    Source: https://sanctionslist.ofac.treas.gov/
    Ingests name, uid, type, and program for candidate attribution.
    """
    csv_path = get_ofac_csv_path()
    df = pd.read_csv(
        csv_path,
        header=None,
        usecols=[0, 1, 2, 3],
        names=["sdn_uid", "name", "sdn_type", "program"],
        dtype=str,
    )
    df = df.dropna(subset=["name"]).drop_duplicates(subset=["name"])
    con.execute("CREATE OR REPLACE TABLE sanctions_list AS SELECT * FROM df")
    return len(df)


def generate_synthetic_counterparties(
    con: duckdb.DuckDBPyConnection, n: int = 200, seed: int = 42
) -> int:
    """
    Generates synthetic payment counterparties, some matching sanctioned names
    with variations (typos, reordering, character replacement, suffixes) and some clean.
    Creates explicit DuckDB schema with string fields for reviewer decisions.
    """
    random.seed(seed)
    sanctioned_names = (
        con.execute("SELECT name FROM sanctions_list USING SAMPLE 40")
        .df()["name"]
        .tolist()
    )

    clean_names = [
        "Alpha Traders LLC",
        "Northwind Logistics",
        "Blue Harbor Corp",
        "Silverline Partners",
        "Crestview Holdings",
        "Oakridge Freight",
        "Apex Global Logistics",
        "Meridian Maritime Corp",
        "Pacific Rim Commodities",
        "Summit Industrial Partners",
        "Zenith Freight Forwarding",
        "Vanguard Supply Solutions",
    ]

    records = []
    for i in range(n):
        if random.random() < 0.20 and sanctioned_names:
            base = random.choice(sanctioned_names)
            variant = _make_variant(base)
            records.append(
                {
                    "id": i,
                    "name": variant,
                    "is_true_match": True,
                    "source_name": base,
                    "decision": "pending",
                    "reviewer_notes": "",
                    "decision_timestamp": "",
                }
            )
        else:
            clean_base = random.choice(clean_names)
            name = f"{clean_base} #{i}"
            records.append(
                {
                    "id": i,
                    "name": name,
                    "is_true_match": False,
                    "source_name": "",
                    "decision": "pending",
                    "reviewer_notes": "",
                    "decision_timestamp": "",
                }
            )

    df = pd.DataFrame(records)
    # Explicit schema creation in DuckDB
    con.execute(
        """
        CREATE OR REPLACE TABLE counterparties (
            id BIGINT PRIMARY KEY,
            name VARCHAR,
            is_true_match BOOLEAN,
            source_name VARCHAR,
            decision VARCHAR DEFAULT 'pending',
            reviewer_notes VARCHAR DEFAULT '',
            decision_timestamp VARCHAR DEFAULT ''
        )
        """
    )
    con.execute("INSERT INTO counterparties SELECT * FROM df")
    return len(df)


def _make_variant(name: str) -> str:
    variants = [
        lambda s: s.replace("a", "@") if "a" in s else s.replace("A", "@"),
        lambda s: s.upper(),
        lambda s: " ".join(reversed(s.split())) if len(s.split()) > 1 else s,
        lambda s: s + " Ltd",
        lambda s: s[:-1] if len(s) > 3 else s,
        lambda s: s.replace("O", "0") if "O" in s else s + " International",
    ]
    chosen = random.choice(variants)(name)
    return chosen if chosen.strip() else name
