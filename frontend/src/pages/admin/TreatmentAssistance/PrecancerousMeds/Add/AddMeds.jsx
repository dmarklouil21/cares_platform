// src/pages/treatment/AdminprecancerousAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LIST_PATH = "/admin/treatment-assistance/pre-cancerous";

const PreCancerousAdd = () => {
  const navigate = useNavigate();

  // ------- Request info -------
  const [lguName, setLguName] = useState("");
  const [date, setDate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  // ------- Patient row (single entry; removed Patient No.) -------
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [interpretationOfResult, setInterpretationOfResult] = useState("");

  // ------- Optional: release date; status defaults to Pending -------
  const [releaseDate, setReleaseDate] = useState("");
  const status = "Pending";

  // ------- UI state: confirm + loading -------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Default the request date to today
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Simple validations (no Patient No. required anymore)
  const isValid = useMemo(() => {
    return (
      lguName.trim() &&
      date &&
      lastName.trim() &&
      firstName.trim() &&
      dateOfBirth &&
      interpretationOfResult.trim()
    );
  }, [lguName, date, lastName, firstName, dateOfBirth, interpretationOfResult]);

  // UI-only "submit" (no real API)
  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    // mock payload just for dev console (removed patient_id)
    const payload = {
      lgu_name: lguName || null,
      date,
      contact_number: contactNumber || null,
      prepared_by: preparedBy || null,
      approved_by: approvedBy || null,
      last_name: lastName,
      first_name: firstName,
      middle_initial: middleInitial || null,
      date_of_birth: dateOfBirth,
      interpretation_of_result: interpretationOfResult,
      release_date_of_meds: releaseDate || null,
      status: "Pending",
    };
    console.log("[PreCancerousAdd] mock create payload:", payload);

    // simulate a short delay, then navigate to list WITH a flash message
    setTimeout(() => {
      setSubmitting(false);
      navigate(LIST_PATH, {
        state: {
          flash: "Record created successfully.",
        },
        // we won't replace here; we'll clear the state on the list page
      });
    }, 700);
  };

  return (
    <div className="h-screen w-full flex p-5 gap-3 flex-col justify-between items-center bg-gray overflow-auto">
      {/* Header Card */}
      <div className="bg-white w-full rounded-md shadow border border-black/10">
        <div className="border-b border-black/10 px-5 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Add Pre-Cancerous Meds Request
          </h2>
        </div>

        {/* Request info grid */}
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <label className="flex items-center gap-4">
            <span className="font-sm w-40">
              LGU Name<span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              value={lguName}
              onChange={(e) => setLguName(e.target.value)}
              placeholder="e.g., City of Cebu"
            />
          </label>

          <label className="flex items-center">
            <span className="font-sm w-31 ">
              Date<span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-1 w-full md:w-auto"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-4">
            <span className="font-sm w-40">Contact Number</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g., 09XXXXXXXXX"
              inputMode="numeric"
            />
          </label>

          <label className="flex items-center gap-4">
            <span className="font-sm w-40">Prepared by</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Name of preparer"
            />
          </label>

          <label className="flex items-center gap-4">
            <span className="font-sm w-40">Approved by</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder="Name of approver"
            />
          </label>
        </div>
      </div>

      {/* Patient Row (removed No. & Patient No.) */}
      <div className="bg-white w-full rounded-md shadow border border-black/10">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray/30">
              <th className="text-left text-sm font-semibold px-4 py-3">
                Last Name<span className="text-red-500">*</span>
              </th>
              <th className="text-left text-sm font-semibold px-4 py-3">
                First Name<span className="text-red-500">*</span>
              </th>
              <th className="text-left text-sm font-semibold px-4 py-3">
                Middle Initial
              </th>
              <th className="text-left text-sm font-semibold px-4 py-3">
                Date of Birth<span className="text-red-500">*</span>
              </th>
              <th className="text-left text-sm font-semibold px-4 py-3">
                Interpretation of Result<span className="text-red-500">*</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g., Dela Cruz"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Maria"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1 w-full uppercase"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  maxLength={2}
                  placeholder="e.g., L."
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="date"
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  value={interpretationOfResult}
                  onChange={(e) => setInterpretationOfResult(e.target.value)}
                  placeholder="e.g., Negative / Positive"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Optional Release Date */}
      <div className="bg-white w-full rounded-md shadow border border-black/10 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="flex items-center gap-4">
            <span className="font-sm w-40">Release Date</span>
            <input
              type="date"
              className="border  border-gray-300 rounded px-3 py-1 w-full md:w-auto"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="w-full flex flex-col md:flex-row gap-3 justify-between md:justify-around">
        <Link
          className="text-center bg-white text-black py-2 md:w-[30%] w-full border border-black/15 hover:border-black rounded-md"
          to={LIST_PATH}
        >
          BACK
        </Link>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!isValid || submitting}
          className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
            !isValid || submitting
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-primary text-white hover:opacity-90"
          }`}
          title={!isValid ? "Fill all required fields" : ""}
        >
          {submitting ? "Creating..." : "Create record"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative bg-white w-[92%] max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Create this record?</h3>
            <p className="text-sm text-gray-700 mb-4">
              This will create a new Pre-Cancerous meds request for{" "}
              <strong>
                {firstName || "First"} {lastName || "Last"}
              </strong>{" "}
              with status <strong>Pending</strong>
              {releaseDate ? ` and release date ${releaseDate}` : ""}.<br />
              <span className="text-gray-500">
                (UI only — no data will be saved)
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-white hover:opacity-90 bg-primary"
                onClick={() => {
                  setConfirmOpen(false);
                  handleSubmit();
                }}
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

export default PreCancerousAdd;
