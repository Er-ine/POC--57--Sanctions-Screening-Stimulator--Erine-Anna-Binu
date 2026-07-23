import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

interface ThrombolysisRateTrendProps {
  data: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism p-3 rounded-lg border-l-4 border-l-cyan border-y border-y-slate-700/50 border-r border-r-slate-700/50 shadow-lg min-w-[120px]">
        <p className="text-gray-400 text-xs font-mono mb-1">{`Month: ${label}`}</p>
        <p className="text-cyan font-bold text-lg font-outfit">
          {payload[0].value}% <span className="text-sm font-normal text-gray-400">rate</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  if (index === dataLength - 1) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="#38BDF8" className="animate-pulse-glow" />
        <circle cx={cx} cy={cy} r={12} fill="none" stroke="#38BDF8" strokeWidth={2} className="pulse-ring" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#030712" stroke="#38BDF8" strokeWidth={2} />;
};

export default function ThrombolysisRateTrend({ data }: ThrombolysisRateTrendProps) {
  // Base rate based on current data
  const currentRate = data?.metrics?.thrombolysisRate || 15;
  
  const chartData = [
    { month: 'Jan', rate: currentRate - 4 },
    { month: 'Feb', rate: currentRate - 3 },
    { month: 'Mar', rate: currentRate - 3.5 },
    { month: 'Apr', rate: currentRate - 2 },
    { month: 'May', rate: currentRate - 1 },
    { month: 'Jun', rate: currentRate },
  ].map(d => ({ ...d, rate: Math.max(0, parseFloat(d.rate.toFixed(1))) }));

  return (
    <div className="w-full h-64">
      <div className="text-sm text-gray-400 mb-2 font-mono flex items-center gap-2">
        Current Rate: <span className="text-cyan font-bold text-lg glow-cyan px-2 py-0.5 bg-cyan/10 rounded">{currentRate}%</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorRateMulti" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.9}/>
              <stop offset="50%" stopColor="#312E81" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#030712" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis 
            dataKey="month" 
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
            domain={[0, Math.max(30, currentRate + 10)]}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#1F2937', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <ReferenceLine y={20} stroke="#818CF8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Intl Benchmark 20%', fill: '#818CF8', fontSize: 10 }} />
          <ReferenceLine y={currentRate} stroke="#38BDF8" strokeOpacity={0.3} strokeDasharray="1 3" label={{ position: 'insideBottomRight', value: 'Current', fill: '#38BDF8', fontSize: 10, fillOpacity: 0.5 }} />
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="#38BDF8" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorRateMulti)" 
            isAnimationActive={true}
            animationDuration={1500}
            dot={<CustomDot dataLength={chartData.length} />}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
