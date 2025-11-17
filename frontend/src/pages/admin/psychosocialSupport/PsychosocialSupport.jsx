import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Calendar, Search, Users, Pencil, Trash2, Eye, Plus } from 'lucide-react';

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import api from "src/api/axiosInstance";

import {
  adminListPsychosocialActivities,
  adminUpdatePsychosocialActivity,
  adminDeletePsychosocialActivity,
} from "src/api/psychosocialSupport";

const PschosocialSupport = () => {
  // List from backend
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null); // { type: "submit"|"delete", id? }

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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Today's date (local) as YYYY-MM-DD for input[min]
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.get("/psychosocial-support/list-activity/");
    setActivities(response.data);
  } catch (error) {
    console.error("Error fetching cancer awareness activities:", error);
    setNotification("Failed to load activities.");
    setNotificationType("error");
    setTimeout(() => setNotification(""), 2000);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

  // Fetch list on mount
  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       setLoading(true);
  //       const data = await adminListPsychosocialActivities();
  //       const normalized = (Array.isArray(data) ? data : []).map((a) => ({
  //         ...a,
  //         photo: a.photo_url || a.photo,
  //         attachment: a.attachment_url || a.attachment,
  //         patients:
  //           typeof a.patients === "string"
  //             ? a.patients
  //                 .split(",")
  //                 .map((s) => s.trim())
  //                 .filter(Boolean)
  //             : Array.isArray(a.patients)
  //             ? a.patients
  //             : [],
  //       }));
  //       setActivities(normalized);
  //     } catch (e) {
  //       setNotification("Failed to load activities.");
  //       setNotificationType("error");
  //       setTimeout(() => setNotification(""), 2000);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   load();
  // }, []);

  // Dynamic suggestions from backend
  // useEffect(() => {
  //   let alive = true;
  //   const load = async () => {
  //     try {
  //       const res = await api.get("/patient/list/");
  //       const arr = Array.isArray(res?.data)
  //         ? res.data
  //         : Array.isArray(res?.data?.results)
  //         ? res.data.results
  //         : [];
  //       const names = (arr || [])
  //         .map((d) => d.full_name || `${d.first_name || ""} ${d.last_name || ""}`.trim())
  //         .filter(Boolean);
  //       if (alive) setPatientList(names);
  //     } catch {
  //       if (alive) setPatientList([]);
  //     }
  //   };
  //   load();
  //   return () => {
  //     alive = false;
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!inputFocused) return setSuggestions([]);
  //   const q = (patientQuery || "").trim().toLowerCase();
  //   const exclude = new Set(form.patients.map((p) => String(p).toLowerCase()));
  //   const base = patientList.filter((n) => !exclude.has(String(n).toLowerCase()));
  //   if (!q) return setSuggestions(base.slice(0, 50));
  //   const filtered = base.filter((n) => String(n).toLowerCase().includes(q));
  //   setSuggestions(filtered.slice(0, 20));
  // }, [inputFocused, patientQuery, form.patients, patientList]);

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
      setNotification("Select a patient from the list.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
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

  // Submit/Delete
  const requestSubmit = () => {
    setShowModal(false);
    setModalText("Confirm Update");
    setModalDesc("Are you sure you want to update this activity?");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const requestDelete = (id, title) => {
    setModalText("Confirm Delete");
    setModalDesc(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
    setModalAction({ type: "delete", id });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;
    setModalOpen(false);
    setLoading(true);
    try {
      if (modalAction.type === "submit" && editing) {
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

        setNotification("Activity updated successfully!");
        setNotificationType("success");
        resetForm();
      } else if (modalAction.type === "delete" && modalAction.id) {
        await adminDeletePsychosocialActivity(modalAction.id);
        setActivities((prev) => prev.filter((a) => a.id !== modalAction.id));
        setNotification("Activity deleted successfully!");
        setNotificationType("success");
      }
    } catch (e) {
      const msg = e?.response?.data
        ? typeof e.response.data === "string"
          ? e.response.data
          : JSON.stringify(e.response.data)
        : "Request failed.";
      setNotification(msg);
      setNotificationType("error");
    } finally {
      setLoading(false);
      setModalAction(null);
      setTimeout(() => setNotification(""), 2000);
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

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (!activity.date) return false;
    
    const activityDate = new Date(activity.date);
    const monthMatches = selectedMonth === "" || (activityDate.getMonth() + 1) === parseInt(selectedMonth);
    const yearMatches = selectedYear === "" || activityDate.getFullYear() === parseInt(selectedYear);
    const searchMatches =
      searchTerm === "" ||
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return monthMatches && yearMatches && searchMatches;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {loading && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Psychosocial Support Activities
          </h2>
          <Link
            to="/admin/PychosocialSupport/add"
            className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {/* <Plus className="w-4 h-4" /> */}
            Add Activity
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              View, add, or manage psychosocial support activities for patients.
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 py-2 pl-10 pr-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full text-sm"
                />
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                title="Clear Filters"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                {/* Clear Filters */}
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activities Section */}
          <div className="px-6 py-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-500 text-sm">
                  {activities.length === 0 
                    ? "Get started by adding your first psychosocial support activity."
                    : "No activities match your current filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {activity.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(activity.date)}</span>
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4 mr-2" />
                          <span>{activity.attendees_count || 0} attendees</span>
                          {/* <span>{activity.patients?.length || 0} patients</span> */}
                        </div>
                        
                        {activity.description && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">
                            {activity.description}
                          </p>
                        )}
                        
                        {activity.patients?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {activity.patients.map((patient, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded-full bg-lightblue/10 text-primary border border-lightblue/40"
                              >
                                {patient}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <Link
                          to={`/admin/PychosocialSupport/view/${activity.id}`}
                          className="bg-primary hover:bg-primary/90 text-white py-1.5 px-2 rounded transition-colors"
                          title="Edit Activity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          // onClick={() => startEdit(activity)}
                          to={`/admin/PychosocialSupport/edit/${activity.id}`}
                          className="bg-yellow hover:bg-yellow/90 text-white py-1.5 px-2 rounded transition-colors"
                          title="Edit Activity"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => requestDelete(activity.id, activity.title)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {activity.attachment && (
                          <a
                            href={filePreviewUrl(activity.attachment)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="bg-primary hover:bg-primary/90 text-white py-1.5 px-2 rounded transition-colors"
                            title="Download Attachment"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {activity.photo && (
                      <div className="mt-2">
                        <img
                          src={filePreviewUrl(activity.photo)}
                          alt={activity.title}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && editing && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[3px] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Activity</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="border border-gray-300 w-full p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="border border-gray-300 w-full p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="What is this session about?"
                      rows={4}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      min={todayStr}
                      className="border border-gray-300 w-full p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                      className="border border-gray-300 w-full p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {form.photo && (
                      <div className="mt-2">
                        <img
                          src={filePreviewUrl(form.photo)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
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

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Attachment */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Attachment
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })}
                      className="border border-gray-300 w-full p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {form.attachment && (
                      <p className="text-xs text-gray-600 mt-1 break-all">
                        {form.attachment instanceof File
                          ? `Selected file: ${form.attachment.name}`
                          : `Existing file: ${form.attachment}`}
                      </p>
                    )}
                  </div>

                  {/* Patients */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Patients who attended *
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={patientQuery}
                        onChange={(e) => setPatientQuery(e.target.value)}
                        onKeyDown={onPatientsKeyDown}
                        onFocus={() => setInputFocused(true)}
                        onClick={() => setInputFocused(true)}
                        onBlur={() => setTimeout(() => setInputFocused(false), 120)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Type a name, press Enter, or pick from options…"
                      />

                      {/* Suggestions dropdown */}
                      {suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 border border-gray-300 rounded-md bg-white shadow-lg max-h-40 overflow-auto z-10">
                          {suggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addPatient(name)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Added patients */}
                    <div className="mt-3 min-h-[40px]">
                      {form.patients.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No patients added yet.
                        </p>
                      ) : (
                        <div className="bg-gray-50 rounded-md max-h-48 overflow-auto p-3 flex flex-col gap-2">
                          {form.patients.map((patient) => (
                            <div
                              key={patient}
                              className="flex items-center bg-white rounded-md justify-between px-3 py-2 border border-gray-200"
                            >
                              <span className="text-sm">{patient}</span>
                              <button
                                type="button"
                                onClick={() => removePatient(patient)}
                                className="text-gray-500 hover:text-red-600 text-lg"
                                aria-label={`Remove ${patient}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={requestSubmit}
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    canSubmit 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-gray-400 cursor-not-allowed"
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