'use client';

import { useState } from "react";

// Learner data structure
type Learner = {
  location: string;
  exams: Array<{ code: string; label: string; score: number }>;
};

// Props for the filters panel component
type FiltersPanelProps = {
  learner: Learner;
  majors: string[];
};

// Filter panel component for tailoring institution matches
export function FiltersPanel({ learner, majors }: FiltersPanelProps) {
  // State for zip radius filter (in miles)
  const [radius, setRadius] = useState(50);

  return (
    <aside className="rounded-3xl border border-[#d5e3cf] bg-white p-5 shadow-lg shadow-black/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
        Filters
      </p>
      <h2 className="text-lg font-semibold text-[#1c1c1c]">
        Tailor your matches
      </h2>

      <form className="mt-4 space-y-4 text-sm text-[#1c1c1c]">
        {/* Zip radius slider filter */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Zip radius
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              min={10}
              max={250}
              className="flex-1 accent-[#6ebf10]"
            />
            <span className="w-14 text-right font-semibold">{radius} mi</span>
          </div>
          <p className="text-xs text-[#4a4a4a]">Based on {learner.location}</p>
        </div>

        {/* CLEP exams checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            CLEP exams
          </label>
          <div className="space-y-2">
            {learner.exams.map((exam) => (
              <label
                key={exam.code}
                className="flex items-center justify-between rounded-lg border border-[#bebebe] px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-[#1c1c1c]">{exam.label}</p>
                  <p className="text-xs text-[#4a4a4a]">Score {exam.score}</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#6ebf10]" />
              </label>
            ))}
          </div>
        </div>

        {/* Minimum credits input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Minimum credits
          </label>
          <input
            type="number"
            min={0}
            defaultValue={6}
            className="w-full rounded-lg border border-[#bebebe] p-2"
          />
        </div>

        {/* Update button to apply filters */}
        <button
          type="button"
          className="w-full rounded-lg bg-[#6ebf10] py-2 font-semibold text-white transition hover:bg-[#5aa50c]"
        >
          Update results
        </button>
      </form>
    </aside>
  );
}
