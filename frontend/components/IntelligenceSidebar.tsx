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
  sources: SourceConfidenceType[];
  sourceError: string | null;
  sourcesLoading: boolean;
  onOpenQuickScreen?: () => void;
  onClose: () => void;
}

export default function IntelligenceSidebar({
  selectedCase,
  onCaseUpdated,
  threshold,
  sources,
  sourceError,
  sourcesLoading,
  onOpenQuickScreen,
  onClose,
}: IntelligenceSidebarProps) {
  const [activeTab, setActiveTab] = useState<"case" | "intelligence">(
    "intelligence"
  );
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleDecision = async (
    decision: "escalated" | "cleared" | "in_review"
  ) => {
    if (!selectedCase) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await recordCaseDecision(selectedCase.id, {
        decision,
        notes: reviewerNotes || "Reviewer action: " + decision,
      });

      if (res.success) {
        setFeedbackMsg({
          text: `Case #${selectedCase.id} recorded as ${decision.toUpperCase()}`,
          type: "success",
        });

        onCaseUpdated({
          ...selectedCase,
          status:
            decision === "in_review" ? selectedCase.status : decision,
          decision,
          reviewer_notes: reviewerNotes,
          decision_timestamp: new Date().toISOString(),
        });

        setReviewerNotes("");
      } else {
        setFeedbackMsg({
          text: "The decision could not be recorded. Please try again.",
          type: "error",
        });
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : "Failed to record decision";

      setFeedbackMsg({ text: errorText, type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleExportCsv = () => {
    const url = getExportCsvUrl(threshold);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className="flex min-h-full min-w-0 flex-col bg-zinc-900/70">
      {/* Sidebar Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h2
              id="intelligence-layer-title"
              className="text-[11px] font-mono tracking-widest text-orange-400 uppercase font-semibold"
            >
              Intelligence Layer
            </h2>
            <p className="mt-1 text-[10px] text-zinc-500">
              Sanctions screening &amp; rail governance
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              T:{threshold}%
            </span>

            <button
              type="button"
              autoFocus
              onClick={onClose}
              aria-label="Close Intelligence Layer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pb-4">
          <div
            role="tablist"
            aria-label="Intelligence layer views"
            className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-1"
          >
            <button
              type="button"
              role="tab"
              id="case-inspector-tab"
              aria-controls="intelligence-layer-panel"
              aria-selected={activeTab === "case"}
              onClick={() => setActiveTab("case")}
              className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "case"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Case Inspector
            </button>

            <button
              type="button"
              role="tab"
              id="rail-governance-tab"
              aria-controls="intelligence-layer-panel"
              aria-selected={activeTab === "intelligence"}
              onClick={() => setActiveTab("intelligence")}
              className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "intelligence"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Rail Governance
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div
        role="tabpanel"
        id="intelligence-layer-panel"
        aria-labelledby={
          activeTab === "case"
            ? "case-inspector-tab"
            : "rail-governance-tab"
        }
        className="min-w-0 flex-1 space-y-6 p-5"
      >
        {activeTab === "case" ? (
          selectedCase ? (
            <div className="space-y-4">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                  Subject Counterparty
                </span>
                <h3 className="mt-0.5 break-words text-base font-semibold text-white">
                  {selectedCase.name}
                </h3>
              </div>

              {/* Status and Confidence */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
                    Effective Status
                  </span>
                  <span
                    className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-medium uppercase ${
                        selectedCase.status === "escalated"
                        ? "border-red-900 bg-red-950/80 text-red-400"
                        : "border-emerald-900 bg-emerald-950/80 text-emerald-400"
                    }`}
                  >
                    {selectedCase.status}
                  </span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
                    Confidence
                  </span>
                  <span className="font-mono text-lg font-bold text-orange-400">
                    {selectedCase.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Matched OFAC Entity */}
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
                  Matched OFAC Sanctioned Entity
                </span>
                <p className="break-words font-mono text-xs text-zinc-200">
                  {selectedCase.matched_name ||
                    "None (Below Screening Threshold)"}
                </p>
              </div>

              {/* Match Rationale */}
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
                  Explainable Match Rationale
                </span>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {selectedCase.explainability}
                </p>
              </div>

              {/* Existing Decision Audit Record */}
              {selectedCase.decision &&
                selectedCase.decision !== "pending" && (
                  <div className="rounded-lg border border-orange-900/40 bg-orange-950/20 p-3 text-xs">
                    <span className="mb-1 block font-semibold text-orange-400">
                      Recorded Compliance Decision:{" "}
                      {selectedCase.decision.toUpperCase()}
                    </span>

                    {selectedCase.reviewer_notes && (
                      <p className="mb-1 text-zinc-300">
                        Notes: {selectedCase.reviewer_notes}
                      </p>
                    )}

                    {selectedCase.decision_timestamp && (
                      <span className="block font-mono text-[10px] text-zinc-500">
                        Audited: {selectedCase.decision_timestamp}
                      </span>
                    )}
                  </div>
                )}

              {/* Decision Workflow */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <label
                  htmlFor="reviewer-notes"
                  className="block text-[11px] font-medium text-zinc-400"
                >
                  Compliance Action &amp; Audit Trail
                </label>

                <textarea
                  id="reviewer-notes"
                  placeholder="Reviewer rationale / audit notes…"
                  value={reviewerNotes}
                  onChange={(event) => setReviewerNotes(event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision("escalated")}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-900/80 bg-red-950/80 px-3 py-2 text-xs font-semibold text-red-300 shadow-sm transition-all hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Saving…" : "Escalate Case"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision("cleared")}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-900/80 bg-emerald-950/80 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-sm transition-all hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Saving…" : "Clear Case"}
                  </button>
                </div>

                {feedbackMsg && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-2 rounded p-2 text-center font-mono text-xs ${
                      feedbackMsg.type === "success"
                        ? "border border-emerald-900 bg-emerald-950/50 text-emerald-400"
                        : "border border-red-900 bg-red-950/50 text-red-400"
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-500">
              Select a payment counterparty from the queue to inspect match
              candidates and record decisions.
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* Why This Matters */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-400">
                <span>⚡ Why This Matters</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                Financial institutions face strict liability under applicable
                sanctions regimes. Transacting with a blocked party can result
                in serious regulatory consequences. Fuzzy screening can help
                identify potential name variations that exact-string matching
                may miss.
              </p>
            </div>

            {/* Rail Governance */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-400">
                <span>🛡️ Who Controls This Rail</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/60 pb-1.5">
                  <span className="font-medium text-zinc-400">U.S. OFAC</span>
                  <span className="text-right text-zinc-200">
                    SDN List &amp; Sanctions Programs
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/60 pb-1.5">
                  <span className="font-medium text-zinc-400">FinCEN</span>
                  <span className="text-right text-zinc-200">
                    AML &amp; Suspicious Activity Reporting
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/60 pb-1.5">
                  <span className="font-medium text-zinc-400">EU CFSP</span>
                  <span className="text-right text-zinc-200">
                    Autonomous Restrictive Measures
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-zinc-400">FATF</span>
                  <span className="text-right text-zinc-200">
                    Recommendations 6 &amp; 7 (TF/PF)
                  </span>
                </div>
              </div>
            </div>

            {/* Decisions to Make */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                <span>🎯 Decisions to Make</span>
              </div>

              <ul className="list-disc space-y-1.5 pl-4 text-xs text-zinc-300 marker:text-emerald-500">
                <li>
                  <strong className="text-zinc-200">Score ≥ 90%:</strong>{" "}
                  Hold the payment and escalate for sanctions-team review
                  according to applicable policy.
                </li>
                <li>
                  <strong className="text-zinc-200">Score 70%–89%:</strong>{" "}
                  Review the potential match, including relevant identifiers
                  and beneficial ownership information.
                </li>
                <li>
                  <strong className="text-zinc-200">Score &lt; 70%:</strong>{" "}
                  Assess under the institution&apos;s approved risk policy; a
                  low fuzzy-match score alone does not establish clearance.
                </li>
              </ul>
            </div>

            {/* Derived Insights */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
                <span>💡 Derived Insights</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                Token-sort fuzzy scoring can help identify word-order changes,
                spelling alterations, and similar naming variations that exact
                string matching may miss. Threshold selection balances match
                sensitivity against analyst review workload.
              </p>
            </div>

            {/* Source Confidence */}
            <SourceConfidencePanel
              sources={sources}
              loading={sourcesLoading}
              error={sourceError}
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-auto space-y-2 border-t border-zinc-800 bg-zinc-950/60 p-4">
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-400 transition-all hover:border-orange-500 hover:bg-orange-500/20"
        >
          <span>📥</span> Download Case Queue (CSV)
        </button>

        {onOpenQuickScreen && (
          <button
            type="button"
            onClick={onOpenQuickScreen}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800"
          >
            <span>🔍</span> Ad-Hoc Name Screener
          </button>
        )}

        <div className="border-t border-zinc-800/40 pt-2 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          DATA CLASSIFICATION: REAL OFAC SDN + SYNTHETIC TEST CASES
        </div>
      </div>
    </aside>
  );
}
