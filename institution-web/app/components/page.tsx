'use client'

import { InstituteForm } from './InstituteForm'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function InstitutePage({ params, searchParams }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    const accessToken = localStorage.getItem('institute_access_token')

    try {
      if (accessToken) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (err) {
      // Fail-safe: continue with logout even if API call fails
      console.error('Logout API error:', err)
    } finally {
      // Always clear tokens and redirect
      localStorage.removeItem('institute_access_token')
      localStorage.removeItem('institute_refresh_token')
      router.push('/institute/login')
    }
  }

  const instituteId = params?.id || '1' // Default to '1' for demo
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {/* Align header and logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Institute Policy Settings</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-[#66b10e] hover:bg-[#5a9e0d] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
        <InstituteForm instituteId="12345" />
      </div>
    </main>
  )
}
