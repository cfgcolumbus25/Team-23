type DashboardHeaderProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function DashboardHeader({ badge, title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {badge}
      </p>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </header>
  );
}
