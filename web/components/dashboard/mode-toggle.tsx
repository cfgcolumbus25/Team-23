'use client';

// Props for mode toggle component
type ModeToggleProps = {
  mode: 'profile' | 'explore';
  onModeChange: (mode: 'profile' | 'explore') => void;
};

// Toggle component to switch between profile-based and explore modes
export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-xl border-2 border-[#d5e3cf] bg-white p-1 shadow-md">
      <button
        onClick={() => onModeChange('profile')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          mode === 'profile'
            ? 'bg-[#6ebf10] text-white shadow-sm'
            : 'text-[#1c1c1c] hover:bg-[#f9fff2]'
        }`}
      >
        My Profile
      </button>
      <button
        onClick={() => onModeChange('explore')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          mode === 'explore'
            ? 'bg-[#6ebf10] text-white shadow-sm'
            : 'text-[#1c1c1c] hover:bg-[#f9fff2]'
        }`}
      >
        Explore Schools
      </button>
    </div>
  );
}

