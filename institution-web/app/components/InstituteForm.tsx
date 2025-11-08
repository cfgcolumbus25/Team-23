'use client'

import { updateInstitute } from '../lib/actions'
import { useState } from 'react'

export function InstituteForm({ instituteId }: { instituteId: string }) {
  const updateInstituteWithId = updateInstitute.bind(null, instituteId)

  const [formData, setFormData] = useState({
    maxCredits: '',
    useFailedCourses: false,
    enrolledCanUseClep: false,
    scoreValidity: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <form
      action={updateInstituteWithId}
      className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md w-full max-w-md"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Max Credits (per two semesters)
        </label>
        <input
          type="number"
          name="maxCredits"
          value={formData.maxCredits}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="useFailedCourses"
          checked={formData.useFailedCourses}
          onChange={handleChange}
        />
        Allow failed courses to transfer
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="enrolledCanUseClep"
          checked={formData.enrolledCanUseClep}
          onChange={handleChange}
        />
        Enrolled students can use CLEP
      </label>

      <div>
        <label className="block text-sm font-medium mb-1">
          Score Validity (in years)
        </label>
        <input
          type="number"
          name="scoreValidity"
          value={formData.scoreValidity}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <button
        type="submit"
        className="mt-4 bg-[#66b10e] hover:bg-[#5a9e0d] text-white py-2 px-4 rounded-lg transition-colors"
      >
        Save Settings
      </button>

    </form>
  )
}

