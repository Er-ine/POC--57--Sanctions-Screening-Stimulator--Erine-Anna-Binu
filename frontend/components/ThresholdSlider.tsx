export default function ThresholdSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <label className="text-sm text-zinc-400">Fuzzy-match threshold: {value}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-orange-500"
      />
    </div>
  );
}