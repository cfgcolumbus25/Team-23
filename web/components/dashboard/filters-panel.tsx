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
    <aside className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filters
      </p>
      <h2 className="text-lg font-semibold text-slate-900">Tailor your matches</h2>

      <form className="mt-4 space-y-4 text-sm text-slate-700">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Zip radius
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              min={10}
              max={250}
              className="flex-1 accent-slate-900"
            />
            <span className="w-14 text-right font-semibold">{radius} mi</span>
          </div>
          <p className="text-xs text-slate-500">Based on {learner.location}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Major focus
          </label>
          <select className="w-full rounded-lg border border-slate-200 bg-white p-2">
            {majors.map((major) => (
              <option key={major}>{major}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            CLEP exams
          </label>
          <div className="space-y-2">
            {learner.exams.map((exam) => (
              <label
                key={exam.code}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{exam.label}</p>
                  <p className="text-xs text-slate-500">Score {exam.score}</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-slate-900" />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Minimum credits
          </label>
          <input
            type="number"
            min={0}
            defaultValue={6}
            className="w-full rounded-lg border border-slate-200 p-2"
          />
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white transition hover:bg-slate-800"
        >
          Update results
        </button>
      </form>
    </aside>
  );
}
