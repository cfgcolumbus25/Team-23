'use client';

import { useState, useEffect } from 'react';

// Institution data structure
type Institution = {
  name: string;
  location: string;
  zip: string;
  credits: number;
  lastUpdated: string;
};

// Props for college info card component
type CollegeInfoCardProps = {
  institution: Institution;
};

// Component that displays AI-generated information about a college
export function CollegeInfoCard({ institution }: CollegeInfoCardProps) {
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch college information from Gemini
  useEffect(() => {
    const fetchCollegeInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/college-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collegeName: institution.name,
            location: institution.location,
            credits: institution.credits,
          }),
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If response isn't JSON, use the status message
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!data.info) {
          throw new Error('No information returned from server');
        }
        setInfo(data.info);
      } catch (err) {
        console.error('Error fetching college info:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error: Unable to connect to server. Make sure the dev server is running.');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeInfo();
  }, [institution]);

  return (
    <section className="rounded-3xl border border-[#d5e3cf] bg-white p-6 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            AI Insights
          </p>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">
            About {institution.name}
          </h2>
        </div>
      </div>

      <div className="mt-4">
        {loading && (
          <div className="rounded-2xl border border-[#e1eddc] bg-[#f9fff2] p-4">
            <p className="text-sm text-[#4a4a4a]">Loading information...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {info && !loading && (
          <div className="rounded-2xl border border-[#e1eddc] bg-[#f9fff2] p-4">
            <p className="text-sm leading-relaxed text-[#1c1c1c] whitespace-pre-line">
              {info}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

