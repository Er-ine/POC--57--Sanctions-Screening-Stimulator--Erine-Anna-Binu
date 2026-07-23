"use client";

import React, { useEffect, useRef } from 'react';

export default function ScenarioSelector({ scenarios, activeId, onChange }: { scenarios: any[], activeId: string, onChange: (id: string) => void }) {
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < scenarios.length - 1) onChange(scenarios[index + 1].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) onChange(scenarios[index - 1].id);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">Select Intelligence Scenario</div>
      {(scenarios || []).map((s, idx) => {
        const isActive = s.id === activeId;
        const isBase = s.id.includes('base') || s.id === 'base_00';
        const dotColor = isBase ? 'bg-green-500' : 'bg-red-500';
        
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`text-left p-3 rounded-md transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#38BDF8]
              ${isActive ? 'bg-[#1F2937] border-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)] transform scale-[1.02]' : 'bg-[#0B1117] border-[#1F2937] hover:border-gray-600 hover:scale-[1.01]'}
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor} ${isActive && !isBase ? 'animate-pulse' : ''}`}></div>
                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{s.name}</span>
              </div>
            </div>
            
            {s.metrics && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Avg Delay:</span>
                  <span className={`font-mono ${isActive ? 'text-[#38BDF8]' : 'text-gray-300'}`}>{s.metrics.average_delay_days || 0}d</span>
                </div>
                {s.metrics.critical_routes > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Critical:</span>
                    <span className="text-red-400 font-mono">{s.metrics.critical_routes}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
