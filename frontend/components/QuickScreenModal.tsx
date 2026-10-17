"use client";

import React, { useState } from "react";
import { screenName } from "@/lib/api";
import { ScreenResponse } from "@/lib/types";

interface QuickScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultThreshold: number;
}

export default function QuickScreenModal({
  isOpen,
  onClose,
  defaultThreshold,
}: QuickScreenModalProps) {
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScreen = async (nameToScreen?: string) => {
    const target = (nameToScreen ?? query).trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const data = await screenName(target, threshold);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Screening request failed");
    } finally {
      setLoading(false);
    }
  };

  const sampleNames = [
    "AEROCARIBBEAN AIRLINES",
    "BANCO NACIONAL DE CUBA",
    "ANGLO-CARIBBEAN CO LTD",
    "Acme Clean Logistics Corp",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-semibold block">
              Ad-Hoc Compliance Screener
            </span>
            <h2 className="text-lg font-semibold text-white">
              Direct OFAC Sanctions Query
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">
              Entity or Individual Name to Screen
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScreen()}
                placeholder="Enter counterparty name (e.g. Aerocaribbean Airlines)…"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                disabled={loading || !query.trim()}
                onClick={() => handleScreen()}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {loading ? "Screening…" : "Screen Name"}
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-500">Test cases:</span>
              {sampleNames.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    handleScreen(s);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold Adjuster */}
          <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              Match Sensitivity Cutoff:{" "}
              <span className="font-mono text-orange-400 font-semibold">{threshold}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="accent-orange-500 w-48"
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">
                    Query: &quot;{result.query}&quot;
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase ${
                      result.match_found
                        ? "bg-red-950 text-red-400 border border-red-900"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                    }`}
                  >
                    {result.match_found ? "⚠️ SANCTIONS FLAGGED" : "✓ CLEARED"}
                  </span>
                </div>

                <div className="text-xs text-zinc-300">
                  Top Score:{" "}
                  <span className="font-mono text-orange-400 font-semibold">
                    {result.confidence_score}%
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-2">
                  {result.explainability}
                </p>
              </div>

              {/* Match Candidates Table */}
              {result.matches && result.matches.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Top 5 Candidates on OFAC SDN List
                  </h4>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-800/80 text-zinc-400">
                        <tr>
                          <th className="p-2.5 font-medium">Candidate Name</th>
                          <th className="p-2.5 font-medium">Program</th>
                          <th className="p-2.5 font-medium">Type</th>
                          <th className="p-2.5 font-medium text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                        {result.matches.map((m, i) => (
                          <tr key={i} className="hover:bg-zinc-800/30">
                            <td className="p-2.5 font-mono text-zinc-200">
                              {m.matched_name}
                            </td>
                            <td className="p-2.5 text-zinc-400">
                              {m.program || "—"}
                            </td>
                            <td className="p-2.5 text-zinc-400">
                              {m.sdn_type || "—"}
                            </td>
                            <td className="p-2.5 text-right font-mono text-orange-400">
                              {m.score}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
