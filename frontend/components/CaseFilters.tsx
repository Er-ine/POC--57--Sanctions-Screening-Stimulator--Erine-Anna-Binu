"use client";

import React from "react";
import { CaseStatus } from "@/lib/types";

interface CaseFiltersProps {
  statusFilter: "all" | CaseStatus;
  onStatusChange: (v: "all" | CaseStatus) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function CaseFilters({
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
}: CaseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by name or matched candidate…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-full sm:w-64 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
        {(["all", "escalated", "cleared"] as const).map((s) => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize font-mono transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
