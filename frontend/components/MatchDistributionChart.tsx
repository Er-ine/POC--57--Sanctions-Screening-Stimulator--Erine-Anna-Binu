"use client";

import React from "react";
import { ScreeningCase } from "@/lib/types";

interface MatchDistributionChartProps {
  cases: ScreeningCase[];
}

export default function MatchDistributionChart({
  cases,
}: MatchDistributionChartProps) {
  const buckets = [0, 0, 0, 0, 0];
  cases.forEach((c) => {
    const idx = Math.min(Math.floor(c.confidence_score / 20), 4);
    buckets[idx]++;
  });
  const max = Math.max(...buckets, 1);

  const ranges = ["0–20%", "21–40%", "41–60%", "61–80%", "81–100%"];

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl p-5 border border-zinc-800 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          Match Score Distribution
        </h3>
        <span className="text-[10px] font-mono text-zinc-500">
          {cases.length} cases evaluated
        </span>
      </div>

      <div className="flex items-end gap-3 h-36 pt-4 pb-1">
        {buckets.map((count, i) => {
          const heightPct = (count / max) * 100;
          const isHighRisk = i >= 3;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group relative"
            >
              {/* Floating count badge */}
              <div
                title={`${count} cases in ${ranges[i]}`}
                className={`w-full rounded-t transition-all duration-500 hover:opacity-85 cursor-help ${
                  isHighRisk
                    ? "bg-gradient-to-t from-red-600 to-orange-500"
                    : "bg-gradient-to-t from-zinc-700 to-zinc-500"
                }`}
                style={{
                  height: `${heightPct}%`,
                  minHeight: count > 0 ? "6px" : "2px",
                }}
              />
              <span className="text-[11px] font-mono text-zinc-400 group-hover:text-white transition-colors">
                {ranges[i]}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
