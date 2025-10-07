// @ts-nocheck
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

const SAMPLE_PATIENTS = [
  "Juan Dela Cruz",
  "Maria Santos",
  "Pedro Reyes",
  "Ana Dizon",
  "Liza Velasquez",
  "Mark Bautista",
  "Kimberly Ytac",
  "James Lee",
  "Carlos Ortega",
  "Sophia Cruz",
];

const add = () => {
  // Local-only UI state
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    photo: null,
    attachment: null,
    patients: [],
  });

  // Modals & notifications (same pattern/design as list page)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "success",
    title: "Success",
    message: "Done.",
  });

  // Patients input state
  const [patientQuery, setPatientQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const patientSuggestions = useMemo(() => {
    if (!inputFocused) return [];
    const pool = SAMPLE_PATIENTS.filter(
      (name) =>
        !form.patients.some((p) => p.toLowerCase() === name.toLowerCase())
    );
    const q = patientQuery.trim().toLowerCase();
    if (!q) return pool.slice(0, 6);
    return pool.filter((n) => n.toLowerCase().includes(q)).slice(0, 6);
  }, [inputFocused, patientQuery, form.patients]);

  const addPatient = (name) => {
    const n = name.trim();
    if (!n) return;
    if (!form.patients.some((p) => p.toLowerCase() === n.toLowerCase())) {
      setForm((f) => ({ ...f, patients: [...f.patients, n] }));
    }
    setPatientQuery("");
    setInputFocused(false);
  };

  const removePatient = (name) => {
    setForm((f) => ({ ...f, patients: f.patients.filter((p) => p !== name) }));
  };

  const onPatientsKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (patientQuery.trim()) addPatient(patientQuery);
    }
    if (e.key === "Backspace" && !patientQuery && form.patients.length) {
      removePatient(form.patients[form.patients.length - 1]);
    }
  };

  const canSubmit = form.title.trim() && form.date && form.patients.length > 0;

  const filePreviewUrl = (f) => {
    if (!f) return "";
    return f instanceof File ? URL.createObjectURL(f) : f;
  };

  // Handlers for Add Activity flow (UI-only)
  const handleAddClick = () => {
    if (!canSubmit) return;
    setConfirmText(
      `Add this activity?\n\nTitle: ${form.title}\nDate: ${form.date}\nPatients: ${form.patients.length}`
    );
    setConfirmOpen(true);
  };

  const doSave = async () => {
    setConfirmOpen(false);
    setLoading(true);

    // Simulate a save (UI only)
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setLoading(false);
      setNotifyInfo({
        type: "success",
        title: "Added",
        message: "Activity added.",
      });
      setNotifyOpen(true);
      // Reset form
      setForm({
        title: "",
        description: "",
        date: "",
        photo: null,
        attachment: null,
        patients: [],
      });
      setPatientQuery("");
    } catch (e) {
      setLoading(false);
      setNotifyInfo({
        type: "error",
        title: "Failed",
        message: "Failed to add activity.",
      });
      setNotifyOpen(true);
    }
  };

  return (
    <div className="w-full max-w-5xl py-6 px-5 h-screen bg-gray">
      {/* Shared modals to match list page design */}
      <LoadingModal open={loading} text="Processing..." />
      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => setNotifyOpen(false)}
      />
      <ConfirmationModal
        open={confirmOpen}
        title="Add Activity"
        desc={confirmText || "Are you sure?"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doSave}
      />

      <div className="flex justify-between px-5">
        <h1 className="text-2xl font-bold mb-4">
          Add Psychosocial Support Activity
        </h1>
        <Link to="/admin/PychosocialSupport">
          <img
            src="/images/back.png"
            alt="Back"
            className="h-6 cursor-pointer"
          />
        </Link>
      </div>

      <div className="bg-white rounded-2xl flex flex-col justify-between shadow-md p-6 h-[90%]">
        {/* ===== Same inputs as before ===== */}
        <div className="flex w-full justify-between overflow-auto h-full">
          <div className="mb-6  w-[50%] pr-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border w-full p-1 rounded"
                placeholder="e.g., Group Sharing Session"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border w-full p-1 rounded"
                placeholder="What is this session about?"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border w-full p-1 rounded"
              />
            </div>

            {/* Photo (preview only) */}
            <div>
              <label className="block text-sm font-semibold mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, photo: e.target.files?.[0] || null })
                }
                className="border w-full p-1 rounded"
              />
              {form.photo && (
                <div className="mt-2">
                  <img
                    src={filePreviewUrl(form.photo)}
                    alt="Preview"
                    className="w-full h-28 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {form.photo instanceof File
                      ? `Selected image: ${form.photo.name}`
                      : "Existing image"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="w-[50%] pl-4  h-full overflow-auto">
            {/* Attachment (UI only) */}
            <div className="h-[19.5%] ">
              <label className="block text-sm font-semibold mb-1">
                Attachment
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setForm({
                    ...form,
                    attachment: e.target.files?.[0] || null,
                  })
                }
                className="border w-full p-1 rounded"
              />
              {form.attachment && (
                <p className="text-xs text-gray-600 mt-1 break-all whitespace-normal leading-snug">
                  {form.attachment instanceof File
                    ? `Selected file: ${form.attachment.name}`
                    : `Existing file: ${form.attachment}`}
                </p>
              )}
            </div>

            {/* Input with suggestions */}
            <div className="relative  h-[15.5%] border-red-500">
              <label className="block text-sm font-semibold mb-1 ">
                Patients who attended
              </label>
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={onPatientsKeyDown}
                onFocus={() => setInputFocused(true)}
                onClick={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 120)}
                className="w-full p-1 border rounded"
                placeholder="Type a name, press Enter, or pick from options…"
              />

              {/* Suggestions dropdown */}
              {patientSuggestions.length > 0 && (
                <div className="absolute  left-0 right-0 mt-1 border rounded bg-white shadow max-h-40 overflow-auto z-10">
                  {patientSuggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addPatient(name)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added patients — vertical list with an × on the right */}
            <div className="mt-3  h-[60%] overflow-auto">
              {form.patients.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No patients added yet.
                </p>
              ) : (
                <ul className="bg-gray rounded h-full p-2 flex flex-col gap-1">
                  {form.patients.map((p) => (
                    <li
                      key={p}
                      className="flex items-center bg-white rounded-md justify-between px-3 py-2"
                    >
                      <span className="text-sm">{p}</span>
                      <button
                        type="button"
                        onClick={() => removePatient(p)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label={`Remove ${p}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              // UI-only cancel (no routing logic added)
              setForm({
                title: "",
                description: "",
                date: "",
                photo: null,
                attachment: null,
                patients: [],
              });
              setPatientQuery("");
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className={`px-4 py-2 text-white rounded ${
              canSubmit ? "bg-primary" : "bg-primary cursor-not-allowed"
            }`}
            onClick={handleAddClick}
          >
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default add;
