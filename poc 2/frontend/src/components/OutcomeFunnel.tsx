import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OutcomeFunnelProps {
  data: any;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glassmorphism p-3 border border-slate-700 rounded-lg shadow-xl">
        <p className="text-xs text-gray-300 font-mono mb-1">{data.name}</p>
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: data.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          {data.value}% of patients
        </p>
      </div>
    );
  }
  return null;
};

export default function OutcomeFunnel({ data }: OutcomeFunnelProps) {
  const goodPct = data?.metrics?.goodOutcomeRate || 50;
  
  const chartData = [
    { name: 'mRS 0 (No symptoms)', value: Math.floor(goodPct * 0.4), color: '#22C55E' },
    { name: 'mRS 1 (No significant disability)', value: Math.floor(goodPct * 0.4), color: '#4ADE80' },
    { name: 'mRS 2 (Slight disability)', value: Math.floor(goodPct * 0.2), color: '#86EFAC' },
    { name: 'mRS 3 (Moderate disability)', value: Math.floor((100 - goodPct) * 0.3), color: '#FCD34D' },
    { name: 'mRS 4 (Moderately severe)', value: Math.floor((100 - goodPct) * 0.3), color: '#F59E0B' },
    { name: 'mRS 5 (Severe disability)', value: Math.floor((100 - goodPct) * 0.2), color: '#EF4444' },
    { name: 'mRS 6 (Dead)', value: Math.floor((100 - goodPct) * 0.2), color: '#991B1B' },
  ];

  return (
    <div className="w-full h-40 flex flex-col">
      <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
        <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
          GOOD OUTCOME: <span className="text-success font-bold glow-success text-sm">{goodPct}%</span>
        </div>
        <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
          POOR OUTCOME: <span className="text-warning font-bold glow-warning text-sm">{100 - goodPct}%</span>
        </div>
      </div>
      <div className="flex-1 relative">
        {/* Subtle divider line behind chart */}
        <div className="absolute top-[43%] left-0 right-0 h-px bg-slate-800/80 border-b border-dashed border-slate-700 z-0">
          <span className="absolute right-0 -top-4 text-[9px] text-gray-500 font-mono bg-[#030712] pl-2">mRS 2/3 THRESHOLD</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical" 
            data={chartData} 
            margin={{ top: 0, right: 30, left: 150, bottom: 0 }}
            barSize={16}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1F2937', opacity: 0.3 }} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              label={{ position: 'right', fill: '#9CA3AF', fontSize: 10, fontFamily: 'var(--font-jetbrains)', formatter: (val: number) => `${val}%` }}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
