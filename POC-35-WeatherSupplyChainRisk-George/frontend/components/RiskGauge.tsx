"use client";

import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

export default function RiskGauge({ riskScore }: { riskScore: number }) {
  const animatedScore = useCountUp(riskScore, 1500);
  
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let color = '#22C55E'; // green
  if (riskScore >= 60) color = '#EF4444'; // red
  else if (riskScore >= 30) color = '#F59E0B'; // amber

  const isHighRisk = riskScore > 60;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative flex items-center justify-center w-32 h-32 ${isHighRisk ? 'animate-pulse-glow' : ''}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-gray-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            className="transition-all duration-300 ease-out animate-gauge-fill"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute text-3xl font-bold font-mono tracking-tighter" style={{ color }}>
          {Math.round(animatedScore)}<span className="text-lg text-gray-400">%</span>
        </div>
      </div>
      <div className="mt-2 text-xs tracking-widest text-gray-400 font-semibold uppercase">System Risk Index</div>
    </div>
  );
}
