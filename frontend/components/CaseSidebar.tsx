export default function CaseSidebar({ caseData }: { caseData: any | null }) {
  if (!caseData) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur rounded-xl border border-zinc-800 p-5 h-full flex items-center justify-center text-zinc-500 text-sm text-center">
        Select a case from the queue to view details.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-xl border border-zinc-800 p-5 sticky top-8">
      <p className="text-orange-400 text-xs font-medium tracking-widest uppercase mb-2">
        Case Intelligence
      </p>
      <h3 className="text-lg font-semibold text-white mb-4 break-words">{caseData.name}</h3>

      <div className="space-y-4 text-sm">
        <div>
          <span className="text-zinc-500 block mb-1">Status</span>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              caseData.status === "escalated"
                ? "bg-red-950 text-red-400 border border-red-900"
                : "bg-emerald-950 text-emerald-400 border border-emerald-900"
            }`}
          >
            {caseData.status}
          </span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-1">Confidence Score</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${caseData.confidence_score}%` }}
              />
            </div>
            <span className="text-zinc-200">{caseData.confidence_score}</span>
          </div>
        </div>

        <div>
          <span className="text-zinc-500 block mb-1">Explainability</span>
          <p className="text-zinc-300 leading-relaxed">{caseData.explainability}</p>
        </div>

        <div className="pt-2 border-t border-zinc-800">
          <span className="text-zinc-500 block mb-2 text-xs uppercase tracking-wide">Who controls the rail</span>
          <p className="text-zinc-400 text-xs leading-relaxed">
            This match is evaluated against OFAC's Specially Designated Nationals (SDN) list,
            published and maintained by the U.S. Department of the Treasury.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-900 rounded-lg py-2 text-sm font-medium transition-colors">
          Escalate
        </button>
        <button className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-900 rounded-lg py-2 text-sm font-medium transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
}