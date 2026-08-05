export default function CaseFilters({
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
}: {
  statusFilter: "all" | "escalated" | "cleared";
  onStatusChange: (v: "all" | "escalated" | "cleared") => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <input
        type="text"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-full sm:w-56"
      />
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        {(["all", "escalated", "cleared"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-orange-500 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
