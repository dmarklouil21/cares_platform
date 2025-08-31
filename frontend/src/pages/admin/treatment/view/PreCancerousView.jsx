// src/pages/treatment/AdminprecancerousView.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  adminGetPreCancerousMedsDetail,
  adminSetReleaseDate,
  adminVerifyPreCancerousMeds,
} from "../../../../api/precancerous";

const PreCancerousView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- local state for release date, status, modal, and toast ---
  const [releaseDate, setReleaseDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'save' | 'done' | null
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // fetch detail
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await adminGetPreCancerousMedsDetail(id);
        if (!mounted) return;
        setPatient(data);
        setReleaseDate(data.release_date_of_meds || "");
        setStatus(data.status || "Pending");
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load request details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Auto-hide toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Open confirmation modal for Save
  const handleSaveClick = () => {
    setConfirmAction("save");
    setConfirmOpen(true);
  };

  // Open confirmation modal for Mark as done
  const handleMarkDoneClick = () => {
    setConfirmAction("done");
    setConfirmOpen(true);
  };

  // Confirm handler for either action
  const handleConfirmAction = async () => {
    const action = confirmAction;
    setConfirmOpen(false);
    setConfirmAction(null);

    try {
      if (action === "save") {
        await adminSetReleaseDate(id, releaseDate);
        setToast({ type: "success", message: "Release date saved." });
      }

      if (action === "done") {
        const payload = releaseDate ? { release_date_of_meds: releaseDate } : {};
        await adminVerifyPreCancerousMeds(id, payload);
        setStatus("Verified");
        setToast({ type: "success", message: "Request verified." });
      }

      // refresh details
      const fresh = await adminGetPreCancerousMedsDetail(id);
      setPatient(fresh);
      setReleaseDate(fresh.release_date_of_meds || "");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/Admin/treatment/precancerous");
      }, 900);
    } catch (e) {
      setToast({ type: "error", message: "Action failed. Please try again." });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">{error || "Record not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
      {/* Toast (uses your markup) */}
      {toast && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Request Pre-Cancerous Meds</h1>
      </div>

      <div className="h-full w-full overflow-auto p-5 flex flex-col gap-4">
        {/* Header Card: LGU + meta */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Request Pre-Cancerous Meds
            </h2>
            <span
              className={`text-xs px-2 py-1 rounded ${
                status === "Verified"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
              title="Current status"
            >
              {status}
            </span>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex gap-2">
              <span className="font-medium w-40">LGU Name</span>
              <span className="text-gray-700">{patient.lgu_name || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Date</span>
              <span className="text-gray-700">{patient.date}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Contact Number</span>
              <span className="text-gray-700">{patient.contact_number || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Prepared by</span>
              <span className="text-gray-700">{patient.prepared_by || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Approved by</span>
              <span className="text-gray-700">{patient.approved_by || "—"}</span>
            </div>
          </div>
        </div>

        {/* Patient Row Table */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray/30">
                <th className="text-left text-sm font-semibold px-4 py-3">
                  No.
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Patient No.
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Last Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  First Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Middle Initial
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Date of Birth
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Interpretation of Result
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 text-sm">1</td>
                <td className="px-4 py-3 text-sm">{patient.patient_id}</td>
                <td className="px-4 py-3 text-sm">{patient.last_name}</td>
                <td className="px-4 py-3 text-sm">{patient.first_name}</td>
                <td className="px-4 py-3 text-sm">
                  {patient.middle_initial || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm">
                  {patient.interpretation_of_result}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Release Date input */}
        <div className="bg-white rounded-md shadow border border-black/10 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="flex items-center gap-4">
              <span className="font-medium w-40">Release Date</span>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full md:w-auto"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-between md:justify-around">
          <Link
            className="text-center bg-white text-black py-2 md:w-[30%] w-full border border-black hover:border-black/15 rounded-md"
            to="/Admin/treatment/precancerous"
          >
            BACK
          </Link>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!releaseDate}
            className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
              !releaseDate
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            Save changes
          </button>

          <button
            type="button"
            onClick={handleMarkDoneClick}
            disabled={status === "Verified" || !releaseDate}
            title={
              status === "Verified"
                ? "Already verified"
                : !releaseDate
                ? "Please set a release date first"
                : ""
            }
            className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
              status === "Verified" || !releaseDate
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            Mark as done
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setConfirmOpen(false);
              setConfirmAction(null);
            }}
          />
          <div className="relative bg-white w-[92%] max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              {confirmAction === "done" ? "Mark as done?" : "Confirm save"}
            </h3>

            {confirmAction === "done" ? (
              <p className="text-sm text-gray-700 mb-4">
                Mark the request for{" "}
                <strong>
                  {patient.first_name} {patient.last_name}
                </strong>{" "}
                (ID: {patient.patient_id}) as <strong>Done</strong>? This will
                update the current status.
              </p>
            ) : (
              <p className="text-sm text-gray-700 mb-4">
                Save changes for{" "}
                <strong>
                  {patient.first_name} {patient.last_name}
                </strong>{" "}
                (ID: {patient.patient_id})
                {releaseDate ? ` with release date ${releaseDate}` : ""}?
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded text-white hover:opacity-90 ${
                  confirmAction === "done" ? "bg-green-600" : "bg-primary"
                }`}
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreCancerousView;
