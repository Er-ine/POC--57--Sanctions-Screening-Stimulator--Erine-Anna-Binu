"use client";

import { useEffect, useState } from "react";

export default function LiveStatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const tickerText = "REAL RAILS INTELLIGENCE • LIVE DATA FEED • GULF HEALTHCARE NETWORK • STROKE CARE MONITOR • ";

  return (
    <div className="h-7 bg-[#02050a] border-b border-slate-800 flex items-center justify-between px-2 shrink-0 overflow-hidden text-[10px] font-mono text-cyan/70 select-none">
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="whitespace-nowrap flex animate-ticker">
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">{tickerText}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-4 shrink-0 bg-[#02050a] z-10 border-l border-slate-800/50 h-full px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow"></div>
          <span className="text-success font-semibold tracking-wider">CONNECTED</span>
        </div>
        <span className="text-slate-400">|</span>
        <span className="w-[60px] text-right font-medium tracking-wider text-cyan">{time || "00:00:00"}</span>
      </div>
    </div>
  );
}
