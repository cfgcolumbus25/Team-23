type KeyStat = {
  label: string;
  value: string;
  helper: string;
};

type KeyStatsCardProps = {
  heading?: string;
  stats: KeyStat[];
};

export function KeyStatsCard({
  heading = "Key Stats",
  stats,
}: KeyStatsCardProps) {
  return (
    <section className="rounded-3xl border border-[#d5e3cf] bg-white p-5 shadow-lg shadow-black/5">
      <h2 className="text-lg font-semibold text-[#1c1c1c]">{heading}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-[#e1eddc] bg-[#f9fff2] px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-[#1c1c1c]">
              {stat.value}
            </p>
            <p className="text-xs text-[#4a4a4a]">{stat.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
