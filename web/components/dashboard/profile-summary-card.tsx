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
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Learner Overview
      </p>
      <h2 className="text-lg font-semibold text-slate-900">
        {learner.name ?? "Learner"}
      </h2>
      <p className="text-sm text-slate-600">Based in {learner.location}</p>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          CLEP Exams
        </p>
        <p className="text-sm text-slate-600">
          {learner.exams.length} exams recorded
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {learner.exams.map((exam) => (
            <span
              key={exam.code}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {exam.label} · {exam.score}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
