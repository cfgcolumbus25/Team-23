import Link from "next/link";

// function to return the home landing page, previously redirected to the user login page 
// now we allow access to the dashboard without logging in
export default function Home() {
  // return the home landing page with the header and the footer
  return (
    // main container for the home page
    <main className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* header for the home page */}
      <header className="border-b border-[#bebebe] bg-white/90 backdrop-blur">
        {/* container for the header */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            {/* logo for the home page */}
            <div className="h-8 w-8 rounded-md bg-[#6ebf10]" />
            <span className="text-lg font-bold text-[#1c1c1c]">CLEPBridge</span>
          </div>
          {/* navigation for the home page */}
          <nav className="flex items-center gap-4">
            {/* link to the dashboard */}
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#1c1c1c] hover:underline"
            >
              Dashboard
            </Link>
            {/* link to the login page */}
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1c1c1c] hover:underline"
            >
              Log In
            </Link>
            {/* link to the onboarding page */}
            <Link
              href="/onboarding"
              className="rounded-md bg-[#6ebf10] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#5aa50c] focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/20"
            >
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      {/* main content for the home page */}
      <div className="flex-1">
        {/* container for the main content */}
        <section className="mx-auto max-w-6xl px-4">
          {/* container for the main content */}
          <div className="flex flex-col items-center gap-6 pt-24 pb-16 text-center sm:pt-28 sm:pb-20">
            {/* title for the home page */}
            <h1 className="text-4xl font-bold leading-tight text-[#1c1c1c] sm:text-5xl">
              Modern States — CLEP Acceptance Tools
            </h1>
            {/* description for the home page */}
            <p className="max-w-2xl text-sm text-[#4a4a4a] sm:text-base">
              Explore institutions, credit policies, and matches for CLEP exams. Use the dashboard
              right away, or sign in to create and save your profile.
            </p>
            {/* container for the buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* link to the dashboard */}
              <Link
                href="/dashboard"
                className="rounded-md bg-[#6ebf10] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#5aa50c] focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/20"
              >
                Open Dashboard
              </Link>
              {/* link to the login page */}
                <Link
                href="/login"
                className="rounded-md border border-[#bebebe] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c1c1c] shadow-sm transition hover:bg-slate-50"
              >
                Log In
              </Link>
              {/* link to the onboarding page */}
              <Link
                href="/onboarding"
                className="rounded-md border border-[#bebebe] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c1c1c] shadow-sm transition hover:bg-slate-50"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* container for the features */}
          <div className="grid gap-4 pb-16 sm:grid-cols-3">
            {/* feature 1 */}
            <div className="rounded-xl border border-[#bebebe] bg-white p-5 text-left shadow">
              <h3 className="mb-1 text-base font-semibold text-[#1c1c1c]">Search Institutions</h3>
              <p className="text-sm text-[#4a4a4a]">
                Find colleges and universities that align to your CLEP exams.
              </p>
            </div>
            {/* feature 2 */}
            <div className="rounded-xl border border-[#bebebe] bg-white p-5 text-left shadow">
              <h3 className="mb-1 text-base font-semibold text-[#1c1c1c]">Understand Credit</h3>
              <p className="text-sm text-[#4a4a4a]">
                See how many credits and which requirements your exams might satisfy.
              </p>
            </div>
            {/* feature 3 */}
            <div className="rounded-xl border border-[#bebebe] bg-white p-5 text-left shadow">
              <h3 className="mb-1 text-base font-semibold text-[#1c1c1c]">Personalize Later</h3>
              <p className="text-sm text-[#4a4a4a]">
                Use the tool without an account, then create a profile to save progress.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* footer for the home page */}
      <footer className="border-t border-[#bebebe] bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center">
          <p className="text-sm text-slate-500">Powered by Modern States</p>
        </div>
      </footer>
    </main>
  );
}
