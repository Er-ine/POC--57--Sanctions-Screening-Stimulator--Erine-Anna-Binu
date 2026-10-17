"use client";

import React from "react";
import { SourceConfidence } from "@/lib/types";

export default function SourceConfidencePanel({
  sources,
}: {
  sources?: SourceConfidence[];
}) {
  const defaultSources: SourceConfidence[] = [
    {
      id: "ofac_sdn",
      source: "U.S. Department of the Treasury (OFAC)",
      dataset: "Specially Designated Nationals (SDN) List",
      type: "Official Regulatory Data",
      confidence: 98,
      freshness: "Active Edition (19,133 entities)",
      record_count: 19133,
      attribution: "Direct Ingestion via Official SDN CSV",
    },
    {
      id: "synthetic_generator",
      source: "Real Rails Synthetic Counterparty Engine",
      dataset: "Adversarial Typology & Mutation Generator",
      type: "Simulated Payment Rail Feed",
      confidence: 85,
      freshness: "In-Memory Simulation",
      record_count: 200,
      attribution: "Rule-Based Typologies (Transliterations, Typos, Reordering)",
    },
  ];

  const displaySources = sources && sources.length > 0 ? sources : defaultSources;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400">
        <span>Source Confidence &amp; Provenance</span>
        <span className="text-[10px] text-zinc-500 font-normal">Per Manifesto</span>
      </div>

      <div className="space-y-2.5">
        {displaySources.map((item) => (
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

            <div className="mt-1 text-[10px] text-zinc-500 truncate" title={item.attribution}>
              Attribution: {item.attribution}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
