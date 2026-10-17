"use client";

import React from "react";
import { ScreeningCase } from "@/lib/types";

interface ScreeningTableProps {
  cases: ScreeningCase[];
  loading?: boolean;
  onRowClick?: (c: ScreeningCase) => void;
  selectedId?: number | null;
}

export default function ScreeningTable({
  cases,
  loading = false,
  onRowClick,
  selectedId,
}: ScreeningTableProps) {
  if (loading) {
    return (
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-t border-zinc-800/60 first:border-t-0 animate-pulse"
          >
            <div className="h-4 bg-zinc-800 rounded w-1/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/6" />
            <div className="h-4 bg-zinc-800 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800/80 text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <tr>
              <th className="p-3.5 pl-4 font-medium">Counterparty Name</th>
              <th className="p-3.5 font-medium">Matched Sanctioned Entity</th>
              <th
                className="p-3.5 font-medium"
                title="Fuzzy similarity score against sanctions list (0-100)"
              >
                Match Score
              </th>
              <th className="p-3.5 font-medium">Review Status</th>
              <th className="p-3.5 pr-4 font-medium text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {cases.map((c) => {
              const isSelected = selectedId === c.id;
              return (
                <tr
                  key={c.id}
                  tabIndex={0}
                  onClick={() => onRowClick?.(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick?.(c);
                    }
                  }}
                  className={`transition-colors cursor-pointer outline-none focus:bg-zinc-800/60 ${
                    isSelected
                      ? "bg-orange-500/10 border-l-4 border-l-orange-500 pl-3 hover:bg-orange-500/15"
                      : "hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Name */}
                  <td className="p-3.5 pl-4 font-medium text-zinc-100 break-words max-w-[200px]">
                    {c.name}
                  </td>

                  {/* Matched Name */}
                  <td className="p-3.5 text-xs font-mono text-zinc-400 break-words max-w-[220px]">
                    {c.matched_name || "—"}
                  </td>

                  {/* Confidence Score Bar */}
                  <td className="p-3.5">
                    <div
                      className="flex items-center gap-2.5"
                      title={`Confidence: ${c.confidence_score}/100`}
                    >
                      <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            c.confidence_score >= 85
                              ? "bg-red-500"
                              : c.confidence_score >= 70
                              ? "bg-orange-500"
                              : "bg-zinc-500"
                          }`}
                          style={{ width: `${Math.min(c.confidence_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-300 w-10">
                        {c.confidence_score}%
                      </span>
                    </div>
                  </td>

                  {/* Effective Status */}
                  <td className="p-3.5">
                    <span
                      title={
                        c.status === "escalated"
                          ? "Escalated for compliance review"
                          : "Cleared below threshold"
                      }
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium uppercase ${
                        c.status === "escalated"
                          ? "bg-red-950/80 text-red-400 border border-red-900"
                          : "bg-emerald-950/80 text-emerald-400 border border-emerald-900"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  {/* Decision Audit Badge */}
                  <td className="p-3.5 pr-4 text-right">
                    {c.decision && c.decision !== "pending" ? (
                      <span
                        title={`Audited decision: ${c.decision}`}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700"
                      >
                        ✓ {c.decision.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">
                        PENDING
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cases.length === 0 && (
        <div className="p-10 text-center text-zinc-500 text-sm">
          No counterparties match this search query or status filter.
        </div>
      )}
    </div>
  );
}
