"use client";

import React, { useState } from 'react';
import { Download, AlertTriangle, Info, Zap, Lightbulb, Target } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import RiskGauge from './RiskGauge';
import WeatherEventCard from './WeatherEventCard';
import ScenarioSelector from './ScenarioSelector';

export default function IntelligenceSidebar({
  scenarioId,
  setScenarioId,
  data,
  sourceConfidence,
  loading,
  scenarios
}: any) {
  const [downloading, setDownloading] = useState(false);
  const metrics = data?.scenario?.metrics || {};
  const animatedVar = useCountUp(metrics.total_value_at_risk_usd || 0, 1500);

  const riskScore = metrics.critical_routes ? (metrics.critical_routes / (metrics.critical_routes + (metrics.warning_routes || 0) + (metrics.nominal_routes || 0))) * 100 : 0;
  
  const handleDownload = () => {
    setDownloading(true);
    // Trigger download from backend
    window.open(`http://localhost:8000/api/download/${scenarioId}`, '_blank');
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B1117] border-l border-[#1F2937] overflow-y-auto animate-slide-in-right">
      <div className="p-6 flex-1 flex flex-col gap-6">
        
        {/* Top Risk Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-1">{data?.sidebar?.metric_label || "Value at Risk"}</h2>
            <div className="text-3xl font-mono text-[#38BDF8] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
              ${(animatedVar / 1000000).toFixed(1)}M
            </div>
          </div>
          <RiskGauge riskScore={Math.min(riskScore * 1.5, 100)} />
        </div>

        <ScenarioSelector scenarios={scenarios || []} activeId={scenarioId} onChange={setScenarioId} />

        <WeatherEventCard events={data?.weather_events || []} />

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#1F2937]/50 rounded-lg border border-[#1F2937]">
            <div className="text-xs text-gray-400 mb-1">Downstream Impact</div>
            <div className="text-xl font-mono text-red-400">
              {metrics.downstream_manufacturing_impact_days || 0}d
            </div>
          </div>
          <div className="p-3 bg-[#1F2937]/50 rounded-lg border border-[#1F2937]">
            <div className="text-xs text-gray-400 mb-1">Max Delay</div>
            <div className="text-xl font-mono text-amber-400">
              {metrics.max_delay_days || 0}d
            </div>
          </div>
        </div>

        {/* Route Status Badges */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col items-center p-2 rounded bg-red-900/20 border border-red-900/50">
            <span className="text-2xl font-mono text-red-500 animate-pulse-glow">{metrics.critical_routes || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-red-400">Critical</span>
          </div>
          <div className="flex-1 flex flex-col items-center p-2 rounded bg-amber-900/20 border border-amber-900/50">
            <span className="text-2xl font-mono text-amber-500">{metrics.warning_routes || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400">Warning</span>
          </div>
        </div>

        {/* Intelligence Briefs */}
        <div className="space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-[#38BDF8]" /> Why This Matters
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#1F2937]/30 p-3 rounded-md border border-[#1F2937]">
              {data?.sidebar?.why_this_matters || "No briefing available."}
            </p>
          </div>
          
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Info className="w-4 h-4 text-[#818CF8]" /> Who Controls The Rail
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#1F2937]/30 p-3 rounded-md border border-[#1F2937]">
              {data?.sidebar?.who_controls_the_rail || "No authority data available."}
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Target className="w-4 h-4 text-green-400" /> Decisions to Make
            </h3>
            <div className="text-sm text-gray-300 leading-relaxed bg-[#1F2937]/30 p-3 rounded-md border border-[#1F2937] whitespace-pre-line">
              {data?.sidebar?.what_decisions_can_be_made || "No decisions available."}
            </div>
          </div>
          
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Derived Insights
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#1F2937]/30 p-3 rounded-md border border-[#1F2937]">
              {data?.sidebar?.what_insights_can_be_derived || "No insights available."}
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F2937] bg-black/20">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8] rounded-md transition-all duration-300 font-semibold text-sm"
        >
          {downloading ? (
            <span className="animate-pulse">Downloading...</span>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Intelligence Report
            </>
          )}
        </button>
        <div className="mt-3 text-center text-[10px] tracking-widest text-gray-500 font-mono">
          DATA CLASSIFICATION: SYNTHETIC
        </div>
      </div>
    </div>
  );
}
