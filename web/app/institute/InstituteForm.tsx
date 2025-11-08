'use client'

import { updateInstitute, fetchInstituteData } from './actions'
import { useState, useEffect } from 'react'
import { CLEPAcceptanceItem } from './CLEPAcceptanceItem'
import type { InstitutionData, CLEPAcceptance } from './types'

export function InstituteForm({ instituteId }: { instituteId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Initialize with empty state matching the JSON structure
  const [formData, setFormData] = useState<InstitutionData>({
    institution_info: {
      max_credits: 0,
      'Can Use For Failed Courses': 0,
      'Can Enrolled Students Use CLEP': 0,
      'Score Validity': '0',
    },
    clep_acceptance: [],
    updated_by: '',
    last_updated: new Date().toISOString(),
  })

  // Fetch existing data when component mounts
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchInstituteData(instituteId)
        console.log('Received data:', data)
        if (data) {
          setFormData(data)
        }
      } catch (error) {
        console.error('Error loading institute data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [instituteId])

  // Handle institution info changes
  function handleInfoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      institution_info: {
        ...prev.institution_info,
        [name]: type === 'checkbox' 
          ? (checked ? 1 : 0)
          : name === 'Score Validity'
            ? value  // Keep as string for Score Validity
            : parseInt(value, 10) || 0  
      },
    }))
  }

  // Handle CLEP acceptance changes
  function handleCLEPChange(index: number, updatedItem: CLEPAcceptance) {
    setFormData(prev => {
      const newClepAcceptance = [...prev.clep_acceptance]
      newClepAcceptance[index] = updatedItem
      return {
        ...prev,
        clep_acceptance: newClepAcceptance,
      }
    })
  }

  // Add new CLEP acceptance entry
  function addCLEPAcceptance() {
    const existingIds = formData.clep_acceptance.map(item => item.id)
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    const newExamKey = `exam_id_${newId}`
    
    const newItem: CLEPAcceptance = {
      id: newId,
      [newExamKey]: {
        exam_name: '',  // Include exam_name field
        cut_score: 50,
        credits_awarded: 3,
        course_equivalents: '',
      },
    }

    setFormData(prev => ({
      ...prev,
      clep_acceptance: [...prev.clep_acceptance, newItem],
    }))
  }

  // Remove CLEP acceptance entry
  function removeCLEPAcceptance(index: number) {
    setFormData(prev => ({
      ...prev,
      clep_acceptance: prev.clep_acceptance.filter((_, i) => i !== index),
    }))
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Update the last_updated field
      const dataToSave = {
        ...formData,
        last_updated: new Date().toISOString(),
        updated_by: 'current_user_id', // This should come from your auth system
      }
      
      await updateInstitute(instituteId, dataToSave)
      // Show success message or redirect
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-md w-full max-w-4xl"
    >
      {/* Institution Info Section */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Institution Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Credits (per two semesters)
            </label>
            <input
              type="number"
              name="max_credits"
              value={formData.institution_info.max_credits}
              onChange={handleInfoChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
              min="0"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Score Validity (in years)
            </label>
            <input
              type="number"
              name="Score Validity"
              value={formData.institution_info['Score Validity']}
              onChange={handleInfoChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
              min="0"
              max="10"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="Can Use For Failed Courses"
              checked={formData.institution_info['Can Use For Failed Courses'] === 1}
              onChange={handleInfoChange}
            />
            Allow failed courses to transfer
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="Can Enrolled Students Use CLEP"
              checked={formData.institution_info['Can Enrolled Students Use CLEP'] === 1}
              onChange={handleInfoChange}
            />
            Enrolled students can use CLEP
          </label>
        </div>
      </div>

      {/* CLEP Acceptance Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">CLEP Test Acceptance</h2>
          <button
            type="button"
            onClick={addCLEPAcceptance}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Add CLEP Test
          </button>
        </div>

        {formData.clep_acceptance.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No CLEP tests configured. Click "Add CLEP Test" to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {formData.clep_acceptance.map((item, index) => (
              <CLEPAcceptanceItem
                key={item.id}
                item={item}
                index={index}
                onChange={(updatedItem) => handleCLEPChange(index, updatedItem)}
                onRemove={() => removeCLEPAcceptance(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className="border-t pt-4 text-sm text-gray-500">
        {formData.last_updated && (
          <p>Last updated: {new Date(formData.last_updated).toLocaleString()}</p>
        )}
        {formData.updated_by && <p>Updated by: {formData.updated_by}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => window.location.reload()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#66b10e] hover:bg-[#5a9e0d] disabled:bg-gray-400 text-white py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
