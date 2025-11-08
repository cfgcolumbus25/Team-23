type ProfileSummaryCardProps = {
  description: string;
};

export function ProfileSummaryCard({ description }: ProfileSummaryCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Profile Summary</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </section>
  );
}