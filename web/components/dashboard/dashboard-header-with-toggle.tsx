'use client';

// Props for combined dashboard header with toggle
type DashboardHeaderWithToggleProps = {
  mode: 'profile' | 'explore';
  onModeChange: (mode: 'profile' | 'explore') => void;
};

// Combined header and toggle component
export function DashboardHeaderWithToggle({ mode, onModeChange }: DashboardHeaderWithToggleProps) {
  return (
    <header className="rounded-3xl border-2 border-[#d5e3cf] bg-white p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#6ebf10]"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6ebf10]">
              Modern States - CLEP Acceptance Tools
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1c1c1c] leading-tight">
            Dashboard
          </h1>
          <p className="text-base sm:text-lg text-[#2a2a2a] font-medium max-w-2xl">
            {mode === 'profile'
              ? "Find schools that match your completed exams"
              : "Explore schools and see what CLEP exams they accept"}
          </p>
        </div>
        <div className="flex items-center sm:ml-6 sm:flex-shrink-0">
          <div className="inline-flex items-center rounded-2xl border-2 border-[#6ebf10] bg-[#f9fff2] p-2 shadow-lg">
            <button
              onClick={() => onModeChange('profile')}
              className={`rounded-xl px-6 py-3 text-base font-bold transition-all duration-200 ${
                mode === 'profile'
                  ? 'bg-[#6ebf10] text-white shadow-md'
                  : 'text-[#1c1c1c] hover:bg-white hover:text-[#6ebf10]'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => onModeChange('explore')}
              className={`rounded-xl px-6 py-3 text-base font-bold transition-all duration-200 ${
                mode === 'explore'
                  ? 'bg-[#6ebf10] text-white shadow-md'
                  : 'text-[#1c1c1c] hover:bg-white hover:text-[#6ebf10]'
              }`}
            >
              Explore Schools
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

