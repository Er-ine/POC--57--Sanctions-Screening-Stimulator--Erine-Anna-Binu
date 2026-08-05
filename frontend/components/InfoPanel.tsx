export default function InfoPanel() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h2 className="font-medium text-orange-400">Why this matters</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Sanctions screening prevents institutions from unknowingly transacting with
          restricted individuals or entities, protecting financial integrity and legal compliance.
        </p>
      </div>
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h2 className="font-medium text-orange-400">Who controls the rail</h2>
        <p className="text-sm text-zinc-400 mt-1">
          OFAC (Office of Foreign Assets Control) publishes and maintains the sanctions list
          this system screens against.
        </p>
      </div>
    </div>
  );
}