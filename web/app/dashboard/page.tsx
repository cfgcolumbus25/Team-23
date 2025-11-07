export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Modern States
          </p>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">
            High-level layout structure.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            Profile summary - Profile will break out in separate page
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            Key stats - number of matching institutions, average credits awarded
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[280px,1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-5">
            Filters panel placeholder
          </aside>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              Map visualization placeholder
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              Institution list placeholder
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
