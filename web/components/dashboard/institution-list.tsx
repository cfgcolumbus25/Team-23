type Institution = {
  name: string;
  location: string;
  zip: string;
  credits: number;
  lastUpdated: string;
};

type InstitutionListProps = {
  institutions: Institution[];
};

export function InstitutionList({ institutions }: InstitutionListProps) {
  return (
    <section className="rounded-3xl border border-[#d5e3cf] bg-white p-6 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Institutions
          </p>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">Matching results</h2>
        </div>
        <button className="rounded-full border border-[#6ebf10] px-4 py-1.5 text-xs font-semibold text-[#6ebf10]">
          Export
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {institutions.map((institution) => (
          <article
            key={institution.name}
            className="rounded-2xl border border-[#e1eddc] bg-[#f9fff2] p-4 text-sm shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#1c1c1c]">{institution.name}</p>
              <span className="text-xs text-[#4a4a4a]">{institution.lastUpdated}</span>
            </div>
            <p className="text-[#4a4a4a]">
              {institution.location} · {institution.zip}
            </p>
            <p className="text-xs text-[#4a4a4a]">
              Credits awarded:{" "}
              <span className="font-semibold text-[#6ebf10]">
                {institution.credits}
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
