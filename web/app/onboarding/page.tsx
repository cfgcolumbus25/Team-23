"use client";

const API_BASE = "http://localhost:5002";

import React from "react";
import InputField from "@/components/onboarding/InputField";
import MultiSelect, {
  type MultiSelectOption,
} from "@/components/onboarding/MultiSelect";
import ExamScoreFields from "@/components/onboarding/ExamScoreFields";
import Toast from "@/components/onboarding/Toast";
import { useRouter } from "next/navigation";

// we set this const to the list of all possible CLEP exams which has been
// harcoded as its static. pulled from the collegeboard clep website.
const CLEP_EXAMS: MultiSelectOption[] = [
  { label: "American Government", value: "American Government" },
  {
    label: "History of the United States I: Early Colonization to 1877",
    value: "History of the United States I: Early Colonization to 1877",
  },
  {
    label: "History of the United States II: 1865 to the Present",
    value: "History of the United States II: 1865 to the Present",
  },
  {
    label: "Human Growth and Development",
    value: "Human Growth and Development",
  },
  {
    label: "Introduction to Educational Psychology",
    value: "Introduction to Educational Psychology",
  },
  { label: "Introductory Psychology", value: "Introductory Psychology" },
  { label: "Introductory Sociology", value: "Introductory Sociology" },
  {
    label: "Principles of Macroeconomics",
    value: "Principles of Macroeconomics",
  },
  {
    label: "Principles of Microeconomics",
    value: "Principles of Microeconomics",
  },
  {
    label: "Social Sciences and History",
    value: "Social Sciences and History",
  },
  {
    label: "Western Civilization I: Ancient Near East to 1648",
    value: "Western Civilization I: Ancient Near East to 1648",
  },
  {
    label: "Western Civilization II: 1648 to the Present",
    value: "Western Civilization II: 1648 to the Present",
  },
  // Composition and Literature
  { label: "American Literature", value: "American Literature" },
  {
    label: "Analyzing and Interpreting Literature",
    value: "Analyzing and Interpreting Literature",
  },
  { label: "College Composition", value: "College Composition" },
  {
    label: "College Composition Modular",
    value: "College Composition Modular",
  },
  { label: "English Literature", value: "English Literature" },
  { label: "Humanities", value: "Humanities" },
  // Science & Mathematics
  { label: "Biology", value: "Biology" },
  { label: "Calculus", value: "Calculus" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "College Algebra", value: "College Algebra" },
  { label: "College Mathematics", value: "College Mathematics" },
  { label: "Natural Sciences", value: "Natural Sciences" },
  { label: "Precalculus", value: "Precalculus" },
  // Business
  { label: "Financial Accounting", value: "Financial Accounting" },
  { label: "Information Systems", value: "Information Systems" },
  { label: "Introductory Business Law", value: "Introductory Business Law" },
  { label: "Principles of Management", value: "Principles of Management" },
  { label: "Principles of Marketing", value: "Principles of Marketing" },
  // World Languages
  {
    label: "French Language: Levels 1 and 2",
    value: "French Language: Levels 1 and 2",
  },
  {
    label: "German Language: Levels 1 and 2",
    value: "German Language: Levels 1 and 2",
  },
  {
    label: "Spanish Language: Levels 1 and 2",
    value: "Spanish Language: Levels 1 and 2",
  },
  {
    label: "Spanish with Writing: Levels 1 and 2",
    value: "Spanish with Writing: Levels 1 and 2",
  },
];

