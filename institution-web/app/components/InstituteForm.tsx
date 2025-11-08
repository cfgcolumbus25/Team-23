"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  fetchInstitutionAcceptances,
  fetchExams,
  updateInstitution,
  createAcceptance,
  updateAcceptance,
  deleteAcceptance,
  type User,
  type Institution,
  type Acceptance,
  type Exam,
} from "@/app/services/institute_service";

export function InstituteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [deletedAcceptanceIds, setDeletedAcceptanceIds] = useState<string[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("institute_access_token");

      if (!token) {
        router.push("/institute/login");
        return;
      }

      // Get current user info
      const userData = await getCurrentUser(token);
      setUser(userData);

      // Fetch available exams
      const examsData = await fetchExams(token);
      setAvailableExams(examsData);

      // Fetch institution and acceptances
      const acceptanceData = await fetchInstitutionAcceptances(token);
      setInstitution(acceptanceData.institution);
      setAcceptances(acceptanceData.acceptances || []);
    } catch (err) {
      console.error("Error loading data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);

      if (errorMessage === "Not authenticated") {
        localStorage.removeItem("institute_access_token");
        localStorage.removeItem("institute_refresh_token");
        router.push("/institute/login");
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle institution field changes
  function handleInstitutionChange(field: keyof Institution, value: any) {
    if (!institution) return;
    setInstitution({
      ...institution,
      [field]: value,
    });
  }

  // Handle acceptance changes
  function handleAcceptanceChange(index: number, field: string, value: any) {
    const newAcceptances = [...acceptances];

    if (field === "exam") {
      // Handle exam change (both exam_id and exams object)
      newAcceptances[index] = {
        ...newAcceptances[index],
        exam_id: value.id,
        exams: {
          id: value.id,
          name: value.name,
        },
      };
    } else if (field === "exams") {
      // Handle nested exams object
      newAcceptances[index] = {
        ...newAcceptances[index],
        exams: value,
      };
    } else {
      // Handle regular fields
      newAcceptances[index] = {
        ...newAcceptances[index],
        [field]: value,
      };
    }

    setAcceptances(newAcceptances);
  }

  // Add new acceptance
  function addAcceptance() {
    if (!institution) return;

    const newAcceptance: Acceptance = {
      id: `temp-${Date.now()}`, // Temporary ID for new items
      institution_id: institution.id,
      exam_id: 0, // Will be set by user via dropdown
      exams: {
        id: 0,
        name: "", // Will be set by user via dropdown
      },
      cut_score: 50,
      credits: 3,
      related_course: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      updated_by_contact_id: user?.id || null,
    };

    setAcceptances([...acceptances, newAcceptance]);
  }

  // Remove acceptance
  function removeAcceptance(index: number) {
    const acceptanceToRemove = acceptances[index];

    // If it's not a temporary item (has a real ID), track it for deletion
    if (!acceptanceToRemove.id.startsWith("temp-")) {
      setDeletedAcceptanceIds([...deletedAcceptanceIds, acceptanceToRemove.id]);
    }

    setAcceptances(acceptances.filter((_, i) => i !== index));
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("institute_access_token");
    if (!token || !institution) {
      alert("Authentication error. Please login again.");
      router.push("/institute/login");
      return;
    }

    const results = {
      institutionUpdate: null as any,
      acceptanceUpdates: [] as any[],
      acceptanceCreates: [] as any[],
      acceptanceDeletes: [] as any[],
      errors: [] as string[],
    };

    try {
      // 1. Update institution settings - COMMENTED OUT FOR NOW
      console.log("Institution update temporarily disabled (API not ready)");
      /*
    try {
      const institutionUpdate = await updateInstitution(token, institution.id, {
        max_credits: institution.max_credits,
        score_validity: institution.score_validity,
        can_use_for_failed_courses: institution.can_use_for_failed_courses,
        can_enrolled_students_use_clep: institution.can_enrolled_students_use_clep,
      })
      results.institutionUpdate = institutionUpdate
      console.log('Institution updated:', institutionUpdate)
    } catch (err) {
      const errorMsg = `Failed to update institution: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }
    */

      // 2. Delete removed acceptances
      for (const deletedId of deletedAcceptanceIds) {
        console.log(`🗑️ Deleting acceptance ${deletedId}...`);
        try {
          await deleteAcceptance(token, deletedId);
          results.acceptanceDeletes.push(deletedId);
          console.log(`Deleted acceptance ${deletedId}`);
        } catch (err) {
          const errorMsg = `Failed to delete acceptance ${deletedId}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }

      // 3. Process acceptances (create new ones, update existing ones)
      for (const acceptance of acceptances) {
        // Validate that an exam is selected
        if (!acceptance.exam_id || acceptance.exam_id === 0) {
          const errorMsg =
            "Please select an exam for all CLEP tests before saving";
          console.error(errorMsg);
          results.errors.push(errorMsg);
          continue;
        }

        if (acceptance.id.startsWith("temp-")) {
          // Create new acceptance
          console.log("➕ Creating new acceptance...");
          try {
            const newAcceptance = await createAcceptance(token, {
              institution_id: institution.id,
              exam_id: acceptance.exam_id,
              cut_score: acceptance.cut_score,
              credits: acceptance.credits,
              related_course: acceptance.related_course,
              last_updated: new Date().toISOString(),
              updated_by_contact_id: user?.id || null,
            });
            results.acceptanceCreates.push(newAcceptance);
            console.log("Created new acceptance:", newAcceptance);
          } catch (err) {
            const errorMsg = `Failed to create acceptance: ${
              err instanceof Error ? err.message : "Unknown error"
            }`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        } else {
          // Update existing acceptance
          console.log(`Updating acceptance ${acceptance.id}...`);
          console.log("Sending data:", {
            exam_id: acceptance.exam_id,
            cut_score: acceptance.cut_score,
            credits: acceptance.credits,
            related_course: acceptance.related_course,
          });

          try {
            const updatedAcceptance = await updateAcceptance(
              token,
              acceptance.id,
              {
                exam_id: acceptance.exam_id,
                cut_score: acceptance.cut_score,
                credits: acceptance.credits,
                related_course: acceptance.related_course,
              }
            );
            results.acceptanceUpdates.push(updatedAcceptance);
            console.log(
              ` Updated acceptance ${acceptance.id}:`,
              updatedAcceptance
            );
          } catch (err) {
            const errorMsg = `Failed to update acceptance ${acceptance.id}: ${
              err instanceof Error ? err.message : "Unknown error"
            }`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        }
      }

      // 4. Log final results
      console.log("=====================================");
      console.log("SAVE OPERATION SUMMARY:");
      console.log("=====================================");
      console.log("Institution Updated:", "Temporarily disabled");
      console.log("Acceptances Created:", results.acceptanceCreates.length);
      console.log("Acceptances Updated:", results.acceptanceUpdates.length);
      console.log("Acceptances Deleted:", results.acceptanceDeletes.length);
      console.log("Errors:", results.errors.length);

      if (results.errors.length > 0) {
        console.log("Errors encountered:", results.errors);
      }

      console.log("Full Results:", results);
      console.log("=====================================");

      // 5. Show user feedback
      if (results.errors.length === 0) {
        alert(
          " Acceptance settings saved successfully!\n\nNote: Institution settings update is temporarily disabled."
        );

        // Clear the deleted IDs since they're now deleted
        setDeletedAcceptanceIds([]);

        // Reload data to get fresh state from server
        await loadData();
      } else {
        alert(
          `Some operations failed:\n\n${results.errors.join(
            "\n"
          )}\n\nCheck console for details.`
        );
      }
    } catch (err) {
      console.error("Unexpected error during save:", err);
      alert("Failed to save settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!institution || !user) {
    return (
      <div className="p-8 text-center text-gray-900">
        No institution data found
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-md w-full"
    >
      {/* Institution Info Section */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {institution.name} - Policies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Max Credits (per two semesters)
            </label>
            <input
              type="number"
              value={institution.max_credits}
              onChange={(e) =>
                handleInstitutionChange(
                  "max_credits",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
              min="0"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Score Validity
            </label>
            <input
              type="text"
              value={institution.score_validity}
              onChange={(e) =>
                handleInstitutionChange("score_validity", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
              placeholder="e.g., 2 years"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={institution.can_use_for_failed_courses}
              onChange={(e) =>
                handleInstitutionChange(
                  "can_use_for_failed_courses",
                  e.target.checked
                )
              }
            />
            Allow failed courses to transfer
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={institution.can_enrolled_students_use_clep}
              onChange={(e) =>
                handleInstitutionChange(
                  "can_enrolled_students_use_clep",
                  e.target.checked
                )
              }
            />
            Enrolled students can use CLEP
          </label>
        </div>
      </div>

      {/* CLEP Acceptance Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            CLEP Test Acceptance
          </h2>
          <button
            type="button"
            onClick={addAcceptance}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Add CLEP Test
          </button>
        </div>

        {acceptances.length === 0 ? (
          <p className="text-gray-700 text-center py-4">
            No CLEP tests configured. Click "Add CLEP Test" to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {acceptances.map((acceptance, index) => (
              <AcceptanceItem
                key={acceptance.id}
                acceptance={acceptance}
                index={index}
                availableExams={availableExams}
                onChange={handleAcceptanceChange}
                onRemove={() => removeAcceptance(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className="border-t pt-4 text-sm text-gray-700">
        <p>
          Last updated: {new Date(institution.last_updated).toLocaleString()}
        </p>
        <p>Logged in as: {user.email}</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
          onClick={() => loadData()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#66b10e] hover:bg-[#5a9e0d] disabled:bg-gray-400 text-gray-950 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

// Acceptance Item Component with Exam Dropdown
function AcceptanceItem({
  acceptance,
  index,
  availableExams,
  onChange,
  onRemove,
}: {
  acceptance: Acceptance;
  index: number;
  availableExams: Exam[];
  onChange: (index: number, field: string, value: any) => void;
  onRemove: () => void;
}) {
  function handleExamChange(examIdStr: string) {
    if (!examIdStr) return; // Ignore empty selection

    const examId = parseInt(examIdStr);
    const selectedExam = availableExams.find((exam) => exam.id === examId);
    if (selectedExam) {
      // Update both exam_id and exams in a single call
      onChange(index, "exam", selectedExam);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-sm text-gray-900">
          CLEP Test #{index + 1}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Exam Name
          </label>
          <select
            value={acceptance.exam_id || ""}
            onChange={(e) => handleExamChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 bg-white"
            required
          >
            <option value="">Select an exam...</option>
            {availableExams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Cut Score (20-80)
          </label>
          <input
            type="number"
            value={acceptance.cut_score}
            onChange={(e) =>
              onChange(index, "cut_score", parseInt(e.target.value) || 0)
            }
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900"
            min="20"
            max="80"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Credits Awarded
          </label>
          <input
            type="number"
            value={acceptance.credits}
            onChange={(e) =>
              onChange(index, "credits", parseInt(e.target.value) || 0)
            }
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900"
            min="0"
            max="12"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Course Equivalent(s)
          </label>
          <input
            type="text"
            value={acceptance.related_course}
            onChange={(e) => onChange(index, "related_course", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900"
            placeholder="BIO 101, BIO 102"
            required
          />
        </div>
      </div>
    </div>
  );
}
