"use client";

import React from 'react';
import DelayChart from './DelayChart';
import ImpactChain from './ImpactChain';
import RouteStatusTable from './RouteStatusTable';
import SourceConfidencePanel from './SourceConfidencePanel';

export default function MainStage({ data, loading }: { data: any, loading: boolean }) {
  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="h-20 bg-[#1F2937] rounded-lg animate-shimmer border border-[#374151]"></div>
        <div className="h-32 bg-[#1F2937] rounded-lg animate-shimmer border border-[#374151]"></div>
        <div className="h-64 bg-[#1F2937] rounded-lg animate-shimmer border border-[#374151]"></div>
        <div className="h-96 bg-[#1F2937] rounded-lg animate-shimmer border border-[#374151]"></div>
      </div>
    );
  }

  if (!data) return <div className="flex-1 flex items-center justify-center text-gray-500">No data available.</div>;

  const { scenario, routes, delay_timeline, impact_chain, source_confidence } = data;
  
  // Safely check if scenario exists before accessing its properties
  const severity = scenario?.metrics?.critical_routes > 0 ? 'critical' : (scenario?.metrics?.warning_routes > 0 ? 'warning' : 'nominal');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gradient-to-br from-[#030712] to-[#0B1117] p-6 gap-6 relative">
      
      {/* Briefing Header */}
      <div className="border-b border-[#1F2937] pb-4 animate-slide-in-bottom" style={{ animationDelay: '0ms' }}>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{scenario?.name || 'Loading Scenario...'}</h1>
        <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">{scenario?.description || ''}</p>
      </div>

      {/* Impact Chain */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Event Impact Chain</h2>
        </div>
        <ImpactChain stages={impact_chain || []} severity={severity} />
      </section>

      {/* Disruption Timeline */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Disruption Cost Timeline</h2>
          <span className="px-2 py-0.5 bg-[#1F2937] text-gray-300 text-[10px] rounded-full font-mono border border-gray-700">
            {delay_timeline?.length || 0} Days
          </span>
        </div>
        <DelayChart timeline={delay_timeline || []} />
      </section>

      {/* Route Intelligence */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Route Intelligence</h2>
          <span className="px-2 py-0.5 bg-[#1F2937] text-gray-300 text-[10px] rounded-full font-mono border border-gray-700">
            {routes?.length || 0} Routes Monitored
          </span>
        </div>
        <RouteStatusTable routes={routes || []} />
      </section>

      {/* Source Confidence */}
      <section className="animate-slide-in-bottom pb-8" style={{ animationDelay: '400ms' }}>
        <SourceConfidencePanel sources={source_confidence || []} />
      </section>

    </div>
  );
}
