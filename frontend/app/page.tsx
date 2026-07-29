"use client";
import { useEffect, useState } from "react";
import { fetchCases, fetchStats } from "@/lib/api";
import ScreeningTable from "@/components/ScreeningTable";
import ThresholdSlider from "@/components/ThresholdSlider";
import InfoPanel from "@/components/InfoPanel";

export default function Home() {
  const [threshold, setThreshold] = useState(70);
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchCases(threshold).then(setCases);
    fetchStats(threshold).then(setStats);
  }, [threshold]);

  return (
    <main className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Sanctions Screening Simulator</h1>
        <p className="text-zinc-400 mt-1">Governance & Trust — Real Rails Intelligence Library</p>
      </header>

      <InfoPanel />

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Screened" value={stats.total} />
          <StatCard label="Escalated" value={stats.escalated} />
          <StatCard label="Escalation Rate" value={`${stats.escalation_rate}%`} />
        </div>
      )}

      <ThresholdSlider value={threshold} onChange={setThreshold} />
      <ScreeningTable cases={cases} />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="text-zinc-400 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}