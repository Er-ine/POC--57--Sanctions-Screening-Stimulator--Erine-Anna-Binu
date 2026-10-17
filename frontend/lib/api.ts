import {
  ScreeningCase,
  StatsResponse,
  ScreenResponse,
  SourceConfidence,
  DecisionPayload,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchCases(threshold: number): Promise<ScreeningCase[]> {
  const res = await fetch(`${API_BASE}/cases?threshold=${threshold}`);
  if (!res.ok) {
    throw new Error(`fetchCases failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchStats(threshold: number): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/stats?threshold=${threshold}`);
  if (!res.ok) {
    throw new Error(`fetchStats failed: ${res.status}`);
  }
  return res.json();
}

export async function screenName(
  name: string,
  threshold: number
): Promise<ScreenResponse> {
  const res = await fetch(
    `${API_BASE}/screen?name=${encodeURIComponent(name)}&threshold=${threshold}`
  );
  if (!res.ok) {
    throw new Error(`screenName failed: ${res.status}`);
  }
  return res.json();
}

export async function recordCaseDecision(
  caseId: number,
  payload: DecisionPayload
): Promise<{ success: boolean; case_id: number; decision: string; notes?: string }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`recordCaseDecision failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchSourceConfidence(): Promise<SourceConfidence[]> {
  const res = await fetch(`${API_BASE}/api/source-confidence`);
  if (!res.ok) {
    throw new Error(`fetchSourceConfidence failed: ${res.status}`);
  }
  return res.json();
}

export function getExportCsvUrl(threshold: number): string {
  return `${API_BASE}/export/csv?threshold=${threshold}`;
}
