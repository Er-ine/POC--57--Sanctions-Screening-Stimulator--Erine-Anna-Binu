import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';

interface DoorToNeedleChartProps {
  data: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism p-3 rounded-lg border-l-4 border-l-cyan border-y border-y-slate-700/50 border-r border-r-slate-700/50 shadow-lg min-w-[120px]">
        <p className="text-gray-400 text-xs font-mono mb-1">{`Time Range: ${label}m`}</p>
        <p className="text-cyan font-bold text-lg font-outfit">
          {payload[0].value} <span className="text-sm font-normal text-gray-400">cases</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DoorToNeedleChart({ data }: DoorToNeedleChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Simulate data distribution around the avgDTN
  const avg = data?.metrics?.avgDTN || 60;
  
  const chartData = [
    { range: '0-15', count: Math.max(0, 5 - Math.abs(avg - 10) / 10), fillId: 'colorGreen' },
    { range: '15-30', count: Math.max(0, 15 - Math.abs(avg - 25) / 5), fillId: 'colorGreen' },
    { range: '30-45', count: Math.max(0, 35 - Math.abs(avg - 40) / 2), fillId: 'colorGreen' },
    { range: '45-60', count: Math.max(0, 45 - Math.abs(avg - 55) / 2), fillId: 'colorGreen' },
    { range: '60-75', count: Math.max(0, 30 - Math.abs(avg - 70) / 2), fillId: 'colorAmber' },
    { range: '75-90', count: Math.max(0, 15 - Math.abs(avg - 85) / 5), fillId: 'colorAmber' },
    { range: '90-105', count: Math.max(0, 8 - Math.abs(avg - 100) / 10), fillId: 'colorRed' },
    { range: '>105', count: Math.max(0, 4 - Math.abs(avg - 115) / 20), fillId: 'colorRed' },
  ].map(d => ({ ...d, count: Math.floor(d.count * 10) }));

  return (
    <div className="w-full h-64">
      <div className="text-sm text-gray-400 mb-2 font-mono flex items-center gap-2">
        Cases meeting target: <span className="text-success font-bold text-lg glow-success px-2 py-0.5 bg-success/10 rounded">{data?.metrics?.meetingTarget || 0}%</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          onMouseMove={(state: any) => {
            if (state.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            } else {
              setActiveIndex(null);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis 
            dataKey="range" 
            stroke="#9CA3AF" 
            fontSize={10} 
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={10} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#1F2937', opacity: 0.3 }}
          />
          <ReferenceLine x="45-60" stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: '60m Target', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }} />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#${entry.fillId})`} 
                opacity={activeIndex === index ? 1 : 0.8}
                stroke={activeIndex === index ? (entry.fillId === 'colorGreen' ? '#22C55E' : entry.fillId === 'colorAmber' ? '#F59E0B' : '#EF4444') : 'none'}
                strokeWidth={activeIndex === index ? 2 : 0}
                style={{ filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none', transition: 'all 0.3s ease' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
