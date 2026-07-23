import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HospitalBenchmarkTableProps {
  data: any;
}

export default function HospitalBenchmarkTable({ data }: HospitalBenchmarkTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const avg = data?.metrics?.avgDTN || 60;
  
  const hospitals = [
    { id: 1, name: "Dubai General", city: "Dubai", country: "UAE", dtn: avg - 5, rate: 18, beds: "4/12", angels: "Gold" },
    { id: 2, name: "Abu Dhabi Central", city: "Abu Dhabi", country: "UAE", dtn: avg + 10, rate: 15, beds: "1/8", angels: "Silver" },
    { id: 3, name: "Riyadh Stroke Center", city: "Riyadh", country: "KSA", dtn: avg - 10, rate: 22, beds: "6/20", angels: "Platinum" },
    { id: 4, name: "Doha Medical", city: "Doha", country: "Qatar", dtn: avg + 25, rate: 12, beds: "0/6", angels: "None" },
    { id: 5, name: "Kuwait Hospital", city: "Kuwait City", country: "Kuwait", dtn: avg, rate: 16, beds: "2/10", angels: "Gold" },
  ].sort((a, b) => a.dtn - b.dtn);

  const getStatus = (dtn: number) => {
    if (dtn <= 60) return { label: "ON TARGET", color: "text-success border-success/30 glow-success" };
    if (dtn <= 80) return { label: "AT RISK", color: "text-warning border-warning/30 glow-warning" };
    return { label: "CRITICAL", color: "text-critical border-critical/30 glow-critical" };
  };

  const getAngelsColor = (status: string) => {
    switch (status) {
      case "Platinum": return "text-[#E5E4E2] bg-[#E5E4E2]/10 border-[#E5E4E2]/30";
      case "Gold": return "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30";
      case "Silver": return "text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/30";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-xs text-gray-400">
            <th className="p-3 font-medium font-mono">HOSPITAL</th>
            <th className="p-3 font-medium font-mono">LOCATION</th>
            <th className="p-3 font-medium text-right font-mono">DTN (MIN)</th>
            <th className="p-3 font-medium text-right font-mono">T-RATE</th>
            <th className="p-3 font-medium text-center font-mono">ANGELS STATUS</th>
            <th className="p-3 font-medium text-center font-mono">STATUS</th>
            <th className="p-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((h, i) => {
            const status = getStatus(h.dtn);
            const isExpanded = expandedRow === h.id;
            const dtnRatio = Math.min(h.dtn / 120, 1) * 100;
            const dtnColor = h.dtn <= 60 ? 'bg-success' : h.dtn <= 80 ? 'bg-warning' : 'bg-critical';
            
            return (
              <Fragment key={h.id}>
                <tr 
                  className={`
                    border-b border-slate-800/50 cursor-pointer table-row-hover transition-colors
                    ${isExpanded ? 'bg-slate-800/30' : ''}
                  `}
                  onClick={() => setExpandedRow(isExpanded ? null : h.id)}
                >
                  <td className="p-3 font-medium text-white text-sm">{h.name}</td>
                  <td className="p-3 text-sm text-gray-400">{h.city}, {h.country}</td>
                  <td className={`p-3 text-right font-mono font-bold ${h.dtn > 60 ? (h.dtn > 80 ? 'text-critical' : 'text-warning') : 'text-success'}`}>
                    <div className="flex flex-col items-end gap-1">
                      <span>{h.dtn}</span>
                      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${dtnColor}`} style={{ width: `${dtnRatio}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-gray-300">{h.rate}%</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs border relative overflow-hidden group inline-block ${getAngelsColor(h.angels)}`}>
                      <span className="relative z-10">{h.angels}</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider bg-black/40 ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 flex justify-end">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-black/20 border-b border-slate-800 animate-accordion-open">
                    <td colSpan={7} className="p-4">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="glassmorphism p-3 rounded">
                          <div className="text-gray-500 text-xs mb-1">Capability</div>
                          <div className="text-white font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan"></span>
                            Comprehensive Center (EVT)
                          </div>
                        </div>
                        <div className="glassmorphism p-3 rounded">
                          <div className="text-gray-500 text-xs mb-1">Annual Volume</div>
                          <div className="text-white font-mono">{Math.floor(800 + Math.random() * 400)} cases</div>
                        </div>
                        <div className="glassmorphism p-3 rounded">
                          <div className="text-gray-500 text-xs mb-1">Beds (Avail/Total)</div>
                          <div className="text-white font-mono">{h.beds}</div>
                        </div>
                        <div className="glassmorphism p-3 rounded">
                          <div className="text-gray-500 text-xs mb-1">mRS 0-2 Rate</div>
                          <div className="text-success font-mono">{(h.rate * 2.5).toFixed(1)}%</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
