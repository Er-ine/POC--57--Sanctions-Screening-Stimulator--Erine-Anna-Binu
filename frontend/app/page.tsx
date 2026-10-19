```tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<ScreeningCase | null>(null);
  const [isQuickScreenOpen, setIsQuickScreenOpen] = useState<boolean>(false);
  const [isDeveloperInfoOpen, setIsDeveloperInfoOpen] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  const developerInfoDialogRef = useRef<HTMLDialogElement>(null);
  const intelligenceTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isIntelligenceOpen) return;

    const trigger = intelligenceTriggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsIntelligenceOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = document.getElementById("intelligence-layer-dialog");
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [isIntelligenceOpen]);

  const closeDeveloperInfo = () => {
    developerInfoDialogRef.current?.close();
    setIsDeveloperInfoOpen(false);
  };

  useEffect(() => {
    const dialog = developerInfoDialogRef.current;
    if (!dialog) return;

    if (!isDeveloperInfoOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialog.close();
        setIsDeveloperInfoOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDeveloperInfoOpen]);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([fetchCases(threshold), fetchStats(threshold)]).then(
      ([caseResult, statsResult]) => {
        if (!isMounted) return;

        const failures: string[] = [];

        if (caseResult.status === "fulfilled") {
          const nextCases = caseResult.value;
          setCaseError(null);
          setCases(nextCases);
          setSelectedCase((previous) => {
            if (!previous) return nextCases[0] || null;
            return (
              nextCases.find((item) => item.id === previous.id) ||
              nextCases[0] ||
              null
            );
          });
        } else {
          const message =
            caseResult.reason instanceof Error
              ? caseResult.reason.message
              : "Failed to load screening cases.";

          failures.push(message);
          setCaseError(message);
          setCases([]);
          setSelectedCase(null);
        }

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value);
        } else {
          failures.push(
            statsResult.reason instanceof Error
              ? statsResult.reason.message
              : "Failed to load screening statistics."
          );
          setStats(null);
        }

        setError(failures.length > 0 ? failures.join(" · ") : null);
        setLoading(false);
      }
    );

    fetchSourceConfidence()
      .then((sourceData) => {
        if (!isMounted) return;
        setSources(sourceData);
        setSourcesLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;

        setSources([]);
        setSourceError(
          err instanceof Error
            ? err.message
            : "Failed to load source provenance."
        );
        setSourcesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [threshold, reloadVersion]);

  const handleThresholdChange = (newVal: number) => {
    setLoading(true);
    setError(null);
    setCaseError(null);
    setSourceError(null);
    setSourcesLoading(true);
    setThreshold(newVal);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setCaseError(null);
    setSourceError(null);
    setSourcesLoading(true);
    setReloadVersion((version) => version + 1);
  };

  const handleCaseUpdated = (updated: ScreeningCase) => {
    setCases((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedCase(updated);

    fetchStats(threshold)
      .then((s) => setStats(s))
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? `Decision saved, but dashboard metrics could not refresh: ${err.message}`
            : "Decision saved, but dashboard metrics could not refresh."
        );
      });
  };

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();

    return cases.filter((c) => {
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesCandidate = c.matched_name
        ? c.matched_name.toLowerCase().includes(q)
        : false;

      return matchesStatus && (matchesName || matchesCandidate);
    });
  }, [cases, statusFilter, search]);

  return (
    <main
      className="min-h-screen text-zinc-100"
      style={{ backgroundColor: "#030712" }}
    >
      <div className="mx-auto max-w-[1720px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <button
            type="button"
            onClick={() => setIsDeveloperInfoOpen(true)}
            aria-label="Developer information"
            title="Developer information"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-orange-300 bg-orange-500 text-xl font-bold italic text-zinc-950 shadow-lg shadow-orange-950/60 transition-colors hover:border-orange-200 hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            i
          </button>

          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="pr-12 sm:pr-14">
              <p className="mb-1.5 font-mono text-xs font-medium uppercase tracking-widest text-orange-400">
                Governance &amp; Trust · Real Rails Intelligence Library
                (Batch 6 · POC-57)
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Sanctions Screening Simulator
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                Production-grade compliance screening against the official U.S.
                OFAC Specially Designated Nationals (SDN) sanctions dataset.
                Real-time RapidFuzz string distance, explainable match scoring,
                and review decision persistence.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 self-end">
              <button
                ref={intelligenceTriggerRef}
                type="button"
                onClick={() => setIsIntelligenceOpen(true)}
                aria-haspopup="dialog"
                aria-controls="intelligence-layer-dialog"
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-100 transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                Intelligence Layer
              </button>

              <button
                type="button"
                onClick={() => setIsQuickScreenOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-950/40 transition-all hover:bg-orange-600"
              >
                <span>🔍</span> Quick Screen Single Entity
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-900 bg-red-950/60 p-4 text-xs text-red-200 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 break-words">
              <strong>Dashboard data issue:</strong> {error}
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded bg-red-900 px-3 py-1 text-xs text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

        <div className="grid grid-cols-1 items-start gap-6">
          <section className="min-w-0 space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="min-w-0">
                <MatchDistributionChart
                  cases={cases}
                  unavailable={Boolean(caseError)}
                  loading={loading}
                />
              </div>

              <div className="min-w-0">
                <ThresholdSlider
                  value={threshold}
                  onChange={handleThresholdChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
                  <span>Case Review Queue</span>
                  <span className="font-mono text-xs font-normal text-zinc-500">
                    ({loading ? "loading" : `${filteredCases.length} displayed`})
                  </span>
                </h2>

                <p className="text-[11px] text-zinc-400">
                  Click any counterparty row to inspect match explainability and
                  record compliance decisions.
                </p>
              </div>

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
              hasError={Boolean(caseError)}
              totalCaseCount={cases.length}
              onRowClick={setSelectedCase}
              selectedId={selectedCase?.id}
            />
          </section>
        </div>

        {isIntelligenceOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Dismiss Intelligence Layer"
              onClick={() => setIsIntelligenceOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
            />

            <div
              id="intelligence-layer-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="intelligence-layer-title"
              className="relative z-10 h-dvh w-full max-w-xl overflow-y-auto border-l border-zinc-700 bg-zinc-950 shadow-2xl"
            >
              <IntelligenceSidebar
                selectedCase={selectedCase}
                onCaseUpdated={handleCaseUpdated}
                threshold={threshold}
                sources={sources}
                sourceError={sourceError}
                sourcesLoading={sourcesLoading}
                onOpenQuickScreen={() => setIsQuickScreenOpen(true)}
                onClose={() => setIsIntelligenceOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      <QuickScreenModal
        isOpen={isQuickScreenOpen}
        onClose={() => setIsQuickScreenOpen(false)}
        defaultThreshold={threshold}
      />

      <dialog
        ref={developerInfoDialogRef}
        aria-labelledby="developer-info-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDeveloperInfo();
        }}
        onClose={() => setIsDeveloperInfoOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDeveloperInfo();
          }
        }}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-zinc-700 bg-zinc-950 p-0 text-zinc-100 shadow-2xl backdrop:bg-zinc-950/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/30 p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl"
          />

          <div className="relative">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange-400">
                  Developer information
                </p>

                <h2
                  id="developer-info-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-white"
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                    Developer
                  </span>
                  <span className="mt-1 block">Erine Anna Binu</span>
                </h2>
              </div>

              <button
                type="button"
                autoFocus
                onClick={closeDeveloperInfo}
                aria-label="Close developer information"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                Project
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                POC-57 — Sanctions Screening Simulator
              </p>

              <p className="mt-3 text-xs text-zinc-400">
                Infocreon Internship
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <a
                  href="https://github.com/Er-ine"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  GitHub profile
                </a>

                <a
                  href="https://github.com/Real-Rails-Interns-Batch2/POC-57-Sanctions-Screening-Simulator-Phase-2"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  Project repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </dialog>
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
      className="flex cursor-help flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-lg backdrop-blur transition-all hover:border-zinc-700 sm:p-5"
    >
      <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
        {label}
      </div>

      <div
        className={`mt-1 font-mono text-2xl font-bold sm:text-3xl ${accentColors[accent]}`}
      >
        {value}
      </div>

      {subtext && (
        <div className="mt-1 truncate font-mono text-[10px] text-zinc-500">
          {subtext}
        </div>
      )}
    </div>
  );
}
```