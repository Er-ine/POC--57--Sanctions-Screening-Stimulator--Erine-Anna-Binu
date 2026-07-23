"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Satellite, Database, Radio, Building2 } from 'lucide-react';

export default function SourceConfidencePanel({ sources }: { sources: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!sources || sources.length === 0) return null;

  const avgConfidence = sources.reduce((acc, s) => acc + s.confidence, 0) / sources.length;

  return (
    <div className="w-full bg-[#0B1117] border border-[#1F2937] rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[#1F2937]/30 hover:bg-[#1F2937]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Intelligence Sources</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">System Avg:</span>
            <span className="text-sm font-mono text-[#38BDF8]">{Math.round(avgConfidence * 100)}%</span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 animate-expand-row border-t border-[#1F2937]">
          {sources.map((source, idx) => {
            let Icon = Database;
            if (source.type === 'satellite') Icon = Satellite;
            if (source.type === 'ais') Icon = Radio;
            if (source.type === 'port_authority') Icon = Building2;

            return (
              <div key={idx} className="group relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-300">{source.source}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{Math.round(source.confidence * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#38BDF8] transition-all duration-1000 ease-out"
                    style={{ width: mounted ? `${source.confidence * 100}%` : '0%' }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-500 uppercase tracking-wide">
                  <span>Freq: {source.update_frequency}</span>
                  <span>Latency: {source.latency}</span>
                </div>
                
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-2 bg-[#1F2937] text-xs text-gray-300 rounded shadow-xl z-20">
                  {source.notes}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
