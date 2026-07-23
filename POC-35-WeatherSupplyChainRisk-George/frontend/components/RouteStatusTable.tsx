"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

export default function RouteStatusTable({ routes }: { routes: any[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>('delay');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sortedRoutes = [...(routes || [])].sort((a, b) => {
    let valA, valB;
    if (sortCol === 'route') { valA = a.name; valB = b.name; }
    else if (sortCol === 'status') { valA = a.status; valB = b.status; }
    else if (sortCol === 'delay') { valA = a.delay_days; valB = b.delay_days; }
    else { valA = a.confidence; valB = b.confidence; }
    
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full overflow-hidden bg-[#0B1117] border border-[#1F2937] rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#1F2937]/50 text-xs uppercase text-gray-400 font-semibold tracking-wider">
          <tr>
            <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('route')}>Route</th>
            <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>Status</th>
            <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('delay')}>Delay Impact</th>
            <th className="px-4 py-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('confidence')}>Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]">
          {sortedRoutes.map((route, idx) => {
            const isCritical = route.status === 'critical';
            const isWarning = route.status === 'warning';
            const statusColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500';
            const borderColor = isCritical ? 'border-l-red-500' : isWarning ? 'border-l-amber-500' : 'border-l-green-500';
            const isExpanded = expandedRow === route.id;

            return (
              <React.Fragment key={route.id}>
                <tr 
                  className={`hover:bg-[#1F2937]/30 cursor-pointer transition-colors border-l-4 ${borderColor} ${idx % 2 === 0 ? 'bg-[#0B1117]' : 'bg-[#111827]'}`}
                  onClick={() => setExpandedRow(isExpanded ? null : route.id)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      {route.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{route.origin.port} → {route.destination.port}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide
                      ${isCritical ? 'bg-red-900/40 text-red-400 border border-red-500/30 animate-pulse-glow' : 
                        isWarning ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 
                        'bg-green-900/40 text-green-400 border border-green-500/30'}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-green-400'}`}>
                        +{route.delay_days}d
                      </span>
                      <div className="w-16 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                        <div className={`h-full ${statusColor}`} style={{ width: `${Math.min((route.delay_days / route.base_lead_time_days) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 group relative">
                      <span className="font-mono text-gray-300">{Math.round(route.confidence * 100)}%</span>
                      <Info className="w-3 h-3 text-gray-500" />
                      <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#1F2937] text-xs text-left rounded shadow-xl z-10">
                        Confidence score based on recent satellite AIS data and port authority reports.
                      </div>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-[#0f151d] animate-expand-row">
                    <td colSpan={4} className="px-4 py-4 border-l-4 border-l-transparent">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="text-gray-500 mb-1">Commodity</div>
                          <div className="font-medium text-gray-200">{route.commodity}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Carrier Count</div>
                          <div className="font-medium text-gray-200">{route.carrier_count}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Annual Volume</div>
                          <div className="font-medium text-gray-200">${(route.annual_volume_usd / 1000000).toFixed(1)}M</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Vessel Capacity</div>
                          <div className="font-medium text-gray-200">{route.vessel_capacity_teu} TEU</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
