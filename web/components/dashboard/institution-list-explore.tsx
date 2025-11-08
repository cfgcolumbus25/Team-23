// Institution data structure for explore mode
type InstitutionWithExams = {
  name: string;
  location: string;
  zip: string;
  acceptedExams: Array<{ name: string; credits: number; cutScore?: number }>;
  lastUpdated: string;
};

// Props for institution list component in explore mode
type InstitutionListExploreProps = {
  institutions: InstitutionWithExams[];
  selectedInstitutionKey?: string | null;
  onSelect?: (institution: InstitutionWithExams) => void;
};

// Component that displays institutions with their accepted CLEP exams
export function InstitutionListExplore({ institutions, selectedInstitutionKey, onSelect }: InstitutionListExploreProps) {
  const getInstitutionKey = (institution: { name: string; zip: string }) =>
    `${institution.name}-${institution.zip}`;

  return (
    <section className="rounded-3xl border border-[#d5e3cf] bg-white p-6 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Institutions
          </p>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">
            Schools and accepted exams
          </h2>
        </div>
      </div>
      {/* List of institution cards with accepted exams - single column for side-by-side layout */}
      <div className="mt-4 space-y-4">
        {institutions.map((institution) => {
          const totalCredits = institution.acceptedExams.reduce((sum, exam) => sum + exam.credits, 0);
          return (
            <article
              key={getInstitutionKey(institution)}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(institution)}
              onKeyDown={(event) => {
                if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onSelect(institution);
                }
              }}
              className={[
                "group flex flex-col rounded-2xl border-2 bg-white p-5 shadow-md transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6ebf10]",
                selectedInstitutionKey === getInstitutionKey(institution)
                  ? "border-[#6ebf10] shadow-lg"
                  : "border-[#d5e3cf] hover:border-[#6ebf10]"
              ].join(' ')}
            >
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#1c1c1c] group-hover:text-[#6ebf10] transition-colors mb-2 leading-tight">
                      {institution.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2a2a2a]">
                        {institution.location}
                      </span>
                      <span className="text-[#d5e3cf]">·</span>
                      <span className="text-sm font-medium text-[#2a2a2a]">
                        {institution.zip}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 bg-[#f9fff2] rounded-lg px-3 py-2 border-2 border-[#e1eddc]">
                    <div className="text-xs font-semibold text-[#1c1c1c] mb-1">Total</div>
                    <div className="text-2xl font-bold text-[#6ebf10]">{totalCredits}</div>
                    <div className="text-xs font-medium text-[#4a4a4a]">credits</div>
                  </div>
                </div>
                <p className="text-xs font-medium text-[#4a4a4a]">
                  Updated {institution.lastUpdated}
                </p>
              </div>
              
              {/* Accepted exams list */}
              <div className="border-t-2 border-[#e1eddc] pt-4 flex-grow flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6ebf10] mb-3">
                  Accepted Exams ({institution.acceptedExams.length})
                </p>
                <div className="flex flex-wrap gap-2 flex-grow">
                  {institution.acceptedExams.map((exam, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border-2 border-[#d5e3cf] bg-[#f9fff2] px-3 py-2 shadow-sm hover:border-[#6ebf10] transition-colors"
                    >
                      <span className="text-xs font-bold text-[#1c1c1c]">
                        {exam.name}
                      </span>
                      <span className="text-xs font-bold text-[#6ebf10]">
                        {exam.credits}cr
                      </span>
                      {exam.cutScore && (
                        <span className="text-xs font-semibold text-[#2a2a2a]">
                          min{exam.cutScore}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
