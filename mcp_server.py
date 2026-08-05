from mcp.server.fastmcp import FastMCP

mcp = FastMCP("sanctions-screening-simulator")

@mcp.tool()
def screen_name(name: str) -> dict:
    """Screen a name against the sanctions list and return match results."""
    # TODO: swap this stub for your actual screening/matching logic
    # e.g. fuzzy match against an OFAC/UN sanctions list dataset
    is_match = False
    score = 0.0

    return {
        "name": name,
        "match_found": is_match,
        "confidence_score": score,
        "details": "Stub response — wire up real matching logic here"
    }

@mcp.tool()
def list_sanctioned_entities(limit: int = 10) -> list:
    """Return a sample of sanctioned entities from the loaded dataset."""
    # TODO: pull from your actual dataset/DB
    return []

if __name__ == "__main__":
    mcp.run(transport="stdio")