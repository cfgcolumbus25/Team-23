import { DashboardHeader } from "@/components/dashboard/header";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { InstitutionList } from "@/components/dashboard/institution-list";
import { KeyStatsCard } from "@/components/dashboard/key-stats-card";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";

const mockLearner = {
  location: "Phoenix, AZ",
  exams: [
    { code: "BIO-101", label: "Biology", score: 62 },
    { code: "HIS-201", label: "US History I", score: 58 },
  ],
};

const mockMajors = ["Biology", "Education", "Business", "General Studies"];
const mockInstitutions = [
  {
    name: "Mesa State University",
    location: "Mesa, AZ",
    zip: "85201",
    credits: 12,
    lastUpdated: "Mar 2024",
  },
  {
    name: "Sonoran Polytechnic",
    location: "Tempe, AZ",
    zip: "85281",
    credits: 9,
    lastUpdated: "Jan 2024",
  },
  {
    name: "Cactus Valley College",
    location: "Chandler, AZ",
    zip: "85224",
    credits: 6,
    lastUpdated: "Aug 2023",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="flex w-full flex-col gap-6">
        <DashboardHeader
          badge="Modern States - CLEP Acceptance Tools"
          title="Dashboard"
          subtitle="High-level layout structure."
        />

        <section className="grid gap-4 md:grid-cols-2">
          <ProfileSummaryCard description="Profile summary - Profile will break out in separate page" />
          <KeyStatsCard description="Key stats - number of matching institutions, average credits awarded" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <FiltersPanel learner={mockLearner} majors={mockMajors} />
          <MapPlaceholder />
          <InstitutionList institutions={mockInstitutions} />
        </section>
      </div>
    </main>
  );
}
