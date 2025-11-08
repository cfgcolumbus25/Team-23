"use client";

import React from "react";
import InputField from "./InputField";

export interface ExamScoreFieldsProps {
  selectedExams: string[];
  scoresByExam: Record<string, string>;
  onChangeScore: (exam: string, value: string) => void;
  errorsByExam?: Record<string, string | undefined>;
}

export default function ExamScoreFields({
  selectedExams,
  scoresByExam,
  onChangeScore,
  errorsByExam = {},
}: ExamScoreFieldsProps) {
  if (selectedExams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {selectedExams.map((exam) => {
        return (
          <InputField
            key={exam}
            id={`score-${exam}`}
            label={`Score for ${exam}`}
            type="number"
            value={scoresByExam[exam] ?? ""}
            onChange={(v) => onChangeScore(exam, v)}
            placeholder="Enter score (20–80)"
            inputMode="numeric"
            min={20}
            max={80}
            error={errorsByExam[exam]}
          />
        );
      })}
    </div>
  );
}


