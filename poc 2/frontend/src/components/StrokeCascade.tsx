import { Activity, Clock, Hospital, Syringe, Brain, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState, Fragment } from 'react';

interface StrokeCascadeProps {
  data: any;
}

export default function StrokeCascade({ data }: StrokeCascadeProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [pausedOnStep, setPausedOnStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Animate through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (pausedOnStep !== null ? prev : (prev + 1) % 8));
    }, 2000);
    return () => clearInterval(timer);
  }, [pausedOnStep]);

  const handleStepClick = (index: number) => {
    if (pausedOnStep === index) {
      setPausedOnStep(null);
    } else {
      setPausedOnStep(index);
      setActiveStep(index);
    }
  };

  const baseDTN = data?.metrics?.avgDTN || 60;
  
  const steps = [
    { name: "Onset", icon: Brain, time: 0, cumTime: 0, status: "neutral", desc: "Patient begins showing symptoms." },
    { name: "EMS Call", icon: Activity, time: 15, cumTime: 15, status: "neutral", desc: "Emergency services contacted." },
    { name: "Door", icon: Hospital, time: 25, cumTime: 40, status: "active", desc: "Patient arrives at hospital." },
    { name: "Triage", icon: Stethoscope, time: 10, cumTime: 50, status: "active", desc: "Initial assessment." },
    { name: "CT Scan", icon: Activity, time: 15, cumTime: 65, status: baseDTN > 70 ? "warning" : "active", desc: "Imaging to detect hemorrhage/ischemia." },
    { name: "Read", icon: FileText, time: 15, cumTime: 80, status: baseDTN > 80 ? "critical" : "active", desc: "Radiologist interpretation." },
    { name: "Needle", icon: Syringe, time: 10, cumTime: baseDTN + 40, status: "target", desc: "Thrombolytics administered." },
    { name: "Outcome", icon: CheckCircle2, time: 0, cumTime: 0, status: "end", desc: "Procedure complete, post-care." }
  ];

  const getStatusColor = (status: string, index: number, isActive: boolean) => {
    if (isActive) return "text-white bg-cyan border-cyan shadow-[0_0_15px_rgba(56,189,248,0.5)]";
    
    switch (status) {
      case "active": return "text-cyan bg-cyan/10 border-cyan/30";
      case "warning": return "text-warning bg-warning/10 border-warning/30";
      case "critical": return "text-critical bg-critical/10 border-critical/30";
      case "target": return "text-success bg-success/10 border-success/30";
      case "end": return "text-indigo bg-indigo/10 border-indigo/30";
      default: return "text-gray-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="w-full py-8 relative">
      {/* Target Marker with Danger Zone */}
      <div className="absolute left-[70%] top-0 bottom-0 border-l-2 border-dashed border-critical z-0">
        <div className="absolute -top-6 -left-10 bg-critical/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          60m TARGET
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-critical/20 to-transparent pointer-events-none" />
      </div>

      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, i) => {
          const isTarget = step.name === "Needle";
          const isActive = i === activeStep;
          const Icon = step.icon;
          const isHovered = hoveredStep === i;
          
          return (
            <Fragment key={step.name}>
              {/* Step */}
              <div 
                className="flex flex-col items-center group relative w-16 cursor-pointer"
                onClick={() => handleStepClick(i)}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Hover Tooltip */}
                {isHovered && (
                  <div className="absolute -top-24 w-40 glassmorphism p-3 rounded-lg border border-cyan/30 z-50 animate-fade-in-up text-left pointer-events-none">
                    <div className="font-bold text-cyan text-sm mb-1">{step.name}</div>
                    <div className="text-xs text-gray-300 mb-1">{step.desc}</div>
                    <div className="text-[10px] font-mono text-gray-400">
                      Step Time: {step.time}m
                      <br/>
                      Cumulative: {step.cumTime > 0 ? `${step.cumTime}m` : '-'}
                    </div>
                  </div>
                )}

                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 relative
                  ${getStatusColor(step.status, i, isActive)}
                `}>
                  {isActive && <div className="ripple-ring text-cyan"></div>}
                  <Icon size={16} className="relative z-10" />
                </div>
                
                <div className={`text-[10px] mt-2 text-center leading-tight transition-colors ${isActive ? 'text-cyan font-bold shadow-cyan' : 'font-medium text-gray-300 group-hover:text-cyan'}`}>
                  {step.name}
                </div>
                
                {step.cumTime > 0 && (
                  <div className={`text-[10px] font-mono mt-1 ${isTarget && step.cumTime - 40 > 60 ? 'text-critical font-bold' : 'text-gray-500'}`}>
                    {step.cumTime - 40 > 0 && i >= 2 ? (step.cumTime - 40) : (i < 2 ? `+${step.time}` : '')}m
                  </div>
                )}
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-1 bg-slate-800 relative -mx-2 -mt-6">
                  {i < activeStep && (
                    <div className="absolute top-0 left-0 h-full bg-cyan/80 w-full shadow-[0_0_10px_rgba(56,189,248,0.5)] overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-2 bg-white energy-beam" />
                    </div>
                  )}
                  {i === activeStep && (
                    <div className="absolute top-0 left-0 h-full bg-cyan animate-pulse w-full"></div>
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 mt-8 text-xs font-mono text-gray-400 justify-center bg-obsidian/50 p-2 rounded-full border border-slate-800/50 w-fit mx-auto">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(56,189,248,0.6)]"></span> Optimal</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> Delay</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> Bottleneck</div>
        <div className="flex items-center gap-2 ml-4 px-2 py-0.5 bg-cyan/10 text-cyan rounded text-[10px]">Click step to pause/focus</div>
      </div>
    </div>
  );
}
