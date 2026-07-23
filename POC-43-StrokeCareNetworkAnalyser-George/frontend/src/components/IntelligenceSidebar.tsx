import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Shield, Zap, AlertTriangle } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import ScenarioSelector from './ScenarioSelector';
import RiskGauge from './RiskGauge';
import StrokeAlertCard from './StrokeAlertCard';
import SourceConfidencePanel from './SourceConfidencePanel';

interface SidebarProps {
  scenarioId: string;
  setScenarioId: (id: string) => void;
  data: any;
  loading: boolean;
  scenarios: any[];
}

const CollapsiblePanel = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-indigo" />
          <span className="text-sm font-semibold tracking-wide text-gray-300">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-500 transition-transform" /> : <ChevronDown size={16} className="text-gray-500 transition-transform" />}
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 animate-accordion-open' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function IntelligenceSidebar({ scenarioId, setScenarioId, data, loading, scenarios }: SidebarProps) {
  const avgDTN = useCountUp(loading ? 0 : data?.metrics?.avgDTN || 0);
  
  return (
    <div className="flex flex-col pb-10">
      {/* 1. Scenarios */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs font-mono text-gray-500 mb-3 tracking-widest">NETWORK SCENARIO</h3>
        <ScenarioSelector 
          scenarios={scenarios} 
          activeId={scenarioId} 
          onSelect={setScenarioId} 
        />
      </div>

      {/* 2. Key Metric */}
      <div className="p-6 border-b border-slate-800 text-center">
        <h3 className="text-sm text-gray-400 mb-2">NETWORK AVG DOOR-TO-NEEDLE</h3>
        <div className="flex items-end justify-center gap-2">
          {loading ? (
            <div className="h-16 w-24 rounded animate-shimmer mx-auto"></div>
          ) : (
            <>
              <span className={`text-6xl font-bold tracking-tighter ${avgDTN > 60 ? 'text-warning' : 'text-success'}`}>
                {avgDTN}
              </span>
              <span className="text-xl text-gray-500 mb-2 font-mono">min</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Gauge */}
      <div className="p-6 border-b border-slate-800 flex justify-center">
        <RiskGauge value={loading ? 0 : data?.metrics?.meetingTarget || 0} loading={loading} />
      </div>

      {/* 4. Alerts */}
      <div className="p-4 border-b border-slate-800">
        <StrokeAlertCard loading={loading} data={data} />
      </div>

      {/* 5. Why This Matters */}
      <CollapsiblePanel title="WHY THIS MATTERS" icon={AlertTriangle} defaultOpen={true}>
        <p className="text-sm text-gray-400 leading-relaxed">
          Time is brain. For every minute delay in restoring blood flow, <span className="text-white font-medium text-glow-cyan">1.9 million neurons are lost</span>. A 15-minute reduction in door-to-needle time is associated with a <span className="text-white font-medium text-glow-cyan">5% lower mortality odds</span> and <span className="text-white font-medium text-glow-cyan">4% lower odds</span> of being discharged to a nursing home.
        </p>
      </CollapsiblePanel>

      {/* 6. Who Controls */}
      <CollapsiblePanel title="WHO CONTROLS THE RAIL" icon={Shield}>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Triage Protocols</span>
            <span className="text-white">ED Directors</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Imaging Prioritization</span>
            <span className="text-white">Radiology Leads</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Network Routing</span>
            <span className="text-white">EMS Directors</span>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 7. Decisions */}
      <CollapsiblePanel title="DECISIONS TO MAKE" icon={Zap} defaultOpen={true}>
        <ul className="list-disc pl-4 text-sm text-gray-400 space-y-2 marker:text-cyan">
          <li className="hover:translate-x-1 hover:text-cyan transition-transform cursor-default">Should EMS bypass North Hospital during peak hours due to consistent 90m+ DTN times?</li>
          <li className="hover:translate-x-1 hover:text-cyan transition-transform cursor-default">Does South Clinic require immediate Angels Initiative retraining?</li>
          <li className="hover:translate-x-1 hover:text-cyan transition-transform cursor-default">Should we allocate emergency funding for a dedicated stroke CT scanner at East General?</li>
        </ul>
      </CollapsiblePanel>

      {/* 8 & 9. Derived Insights & Sources */}
      <div className="p-4 pt-6">
        <h3 className="text-xs font-mono text-gray-500 mb-4 tracking-widest">SOURCE CONFIDENCE</h3>
        <SourceConfidencePanel loading={loading} />
      </div>

      {/* 10. Download */}
      <div className="p-4 mt-auto">
        <button className="w-full btn-premium hover:gradient-border text-cyan py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Download size={16} />
          <span className="font-semibold text-sm tracking-wide">EXPORT SCENARIO REPORT</span>
        </button>
      </div>
    </div>
  );
}
