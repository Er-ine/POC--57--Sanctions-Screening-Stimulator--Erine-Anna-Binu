"use client";

import React from "react";

interface ThresholdSliderProps {
  value: number;
  onChange: (v: number) => void;
}

export default function ThresholdSlider({
  value,
  onChange,
}: ThresholdSliderProps) {
  const getSensitivityLabel = (val: number) => {
    if (val >= 85) return { label: "Conservative / Low Queue", color: "text-zinc-400" };
    if (val >= 70) return { label: "Standard / Recommended", color: "text-orange-400" };
    return { label: "Aggressive / High False Positives", color: "text-amber-400" };
  };

  const sensitivity = getSensitivityLabel(value);

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl p-5 border border-zinc-800 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Fuzzy Sensitivity Threshold
          </label>
          <span className="text-xl font-mono font-bold text-orange-400">
            {value}%
          </span>
        </div>

        <div className="text-[11px] font-mono mb-4">
          Posturing: <span className={sensitivity.color}>{sensitivity.label}</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-800/80">
        <span className="text-[11px] text-zinc-500">Quick Presets:</span>
        <div className="flex gap-1.5">
          {[50, 65, 70, 80, 90].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                value === preset
                  ? "bg-orange-500 text-white font-semibold"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
