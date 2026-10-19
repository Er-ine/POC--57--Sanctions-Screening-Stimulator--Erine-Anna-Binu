"use client";

import React, { useState } from "react";
import {
  ScreeningCase,
  SourceConfidence as SourceConfidenceType,
} from "@/lib/types";
import { recordCaseDecision, getExportCsvUrl } from "@/lib/api";
import SourceConfidencePanel from "./SourceConfidencePanel";

interface IntelligenceSidebarProps {
  selectedCase: ScreeningCase | null;
  onCaseUpdated: (updatedCase: ScreeningCase) => void;
  threshold: number;
  sources?: SourceConfidenceType[];
  onOpenQuickScreen?: () => void;
}

export default function IntelligenceSidebar({
  selectedCase,
  onCaseUpdated,
  threshold,
  sources,
  onOpenQuickScreen,
}: IntelligenceSidebarProps) {
  const [activeTab, setActiveTab] = useState<"case" | "intelligence">(
    "intelligence"
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleDecision = async (decision: "escalated" | "cleared" | "in_review") => {
    if (!selectedCase) return;
    setSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await recordCaseDecision(selectedCase.id, {
        decision,
        notes: reviewerNotes || `Reviewer action: ${decision}`,
      });
      if (res.success) {
        setFeedbackMsg({
          text: `Case #${selectedCase.id} recorded as ${decision.toUpperCase()}`,
          type: "success",
        });
        onCaseUpdated({
          ...selectedCase,
          status: decision === "in_review" ? selectedCase.status : decision,
          decision,
          reviewer_notes: reviewerNotes,
          decision_timestamp: new Date().toISOString(),
        });
        setReviewerNotes("");
      }
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "Failed to record decision";
      setFeedbackMsg({ text: errorText, type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleExportCsv = () => {
    const url = getExportCsvUrl(threshold);
    window.open(url, "_blank");
  };

  return (
    <aside className="bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-800 flex flex-col overflow-hidden shadow-2xl">
      {/* Sidebar Header & Tab Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls="intelligence-layer-content"
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <span className="text-[11px] font-mono tracking-widest text-orange-400 uppercase font-semibold">
              Intelligence Layer · 30% Rail
            </span>
            <span aria-hidden="true" className="text-zinc-500 transition-transform">
              {isExpanded ? "−" : "+"}
            </span>
          </button>
          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            T:{threshold}%
          </span>
        </div>

        <div id="intelligence-layer-content" hidden={!isExpanded}>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("case")}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "case"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Case Inspector
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("intelligence")}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "intelligence"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Rail Governance
              </button>
            </div>
          </div>

            {/* Main Tab Content */}
            <div className="p-5 space-y-6">
              {activeTab === "case" ? (
          /* TAB 1: CASE INSPECTOR & WORKFLOW */
          selectedCase ? (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                  Subject Counterparty
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5 break-words">
                  {selectedCase.name}
                </h3>
              </div>

              {/* Status and Score Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                    Effective Status
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase font-mono ${
                      selectedCase.status === "escalated"
                        ? "bg-red-950/80 text-red-400 border border-red-900"
                        : "bg-emerald-950/80 text-emerald-400 border border-emerald-900"
                    }`}
                  >
                    {selectedCase.status}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                    Confidence
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-orange-400">
                      {selectedCase.confidence_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Closest OFAC Candidate */}
              <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Matched OFAC Sanctioned Entity
                </span>
                <p className="text-xs font-mono text-zinc-200 break-words">
                  {selectedCase.matched_name || "None (Below Screening Threshold)"}
                </p>
              </div>

              {/* Explainability string */}
              <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Explainable Match Rationale
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedCase.explainability}
                </p>
              </div>

              {/* Reviewer Decision Audit Record */}
              {selectedCase.decision && selectedCase.decision !== "pending" && (
                <div className="p-3 bg-orange-950/20 rounded-lg border border-orange-900/40 text-xs">
                  <span className="text-orange-400 font-semibold block mb-1">
                    Recorded Compliance Decision: {selectedCase.decision.toUpperCase()}
                  </span>
                  {selectedCase.reviewer_notes && (
                    <p className="text-zinc-300 mb-1">
                      Notes: {selectedCase.reviewer_notes}
                    </p>
                  )}
                  {selectedCase.decision_timestamp && (
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      Audited: {selectedCase.decision_timestamp}
                    </span>
                  )}
                </div>
              )}

              {/* Decision Action Workflow */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[11px] text-zinc-400 font-medium block">
                  Compliance Action &amp; Audit Trail
                </label>
                <input
                  type="text"
                  placeholder="Reviewer rationale / audit notes…"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision("escalated")}
                    className="py-2 px-3 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-900/80 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    Escalate Case
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision("cleared")}
                    className="py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-900/80 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    Clear Case
                  </button>
                </div>

                {feedbackMsg && (
                  <div
                    className={`mt-2 p-2 rounded text-xs text-center font-mono ${
                      feedbackMsg.type === "success"
                        ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900"
                        : "bg-red-950/50 text-red-400 border border-red-900"
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Select a payment counterparty from the queue to inspect match candidates and record decisions.
            </div>
          )
              ) : (
          /* TAB 2: COMPLETE REAL RAILS INSTITUTIONAL INTELLIGENCE */
          <div className="space-y-4">
            {/* Why This Matters */}
            <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wide">
                <span>⚡ Why This Matters</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Financial institutions face strict liability under U.S. and international sanctions regimes. Transacting with a blocked party — even unknowingly — carries severe regulatory penalties, civil forfeitures, and forfeiture of correspondent banking access. Fuzzy screening catches deliberate obfuscation that exact-string matching misses.
              </p>
            </div>

            {/* Who Controls This Rail */}
            <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wide">
                <span>🛡️ Who Controls This Rail</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-start border-b border-zinc-800/60 pb-1.5">
                  <span className="text-zinc-400 font-medium">U.S. OFAC</span>
                  <span className="text-zinc-200 text-right">SDN List &amp; Sanctions Programs</span>
                </div>
                <div className="flex justify-between items-start border-b border-zinc-800/60 pb-1.5">
                  <span className="text-zinc-400 font-medium">FinCEN</span>
                  <span className="text-zinc-200 text-right">AML &amp; Suspicious Activity Reporting</span>
                </div>
                <div className="flex justify-between items-start border-b border-zinc-800/60 pb-1.5">
                  <span className="text-zinc-400 font-medium">EU CFSP</span>
                  <span className="text-zinc-200 text-right">Autonomous Restrictive Measures</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-zinc-400 font-medium">FATF</span>
                  <span className="text-zinc-200 text-right">Recommendation 6 &amp; 7 (TF/PF)</span>
                </div>
              </div>
            </div>

            {/* Decisions to Make */}
            <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                <span>🎯 Decisions to Make</span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 list-disc pl-4 marker:text-emerald-500">
                <li>
                  <strong className="text-zinc-200">Score ≥ 90%:</strong> Block payment immediately, freeze funds, and notify OFAC Sanctions Compliance.
                </li>
                <li>
                  <strong className="text-zinc-200">Score 70%–89%:</strong> Place payment on administrative hold for Enhanced Due Diligence (EDD) and beneficial ownership review.
                </li>
                <li>
                  <strong className="text-zinc-200">Score &lt; 70%:</strong> Clear transaction under standard risk appetite unless high-risk jurisdiction flags apply.
                </li>
              </ul>
            </div>

            {/* Derived Insights */}
            <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wide">
                <span>💡 Derived Insights</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Token-sort fuzzy scoring effectively neutralizes word-inversion evasion (&quot;AIRLINES AEROCARIBBEAN&quot; matches &quot;AEROCARIBBEAN AIRLINES&quot; at 100%). At threshold 70, the system captures spelling alterations and transliteration noise while capping analyst queue burden.
              </p>
            </div>

            {/* Source Confidence Panel */}
            <SourceConfidencePanel sources={sources} />
          </div>
        )}
            </div>
          </div>
        </div>

      {/* Action Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 mt-auto space-y-2">
        <button
          type="button"
          onClick={handleExportCsv}
          className="w-full py-2.5 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <span>📥</span> Download Case Queue (CSV)
        </button>

        {onOpenQuickScreen && (
          <button
            type="button"
            onClick={onOpenQuickScreen}
            className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          >
            <span>🔍</span> Ad-Hoc Name Screener
          </button>
        )}

        <div className="pt-2 text-center text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-t border-zinc-800/40">
          DATA CLASSIFICATION: REAL OFAC SDN + SYNTHETIC TEST CASES
        </div>
        </div>
      )}
    </aside>
  );
}
