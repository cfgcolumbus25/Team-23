type KeyStatsCardProps = {
  description: string;
};

export function KeyStatsCard({ description }: KeyStatsCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Key Stats</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </section>
  );
}
