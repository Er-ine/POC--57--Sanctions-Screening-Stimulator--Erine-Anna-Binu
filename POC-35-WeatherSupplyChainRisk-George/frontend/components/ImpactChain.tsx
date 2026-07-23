"use client";

import React from 'react';
import { CloudLightning, Anchor, Ship, Layers, Clock, Factory, ShoppingCart } from 'lucide-react';

const ICONS: Record<string, any> = {
  CloudLightning, Anchor, Ship, Layers, Clock, Factory, ShoppingCart
};

export default function ImpactChain({ stages, severity }: { stages: any[], severity: string }) {
  const isCritical = severity === 'critical';
  const isWarning = severity === 'warning';
  
  return (
    <div className="w-full bg-[#0B1117] p-6 border border-[#1F2937] rounded-lg">
      <div className="flex items-center justify-between relative">
        
        {/* Connector Line Base */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#1F2937] -translate-y-1/2 z-0 rounded"></div>
        
        {/* Animated Connector Line overlay (only if active) */}
        {(isCritical || isWarning) && (
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 z-0 overflow-hidden rounded">
            <div className={`h-full w-full ${isCritical ? 'bg-red-500/50' : 'bg-amber-500/50'}`}></div>
            <div className="absolute top-0 left-0 h-full w-2 bg-white animate-flow-particle shadow-[0_0_8px_white]"></div>
          </div>
        )}

        {stages?.map((stage, idx) => {
          const IconComp = ICONS[stage.icon] || Clock;
          
          // Progressive highlight logic
          const isActive = (isCritical || isWarning);
          const iconColor = isActive ? (isCritical ? 'text-red-400' : 'text-amber-400') : 'text-gray-500';
          const bgColor = isActive ? (isCritical ? 'bg-red-900/30' : 'bg-amber-900/30') : 'bg-[#1F2937]';
          const borderColor = isActive ? (isCritical ? 'border-red-500' : 'border-amber-500') : 'border-[#374151]';
          const glow = isActive ? (isCritical ? 'shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'shadow-[0_0_10px_rgba(245,158,11,0.4)]') : '';

          // For the last two items, align the tooltip to the right edge so it doesn't go off-screen
          const tooltipPosition = idx > 4 ? "right-0" : "left-1/2 -translate-x-1/2";

          return (
            <div 
              key={idx} 
              className="relative z-10 flex flex-col items-center group cursor-help" 
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1F2937] text-gray-400 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-700">
                {stage.order}
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${bgColor} ${borderColor} ${glow} transition-all duration-300 group-hover:scale-110`}>
                <IconComp className={`w-5 h-5 ${iconColor}`} />
              </div>
              
              <div className="mt-2 text-xs font-semibold text-center text-gray-300 w-24">
                {stage.name}
              </div>

              {/* Tooltip */}
              <div className={`absolute top-full mt-2 w-48 p-2 bg-[#1F2937] border border-[#38BDF8]/30 text-xs text-gray-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${tooltipPosition}`}>
                {stage.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
