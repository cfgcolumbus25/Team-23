'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store tokens in localStorage
      if (data.session) {
        localStorage.setItem('institute_access_token', data.session.access_token)
        localStorage.setItem('institute_refresh_token', data.session.refresh_token)
      }

      // Redirect to institute page
      router.push('/institute')
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900">Institution Login</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md w-full"
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-700"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#66b10e] hover:bg-[#5a9e0d] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center text-sm mt-2">
            <span className="text-gray-600">Don't have an account? </span>
            <a
              href="/institute/signup"
              className="text-[#66b10e] hover:underline"
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </main>
  )
}

