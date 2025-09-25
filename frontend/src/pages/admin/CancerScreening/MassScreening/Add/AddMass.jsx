// pages/admin/Services/CancerScreening/MassScreeningAdd.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

export default function MassScreeningAdd() {
  const navigate = useNavigate();

  // ----- Request Info (from MassScreeningView) -----
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [supportNeed, setSupportNeed] = useState("");
  const [status, setStatus] = useState("Pending"); // Pending | Verified | Rejected | Done

  // ----- Attachments -----
  const [attachments, setAttachments] = useState([]); // File[]
  const onPickAttachments = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ----- Attendance (from MassAttendanceView) -----
  const [attendees, setAttendees] = useState([{ name: "", result: "" }]); // start with one empty row
  const addAttendee = () =>
    setAttendees((prev) => [...prev, { name: "", result: "" }]);
  const removeAttendee = (idx) =>
    setAttendees((prev) => prev.filter((_, i) => i !== idx));
  const updateAttendee = (idx, field, value) =>
    setAttendees((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );

  // ----- UX -----
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Use NotificationModal ONLY for validation/info (not for success).
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState({
    type: "success",
    title: "Created",
    message: "Mass screening was created successfully.",
  });

  const [loading, setLoading] = useState(false); // visual only

  // Simple validation (UI)
  const validate = () => {
    if (!title.trim()) {
      setNote({
        type: "info",
        title: "Missing Title",
        message: "Please enter a title for this mass screening.",
      });
      setShowNote(true);
      return false;
    }
    if (!date) {
      setNote({
        type: "info",
        title: "Missing Date",
        message: "Please select a date.",
      });
      setShowNote(true);
      return false;
    }
    return true;
  };

  // UI-only submit: navigate with state (destination shows the top toast)
  const handleCreate = () => {
    if (!validate()) return;
    setConfirmOpen(false);

    // Do NOT open NotificationModal here (avoids centered popup before navigation)
    // Just pass success state to the destination route:
    navigate("/admin/cancer-screening/mass-screening", {
      state: { type: "success", message: "Created Successfully." },
    });
  };

  // Pretty file size for preview list
  const formatBytes = (b) => {
    if (typeof b !== "number") return null;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusBadgeClass = useMemo(() => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Done":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }, [status]);

  return (
    <>
      {/* Global Modals */}
      <ConfirmationModal
        open={confirmOpen}
        title="Create Mass Screening?"
        desc="Please review all details before submitting."
        onConfirm={handleCreate}
        onCancel={() => setConfirmOpen(false)}
      />
      {/* Keep this only for validation/info, not for success after create */}
      <NotificationModal
        show={showNote}
        type={note.type}
        title={note.title}
        message={note.message}
        onClose={() => setShowNote(false)}
      />
      <LoadingModal open={loading} text="Creating..." />

      {/* Page */}
      <div className="h-screen w-full bg-gray p-5 gap-3 justify-start  flex flex-col overflow-auto">
        <div className="flex  items-center px-5 justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Add Mass Screening</h2>
            <p className="text-yellow mt-1">
              Fill out details for a mass cancer screening event.
            </p>
          </div>
          <Link to={"/admin/cancer-screening/mass-screening"}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>

        {/* Request Info */}
        <section className="bg-white rounded-2xl border border-gray-200 px-5 md:px-7 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Request Info</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusBadgeClass}`}
            >
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-5">
            <div className="flex flex-col">
              <label className=" text-sm font-semibold">Title</label>
              <input
                type="text"
                className="mt-1 border border-gray-300 rounded px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Barangay Health Center Screening"
              />
            </div>

            <div className="flex flex-col">
              <label className=" text-sm font-semibold">Venue</label>
              <input
                type="text"
                className="mt-1 border border-gray-300 rounded px-3 py-2"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g., Barangay Hall"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className=" text-sm font-semibold">Description</label>
              <textarea
                rows={3}
                className="mt-1 border border-gray-300 rounded px-3 py-2 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the event"
              />
            </div>

            <div className="flex flex-col">
              <label className=" text-sm font-semibold">
                Target Beneficiaries
              </label>
              <input
                type="number"
                min="0"
                className="mt-1 border border-gray-300 rounded px-3 py-2"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
                placeholder="e.g., 150"
              />
            </div>

            <div className="flex flex-col">
              <label className=" text-sm font-semibold">Date</label>
              <input
                type="date"
                className="mt-1 border border-gray-300 rounded px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className=" text-sm font-semibold">
                RAFI support need
              </label>
              <input
                type="text"
                className="mt-1 border border-gray-300 rounded px-3 py-2"
                value={supportNeed}
                onChange={(e) => setSupportNeed(e.target.value)}
                placeholder="e.g., logistics, supplies, staff"
              />
            </div>

            <div className="flex flex-col">
              <label className=" text-sm font-semibold">Status</label>
              <select
                className="mt-1 border border-gray-300 rounded px-3 py-2 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </section>

        {/* Attachments */}
        <section className="bg-white rounded-2xl border border-gray-200 px-5 md:px-7 py-6">
          <h3 className="font-semibold mb-3">Attachments</h3>

          <div className="flex flex-col gap-4">
            <div>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="border border-gray-300 rounded px-3 py-2 bg-white"
                onChange={onPickAttachments}
              />
              <p className="text-xs text-gray-600 mt-1">
                You can attach PDFs or images. ({attachments.length} selected)
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {attachments.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between px-3 py-2 border border-primary rounded-md bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                        alt=""
                        className="h-5 w-7"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-gray-500">
                          {typeof f.size === "number"
                            ? formatBytes(f.size)
                            : ""}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => removeAttachment(i)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Attendance (optional at add time) */}
        <section className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 md:px-7 py-4 border-b border-black/15">
            <h3 className="font-semibold">Attendance List (Optional)</h3>
          </div>

          <div className="">
            {/* header */}
            <div className="grid grid-cols-12 font-semibold text-sm border-b border-black/15 px-5 md:px-7 py-3 bg-gray-50">
              <div className="col-span-7 md:col-span-5">Name</div>
              <div className="col-span-5 md:col-span-6">Result / Notes</div>
              <div className="hidden md:block md:col-span-1 text-right pr-2"></div>
            </div>

            {/* rows */}
            {attendees.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center px-5 md:px-7 py-3 gap-2"
              >
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={row.name}
                    onChange={(e) => updateAttendee(i, "name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={row.result}
                    onChange={(e) =>
                      updateAttendee(i, "result", e.target.value)
                    }
                    placeholder="Result or notes"
                  />
                </div>
                <div className="col-span-12 md:col-span-1 flex md:justify-end">
                  {attendees.length > 1 && (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline mt-2 md:mt-0"
                      onClick={() => removeAttendee(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* footer */}
            <div className="px-5 md:px-7 py-3 bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
              <span>
                Total: {attendees.filter((a) => a.name.trim()).length}
              </span>
              <button
                type="button"
                className="text-sm text-blue-700 hover:underline"
                onClick={addAttendee}
              >
                + Add attendee
              </button>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-end">
          <Link
            to="/admin/cancer-screening/mass-screening"
            className="px-4 py-2 rounded-md md:w-[30%] text-center bg-white border border-black/15 hover:border-black"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="px-4 py-2 rounded-md md:w-[30%] text-center bg-primary text-white font-semibold"
            onClick={() => setConfirmOpen(true)}
          >
            Create Mass Screening
          </button>
        </div>
      </div>
    </>
  );
}
