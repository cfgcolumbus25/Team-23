// Institution data structure
type Institution = {
  name: string;
  location: string;
  zip: string;
  credits: number;
  lastUpdated: string;
};

// Props for institution list component
type InstitutionListProps = {
  institutions: Institution[];
};

// Component that displays a list of matching institutions
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
      </div>
      {/* List of institution cards */}
      <div className="mt-4 space-y-4">
        {institutions.map((institution) => (
          <article
            key={institution.name}
            className="group rounded-2xl border-2 border-[#d5e3cf] bg-white p-6 shadow-md transition-all hover:border-[#6ebf10] hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1c1c1c] group-hover:text-[#6ebf10] transition-colors mb-2">
                  {institution.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-[#2a2a2a]">
                    {institution.location}
                  </span>
                  <span className="text-[#d5e3cf]">·</span>
                  <span className="text-sm font-medium text-[#2a2a2a]">
                    {institution.zip}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#1c1c1c]">Credits:</span>
                    <span className="text-2xl font-bold text-[#6ebf10]">
                      {institution.credits}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#4a4a4a]">
                    Updated {institution.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
