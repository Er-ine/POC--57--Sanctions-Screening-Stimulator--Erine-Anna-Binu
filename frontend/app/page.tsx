"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchCases, fetchStats } from "@/lib/api";
import ScreeningTable from "@/components/ScreeningTable";
import ThresholdSlider from "@/components/ThresholdSlider";
import InfoPanel from "@/components/InfoPanel";
import MatchDistributionChart from "@/components/MatchDistributionChart";
import CaseDetailModal from "@/components/CaseDetailModal";
import CaseFilters from "@/components/CaseFilters";

export default function Home() {
  const [threshold, setThreshold] = useState(70);
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "escalated" | "cleared">("all");
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchCases(threshold), fetchStats(threshold)])
      .then(([c, s]) => {
        setCases(c);
        setStats(s);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }, [threshold]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [cases, statusFilter, search]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 sm:space-y-10">
        <header className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 p-6 sm:p-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <p className="text-orange-400 text-xs font-medium tracking-widest uppercase mb-2">
            Governance &amp; Trust · Real Rails Intelligence Library
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Sanctions Screening Simulator
          </h1>
          <p className="text-zinc-400 mt-2 max-w-2xl text-sm sm:text-base">
            Fuzzy name matching against the OFAC sanctions list, with explainable
            confidence scoring and an escalation workflow for compliance review.
          </p>
        </header>

        <InfoPanel />

        {error && (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 text-red-300 text-sm">
            Could not load data from the backend: {error}. Make sure the FastAPI
            server is running at http://localhost:8000.
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Total Screened" value={stats.total} accent="zinc" tooltip="Total counterparties screened against the sanctions list at the current threshold" />
            <StatCard label="Escalated" value={stats.escalated} accent="red" tooltip="Cases where the fuzzy-match confidence score met or exceeded the threshold" />
            <StatCard label="Cleared" value={stats.cleared} accent="emerald" tooltip="Cases below the match threshold — no action required" />
            <StatCard label="Escalation Rate" value={`${stats.escalation_rate}%`} accent="orange" tooltip="Percentage of screened counterparties flagged for review" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MatchDistributionChart cases={cases} />
          </div>
          <ThresholdSlider value={threshold} onChange={setThreshold} />
        </div>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="text-lg font-medium text-zinc-200">Case Queue</h2>
            <CaseFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
          <ScreeningTable
            cases={filteredCases}
            loading={loading}
            onRowClick={setSelectedCase}
          />
        </section>
      </div>

      {selectedCase && (
        <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </main>
  );
}

function StatCard({ label, value, accent, tooltip }: { label: string; value: any; accent: string; tooltip: string }) {
  const accentColors: Record<string, string> = {
    zinc: "text-zinc-300",
    red: "text-red-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
  };
  return (
    <div
      title={tooltip}
      className="bg-zinc-900/60 backdrop-blur rounded-xl p-4 sm:p-5 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-help"
    >
      <div className="text-zinc-500 text-xs uppercase tracking-wide">{label}</div>
      <div className={`text-2xl sm:text-3xl font-semibold mt-2 ${accentColors[accent]}`}>{value}</div>
    </div>
  );
}
