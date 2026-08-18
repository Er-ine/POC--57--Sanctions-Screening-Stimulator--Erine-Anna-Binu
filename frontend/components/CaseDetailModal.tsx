export default function CaseDetailModal({ caseData, onClose }: { caseData: any; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{caseData.name}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                caseData.status === "escalated"
                  ? "bg-red-950 text-red-400 border border-red-900"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-900"
              }`}
            >
              {caseData.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Confidence Score</span>
            <span className="text-zinc-200">{caseData.confidence_score}</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Explainability</span>
            <p className="text-zinc-300">{caseData.explainability}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-900 rounded-lg py-2 text-sm font-medium transition-colors">
            Escalate for Review
          </button>
          <button className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-900 rounded-lg py-2 text-sm font-medium transition-colors">
            Clear Case
          </button>
        </div>
      </div>
    </div>
  );
}
