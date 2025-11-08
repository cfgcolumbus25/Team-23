const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface Exam {
  id: number;
  name: string;
}

export interface Acceptance {
  id: string;
  exam_id: number;
  exams?: Exam;
  cut_score: number;
  credits: number;
  related_course: string;
  institution_id: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
  updated_by_contact_id: string | null;
}

export interface Institution {
  id: string;
  name: string;
  org_id: string;
  max_credits: number;
  can_use_for_failed_courses: boolean;
  can_enrolled_students_use_clep: boolean;
  score_validity: string;
  city: string;
  state: string;
  zip: string;
  enrollment: number;
  clep_web_url: string;
  transcription_fee: number;
  verified_by: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
}

export interface User {
  id: string;
  email: string;
  institution: Institution;
  role: string;
}

// Get all available CLEP exams
export async function fetchExams(token: string): Promise<Exam[]> {
  const response = await fetch(`${API_URL}/exams`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authenticated");
    throw new Error("Failed to fetch exams");
  }

  const data = await response.json();
  return data.exams;
}

// Get current user info
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authenticated");
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();
  return data.user;
}

// Fetch institution acceptances
export async function fetchInstitutionAcceptances(token: string) {
  const response = await fetch(`${API_URL}/institution/acceptances`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authenticated");
    if (response.status === 403) throw new Error("Not linked to institution");
    throw new Error("Failed to fetch acceptances");
  }

  return response.json();
}

// Update institution settings
export async function updateInstitution(
  token: string,
  institutionId: string,
  updates: Partial<Institution>
): Promise<Institution> {
  const response = await fetch(`${API_URL}/institution/${institutionId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update institution");
  }

  return response.json();
}

// Create a new acceptance
export async function createAcceptance(
  token: string,
  acceptance: Omit<Acceptance, "id" | "created_at" | "updated_at">
): Promise<Acceptance> {
  const response = await fetch(`${API_URL}/institution/acceptances`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exam_id: acceptance.exam_id,
      cut_score: acceptance.cut_score,
      credits: acceptance.credits,
      related_course: acceptance.related_course,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create acceptance");
  }

  return response.json();
}

// Update an existing acceptance
export async function updateAcceptance(
  token: string,
  acceptanceId: string,
  updates: Partial<Acceptance>
): Promise<Acceptance> {
  const response = await fetch(
    `${API_URL}/institution/acceptances/${acceptanceId}`,
    {
      method: "PUT", // Changed from PATCH to PUT
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exam_id: updates.exam_id,
        cut_score: updates.cut_score,
        credits: updates.credits,
        related_course: updates.related_course,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update acceptance");
  }

  return response.json();
}

// Delete an acceptance
export async function deleteAcceptance(
  token: string,
  acceptanceId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/institution/acceptances/${acceptanceId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete acceptance");
  }
}
