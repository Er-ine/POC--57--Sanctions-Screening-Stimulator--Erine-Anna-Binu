export type CaseStatus = "escalated" | "cleared";
export type DecisionType = "pending" | "escalated" | "cleared" | "in_review";

export interface ScreeningCase {
  id: number;
  name: string;
  matched_name?: string;
  confidence_score: number;
  status: CaseStatus;
  auto_status?: CaseStatus;
  decision?: DecisionType;
  reviewer_notes?: string;
  decision_timestamp?: string | null;
  explainability: string;
}

export interface StatsResponse {
  total: number;
  escalated: number;
  cleared: number;
  escalation_rate: number;
  threshold?: number;
}

export interface MatchCandidate {
  matched_name: string;
  score: number;
  above_threshold: boolean;
  sdn_uid?: string;
  sdn_type?: string;
  program?: string;
}

export interface ScreenResponse {
  query: string;
  matches: MatchCandidate[];
  match_found: boolean;
  confidence_score: number;
  explainability: string;
}

export interface SourceConfidence {
  id: string;
  source: string;
  dataset: string;
  type: string;
  confidence: number;
  freshness: string;
  record_count: number;
  attribution: string;
}

export interface DecisionPayload {
  decision: "escalated" | "cleared" | "in_review";
  notes?: string;
}
