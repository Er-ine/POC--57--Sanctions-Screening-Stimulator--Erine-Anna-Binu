export default function ScreeningTable({
  cases,
  loading,
  onRowClick,
  selectedId,
}: {
  cases: any[];
  loading?: boolean;
  onRowClick?: (c: any) => void;
  selectedId?: any;
}) {
  if (loading) {
    return (
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-3 border-t border-zinc-800/60 first:border-t-0 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-1/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/6" />
            <div className="h-4 bg-zinc-800 rounded w-1/6" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl border border-zinc-800 overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-zinc-800/80 text-zinc-400">
          <tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium" title="Fuzzy-match confidence score (0-100)">
              Confidence
            </th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr
              key={c.id}
              onClick={() => onRowClick?.(c)}
              className={`border-t border-zinc-800/60 hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                selectedId === c.id ? "bg-orange-500/10 border-l-2 border-l-orange-500" : ""
              }`}
            >
              <td className="p-3 text-zinc-200">{c.name}</td>
              <td className="p-3">
                <div className="flex items-center gap-2" title={`Confidence: ${c.confidence_score}/100`}>
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${c.confidence_score}%` }}
                    />
                  </div>
                  <span className="text-zinc-400">{c.confidence_score}</span>
                </div>
              </td>
              <td className="p-3">
                <span
                  title={c.status === "escalated" ? "Flagged for manual compliance review" : "No match above threshold"}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === "escalated"
                      ? "bg-red-950 text-red-400 border border-red-900"
                      : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                  }`}
                >
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {cases.length === 0 && (
        <div className="p-8 text-center text-zinc-500">No cases match this threshold or filter.</div>
      )}
    </div>
  );
}