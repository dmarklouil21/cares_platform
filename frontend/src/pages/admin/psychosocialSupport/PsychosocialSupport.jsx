// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from 'lucide-react';

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import api from "src/api/axiosInstance";

import {
  adminListPsychosocialActivities,
  adminUpdatePsychosocialActivity,
  adminDeletePsychosocialActivity,
} from "src/api/psychosocialSupport";


/* Data loads from backend; no UI-only seed needed */

const PschosocialSupport = () => {
  // List from backend
  const [activities, setActivities] = useState([]);

  // Global modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // { type: "submit"|"delete", id? }

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "success",
    title: "Success",
    message: "Done.",
  });

  const [loading, setLoading] = useState(false);

  // Today's date (local) as YYYY-MM-DD for input[min]
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Fetch list on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminListPsychosocialActivities();
        const normalized = (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          // Prefer absolute URLs from backend if available
          photo: a.photo_url || a.photo,
          attachment: a.attachment_url || a.attachment,
          patients:
            typeof a.patients === "string"
              ? a.patients
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : Array.isArray(a.patients)
              ? a.patients
              : [],
        }));
        setActivities(normalized);
      } catch (e) {
        // optionally notify
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form (shared by edit modal)
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    photo: null,
    attachment: null,
    patients: [],
  });

  // Patients input (options + free text)
  const [patientQuery, setPatientQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [patientList, setPatientList] = useState([]);

  // Dynamic suggestions from backend
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await api.get("/patient/list/");
        const arr = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
          ? res.data.results
          : [];
        const names = (arr || [])
          .map((d) => d.full_name || `${d.first_name || ""} ${d.last_name || ""}`.trim())
          .filter(Boolean);
        if (alive) setPatientList(names);
      } catch {
        if (alive) setPatientList([]);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!inputFocused) return setSuggestions([]);
    const q = (patientQuery || "").trim().toLowerCase();
    const exclude = new Set(form.patients.map((p) => String(p).toLowerCase()));
    const base = patientList.filter((n) => !exclude.has(String(n).toLowerCase()));
    if (!q) return setSuggestions(base.slice(0, 50));
    const filtered = base.filter((n) => String(n).toLowerCase().includes(q));
    setSuggestions(filtered.slice(0, 20));
  }, [inputFocused, patientQuery, form.patients, patientList]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      photo: null,
      attachment: null,
      patients: [],
    });
    setPatientQuery("");
    setEditing(null);
  };

  // Patients helpers
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
    setInputFocused(false); // CLOSE suggestions after selecting/adding
  };

  const removePatient = (name) => {
    setForm((f) => ({ ...f, patients: f.patients.filter((p) => p !== name) }));
  };

  // EDIT ONLY: open the modal prefilled
  const startEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title ?? "",
      description: a.description ?? "",
      date: a.date ?? "",
      photo: a.photo ?? null,
      attachment: a.attachment ?? null,
      patients: Array.isArray(a.patients) ? [...a.patients] : [],
    });
    setShowModal(true);
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

  // Submit/Delete (UI only)
  const requestSubmit = () => {
    // Only UPDATE path is relevant from Edit modal
    setShowModal(false);
    setConfirmText("Confirm update?");
    setConfirmAction({ type: "submit" });
    setConfirmOpen(true);
  };

  const requestDelete = (id) => {
    setConfirmText("Confirm delete?");
    setConfirmAction({ type: "delete", id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setConfirmOpen(false);
    setLoading(true);
    try {
      if (confirmAction.type === "submit" && editing) {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        if (form.description) fd.append("description", form.description);
        fd.append("date", form.date);
        if (form.photo instanceof File) fd.append("photo", form.photo);
        if (form.attachment instanceof File) fd.append("attachment", form.attachment);
        fd.append("patients", JSON.stringify(form.patients || []));

        await adminUpdatePsychosocialActivity(editing.id, fd);

        // Refresh list
        const data = await adminListPsychosocialActivities();
        const normalized = (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          patients:
            typeof a.patients === "string"
              ? a.patients
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : Array.isArray(a.patients)
              ? a.patients
              : [],
        }));
        setActivities(normalized);

        setNotifyInfo({ type: "success", title: "Updated", message: "Activity updated." });
        setNotifyOpen(true);
        resetForm();
      } else if (confirmAction.type === "delete" && confirmAction.id) {
        await adminDeletePsychosocialActivity(confirmAction.id);
        setActivities((prev) => prev.filter((a) => a.id !== confirmAction.id));
        setNotifyInfo({ type: "success", title: "Deleted", message: "Activity deleted." });
        setNotifyOpen(true);
      }
    } catch (e) {
      const msg = e?.response?.data
        ? typeof e.response.data === "string"
          ? e.response.data
          : JSON.stringify(e.response.data)
        : "Request failed.";
      setNotifyInfo({ type: "error", title: "Error", message: msg });
      setNotifyOpen(true);
    } finally {
      setLoading(false);
      setConfirmAction(null);
      setConfirmText("");
    }
  };

  const canSubmit =
    form.title.trim() && form.date && form.patients.length > 0 && !loading;

  const filePreviewUrl = (f) => {
    if (!f) return "";
    if (f instanceof File) return URL.createObjectURL(f);
    if (typeof f === "string" && f.startsWith("/")) return `http://localhost:8000${f}`;
    return f;
  };

  const confirmTitle = useMemo(() => {
    if (!confirmAction) return "";
    if (confirmAction.type === "delete") return "Delete Activity";
    if (confirmAction.type === "submit") return "Update Activity";
    return "Please Confirm";
  }, [confirmAction]);

  return (
    <>
      {/* Modals */}
      <ConfirmationModal
        open={confirmOpen}
        title={confirmTitle}
        desc={confirmText || "Are you sure?"}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setConfirmText("");
        }}
      />

      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => setNotifyOpen(false)}
      />
      <LoadingModal open={loading} text="Processing..." />

      {/* Page */} 
      {/* bg-gray w-full h-screen flex flex-col items-center */}
      <div className="h-screen w-full flex p-5 gap-3 flex-col justify-start items-center bg-gray">
        <div className="flex items-center justify-between w-full pl-1 pr-2">
          <h2 className="text-xl font-bold text-left">
            Psychosocial Support Activities
          </h2>

          <Link
            to="/admin/PychosocialSupport/add"
            className="bg-yellow px-5 py-1 rounded-sm text-white"
          >
            Add
          </Link>
        </div>
        {/* w-full flex-1 py-3 gap-3 flex flex-col justify-start px-5 */}
        <div className="flex flex-col bg-white rounded-md w-full shadow-md px-5 py-5 gap-3">
          <div className="flex flex-col bg-white w-full rounded-md shadow-md gap-4 flex-1">
            {activities.length === 0 ? (
              <p className="text-gray-500 italic">
                No activities yet. Use “Add Activity”.
              </p>
            ) : (
              <div className="flex flex-col gap-5 overflow-auto custom-rightspaceSB h-[420px]">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex border-b-[1.5px] border-primary/70 pb-4 gap-5 justify-between"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-lg">{a.title}</h3>
                      <p className="text-primary text-xs">
                        {a.date} {" "}
                        {a.attachment && (
                          <a
                            href={filePreviewUrl(a.attachment)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-sm"
                          >
                            {/* Download */}
                            <Download className="inline-block w-4 h-4 mr-1 ml-3" />
                          </a>
                        )}
                      </p>
                      {a.description && (
                        <p className="text-sm">{a.description}</p>
                      )}
                      {a.photo && (
                        <div className="mt-2">
                          <img
                            src={filePreviewUrl(a.photo)}
                            alt={a.title}
                            className="w-full max-w-sm h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      {a.patients?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {a.patients.map((p, i) => (
                            <span
                              key={p + i}
                              className="px-2 py-0.5 text-xs rounded-full bg-lightblue/10 text-primary border border-lightblue/40"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex gap-2">
                        <button
                          className="bg-yellow-500 cursor-pointer px-4 py-1 text-sm text-white rounded-sm"
                          onClick={() => startEdit(a)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 border-[1.5px] border-red-500 px-3 py-1 text-sm text-white rounded-sm"
                          onClick={() => requestDelete(a.id)}
                        >
                          Delete
                        </button>
                      </div>
                      {/* {a.attachment && (
                        <a
                          href={filePreviewUrl(a.attachment)}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline text-sm"
                        >
                          {/* Download *s/}
                          <Download className="inline-block w-4 h-4 mr-1" />
                        </a>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal ONLY */}
        {showModal && editing && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[3px] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center w-[60%] h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Activity</h2>

              {/* ===== Inputs (same as old Add modal) ===== */}
              <div className="flex w-full justify-between overflow-auto">
                <div className="mb-6 space-y-3 w-[50%] pr-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="border w-full p-2 rounded"
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
                      className="border w-full p-2 rounded"
                      placeholder="What is this session about?"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      min={todayStr}
                      className="border w-full p-2 rounded"
                    />
                  </div>

                  {/* Photo (preview only) */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, photo: e.target.files?.[0] || null })
                      }
                      className="border w-full p-2 rounded"
                    />
                    {form.photo && (
                      <div className="mt-2">
                        <img
                          src={filePreviewUrl(form.photo)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
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

                {/* ===== Right column: attachment + patients ===== */}
                <div className="mb-6 w-[50%] pl-4">
                  {/* Attachment (UI only) */}
                  <div>
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
                      className="border w-full p-2 rounded"
                    />
                    {form.attachment && (
                      <p className="text-xs text-gray-600 mt-1 break-all whitespace-normal leading-snug">
                        {form.attachment instanceof File
                          ? `Selected file: ${form.attachment.name}`
                          : `Existing file: ${form.attachment}`}
                      </p>
                    )}
                  </div>

                  <label className="block text-sm font-semibold mb-1 mt-3">
                    Patients who attended
                  </label>

                  {/* Input with suggestions (top) */}
                  <div className="relative">
                    <input
                      type="text"
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                      onKeyDown={onPatientsKeyDown}
                      onFocus={() => setInputFocused(true)}
                      onClick={() => setInputFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setInputFocused(false), 120)
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Type a name, press Enter, or pick from options…"
                    />

                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 border rounded bg-white shadow max-h-40 overflow-auto z-10">
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

                  {/* Added patients — vertical list with an × on the right (match Add page) */}
                  <div className="mt-3 min-h-[40px]">
                    {form.patients.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">
                        No patients added yet.
                      </p>
                    ) : (
                      <ul className="bg-gray rounded max-h-48 overflow-auto p-2 flex flex-col gap-1">
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
              <div className="flex justify-end gap-2 w-full">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={requestSubmit}
                  className={`px-4 py-2 text-white rounded ${
                    canSubmit ? "bg-primary" : "bg-primary cursor-not-allowed"
                  }`}
                >
                  Update Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PschosocialSupport;
