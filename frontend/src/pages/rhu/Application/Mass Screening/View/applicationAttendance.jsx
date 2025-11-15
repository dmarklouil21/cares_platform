import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import {
  getMassScreeningAttendance,
  saveMassScreeningAttendance,
} from "../../../../../api/massScreening";
import api from "src/api/axiosInstance";

/* Notification (no close button) */
function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

const ApplicationAttendance = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const record = state?.record || state || null;

  const initialPatients = useMemo(() => {
    return Array.isArray(state?.patients) && state.patients.length
      ? state.patients.map((p) =>
          typeof p === "string"
            ? { name: p, result: "" }
            : { name: p.name, result: p.result ?? "" }
        )
      : [];
  }, [state]);

  const [patients, setPatients] = useState(initialPatients);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rhuLgu, setRhuLgu] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setPatients(initialPatients), [initialPatients]);

  // Load existing attendance from backend
  useEffect(() => {
    const load = async () => {
      if (!record?.id) return;
      try {
        setLoading(true);
        setError("");
        const data = await getMassScreeningAttendance(record.id);
        if (Array.isArray(data) && data.length) {
          setPatients(
            data.map((e) => ({ name: e.name, result: e.result || "" }))
          );
        }
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [record?.id]);

  useEffect(() => {
    const run = async () => {
      try {
        const prof = await api.get("/rhu/profile/");
        const lgu = prof?.data?.lgu || "";
        setRhuLgu(lgu);
        const toCity = (s) => String(s || "").replace(/^RHU\s+/i, "").split(",")[0].trim();
        const norm = (s) => toCity(s).toLowerCase();
        const cityExact = toCity(lgu);

        let list = [];
        try {
          const res = await api.get("/rhu/patients/");
          list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        } catch {}

        if (!Array.isArray(list) || list.length === 0) {
          try {
            const resCity = await api.get(`/patient/list/`, { params: { registered_by: "rhu", city: cityExact } });
            list = Array.isArray(resCity?.data) ? resCity.data : (Array.isArray(resCity?.data?.results) ? resCity.data.results : []);
            if (!list.length) {
              const resAllRhu = await api.get(`/patient/list/`, { params: { registered_by: "rhu" } });
              const allRhu = Array.isArray(resAllRhu?.data) ? resAllRhu.data : (Array.isArray(resAllRhu?.data?.results) ? resAllRhu.data.results : []);
              list = allRhu.filter((p) => norm(p.city) === norm(cityExact) || norm(p.city).includes(norm(cityExact)));
            }
          } catch {}
        }

        setPatientList(list || []);
        if (!list || list.length === 0) {
          setNotif("No RHU patients found for your LGU.");
        }
      } catch {}
    };
    run();
  }, []);

  const updateResult = (idx, value) => {
    setPatients((list) =>
      list.map((p, i) => (i === idx ? { ...p, result: value } : p))
    );
  };

  const removePatient = (idx) => {
    setPatients((list) => list.filter((_, i) => i !== idx));
  };

  // Available patients panel filtering (exclude already added)
  const addedNames = useMemo(() => new Set(patients.map((p) => (p.name || "").toLowerCase())), [patients]);
  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const all = Array.isArray(patientList) ? patientList : [];
    return all
      .filter((p) => {
        const full = (p.full_name || `${p.first_name || ""} ${p.last_name || ""}`).trim();
        if (!full) return false;
        if (addedNames.has(full.toLowerCase())) return false;
        if (!term) return true;
        return full.toLowerCase().includes(term) || String(p.patient_id || "").includes(term);
      })
      .slice(0, 200);
  }, [patientList, searchTerm, addedNames]);

  const addAttendee = (patient) => {
    const full = (patient.full_name || `${patient.first_name || ""} ${patient.last_name || ""}`).trim();
    if (!full) return;
    if (addedNames.has(full.toLowerCase())) return;
    setPatients((list) => [...list, { name: full, result: "" }]);
    setNotif("Patient added.");
  };

  /* Save + confirmation + notification */
  const [showConfirm, setShowConfirm] = useState(false);
  const [notif, setNotif] = useState("");
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(""), 2500);
    return () => clearTimeout(t);
  }, [notif]);

  const handleSave = () => setShowConfirm(true);
  const confirmSave = async () => {
    if (!record?.id) {
      setNotif("Missing mass screening ID.");
      setShowConfirm(false);
      return;
    }
    try {
      setSaving(true);
      const entries = patients
        .map((p) => ({
          name: String(p.name || "").trim(),
          result: String(p.result || "").trim(),
        }))
        .filter((p) => p.name);
      await saveMassScreeningAttendance(record.id, entries);
      setNotif("Attendance saved successfully.");
      setShowConfirm(false);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Failed to save attendance.";
      setNotif(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (!record) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray">
        <div className="bg-white rounded-xl shadow p-6">No record data.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray relative">
      <Notification message={notif} />

      {/* Top bar */}
      {/* <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
        <h1 className="text-md font-bold h-full flex items-center">RHU</h1>
      </div> */}

      {/* Content */}
      <div className="w-full flex-1 py-5 flex flex-col justify-start gap-5 px-5 overflow-auto">
        <h2 className="text-xl font-bold text-left w-full pl-5">Attendance</h2>

        {/* Context */}
        <div className="bg-white rounded-2xl shadow-md px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContextField label="Mass ID" value={record.id} />
            <ContextField label="Title" value={record.title} />
            <ContextField label="Date" value={record.date} />
          </div>
        </div>

        {/* Two-pane layout: Available (left) | Current attendees (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available patients */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">Available Patients</h3>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patients by name or ID..."
                  className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary w-full text-sm"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No patients found.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((p) => {
                      const full = (p.full_name || `${p.first_name || ""} ${p.last_name || ""}`).trim();
                      return (
                        <div key={p.patient_id || full} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{full}</p>
                            <p className="text-xs text-gray-500">ID: {p.patient_id || "N/A"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addAttendee(p)}
                            className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition-colors"
                            title="Add Attendee"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Current attendees with results */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-600">Current Attendees</h3>
              <span className="text-sm text-gray-600">{patients.length} patients</span>
            </div>
            <div className="p-4">
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="hidden md:grid md:grid-cols-12 font-semibold text-sm px-3 py-2 bg-gray-50">
                  <div className="md:col-span-4">Name</div>
                  <div className="md:col-span-7">Result / Notes</div>
                  <div className="md:col-span-1 text-right pr-2">Actions</div>
                </div>
                {patients.map((p, idx) => (
                  <div key={p.name + idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border-t first:border-t-0">
                    <div className="md:col-span-4 font-medium">{p.name}</div>
                    <div className="md:col-span-7">
                      <input
                        type="text"
                        value={p.result}
                        onChange={(e) => updateResult(idx, e.target.value)}
                        placeholder="Encode result…"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removePatient(idx)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors"
                        title="Remove Attendee"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-md bg-primary text-white font-semibold ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {saving ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="w-full flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md w-[30%] text-center bg-gray-300 text-gray-800 font-semibold"
          >
            Back
          </button>
          <Link
            to="/rhu/application/mass-screening"
            className="px-4 py-2 rounded-md w-[30%] text-center bg-primary text-white font-semibold"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-[min(420px,92vw)] rounded-xl shadow-xl p-6 z-50 text-center">
            <h4 className="text-lg font-semibold mb-2">Save attendance?</h4>
            <p className="text-sm text-gray2 mb-6">
              This will save encoded results for all patients.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                disabled={saving}
                className={`px-4 py-2 rounded-md bg-primary text-white font-semibold ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationAttendance;

/* ----------------------------- Helpers ----------------------------- */
function ContextField({ label, value }) {
  return (
    <div>
      <div className="text-gray2 text-sm mb-1">{label}</div>
      <div className="border border-gray-200 rounded-md px-4 py-2">
        {value ?? "—"}
      </div>
    </div>
  );
}
