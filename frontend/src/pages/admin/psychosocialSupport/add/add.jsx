// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import { adminCreatePsychosocialActivity } from "src/api/psychosocialSupport";

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
  const [suggestions, setSuggestions] = useState([]);
  const [patientList, setPatientList] = useState([]);

  // Today's date (local) as YYYY-MM-DD for input[min]
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Load overall patient list (admin)
  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const res = await api.get("/patient/list/");
        const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        const names = (arr || []).map((d) => d.full_name || `${d.first_name || ""} ${d.last_name || ""}`.trim()).filter(Boolean);
        if (alive) setPatientList(names);
      } catch (e) {
        if (alive) setPatientList([]);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  // Compute suggestions locally from patientList
  useEffect(() => {
    if (!inputFocused) return setSuggestions([]);
    const q = (patientQuery || "").trim().toLowerCase();
    const exclude = new Set(form.patients.map((p) => String(p).toLowerCase()));
    const base = patientList.filter((n) => !exclude.has(String(n).toLowerCase()));
    if (!q) return setSuggestions(base.slice(0, 50));
    const filtered = base.filter((n) => String(n).toLowerCase().includes(q));
    setSuggestions(filtered.slice(0, 20));
  }, [inputFocused, patientQuery, form.patients, patientList]);

  const addPatient = (name) => {
    const n = name.trim();
    if (!n) return;
    const exists = patientList.some((p) => String(p).toLowerCase() === n.toLowerCase());
    if (!exists) {
      setNotifyInfo({ type: "error", title: "Invalid Patient", message: "Select a patient from the list." });
      setNotifyOpen(true);
      return;
    }
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
    if (f instanceof File) return URL.createObjectURL(f);
    // If backend returned relative media URL, prefix host
    if (typeof f === "string" && f.startsWith("/")) return `http://localhost:8000${f}`;
    return f;
  };

  // Format DRF-style error objects into readable text
  const formatApiError = (e) => {
    const d = e?.response?.data;
    if (!d) return "Failed to add activity.";
    if (typeof d === "string") return d;
    if (typeof d === "object" && d !== null) {
      if (typeof d.detail === "string") return d.detail;
      const labelize = (k) =>
        k === "non_field_errors"
          ? "Error"
          : k
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
      const lines = Object.entries(d).map(([key, val]) => {
        const text = Array.isArray(val) ? val.join(" ") : String(val);
        // For date field, show message only without the "Date: " prefix
        if (key === "date") return text;
        return `${labelize(key)}: ${text}`;
      });
      return lines.join("\n");
    }
    return "Failed to add activity.";
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

    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      if (form.description) fd.append("description", form.description);
      fd.append("date", form.date);
      if (form.photo) fd.append("photo", form.photo);
      if (form.attachment) fd.append("attachment", form.attachment);
      fd.append("patients", JSON.stringify(form.patients || []));

      await adminCreatePsychosocialActivity(fd);

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
      const msg = formatApiError(e);
      setNotifyInfo({ type: "error", title: "Validation Error", message: msg });
      setNotifyOpen(true);
    }
  };

  return (
    // <div className="w-full max-w-5xl py-6 px-5 h-screen bg-gray">
    <>
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

      {/* <div className="flex justify-between px-5">
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
      </div> */}

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-gray overflow-auto">
        <div className="h-fit w-full flex flex-col gap-4">
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Activity Details</h2>
              {/* <span
                className={`text-xs px-2 py-1 rounded ${
                  status === "Complete"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {status}
              </span> */}
            </div>
            {/* Title */}

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  placeholder="e.g., Group Sharing Session"
                />
              </div>

              {/* Date */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={todayStr}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>

              {/* Attachment */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
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
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {form.attachment && (
                  <p className="text-xs text-gray-600 mt-1 break-all whitespace-normal leading-snug">
                    {form.attachment instanceof File
                      ? `Selected file: ${form.attachment.name}`
                      : `Existing file: ${form.attachment}`}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Description
                </label>
                <textarea
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What is this session about?"
                ></textarea>
              </div>

              {/* Photo (preview only) */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, photo: e.target.files?.[0] || null })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
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

              {/* Input with suggestions */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
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
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  placeholder="Type a name, press Enter, or pick from options…"
                />

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="left-0 right-0 mt-1 border rounded bg-white shadow max-h-40 overflow-auto z-10">
                    {suggestions.map((name) => (
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
            </div>
          </div>

          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Patients Added</h2>
                {/* <span
                  className={`text-xs px-2 py-1 rounded ${
                    status === "Complete"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {status}
                </span> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="mt-3 overflow-auto">
                  {form.patients.length === 0 ? (
                    <p className="text-xs text-gray-500 italic px-5 py-2">
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
          </div>

          {/* Right column */}
          {/* <div className="w-[50%] pl-4  h-full overflow-auto"> */}

            {/* Added patients — vertical list with an × on the right */}
            {/* <div className="mt-3  h-[60%] overflow-auto">
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
            </div> */}
          {/* </div> */}
        </div>

        {/* Actions */}
        <div className="w-full flex justify-around pb-6">
          <Link
            // type="button"
            to={"/admin/PychosocialSupport"}
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black rounded-md"
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
          </Link>
          <button
            type="button"
            disabled={!canSubmit}
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            // className={`px-4 py-2 text-white rounded ${
            //   canSubmit ? "bg-primary" : "bg-primary cursor-not-allowed"
            // }`}
            onClick={handleAddClick}
          >
            Add Activity
          </button>
        </div>
      </div>
    {/* </div> */}
    </>
  );
};

export default add;
