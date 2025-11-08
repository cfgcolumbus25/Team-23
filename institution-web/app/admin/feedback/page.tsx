'use client'

import { useState, useEffect } from 'react'

interface Acceptance {
  id: string
  cut_score: number
  credits: number
  related_course: string
  likes: number
  dislikes: number
  total_votes: number
  dislike_ratio: number
  institutions: {
    id: string
    name: string
    city: string
    state: string
  }
  exams: {
    id: number
    name: string
  }
}

export default function AdminFeedbackPage() {
  const [acceptances, setAcceptances] = useState<Acceptance[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'dislikes' | 'likes' | 'dislike_ratio'>('dislikes')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

  useEffect(() => {
    fetchFeedback()
  }, [sortBy])

  async function fetchFeedback() {
    setLoading(true)
    const token = localStorage.getItem('institute_access_token')

    try {
      const response = await fetch(`${apiUrl}/admin/acceptances/feedback?sort_by=${sortBy}&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAcceptances(data.acceptances || [])
      }
    } catch (err) {
      console.error('Error fetching feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  function getDislikeRatioColor(ratio: number) {
    if (ratio >= 0.7) return 'text-red-600 bg-red-50'
    if (ratio >= 0.5) return 'text-orange-600 bg-orange-50'
    if (ratio >= 0.3) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  function formatRatio(ratio: number) {
    return `${(ratio * 100).toFixed(0)}%`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Acceptance Feedback</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor student feedback on CLEP acceptance policies
        </p>
      </div>

      {/* Sort Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('dislikes')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                sortBy === 'dislikes'
                  ? 'bg-[#66b10e] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Dislikes
            </button>
            <button
              onClick={() => setSortBy('dislike_ratio')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                sortBy === 'dislike_ratio'
                  ? 'bg-[#66b10e] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Highest Dislike %
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                sortBy === 'likes'
                  ? 'bg-[#66b10e] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Likes
            </button>
          </div>
        </div>
      </div>

      {/* Acceptances Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            CLEP Acceptances ({acceptances.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading feedback data...</div>
          ) : acceptances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No feedback data available</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cut Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dislikes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dislike %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {acceptances.map((acceptance) => (
                  <tr key={acceptance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {acceptance.institutions?.name || 'N/A'}
                      </div>
                      <div className="text-gray-500">
                        {acceptance.institutions?.city}, {acceptance.institutions?.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {acceptance.exams?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acceptance.cut_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acceptance.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        👍 {acceptance.likes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        👎 {acceptance.dislikes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDislikeRatioColor(
                          acceptance.dislike_ratio
                        )}`}
                      >
                        {formatRatio(acceptance.dislike_ratio)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Dislike Ratio Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-600">&lt; 30% - Good</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">30-50% - Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-gray-600">50-70% - Concerning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-600">&ge; 70% - Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}

