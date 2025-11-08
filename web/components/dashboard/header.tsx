type DashboardHeaderProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function DashboardHeader({ badge, title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="rounded-3xl border border-[#cfd8c6] bg-white p-6 shadow-lg shadow-[#6ebf10]/15">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6ebf10]">
        {badge}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[#1c1c1c]">{title}</h1>
      <p className="mt-1 text-base text-[#4a4a4a]">{subtitle}</p>
    </header>
  );
}
