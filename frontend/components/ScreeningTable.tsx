export default function ScreeningTable({ cases, loading }: { cases: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
        Loading cases…
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-800/80 text-zinc-400">
          <tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Confidence</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Explainability</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-t border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
              <td className="p-3 text-zinc-200">{c.name}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
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
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === "escalated"
                      ? "bg-red-950 text-red-400 border border-red-900"
                      : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="p-3 text-zinc-500 max-w-md">{c.explainability}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {cases.length === 0 && (
        <div className="p-8 text-center text-zinc-500">No cases match this threshold.</div>
      )}
    </div>
  );
}