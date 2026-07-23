"use client";

import { useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";
import MainStage from "@/components/MainStage";
import IntelligenceSidebar from "@/components/IntelligenceSidebar";
import LiveStatusBar from "@/components/LiveStatusBar";

export default function DashboardPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenarioId, setScenarioId] = useState("full_network");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [headerTime, setHeaderTime] = useState("");

  useEffect(() => {
    const updateTime = () => setHeaderTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setScenarios([
        { id: "full_network", name: "Full Network", description: "All active hospitals" },
        { id: "peak_hours", name: "Peak Hours", description: "08:00 - 18:00 load" },
        { id: "weekend", name: "Weekend", description: "Reduced staffing models" },
        { id: "reroute", name: "Reroute Active", description: "Bypass full centers" }
      ]);
    }, 200);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData({
        scenario: scenarioId,
        metrics: {
          avgDTN: Math.floor(Math.random() * 40) + 45,
          meetingTarget: Math.floor(Math.random() * 50) + 30,
          thrombolysisRate: Math.floor(Math.random() * 15) + 10,
          goodOutcomeRate: Math.floor(Math.random() * 30) + 40,
        }
      });
      setLoading(false);
      showToast(`Scenario changed to: ${scenarioId}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [scenarioId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-obsidian text-gray-100">
      <LiveStatusBar />
      <header className="h-14 bg-navy border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 relative scanline-overlay">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-cyan/10 rounded border border-cyan/30 text-cyan animate-float">
            <Activity size={18} className="animate-pulse-slow" />
          </div>
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent mx-1"></div>
          <h1 className="font-semibold text-sm tracking-wide text-gray-200">
            REAL RAILS INTELLIGENCE
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-gray-400 font-normal">Stroke Care Network Analyser</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
            <span className="text-xs font-mono text-cyan">SYSTEM ONLINE</span>
            <span className="text-slate-500 mx-1">|</span>
            <span className="text-xs font-mono text-gray-300 w-[55px] text-right">{headerTime || "00:00:00"}</span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden bg-grid-pattern relative">
        <div className="flex-[7] min-w-0 overflow-y-auto relative z-10">
          <MainStage data={data} loading={loading} />
        </div>
        <div className="flex-[3] min-w-[320px] max-w-[450px] border-l border-slate-800 bg-navy overflow-y-auto relative z-10">
          <IntelligenceSidebar scenarioId={scenarioId} setScenarioId={setScenarioId} data={data} loading={loading} scenarios={scenarios} />
        </div>
      </div>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glassmorphism rounded-lg overflow-hidden animate-slide-in-toast cyan-border-glow min-w-[280px]">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="text-cyan"><Activity size={16} /></div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <div className="h-1 bg-slate-800 w-full relative">
            <div className="absolute top-0 left-0 h-full bg-cyan animate-progress-fill" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
