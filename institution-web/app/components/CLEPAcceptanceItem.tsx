'use client'

import type { CLEPAcceptance, ExamDetails } from './types'

interface CLEPAcceptanceItemProps {
  item: CLEPAcceptance
  index: number
  onChange: (item: CLEPAcceptance) => void
  onRemove: () => void
}

export function CLEPAcceptanceItem({ 
  item, 
  index, 
  onChange, 
  onRemove 
}: CLEPAcceptanceItemProps) {
  // Get the exam key (e.g., "exam_id_1")
  const examKey = Object.keys(item).find(key => key.startsWith('exam_id_')) || ''
  const examData = examKey && typeof item[examKey] === 'object' ? item[examKey] as ExamDetails : null

  if (!examData) return null

  function handleChange(field: keyof ExamDetails, value: string | number) {
    const updatedItem = {
      ...item,
      [examKey]: {
        ...examData,
        [field]: field === 'course_equivalents' || field === 'exam_name'  // Keep strings as strings
          ? (value as string)
          : parseInt(value as string, 10),
      },
    } as CLEPAcceptance

    onChange(updatedItem)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-sm">CLEP Test #{index + 1}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
          aria-label="Remove CLEP test"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Exam Name
          </label>
          <input
            type="text"
            value={examData.exam_name}
            onChange={(e) => handleChange('exam_name', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            placeholder="e.g., Biology"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cut Score (20-80)
          </label>
          <input
            type="number"
            value={examData.cut_score}
            onChange={(e) => handleChange('cut_score', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            min="20"
            max="80"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Credits Awarded
          </label>
          <input
            type="number"
            value={examData.credits_awarded}
            onChange={(e) => handleChange('credits_awarded', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            min="0"
            max="12"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Course Equivalent(s)
          </label>
          <input
            type="text"
            value={examData.course_equivalents}
            onChange={(e) => handleChange('course_equivalents', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            placeholder="BIO 101, BIO 102"
            required
          />
        </div>
      </div>
    </div>
  )
}