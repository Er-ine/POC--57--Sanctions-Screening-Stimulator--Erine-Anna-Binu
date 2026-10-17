import os
import sys
import duckdb
from mcp.server.fastmcp import FastMCP

# Ensure backend directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from data_loader import load_ofac_list  # noqa: E402
from matcher import screen_name as backend_screen_name  # noqa: E402

mcp = FastMCP("sanctions-screening-simulator")

# Initialize DuckDB and load OFAC dataset
con = duckdb.connect(database=":memory:")
load_ofac_list(con)


@mcp.tool()
def screen_name(name: str, threshold: float = 70.0) -> dict:
    """
    Screen a counterparty name against the real OFAC Specially Designated Nationals (SDN) list.
    Returns fuzzy match confidence score, match status, and plain-language explainability.
    """
    cur = con.cursor()
    result = backend_screen_name(cur, name, threshold)
    return result


@mcp.tool()
def list_sanctioned_entities(limit: int = 10) -> list:
    """
    Return a sample of official sanctioned entities from the loaded OFAC dataset.
    """
    cur = con.cursor()
    safe_limit = max(1, min(limit, 100))
    df = cur.execute(
        f"SELECT sdn_uid, name, sdn_type, program FROM sanctions_list LIMIT {safe_limit}"
    ).df()
    return df.to_dict(orient="records")


if __name__ == "__main__":
    mcp.run(transport="stdio")
