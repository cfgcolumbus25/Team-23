'use client';

import { useState, useEffect } from 'react';
import { DashboardHeaderWithToggle } from "@/components/dashboard/dashboard-header-with-toggle";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { InstitutionList } from "@/components/dashboard/institution-list";
import { InstitutionListExplore } from "@/components/dashboard/institution-list-explore";
import { KeyStatsCard } from "@/components/dashboard/key-stats-card";
import { MapSection } from "@/components/dashboard/map-section";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
import { CollegeInfoCard } from "@/components/dashboard/college-info-card";

type UserData = {
  name: string;
  email: string;
  zipcode: string;
  exams: Array<{ label: string; code: string; score: number }>;
};

type Institution = {
  name: string;
  location: string;
  zip: string;
  credits: number;
  lastUpdated: string;
  lat: number;
  lng: number;
};

type InstitutionWithExams = Institution & {
  acceptedExams: Array<{ name: string; credits: number; cutScore: number }>;
};

export default function DashboardPage() {
  const [mode, setMode] = useState<'profile' | 'explore'>('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [userLocation, setUserLocation] = useState<{ city: string; state: string; coordinates: { lat: number; lng: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [minCredits, setMinCredits] = useState(0);
  const [stats, setStats] = useState([
    { label: "Matches", value: "0", helper: "Institutions aligned to CLEP exams" },
    { label: "Avg Credits", value: "0", helper: "Median awarded across matches" },
    { label: "Fresh Policies", value: "0%", helper: "Updated within last 12 months" },
  ]);
  const [searchZipcode, setSearchZipcode] = useState<string>('');
  const [exploreZipcode, setExploreZipcode] = useState<string>('');

  useEffect(() => {
    // Load user data from localStorage
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const data = JSON.parse(stored) as UserData;
        // Ensure exams is always an array
        const validatedData: UserData = {
          ...data,
          exams: Array.isArray(data.exams) ? data.exams : [],
        };
        setUserData(validatedData);
        
        // Fetch institutions based on zipcode
        if (validatedData.zipcode) {
          fetchInstitutions(validatedData.zipcode);
          setExploreZipcode(validatedData.zipcode);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchInstitutions(zipcode: string, exactMatch: boolean = false) {
    try {
      setLoading(true);
      const url = exactMatch 
        ? `/api/institutions?zipcode=${zipcode}&radius=50&exact=true`
        : `/api/institutions?zipcode=${zipcode}&radius=50`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch institutions');
      
      const data = await response.json();
      setInstitutions(data.institutions || []);
      setUserLocation(data.userLocation);
      
      // Calculate stats
      const matchCount = data.institutions?.length || 0;
      const avgCredits = matchCount > 0
        ? Math.round(data.institutions.reduce((sum: number, inst: Institution) => sum + (inst.credits || 0), 0) / matchCount)
        : 0;
      const freshCount = data.institutions?.filter((inst: Institution) => {
        const date = new Date(inst.lastUpdated);
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date > yearAgo;
      }).length || 0;
      const freshPercent = matchCount > 0 ? Math.round((freshCount / matchCount) * 100) : 0;
      
      setStats([
        { label: "Matches", value: matchCount.toString(), helper: "Institutions aligned to CLEP exams" },
        { label: "Avg Credits", value: avgCredits.toString(), helper: "Median awarded across matches" },
        { label: "Fresh Policies", value: `${freshPercent}%`, helper: "Updated within last 12 months" },
      ]);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleZipcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const zipcode = searchZipcode.trim();
    // Validate 5-digit zipcode
    if (zipcode && /^\d{5}$/.test(zipcode)) {
      setExploreZipcode(zipcode);
      fetchInstitutions(zipcode, true); // Use exact match for explore mode
      setSearchZipcode(''); // Clear the input after search
    } else {
      alert('Please enter a valid 5-digit zipcode');
    }
  };

  const handleZipcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length <= 5) {
      setSearchZipcode(value);
    }
  };

  // Create learner object for components
  const learner = userData ? {
    name: userData.name,
    location: userLocation ? `${userLocation.city}, ${userLocation.state}` : userData.zipcode,
    exams: Array.isArray(userData.exams) ? userData.exams : [],
    coordinates: userLocation?.coordinates || { lat: 39.8283, lng: -98.5795 },
  } : null;

  // Filter institutions by minimum credits
  const filteredInstitutions = institutions.filter(inst => inst.credits >= minCredits);

  // Update stats when institutions or filter changes
  useEffect(() => {
    const filtered = institutions.filter(inst => inst.credits >= minCredits);
    if (filtered.length > 0) {
      const matchCount = filtered.length;
      const avgCredits = Math.round(
        filtered.reduce((sum: number, inst: Institution) => sum + (inst.credits || 0), 0) / matchCount
      );
      const freshCount = filtered.filter((inst: Institution) => {
        const date = new Date(inst.lastUpdated);
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date > yearAgo;
      }).length;
      const freshPercent = Math.round((freshCount / matchCount) * 100);

      setStats([
        { label: "Matches", value: matchCount.toString(), helper: "Institutions aligned to CLEP exams" },
        { label: "Avg Credits", value: avgCredits.toString(), helper: "Median awarded across matches" },
        { label: "Fresh Policies", value: `${freshPercent}%`, helper: "Updated within last 12 months" },
      ]);
    } else if (institutions.length === 0) {
      setStats([
        { label: "Matches", value: "0", helper: "Institutions aligned to CLEP exams" },
        { label: "Avg Credits", value: "0", helper: "Median awarded across matches" },
        { label: "Fresh Policies", value: "0%", helper: "Updated within last 12 months" },
      ]);
    }
  }, [institutions, minCredits]);

  // Convert institutions to explore mode format (simplified)
  const institutionsExplore: InstitutionWithExams[] = filteredInstitutions.map(inst => ({
    ...inst,
    acceptedExams: Array.isArray(userData?.exams) && userData.exams.length > 0
      ? userData.exams.slice(0, 3).map(exam => ({
          name: exam.label,
          credits: Math.floor(Math.random() * 4) + 3,
          cutScore: 50,
        }))
      : [],
  }));

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f2f2f2] p-6 text-[#1c1c1c]">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-[#4a4a4a]">Loading...</p>
        </div>
      </main>
    );
  }

  if (!userData || !learner) {
    return (
      <main className="min-h-screen bg-[#f2f2f2] p-6 text-[#1c1c1c]">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-[#4a4a4a]">No user data found. Please complete onboarding first.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2] p-6 text-[#1c1c1c]">
      <div className="flex w-full flex-col gap-6">
        <DashboardHeaderWithToggle mode={mode} onModeChange={setMode} />

        {mode === 'profile' ? (
          <>
            {/* Profile mode: Show learner profile and stats */}
            <section className="grid gap-4 md:grid-cols-2">
              <ProfileSummaryCard learner={learner} />
              <KeyStatsCard stats={stats} />
            </section>

            {/* Filters, map, and matching institutions */}
            <section className="grid gap-4 lg:grid-cols-3 lg:auto-rows-min">
              <FiltersPanel learner={learner} majors={[]} onMinCreditsChange={setMinCredits} />
              <div className="lg:col-span-2">
                <MapSection
                  institutions={filteredInstitutions}
                  learnerLocation={learner.coordinates}
                />
              </div>
              <div className="lg:col-span-3">
                <InstitutionList institutions={filteredInstitutions} />
              </div>
              {/* AI-generated information about the top choice */}
              {filteredInstitutions.length > 0 && (
                <div className="lg:col-span-3">
                  <CollegeInfoCard institution={filteredInstitutions[0]} />
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Explore mode: Show schools with accepted exams - side by side map and list */}
            {/* Zipcode Search Bar */}
            <section className="rounded-3xl border-2 border-[#d5e3cf] bg-white p-6 shadow-lg">
              <form onSubmit={handleZipcodeSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="zipcode-search" className="block text-sm font-semibold text-[#1c1c1c] mb-2">
                    Search Schools by Zipcode
                  </label>
                  <input
                    id="zipcode-search"
                    type="text"
                    inputMode="numeric"
                    value={searchZipcode}
                    onChange={handleZipcodeInputChange}
                    placeholder="Enter a 5-digit zipcode (e.g., 10001)"
                    className="w-full rounded-xl border-2 border-[#d5e3cf] bg-white px-4 py-3 text-[#1c1c1c] placeholder:text-[#8a8a8a] focus:border-[#6ebf10] focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/20 transition-all"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    disabled={loading}
                  />
                  <div className="mt-2 flex items-center gap-4 flex-wrap">
                    {exploreZipcode && (
                      <p className="text-sm text-[#4a4a4a]">
                        Currently showing schools in zipcode: <span className="font-semibold text-[#6ebf10]">{exploreZipcode}</span>
                      </p>
                    )}
                    {exploreZipcode && userData?.zipcode && exploreZipcode !== userData.zipcode && (
                      <button
                        type="button"
                        onClick={() => {
                          if (userData.zipcode) {
                            setExploreZipcode(userData.zipcode);
                            fetchInstitutions(userData.zipcode, false);
                            setSearchZipcode('');
                          }
                        }}
                        className="text-sm font-semibold text-[#6ebf10] hover:text-[#5ca00d] underline transition-colors"
                      >
                        Reset to my zipcode ({userData.zipcode})
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || searchZipcode.length !== 5}
                    className="rounded-xl bg-[#6ebf10] px-6 py-3 text-base font-bold text-white shadow-md hover:bg-[#5ca00d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </section>
            <section className="grid gap-4 lg:grid-cols-2 lg:auto-rows-min">
              {/* Map on the left */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <MapSection
                  institutions={institutionsExplore.map(inst => ({
                    name: inst.name,
                    location: inst.location,
                    zip: inst.zip,
                    credits: inst.acceptedExams.reduce((sum, exam) => sum + exam.credits, 0),
                    lastUpdated: inst.lastUpdated,
                    lat: inst.lat,
                    lng: inst.lng,
                  }))}
                  learnerLocation={userLocation?.coordinates || learner.coordinates}
                />
                {/* AI-generated information about the top choice - under map */}
                {institutionsExplore.length > 0 && (
                  <CollegeInfoCard institution={{
                    name: institutionsExplore[0].name,
                    location: institutionsExplore[0].location,
                    zip: institutionsExplore[0].zip,
                    credits: institutionsExplore[0].acceptedExams.reduce((sum, exam) => sum + exam.credits, 0),
                    lastUpdated: institutionsExplore[0].lastUpdated,
                  }} />
                )}
              </div>
              {/* Institution list on the right */}
              <div className="lg:col-span-1">
                {loading ? (
                  <section className="rounded-3xl border border-[#d5e3cf] bg-white p-6 shadow-lg shadow-black/5">
                    <div className="flex items-center justify-center h-64">
                      <p className="text-lg text-[#4a4a4a]">Loading schools...</p>
                    </div>
                  </section>
                ) : institutionsExplore.length === 0 ? (
                  <section className="rounded-3xl border border-[#d5e3cf] bg-white p-6 shadow-lg shadow-black/5">
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <p className="text-lg font-semibold text-[#1c1c1c] mb-2">No schools found</p>
                      <p className="text-sm text-[#4a4a4a] mb-4">
                        {exploreZipcode 
                          ? `No institutions found for zipcode ${exploreZipcode}. Try searching a different zipcode.`
                          : 'No institutions available. Try searching by zipcode.'}
                      </p>
                    </div>
                  </section>
                ) : (
                  <InstitutionListExplore institutions={institutionsExplore} />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
