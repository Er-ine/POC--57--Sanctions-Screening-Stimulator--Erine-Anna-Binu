import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface StrokeAlertCardProps {
  data: any;
  loading: boolean;
}

export default function StrokeAlertCard({ data, loading }: StrokeAlertCardProps) {
  if (loading) {
    return <div className="h-24 rounded-lg animate-shimmer w-full"></div>;
  }

  const isCritical = data?.metrics?.avgDTN > 70;

  if (!isCritical) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle size={20} className="text-success shrink-0 mt-0.5" />
        <div>
          <h4 className="text-success font-semibold text-sm mb-1">Network Optimal</h4>
          <p className="text-success/70 text-xs">All key stroke centers operating within acceptable Door-to-Needle parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-critical/10 border border-critical/50 rounded-lg p-4 relative overflow-hidden group animate-pulse-critical">
      <div className="absolute top-0 right-0 w-16 h-16 bg-critical/20 rounded-bl-full group-hover:scale-110 transition-transform"></div>
      
      <div className="flex items-start gap-3 relative z-10">
        <AlertTriangle size={20} className="text-critical shrink-0 mt-0.5 animate-pulse-slow group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
        <div className="flex-1">
          <h4 className="text-critical font-semibold text-sm mb-2">Critical Bottlenecks Detected</h4>
          
          <div className="space-y-0">
            <div className="flex justify-between items-center text-xs bg-black/20 p-2 rounded-t border border-critical/20 border-b-0">
              <span className="text-gray-300">North General</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-critical w-[89%]" />
                </div>
                <span className="text-critical font-mono font-semibold">89 min</span>
              </div>
            </div>
            <div className="h-px bg-critical/10 w-full" />
            <div className="flex justify-between items-center text-xs bg-black/20 p-2 rounded-b border border-critical/20 border-t-0">
              <span className="text-gray-300">East City Hospital</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-critical w-[84%]" />
                </div>
                <span className="text-critical font-mono font-semibold">84 min</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 overflow-hidden h-6 relative">
            <p className="text-xs text-critical/70 font-mono absolute transition-transform duration-300 group-hover:-translate-y-6">ACTION REQUIRED</p>
            <button className="text-xs text-critical font-bold flex items-center gap-1 absolute translate-y-6 transition-transform duration-300 group-hover:translate-y-0 cursor-pointer">
              TAKE ACTION <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
