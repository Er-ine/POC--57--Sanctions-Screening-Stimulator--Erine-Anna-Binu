import { Database, LineChart, Server } from 'lucide-react';

interface SourceConfidencePanelProps {
  loading?: boolean;
}

export default function SourceConfidencePanel({ loading }: SourceConfidencePanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 rounded animate-shimmer w-full bg-slate-800/50"></div>
        ))}
      </div>
    );
  }

  const sources = [
    { name: "SITS Registry API", type: "Registry", conf: 98, icon: Database },
    { name: "Angels Initiative Data", type: "Benchmark", conf: 95, icon: LineChart },
    { name: "Real-time HL7 Feed", type: "Live", conf: 76, icon: Server },
  ];

  const getColorClass = (conf: number) => {
    if (conf > 90) return "bg-success";
    if (conf > 70) return "bg-warning";
    return "bg-critical";
  };
  
  const getTextColorClass = (conf: number) => {
    if (conf > 90) return "text-success";
    if (conf > 70) return "text-warning";
    return "text-critical";
  };

  return (
    <div className="space-y-3">
      {sources.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-black/20 p-3 rounded border border-slate-800/50 hover:-translate-y-0.5 hover:shadow-lg transition-transform duration-200">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Icon size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-300 flex items-center gap-2">
                  {s.name}
                  {s.conf > 90 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
                  )}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-gray-400">
                {s.type}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(s.conf)} animate-progress-fill`}
                  style={{ width: `${s.conf}%`, animationDuration: `${1 + i * 0.2}s` }}
                ></div>
              </div>
              <span className={`text-xs font-mono font-bold ${getTextColorClass(s.conf)}`}>
                {s.conf}%
              </span>
            </div>
          </div>
        );
      })}
      
      <div className="mt-4 text-[10px] text-gray-500 text-center font-mono group cursor-default">
        <span className="inline-block border-r-2 border-cyan pr-1 animate-pulse-slow">
          Data fusion powered by Real Rails Intelligence Engine v2.4
        </span>
      </div>
    </div>
  );
}
