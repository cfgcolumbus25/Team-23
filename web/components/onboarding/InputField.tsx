"use client";

import React from "react";

type InputType = "text" | "email" | "password" | "number";

export interface InputFieldProps {
  id: string;
  label: string;
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  min?: number;
  max?: number;
}

export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  inputMode,
  pattern,
  min,
  max,
}: InputFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        min={min}
        max={max}
        className={[
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm",
          "focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
        ].join(" ")}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}


