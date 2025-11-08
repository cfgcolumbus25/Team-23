'use client';

import { useState } from "react";

type Learner = {
  location: string;
  exams: Array<{ code: string; label: string; score: number }>;
};

type FiltersPanelProps = {
  learner: Learner;
  majors: string[];
};

export function FiltersPanel({ learner, majors }: FiltersPanelProps) {
  const [radius, setRadius] = useState(50);

  return (
    <aside className="rounded-xl border border-[#bebebe] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
        Filters
      </p>
      <h2 className="text-lg font-semibold text-[#1c1c1c]">
        Tailor your matches
      </h2>

      <form className="mt-4 space-y-4 text-sm text-[#1c1c1c]">
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

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Major focus
          </label>
          <select className="w-full rounded-lg border border-[#bebebe] bg-white p-2">
            {majors.map((major) => (
              <option key={major}>{major}</option>
            ))}
          </select>
        </div>

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
