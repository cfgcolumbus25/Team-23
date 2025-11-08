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
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Institutions
          </p>
          <h2 className="text-lg font-semibold text-slate-900">Matching results</h2>
        </div>
        <button className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold">
          Export
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {institutions.map((institution) => (
          <article
            key={institution.name}
            className="rounded-lg border border-slate-200 p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{institution.name}</p>
              <span className="text-xs text-slate-500">{institution.lastUpdated}</span>
            </div>
            <p className="text-slate-600">
              {institution.location} · {institution.zip}
            </p>
            <p className="text-xs text-slate-500">
              Credits awarded:{" "}
              <span className="font-semibold text-slate-900">{institution.credits}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
