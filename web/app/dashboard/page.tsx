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
  const [stats, setStats] = useState([
    { label: "Matches", value: "0", helper: "Institutions aligned to CLEP exams" },
    { label: "Avg Credits", value: "0", helper: "Median awarded across matches" },
    { label: "Fresh Policies", value: "0%", helper: "Updated within last 12 months" },
  ]);

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

  async function fetchInstitutions(zipcode: string) {
    try {
      const response = await fetch(`/api/institutions?zipcode=${zipcode}&radius=50`);
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

  // Create learner object for components
  const learner = userData ? {
    name: userData.name,
    location: userLocation ? `${userLocation.city}, ${userLocation.state}` : userData.zipcode,
    exams: Array.isArray(userData.exams) ? userData.exams : [],
    coordinates: userLocation?.coordinates || { lat: 39.8283, lng: -98.5795 },
  } : null;

  // Convert institutions to explore mode format (simplified)
  const institutionsExplore: InstitutionWithExams[] = institutions.map(inst => ({
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
              <FiltersPanel learner={learner} majors={[]} />
              <div className="lg:col-span-2">
                <MapSection
                  institutions={institutions}
                  learnerLocation={learner.coordinates}
                />
              </div>
              <div className="lg:col-span-3">
                <InstitutionList institutions={institutions} />
              </div>
              {/* AI-generated information about the top choice */}
              {institutions.length > 0 && (
                <div className="lg:col-span-3">
                  <CollegeInfoCard institution={institutions[0]} />
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Explore mode: Show schools with accepted exams - side by side map and list */}
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
                  learnerLocation={learner.coordinates}
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
                <InstitutionListExplore institutions={institutionsExplore} />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
