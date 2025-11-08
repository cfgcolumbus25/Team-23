import { DashboardHeader } from "@/components/dashboard/header";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { InstitutionList } from "@/components/dashboard/institution-list";
import { KeyStatsCard } from "@/components/dashboard/key-stats-card";
import { MapSection } from "@/components/dashboard/map-section";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
import { CollegeInfoCard } from "@/components/dashboard/college-info-card";

const mockLearner = {
  name: "Ava Johnson",
  location: "Columbus, OH",
  exams: [
    { code: "BIO-101", label: "Biology", score: 62 },
    { code: "HIS-201", label: "US History I", score: 58 },
  ],
  coordinates: {
    lat: 39.9612,
    lng: -82.9988,
  },
};

const mockMajors = ["Biology", "Education", "Business", "General Studies"];
const mockInstitutions = [
  {
    name: "Ohio State University",
    location: "Columbus, OH",
    zip: "43210",
    credits: 12,
    lastUpdated: "Mar 2024",
    lat: 40.0068,
    lng: -83.0304,
  },
  {
    name: "Ohio University",
    location: "Athens, OH",
    zip: "45701",
    credits: 9,
    lastUpdated: "Jan 2024",
    lat: 39.3268,
    lng: -82.1013,
  },
  {
    name: "University of Cincinnati",
    location: "Cincinnati, OH",
    zip: "45221",
    credits: 6,
    lastUpdated: "Aug 2023",
    lat: 39.1329,
    lng: -84.5150,
  },
];
const mockStats = [
  {
    label: "Matches",
    value: "24",
    helper: "Institutions aligned to CLEP exams",
  },
  {
    label: "Avg Credits",
    value: "9",
    helper: "Median awarded across matches",
  },
  {
    label: "Fresh Policies",
    value: "72%",
    helper: "Updated within last 12 months",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f2f2f2] p-6 text-[#1c1c1c]">
      <div className="flex w-full flex-col gap-6">
        <DashboardHeader
          badge="Modern States - CLEP Acceptance Tools"
          title="Dashboard"
          subtitle="High-level layout structure."
        />

        <section className="grid gap-4 md:grid-cols-2">
          <ProfileSummaryCard learner={mockLearner} />
          <KeyStatsCard stats={mockStats} />
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:auto-rows-min">
          <FiltersPanel learner={mockLearner} majors={mockMajors} />
          <div className="lg:col-span-2">
            <MapSection
              institutions={mockInstitutions}
              learnerLocation={mockLearner.coordinates}
            />
          </div>
          <div className="lg:col-span-3">
            <InstitutionList institutions={mockInstitutions} />
          </div>
          {/* AI-generated information about the top choice */}
          {mockInstitutions.length > 0 && (
            <div className="lg:col-span-3">
              <CollegeInfoCard institution={mockInstitutions[0]} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
