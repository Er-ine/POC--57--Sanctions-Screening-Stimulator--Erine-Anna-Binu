export default function ScreeningTable({ cases }: { cases: any[] }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-800 text-zinc-400">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Confidence</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Explainability</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.confidence_score}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    c.status === "escalated" ? "bg-red-900 text-red-300" : "bg-emerald-900 text-emerald-300"
                  }`}
                  title={c.status === "escalated" ? "Flagged for manual review" : "No match above threshold"}
                >
                  {c.status}
                </span>
              </td>
              <td className="p-3 text-zinc-400">{c.explainability}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}