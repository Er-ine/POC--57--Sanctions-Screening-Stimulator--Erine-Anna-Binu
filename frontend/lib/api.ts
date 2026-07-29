const API_BASE = "http://localhost:8000";

export async function fetchCases(threshold: number) {
  const res = await fetch(`${API_BASE}/cases?threshold=${threshold}`);
  return res.json();
}

export async function fetchStats(threshold: number) {
  const res = await fetch(`${API_BASE}/stats?threshold=${threshold}`);
  return res.json();
}

export async function screenName(name: string, threshold: number) {
  const res = await fetch(`${API_BASE}/screen?name=${encodeURIComponent(name)}&threshold=${threshold}`);
  return res.json();
}