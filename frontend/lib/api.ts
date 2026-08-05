const API_BASE = "http://localhost:8000";

export async function fetchCases(threshold: number) {
  const res = await fetch(`${API_BASE}/cases?threshold=${threshold}`);
  if (!res.ok) {
    throw new Error(`fetchCases failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchStats(threshold: number) {
  const res = await fetch(`${API_BASE}/stats?threshold=${threshold}`);
  if (!res.ok) {
    throw new Error(`fetchStats failed: ${res.status}`);
  }
  return res.json();
}

export async function screenName(name: string, threshold: number) {
  const res = await fetch(`${API_BASE}/screen?name=${encodeURIComponent(name)}&threshold=${threshold}`);
  if (!res.ok) {
    throw new Error(`screenName failed: ${res.status}`);
  }
  return res.json();
}