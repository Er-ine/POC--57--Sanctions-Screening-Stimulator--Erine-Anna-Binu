"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { CheckCircle } from 'lucide-react';

export default function DelayChart({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0 || timeline.every(t => t.cumulative_cost_usd === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-[#0B1117] border border-[#1F2937] rounded-lg text-gray-400">
        <CheckCircle className="w-12 h-12 text-green-500 mb-2 opacity-50" />
        <p>No disruption timeline for this scenario.</p>
      </div>
    );
  }

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '$0';
    if (tickItem >= 1000000000) return `$${(tickItem / 1000000000).toFixed(1)}B`;
    return `$${(tickItem / 1000000).toFixed(0)}M`;
  };

  // Find peak point for reference dot
  const peakPoint = timeline.reduce((max, p) => p.cumulative_cost_usd > max.cumulative_cost_usd ? p : max, timeline[0]);

  return (
    <div className="h-64 w-full bg-[#0B1117] p-4 border border-[#1F2937] rounded-lg animate-slide-in-bottom">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#4B5563" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            tickMargin={10}
          />
          <YAxis 
            stroke="#4B5563" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={formatYAxis}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B1117', borderColor: '#38BDF8', borderRadius: '8px' }}
            itemStyle={{ color: '#E5E7EB' }}
            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
            formatter={(value: number) => [formatYAxis(value), 'Cost Impact']}
            labelFormatter={(label) => {
              const pt = timeline.find(t => t.day === label);
              return `${pt?.label || `Day ${label}`} (${pt?.routes_affected} routes)`;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="cumulative_cost_usd" 
            stroke="#38BDF8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCost)" 
            animationDuration={1500}
            animationEasing="ease-out"
          />
          {timeline.filter(t => t.label && t.label !== `Day ${t.day}`).map((t, idx) => (
            <ReferenceLine key={idx} x={t.day} stroke="#F59E0B" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t.label, fill: '#F59E0B', fontSize: 10 }} />
          ))}
          {peakPoint && peakPoint.cumulative_cost_usd > 0 && (
             <ReferenceDot x={peakPoint.day} y={peakPoint.cumulative_cost_usd} r={4} fill="#EF4444" stroke="none" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
