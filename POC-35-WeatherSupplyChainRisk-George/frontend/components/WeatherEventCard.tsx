"use client";

import React from 'react';
import { CloudLightning, Wind, CloudRain, Droplets, CloudSnow, ShieldCheck } from 'lucide-react';

export default function WeatherEventCard({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 border border-[#1F2937] bg-[#0B1117] rounded-lg animate-slide-in-right flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-green-500" />
        <div>
          <div className="text-sm font-semibold text-green-400">No Active Threats</div>
          <div className="text-xs text-gray-400">Base operating scenario</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event, idx) => {
        let Icon = CloudRain;
        if (event.type?.toLowerCase().includes('hurricane')) Icon = CloudLightning;
        if (event.type?.toLowerCase().includes('typhoon')) Icon = Wind;
        if (event.type?.toLowerCase().includes('flood')) Icon = Droplets;
        if (event.type?.toLowerCase().includes('cyclone')) Icon = CloudSnow;

        return (
          <div key={idx} className="p-4 border border-[#1F2937] bg-[#0B1117] rounded-lg animate-slide-in-right glassmorphism cyan-border-glow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-[#38BDF8]" />
                <span className="font-bold text-sm text-white">{event.name}</span>
              </div>
              <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-red-900/50 text-red-400 rounded-sm animate-pulse-glow">
                {event.category || 'Warning'}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 mb-3">
              Max Wind: <span className="text-white font-mono">{event.wind_speed_mph || '--'} mph</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {event.affected_ports?.map((port: string, pIdx: number) => (
                <span key={pIdx} className="px-1.5 py-0.5 text-[10px] bg-[#1F2937] text-gray-300 rounded border border-gray-700">
                  {port}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
