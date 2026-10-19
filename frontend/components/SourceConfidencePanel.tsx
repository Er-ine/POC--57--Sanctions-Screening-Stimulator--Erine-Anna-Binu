"use client";

import React from "react";
import { SourceConfidence } from "@/lib/types";

export default function SourceConfidencePanel({
  sources,
  loading,
  error,
}: {
  sources: SourceConfidence[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400">
        <span>Source Confidence &amp; Provenance</span>
        <span className="text-[10px] text-zinc-500 font-normal">Per Manifesto</span>
      </div>

      {sources.length === 0 ? (
        <p
          role={loading ? "status" : error ? "alert" : "status"}
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-400"
        >
          {loading
            ? "Loading source provenance…"
            : error
              ? `Source provenance unavailable: ${error}`
              : "No source provenance was returned by the API."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {sources.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-zinc-200 truncate">
                  {item.source}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400 shrink-0">
                  {item.confidence}%
                </span>
              </div>

              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>{item.type}</span>
                <span className="font-mono text-zinc-500">
                  {item.record_count.toLocaleString()} records
                </span>
              </div>

              <div
                className="mt-1 text-[10px] text-zinc-500 truncate"
                title={item.attribution}
              >
                Attribution: {item.attribution}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
