"use client";

import React from "react";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (nextValues: string[]) => void;
  placeholder?: string;
  error?: string;
}

export default function MultiSelect({
  id,
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  error,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  function toggleValue(val: string) {
    const exists = selectedValues.includes(val);
    const next = exists
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onChange(next);
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={[
            "flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 shadow-sm",
            "focus:border-[#6ebf10] focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/20",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
          ].join(" ")}
        >
          <span className="truncate">
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder}
          </span>
          <svg
            className="ml-2 h-4 w-4 text-slate-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {open ? (
          <ul
            role="listbox"
            className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg"
          >
            {options.map((opt) => {
              const checked = selectedValues.includes(opt.value);
              return (
                <li
                  role="option"
                  aria-selected={checked}
                  key={opt.value}
                  className={[
                    "flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-slate-700 hover:bg-slate-50",
                    checked ? "bg-slate-50" : "",
                  ].join(" ")}
                  onClick={() => toggleValue(opt.value)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-[#6ebf10]"
                    checked={checked}
                    onChange={() => toggleValue(opt.value)}
                  />
                  <span>{opt.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {selectedValues.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((val) => {
            const label =
              options.find((o) => o.value === val)?.label ?? val;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded-full border border-[#bebebe] px-3 py-1 text-xs font-medium text-[#1c1c1c]"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => toggleValue(val)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}


