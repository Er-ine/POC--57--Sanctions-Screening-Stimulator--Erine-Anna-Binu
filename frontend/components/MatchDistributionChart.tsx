export default function MatchDistributionChart({ cases }: { cases: any[] }) {
  const buckets = [0, 0, 0, 0, 0];
  cases.forEach((c) => {
    const idx = Math.min(Math.floor(c.confidence_score / 20), 4);
    buckets[idx]++;
  });
  const max = Math.max(...buckets, 1);

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl p-5 border border-zinc-800 h-full">
      <h3 className="text-sm text-zinc-400 mb-4">Match Score Distribution</h3>
      <div className="flex items-end gap-3 h-40">
        {buckets.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
            <div
              title={`${count} case${count !== 1 ? "s" : ""} in range ${i * 20}-${i * 20 + 20}`}
              className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t transition-all duration-500 hover:opacity-80 cursor-help"
              style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
            />
            <span className="text-xs text-zinc-500">{i * 20}-{i * 20 + 20}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