/*
this is the main page for onboarding process. contains all of the input fields and 
logic for the onboarding process, we use the use state to manage the state of all of 
the input fields. 
*/
export default function OnboardingPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zip, setZip] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [selectedExams, setSelectedExams] = React.useState<string[]>([]);
  const [scoresByExam, setScoresByExam] = React.useState<
    Record<string, string>
  >({});
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const router = useRouter();

  // manage errors for the input fields
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    zip?: string;
    exams?: string;
    examScores?: Record<string, string | undefined>;
  }>({});

  // this useeffect used to remove scores for any of the CLEP exams that were
  // not selected by any of the users
  React.useEffect(() => {
    // remove here so that the scores are not shown for any of the CLEP exams that were not selected by the user
    setScoresByExam((prev) => {
      const next: Record<string, string> = {};
      for (const exam of selectedExams) {
        next[exam] = prev[exam] ?? "";
      }
      // return new object with only scores for selected exams
      return next;
    });
  }, [selectedExams]);

  // this function validates the various input fields, returns true if all fields
  // are valid, false if any of fields invalid
  function validate(): boolean {
    const nextErrors: typeof errors = { examScores: {} };
    // validate the name field
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) {
      // check that email nonempty
      nextErrors.email = "Email is required";
    } else {
      // check that email has a valid format
      const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!simpleEmail.test(email)) {
        nextErrors.email = "Enter a valid email";
      }
    }
    // validate the zip code field using regex
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zip)) {
      nextErrors.zip = "ZIP must be 5 digits";
    }
    // CLEP exam selection is optional; validate scores only if provided for selected exams
    for (const exam of selectedExams) {
      const val = scoresByExam[exam];
      if (val === undefined || val === "") {
        // score optional for selected exams
      } else if (!/^\d+$/.test(val)) {
        // check that score is numeric
        nextErrors.examScores![exam] = "Score must be numeric";
      } else {
        // check that score is between 20 and 80
        const num = Number(val);
        if (num < 20 || num > 80) {
          nextErrors.examScores![exam] = "Score must be between 20 and 80";
        }
      }
    }
    // clean up empty examScores object
    if (Object.keys(nextErrors.examScores ?? {}).length === 0) {
      delete nextErrors.examScores;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // this function is called when the user submits the form, it validates the form
  // and if valid, it calls the backend API to create the profile
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // create the payload for the backend API
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      zipcode: parseInt(zip, 10),
      exams: selectedExams.reduce((acc, exam) => {
        acc[exam] = scoresByExam[exam] ? parseInt(scoresByExam[exam], 10) : 0;
        return acc;
      }, {} as Record<string, number>),
      maxcredits: undefined, // optional
    };

    try {
      const res = await fetch(`${API_BASE}/learners/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.error || "Failed to create user";
        console.error(msg);

        // Show an error toast instead of success
        setToastMessage(msg); // you need a separate toast message state
        setShowToast(true);
        return;
      }

      console.log("User created:", json);

      // Save user data to localStorage for personalization
      const userData = {
        name: name.trim(),
        email: email.trim(),
        zipcode: zip.trim(),
        exams: selectedExams.map((exam) => ({
          label: exam,
          code: exam.replace(/\s+/g, "-").toUpperCase(),
          score: scoresByExam[exam] ? parseInt(scoresByExam[exam], 10) : 0,
        })),
      };
      localStorage.setItem("userData", JSON.stringify(userData));

      setToastMessage("Profile created successfully!");
      setShowToast(true);
      router.push("/dashboard");
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  // this function is called when the user changes the score for a CLEP exam
  function handleScoreChange(exam: string, value: string) {
    setScoresByExam((prev) => ({ ...prev, [exam]: value }));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-900">
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="w-full max-w-md rounded-xl border border-[#bebebe] bg-white p-6 shadow sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1c]">
            Create Your Profile
          </h1>
          <p className="mt-1 text-sm text-[#4a4a4a]">
            Tell us a bit about you and your CLEP exams.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            id="name"
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Jane Doe"
            required
            error={errors.name}
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="jane@example.com"
            required
            error={errors.email}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
            error={errors.password}
          />
          <InputField
            id="zip"
            label="ZIP Code"
            type="text"
            value={zip}
            onChange={setZip}
            placeholder="12345"
            required
            inputMode="numeric"
            pattern="\d{5}"
            error={errors.zip}
          />
          <MultiSelect
            id="exams"
            label="CLEP Exams Taken"
            options={CLEP_EXAMS}
            selectedValues={selectedExams}
            onChange={setSelectedExams}
            placeholder="Select CLEP exams"
            error={errors.exams}
          />
          <ExamScoreFields
            selectedExams={selectedExams}
            scoresByExam={scoresByExam}
            onChangeScore={handleScoreChange}
            errorsByExam={errors.examScores}
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[#6ebf10] px-4 py-2.5 font-semibold text-white shadow transition hover:bg-[#5aa50c] focus:outline-none focus:ring-2 focus:ring-[#6ebf10]/20"
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
