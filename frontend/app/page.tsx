"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchCases,
  fetchStats,
  fetchSourceConfidence,
} from "@/lib/api";
import {
  ScreeningCase,
  StatsResponse,
  SourceConfidence,
  CaseStatus,
} from "@/lib/types";
import ScreeningTable from "@/components/ScreeningTable";
import ThresholdSlider from "@/components/ThresholdSlider";
import MatchDistributionChart from "@/components/MatchDistributionChart";
import IntelligenceSidebar from "@/components/IntelligenceSidebar";
import CaseFilters from "@/components/CaseFilters";
import QuickScreenModal from "@/components/QuickScreenModal";

export default function Home() {
  const [threshold, setThreshold] = useState<number>(70);
  const [cases, setCases] = useState<ScreeningCase[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [sources, setSources] = useState<SourceConfidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<ScreeningCase | null>(null);
  const [isQuickScreenOpen, setIsQuickScreenOpen] = useState<boolean>(false);

  // Fetch data on threshold change
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchCases(threshold),
      fetchStats(threshold),
      fetchSourceConfidence(),
    ])
      .then(([c, s, src]) => {
        if (!isMounted) return;
        setCases(c);
        setStats(s);
        setSources(src);
        setLoading(false);
        setSelectedCase((prev) => {
          if (!prev) return c[0] || null;
          const match = c.find((item) => item.id === prev.id);
          return match || c[0] || null;
        });
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [threshold]);

  const handleThresholdChange = (newVal: number) => {
    setLoading(true);
    setThreshold(newVal);
  };

  const handleCaseUpdated = (updated: ScreeningCase) => {
    setCases((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedCase(updated);
    // Refresh stats to reflect manual review changes
    fetchStats(threshold)
      .then((s) => setStats(s))
      .catch(() => {});
  };

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesCandidate = c.matched_name
        ? c.matched_name.toLowerCase().includes(q)
        : false;
      return matchesStatus && (matchesName || matchesCandidate);
    });
  }, [cases, statusFilter, search]);

  return (
    <main className="min-h-screen text-zinc-100" style={{ backgroundColor: "#030712" }}>
      <div className="max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Header */}
        <header className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-orange-400 text-xs font-mono font-medium tracking-widest uppercase mb-1.5">
                Governance &amp; Trust · Real Rails Intelligence Library (Batch 6 · POC-57)
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Sanctions Screening Simulator
              </h1>
              <p className="text-zinc-400 mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed">
                Production-grade compliance screening against the official U.S. OFAC Specially Designated Nationals (SDN) sanctions dataset. Real-time RapidFuzz string distance, explainable match scoring, and review decision persistence.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickScreenOpen(true)}
                className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-orange-950/40 flex items-center gap-2"
              >
                <span>🔍</span> Quick Screen Single Entity
              </button>
            </div>
          </div>
        </header>

        {/* Backend Connectivity Error Alert */}
        {error && (
          <div className="bg-red-950/60 border border-red-900 rounded-xl p-4 text-red-200 text-xs flex items-center justify-between shadow-lg">
            <span>
              <strong>Backend Connection Issue:</strong> {error}. Ensure FastAPI is running on{" "}
              <code className="bg-red-900/40 px-1 py-0.5 rounded font-mono">http://localhost:8000</code>.
            </span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchCases(threshold).then((c) => setCases(c)).catch(() => {});
              }}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Real Rails Top Metric Stage */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Total Screened"
              value={stats.total}
              accent="zinc"
              subtext="Active counterparty test cases"
              tooltip="Total payment counterparties evaluated at current threshold"
            />
            <StatCard
              label="Escalated Flagged"
              value={stats.escalated}
              accent="red"
              subtext="High-risk / review required"
              tooltip="Counterparties meeting or exceeding fuzzy match cutoff"
            />
            <StatCard
              label="Cleared Entities"
              value={stats.cleared}
              accent="emerald"
              subtext="Below risk threshold"
              tooltip="Counterparties cleared for straight-through processing"
            />
            <StatCard
              label="Escalation Rate"
              value={`${stats.escalation_rate}%`}
              accent="orange"
              subtext={`Sensitivity: ${threshold}% threshold`}
              tooltip="Percentage of counterparties flagged for human compliance review"
            />
          </div>
        )}

        {/* 70/30 SPLIT ARCHITECTURE — Real Rails Master Manifesto Protocol */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* 70% MAIN STAGE */}
          <section className="lg:col-span-7 space-y-5">
            {/* Control & Chart Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatchDistributionChart cases={cases} />
              <ThresholdSlider
                value={threshold}
                onChange={handleThresholdChange}
              />
            </div>

            {/* Case Queue Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <span>Case Review Queue</span>
                  <span className="text-xs font-mono font-normal text-zinc-500">
                    ({filteredCases.length} displayed)
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Click any counterparty row to inspect match explainability and record compliance decisions.
                </p>
              </div>

              <CaseFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                search={search}
                onSearchChange={setSearch}
              />
            </div>

            {/* Table Component */}
            <ScreeningTable
              cases={filteredCases}
              loading={loading}
              onRowClick={setSelectedCase}
              selectedId={selectedCase?.id}
            />
          </section>

          {/* 30% INTELLIGENCE SIDEBAR — The Handshake & Rail Governance */}
          <div className="lg:col-span-3 sticky top-6">
            <IntelligenceSidebar
              selectedCase={selectedCase}
              onCaseUpdated={handleCaseUpdated}
              threshold={threshold}
              sources={sources}
              onOpenQuickScreen={() => setIsQuickScreenOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Ad-hoc Quick Screener Modal */}
      <QuickScreenModal
        isOpen={isQuickScreenOpen}
        onClose={() => setIsQuickScreenOpen(false)}
        defaultThreshold={threshold}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
  subtext,
  tooltip,
}: {
  label: string;
  value: string | number;
  accent: "zinc" | "red" | "emerald" | "orange";
  subtext?: string;
  tooltip: string;
}) {
  const accentColors: Record<string, string> = {
    zinc: "text-zinc-100",
    red: "text-red-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
  };

  return (
    <div
      title={tooltip}
      className="bg-zinc-900/60 backdrop-blur rounded-xl p-4 sm:p-5 border border-zinc-800 hover:border-zinc-700 transition-all cursor-help shadow-lg flex flex-col justify-between"
    >
      <div className="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${accentColors[accent]}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-[10px] text-zinc-500 font-mono mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}
