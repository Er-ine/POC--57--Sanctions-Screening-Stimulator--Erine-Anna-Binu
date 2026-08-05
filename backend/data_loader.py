import pandas as pd
import duckdb
import random

OFAC_CSV_PATH = "data/ofac_sdn.csv"

def load_ofac_list(con: duckdb.DuckDBPyConnection):
    """
    Loads OFAC SDN list into DuckDB.
    Download the real list from: https://sanctionslist.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV
    For now this expects a CSV with at least a 'name' column.
    """
    df = pd.read_csv(OFAC_CSV_PATH, header=None, usecols=[1], names=["name"])
    df = df.dropna().drop_duplicates()
    con.execute("CREATE OR REPLACE TABLE sanctions_list AS SELECT * FROM df")
    return len(df)


def generate_synthetic_counterparties(con: duckdb.DuckDBPyConnection, n=200):
    """
    Generates synthetic payment counterparties, some matching sanctioned names
    with variations (typos, reordering) and some clean.
    """
    sanctioned_names = con.execute("SELECT name FROM sanctions_list USING SAMPLE 30").df()["name"].tolist()
    clean_names = [
        "Alpha Traders LLC", "Northwind Logistics", "Blue Harbor Corp",
        "Silverline Partners", "Crestview Holdings", "Oakridge Freight"
    ]

    records = []
    for i in range(n):
        if random.random() < 0.15 and sanctioned_names:
            base = random.choice(sanctioned_names)
            variant = _make_variant(base)
            records.append({"id": i, "name": variant, "is_true_match": True, "source_name": base})
        else:
            name = random.choice(clean_names) + f" #{i}"
            records.append({"id": i, "name": name, "is_true_match": False, "source_name": None})

    df = pd.DataFrame(records)
    con.execute("CREATE OR REPLACE TABLE counterparties AS SELECT * FROM df")
    return len(df)


def _make_variant(name: str) -> str:
    variants = [
        lambda s: s.replace("a", "@"),
        lambda s: s.upper(),
        lambda s: " ".join(reversed(s.split())),
        lambda s: s + " Ltd",
        lambda s: s[:-1] if len(s) > 3 else s,
    ]
    return random.choice(variants)(name)