type Exam = {
  code: string;
  label: string;
  score: number;
};

type ProfileSummaryCardProps = {
  learner: {
    name?: string;
    location: string;
    exams: Exam[];
  };
};

export function ProfileSummaryCard({ learner }: ProfileSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-[#d5e3cf] bg-white p-5 shadow-lg shadow-black/5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6ebf10]">
        Learner Overview
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#1c1c1c]">
        {learner.name ?? "Learner"}
      </h2>
      <p className="text-sm text-[#4a4a4a]">Based in {learner.location}</p>

      <div className="mt-5 rounded-2xl bg-[#f6fff0] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
          CLEP Exams
        </p>
        <p className="text-sm text-[#4a4a4a]">
          {learner.exams.length} exams recorded
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {learner.exams.map((exam) => (
            <span
              key={exam.code}
              className="rounded-full border border-[#d5e3cf] bg-white px-3 py-1 text-xs font-medium text-[#1c1c1c]"
            >
              {exam.label} · {exam.score}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
