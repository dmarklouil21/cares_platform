import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";

// ----- inline sample data (fallback; list passes selected via location.state) -----
const SAMPLE_PATIENTS = [
  {
    patient_id: "P-0001",
    first_name: "Maria",
    last_name: "Dela Cruz",
    middle_initial: "S.",
    date_of_birth: "1990-05-12",
    status: "pending",
    interpretation_of_result: "HPV Positive",
    // release_date_of_meds: "2025-04-20", // optional seed
  },
  {
    patient_id: "P-0002",
    first_name: "Jose",
    last_name: "Garcia",
    middle_initial: "R.",
    date_of_birth: "1987-11-03",
    status: "pending",
    interpretation_of_result: "ASC-US",
  },
  {
    patient_id: "P-0003",
    first_name: "Kimberly",
    last_name: "Ytac",
    middle_initial: "F.",
    date_of_birth: "1999-02-22",
    status: "verified",
    interpretation_of_result: "Negative",
  },
  {
    patient_id: "P-0004",
    first_name: "Stayve",
    last_name: "Alreach",
    middle_initial: "",
    date_of_birth: "2001-07-15",
    status: "rejected",
    interpretation_of_result: "Unsatisfactory",
  },
];

// ----- header info (as in your card screenshot) -----
const REQUEST_INFO = {
  lgu_name: "City of Cebu",
  date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  contact_number: "032-123-4567",
  prepared_by: "Nurse Jane Doe",
  approved_by: "Dr. Juan Dela Cruz",
};

const PreCancerousView = () => {
  const { patient_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // prefer data passed from list (reflects current status), else fallback
  const patient = useMemo(() => {
    return (
      location.state?.patient ||
      SAMPLE_PATIENTS.find((p) => p.patient_id === patient_id)
    );
  }, [location.state, patient_id]);

  // --- local state for release date, status, modal, and toast ---
  const [releaseDate, setReleaseDate] = useState("");
  const [status, setStatus] = useState(patient?.status || "pending");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'save' | 'done' | null
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Seed release date & status from patient if available
  useEffect(() => {
    if (patient?.release_date_of_meds) {
      setReleaseDate(patient.release_date_of_meds);
    }
    if (patient?.status) {
      setStatus(patient.status);
    }
  }, [patient]);

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
  const handleConfirmAction = () => {
    const action = confirmAction;
    setConfirmOpen(false);
    setConfirmAction(null);

    if (action === "save") {
      // Print to console as requested
      console.log("[PreCancerousView] Save changes:", {
        patient_id: patient?.patient_id,
        release_date: releaseDate,
      });

      // Show notification
      setToast({ type: "success", message: "Changes saved." });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/Admin/treatment/precancerous");
      }, 900);
    }

    if (action === "done") {
      const prevStatus = status;
      const newStatus = "done";
      setStatus(newStatus);

      // Print to console
      console.log("[PreCancerousView] Mark as done:", {
        patient_id: patient?.patient_id,
        previous_status: prevStatus,
        new_status: newStatus,
      });

      // Show notification
      setToast({ type: "success", message: "Marked as done." });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/Admin/treatment/precancerous");
      }, 900);
    }
  };

  if (!patient) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Patient not found.</p>
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
                status === "done"
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
              <span className="text-gray-700">{REQUEST_INFO.lgu_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Date</span>
              <span className="text-gray-700">{REQUEST_INFO.date}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Contact Number</span>
              <span className="text-gray-700">
                {REQUEST_INFO.contact_number}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Prepared by</span>
              <span className="text-gray-700">{REQUEST_INFO.prepared_by}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Approved by</span>
              <span className="text-gray-700">{REQUEST_INFO.approved_by}</span>
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
            disabled={status === "done"}
            className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
              status === "done"
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
