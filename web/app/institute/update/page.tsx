'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function UpdateCLEPPolicyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Read query parameters from URL
  const school = searchParams.get('school')
  const id = searchParams.get('id')
  const token = searchParams.get('token')
  
  // Form state
  const [formData, setFormData] = useState({
    acceptsCLEP: '',
    maxCredits: '',
    scoreValidity: '',
    publicPolicyUrl: '',
    contactEmail: '',
  })
  
  // Validation and UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Validate email format
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Validate URL format
  function isValidUrl(url: string): boolean {
    if (!url) return true // Optional field
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  // Validate form inputs
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}
    
    if (!formData.acceptsCLEP) {
      newErrors.acceptsCLEP = 'Please select whether you accept CLEP'
    }
    
    if (!formData.maxCredits) {
      newErrors.maxCredits = 'Max credits is required'
    } else if (parseInt(formData.maxCredits) < 0) {
      newErrors.maxCredits = 'Max credits must be 0 or greater'
    }
    
    if (!formData.scoreValidity) {
      newErrors.scoreValidity = 'Score validity is required'
    } else if (parseInt(formData.scoreValidity) < 0) {
      newErrors.scoreValidity = 'Score validity must be 0 or greater'
    }
    
    if (formData.publicPolicyUrl && !isValidUrl(formData.publicPolicyUrl)) {
      newErrors.publicPolicyUrl = 'Please enter a valid URL'
    }
    
    if (!formData.contactEmail) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validate inputs
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    // Simulate save operation
    setTimeout(() => {
      // Log form data to console
      console.log('Form data submitted:', {
        school,
        id,
        token,
        ...formData,
      })
      
      setLoading(false)
      setSuccess(true)
    }, 700)
  }
  
  // Handle cancel
  function handleCancel() {
    router.push('/institute')
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Page header */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Update CLEP Policy
          </h1>
          
          {school && (
            <p className="text-gray-600 mb-6">
              {school} — update how you accept CLEP credits
            </p>
          )}
          
          {/* Success message */}
          {success ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                CLEP policy updated (mock)
              </h2>
              <p className="text-gray-600 mb-6">
                You're all set!
              </p>
              <button
                onClick={() => router.push('/institute')}
                className="w-full bg-[#66b10e] hover:bg-[#5a9e0d] text-white py-2 px-6 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Accepts CLEP? */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Accepts CLEP? <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="acceptsCLEP"
                      value="yes"
                      checked={formData.acceptsCLEP === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#66b10e]"
                    />
                    <span className="text-gray-900 font-semibold">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="acceptsCLEP"
                      value="no"
                      checked={formData.acceptsCLEP === 'no'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#66b10e]"
                    />
                    <span className="text-gray-900 font-semibold">No</span>
                  </label>
                </div>
                {errors.acceptsCLEP && (
                  <p className="text-red-600 text-sm mt-1">{errors.acceptsCLEP}</p>
                )}
              </div>
              
              {/* Max Credits */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Max Credits (per two semesters) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="maxCredits"
                  value={formData.maxCredits}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
                  placeholder="Enter max credits"
                  min="0"
                />
                {errors.maxCredits && (
                  <p className="text-red-600 text-sm mt-1">{errors.maxCredits}</p>
                )}
              </div>
              
              {/* Score Validity */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Score Validity (in years) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="scoreValidity"
                  value={formData.scoreValidity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
                  placeholder="Enter years"
                  min="0"
                />
                {errors.scoreValidity && (
                  <p className="text-red-600 text-sm mt-1">{errors.scoreValidity}</p>
                )}
              </div>
              
              {/* Public Policy URL */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Public Policy URL <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  name="publicPolicyUrl"
                  value={formData.publicPolicyUrl}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
                  placeholder="https://example.com/policy"
                />
                {errors.publicPolicyUrl && (
                  <p className="text-red-600 text-sm mt-1">{errors.publicPolicyUrl}</p>
                )}
              </div>
              
              {/* Contact Email */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Contact Email for confirmation
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
                  placeholder="contact@institution.edu"
                />
                {errors.contactEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#66b10e] hover:bg-[#5a9e0d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
