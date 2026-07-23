'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const StrokeUnitMapInner = dynamic(() => import('./StrokeUnitMapInner'), { 
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[500px] bg-obsidian rounded-xl border border-slate-800 animate-pulse-slow flex items-center justify-center text-slate-500 font-mono text-sm tracking-widest">INITIALIZING SECURE MAP...</div>
});

export default function StrokeUnitMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full min-h-[500px] bg-obsidian rounded-xl border border-slate-800 animate-pulse-slow"></div>;
  }

  return (
    <div className="relative h-full w-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-obsidian">
      {/* Map Container Inner Shadow/Vignette Effect */}
      <div className="absolute inset-0 z-[400] pointer-events-none shadow-[inset_0_0_80px_rgba(3,7,18,0.9)]" />
      
      <StrokeUnitMapInner />

      {/* Glassmorphism Legend */}
      <div className="absolute bottom-6 right-6 z-[400] glassmorphism p-4 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-2xl">
        <h4 className="text-xs font-bold text-slate-400 mb-3 tracking-widest font-mono">NETWORK STATUS</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_#4ade80]"></div>
            <span className="text-sm text-slate-200">Optimal (&lt;30m)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_#fbbf24]"></div>
            <span className="text-sm text-slate-200">Average (30-45m)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-critical shadow-[0_0_8px_#f87171]"></div>
            <span className="text-sm text-slate-200">Delayed (&gt;45m)</span>
          </div>
          <div className="w-full h-px bg-slate-700/50 my-2"></div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-cyan opacity-50 border-t border-dashed border-cyan"></div>
            <span className="text-sm text-slate-200">Transfer Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
