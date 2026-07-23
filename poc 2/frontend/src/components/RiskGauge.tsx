import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  value: number; // 0-100
  loading?: boolean;
}

export default function RiskGauge({ value, loading = false }: RiskGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (loading) {
      setAnimatedValue(0);
      return;
    }
    
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [value, loading]);

  const size = 200;
  const strokeWidth = 14;
  const center = size / 2;
  const normalizedRadius = center - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (animatedValue / 100) * arcLength;

  const getColor = (val: number) => {
    if (val >= 70) return "#22C55E";
    if (val >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(animatedValue);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow Ring — behind everything */}
        <svg height={size} width={size} className="transform rotate-[135deg] absolute inset-0 z-0 opacity-25 blur-[10px]">
           <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth + 10}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ 
              strokeLinecap: "round",
              strokeDashoffset: isNaN(strokeDashoffset) ? arcLength : strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-in-out, stroke 1s ease-in-out" 
            }}
            r={normalizedRadius}
            cx={center}
            cy={center}
          />
        </svg>

        {/* Main Gauge SVG */}
        <svg height={size} width={size} className="transform rotate-[135deg] relative z-10">
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            stroke="url(#trackGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeLinecap: "round" }}
            r={normalizedRadius}
            cx={center}
            cy={center}
          />
          {/* Foreground progress */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ 
              strokeLinecap: "round",
              strokeDashoffset: isNaN(strokeDashoffset) ? arcLength : strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-in-out, stroke 1s ease-in-out" 
            }}
            r={normalizedRadius}
            cx={center}
            cy={center}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 270 * (Math.PI / 180);
            const x1 = center + Math.cos(angle) * (normalizedRadius - 12);
            const y1 = center + Math.sin(angle) * (normalizedRadius - 12);
            const x2 = center + Math.cos(angle) * (normalizedRadius - 3);
            const y2 = center + Math.sin(angle) * (normalizedRadius - 3);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            );
          })}
        </svg>
        
        {/* Center Text — dark backdrop for readability */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ paddingTop: '8px' }}>
          <div className="w-20 h-20 rounded-full bg-obsidian/90 flex items-center justify-center">
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
            ) : (
              <span className="text-5xl font-bold tracking-tighter metric-value transition-colors duration-1000" style={{ color }}>
                {Math.round(animatedValue)}<span className="text-lg opacity-70">%</span>
              </span>
            )}
          </div>
        </div>

        {/* Small Labels */}
        <div className="absolute bottom-2 left-4 text-[10px] font-mono text-gray-500">0</div>
        <div className="absolute bottom-2 right-4 text-[10px] font-mono text-gray-500">100</div>
      </div>
      
      <div className="text-sm text-gray-400 font-medium -mt-4 uppercase tracking-wider">
        Meeting 60-min Target
      </div>
    </div>
  );
}
