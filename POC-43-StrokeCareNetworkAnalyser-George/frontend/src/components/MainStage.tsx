import React, { useMemo } from 'react';
import { Clock, Target, Syringe, Heart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import StrokeCascade from './StrokeCascade';
import DoorToNeedleChart from './DoorToNeedleChart';
import ThrombolysisRateTrend from './ThrombolysisRateTrend';
import OutcomeFunnel from './OutcomeFunnel';
import StrokeUnitMap from './StrokeUnitMap';
import HospitalBenchmarkTable from './HospitalBenchmarkTable';

interface MainStageProps {
  data: any;
  loading: boolean;
}

const MiniSparkline = ({ color }: { color: string }) => {
  const points = useMemo(() => {
    // Use a simple seeded pseudo-random based on color to avoid SSR hydration mismatch
    let seed = 0;
    for (let c = 0; c < color.length; c++) seed = ((seed << 5) - seed + color.charCodeAt(c)) | 0;
    const seededRandom = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };
    const pts = [];
    let prev = 12;
    for (let i = 0; i < 8; i++) {
      const val = Math.max(2, Math.min(22, prev + (seededRandom() - 0.5) * 10));
      pts.push(`${i * (80 / 7)},${val}`);
      prev = val;
    }
    return pts;
  }, [color]);

  const polylinePoints = points.join(' ');
  const polygonPoints = `0,24 ${polylinePoints} 80,24`;
  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <svg width="80" height="24" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradId})`} />
      <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const MetricCard = ({ title, value, unit, icon: Icon, color, loading, stagger, trend, trendValue, isCritical, isWarning }: any) => {
  const animatedValue = useCountUp(loading ? 0 : value);
  
  const trendColor = trend === 'up' ? 'text-success' : 'text-critical';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  const glowClass = isCritical ? 'glow-critical border-critical/30 animate-pulse-critical' : isWarning ? 'glow-warning border-warning/30' : '';

  return (
    <div className={`glassmorphism rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group animate-fade-in-up ${stagger} ${glowClass}`}>
      <div className={`absolute -top-4 -right-4 w-32 h-32 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150 animate-pulse-slow blur-xl`} style={{ backgroundColor: color }}></div>
      <div className="flex justify-between items-start relative z-10">
        <span className="text-gray-400 text-sm font-medium tracking-wide">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/50 backdrop-blur-sm" style={{ color }}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="mt-1 flex flex-col gap-3 relative z-10">
        <div className="flex items-baseline gap-1">
          {loading ? (
            <div className="h-8 w-16 rounded animate-shimmer"></div>
          ) : (
            <>
              <span className="metric-value" style={{ color: '#F8FAFC' }}>{animatedValue}</span>
              <span className="metric-unit">{unit}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className={`flex items-center gap-1 text-xs font-mono font-medium ${trendColor}`}>
            <TrendIcon size={14} className={trend === 'up' ? 'animate-bounce' : ''} style={{ animationDuration: '2s' }} />
            <span>{trend === 'up' ? '+' : '-'}{trendValue}%</span>
          </div>
          <MiniSparkline color={color} />
        </div>
      </div>
    </div>
  );
};

export default function MainStage({ data, loading }: MainStageProps) {
  const avgDTN = data?.metrics?.avgDTN || 0;
  
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* TOP ROW: Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Avg DTN Time" 
          value={avgDTN} 
          unit="min" 
          icon={Clock} 
          color={avgDTN <= 60 ? "#22C55E" : (avgDTN <= 80 ? "#F59E0B" : "#EF4444")}
          loading={loading}
          stagger="stagger-1"
          trend="down"
          trendValue="3.1"
          isCritical={avgDTN > 80}
          isWarning={avgDTN > 60 && avgDTN <= 80}
        />
        <MetricCard 
          title="% Meeting Target" 
          value={data?.metrics?.meetingTarget || 0} 
          unit="%" 
          icon={Target} 
          color="#38BDF8"
          loading={loading}
          stagger="stagger-2"
          trend="up"
          trendValue="5.2"
        />
        <MetricCard 
          title="Thrombolysis Rate" 
          value={data?.metrics?.thrombolysisRate || 0} 
          unit="%" 
          icon={Syringe} 
          color="#818CF8"
          loading={loading}
          stagger="stagger-3"
          trend="up"
          trendValue="1.8"
        />
        <MetricCard 
          title="Good Outcome Rate" 
          value={data?.metrics?.goodOutcomeRate || 0} 
          unit="%" 
          icon={Heart} 
          color="#22C55E"
          loading={loading}
          stagger="stagger-4"
          trend="up"
          trendValue="2.4"
        />
      </div>

      {/* SECOND ROW: Stroke Cascade */}
      <div className="glassmorphism rounded-xl p-5 animate-fade-in-up stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow"></div>
          <h2 className="section-header section-header-visible">STROKE TIME CASCADE</h2>
        </div>
        {loading ? <div className="h-24 w-full rounded animate-shimmer" /> : <StrokeCascade data={data} />}
      </div>

      {/* THIRD ROW: Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glassmorphism rounded-xl p-5 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-glow"></div>
            <h2 className="section-header section-header-visible">DOOR-TO-NEEDLE DISTRIBUTION</h2>
          </div>
          {loading ? <div className="h-64 w-full rounded animate-shimmer" /> : <DoorToNeedleChart data={data} />}
        </div>
        <div className="glassmorphism rounded-xl p-5 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow"></div>
            <h2 className="section-header section-header-visible">NETWORK THROMBOLYSIS TREND</h2>
          </div>
          {loading ? <div className="h-64 w-full rounded animate-shimmer" /> : <ThrombolysisRateTrend data={data} />}
        </div>
      </div>

      {/* FOURTH ROW: Outcomes */}
      <div className="glassmorphism rounded-xl p-5 animate-fade-in-up stagger-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse-glow"></div>
          <h2 className="section-header section-header-visible">90-DAY DISABILITY OUTCOMES (mRS)</h2>
        </div>
        {loading ? <div className="h-32 w-full rounded animate-shimmer" /> : <OutcomeFunnel data={data} />}
      </div>

      {/* FIFTH ROW: Map */}
      <div className="glassmorphism rounded-xl p-5 animate-fade-in-up stagger-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-glow"></div>
          <h2 className="section-header section-header-visible">STROKE UNIT COVERAGE MAP</h2>
        </div>
        {loading ? <div className="h-[400px] w-full rounded animate-shimmer" /> : <StrokeUnitMap data={data} />}
      </div>

      {/* SIXTH ROW: Table */}
      <div className="glassmorphism rounded-xl p-5 mb-8 animate-fade-in-up stagger-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow"></div>
          <h2 className="section-header section-header-visible">HOSPITAL-LEVEL BENCHMARKING</h2>
        </div>
        {loading ? <div className="h-64 w-full rounded animate-shimmer" /> : <HospitalBenchmarkTable data={data} />}
      </div>
    </div>
  );
}
