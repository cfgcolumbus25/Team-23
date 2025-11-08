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
    <section className="rounded-xl border border-[#bebebe] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Institutions
          </p>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">Matching results</h2>
        </div>
        <button className="rounded-lg border border-[#6ebf10] px-3 py-1 text-xs font-semibold text-[#6ebf10]">
          Export
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {institutions.map((institution) => (
          <article
            key={institution.name}
            className="rounded-lg border border-[#bebebe] p-3 text-sm"
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
