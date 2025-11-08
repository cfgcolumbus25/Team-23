"use client";

import { useState, useEffect } from "react";

interface Institution {
  id: string;
  name: string;
  city: string;
  state: string;
  last_updated: string | null;
}

interface EmailHistoryItem {
  id: string;
  sent_to: string;
  subject: string;
  sent_at: string;
  institutions: {
    name: string;
    state: string;
  };
}

export default function AdminEmailsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(
    new Set()
  );
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    fetchInstitutions();
    fetchEmailHistory();
  }, [stateFilter]);

  async function fetchInstitutions() {
    setLoading(true);
    const token = localStorage.getItem("institute_access_token");

    try {
      const queryParams = new URLSearchParams();
      if (stateFilter) queryParams.append("state", stateFilter);
      queryParams.append("limit", "100");

      const response = await fetch(
        `${apiUrl}/admin/institutions?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error("Error fetching institutions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmailHistory() {
    const token = localStorage.getItem("institute_access_token");

    try {
      const response = await fetch(`${apiUrl}/admin/email/history?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails || []);
      }
    } catch (err) {
      console.error("Error fetching email history:", err);
    }
  }

  function toggleInstitution(id: string) {
    const newSelected = new Set(selectedInstitutions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInstitutions(newSelected);
  }

  function toggleSelectAll() {
    if (selectedInstitutions.size === institutions.length) {
      setSelectedInstitutions(new Set());
    } else {
      setSelectedInstitutions(new Set(institutions.map((i) => i.id)));
    }
  }

  async function sendEmails() {
    if (selectedInstitutions.size === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one institution",
      });
      return;
    }

    setSending(true);
    setMessage(null);
    const token = localStorage.getItem("institute_access_token");

    try {
      const response = await fetch(`${apiUrl}/admin/email/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institution_ids: Array.from(selectedInstitutions),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let successMessage = `Successfully sent ${data.sent_count} emails.`;

        if (data.failed_count > 0) {
          const noContactErrors =
            data.details?.filter(
              (d: any) => d.error === "No contact email found"
            ).length || 0;

          if (noContactErrors > 0) {
            successMessage += ` ${noContactErrors} institution(s) have no contacts saved.`;
          }
          if (data.failed_count > noContactErrors) {
            successMessage += ` ${
              data.failed_count - noContactErrors
            } failed for other reasons.`;
          }
        }

        setMessage({
          type: data.failed_count > 0 ? "error" : "success",
          text: successMessage,
        });
        setSelectedInstitutions(new Set());
        fetchEmailHistory();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to send emails",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Send reminder emails to institutions to update their CLEP policies
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              Filter by State:
            </label>
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
              placeholder="e.g., NY, CA"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-24"
              maxLength={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendEmails}
              disabled={sending || selectedInstitutions.size === 0}
              className="bg-[#66b10e] hover:bg-[#5a9e0d] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending
                ? "Sending..."
                : `Send Emails (${selectedInstitutions.size})`}
            </button>
          </div>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Institutions ({institutions.length})
          </h2>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-[#66b10e] hover:text-[#5a9e0d] font-medium"
          >
            {selectedInstitutions.size === institutions.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading institutions...
            </div>
          ) : institutions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No institutions found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInstitutions.has(inst.id)}
                        onChange={() => toggleInstitution(inst.id)}
                        className="h-4 w-4 text-[#66b10e] border-gray-300 rounded focus:ring-[#66b10e]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inst.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inst.city}, {inst.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inst.last_updated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Email History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Emails Sent
          </h2>
        </div>
        <div className="overflow-x-auto">
          {emailHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No emails sent yet
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailHistory.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.institutions?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email.sent_to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(email.sent_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
