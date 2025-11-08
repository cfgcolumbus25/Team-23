import { DashboardHeader } from "@/components/dashboard/header";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { InstitutionList } from "@/components/dashboard/institution-list";
import { KeyStatsCard } from "@/components/dashboard/key-stats-card";
import { MapSection } from "@/components/dashboard/map-section";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";

const mockLearner = {
  name: "Ava Johnson",
  location: "Phoenix, AZ",
  exams: [
    { code: "BIO-101", label: "Biology", score: 62 },
    { code: "HIS-201", label: "US History I", score: 58 },
  ],
  coordinates: {
    lat: 33.4484,
    lng: -112.074,
  },
};

const mockMajors = ["Biology", "Education", "Business", "General Studies"];
const mockInstitutions = [
  {
    name: "Mesa State University",
    location: "Mesa, AZ",
    zip: "85201",
    credits: 12,
    lastUpdated: "Mar 2024",
    lat: 33.4152,
    lng: -111.8315,
  },
  {
    name: "Sonoran Polytechnic",
    location: "Tempe, AZ",
    zip: "85281",
    credits: 9,
    lastUpdated: "Jan 2024",
    lat: 33.4255,
    lng: -111.94,
  },
  {
    name: "Cactus Valley College",
    location: "Chandler, AZ",
    zip: "85224",
    credits: 6,
    lastUpdated: "Aug 2023",
    lat: 33.3062,
    lng: -111.8413,
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
        </section>
      </div>
    </main>
  );
}
