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
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with logout button */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Institute Policy Settings</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
        <InstituteForm instituteId="12345" />
      </div>
    </main>
  )
}
