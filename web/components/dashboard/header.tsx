type DashboardHeaderProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function DashboardHeader({ badge, title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="rounded-xl border border-[#bebebe] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6ebf10]">
        {badge}
      </p>
      <h1 className="text-2xl font-semibold text-[#1c1c1c]">{title}</h1>
      <p className="text-sm text-[#4a4a4a]">{subtitle}</p>
    </header>
  );
}
