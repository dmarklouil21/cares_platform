import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";

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
    const fallback = [
      { name: "Juan Dela Cruz", result: "" },
      { name: "Maria Santos", result: "" },
      { name: "Pedro Reyes", result: "" },
      { name: "Ana Bautista", result: "" },
      { name: "Jose Ramirez", result: "" },
    ];
    return Array.isArray(state?.patients) && state.patients.length
      ? state.patients.map((p) =>
          typeof p === "string"
            ? { name: p, result: "" }
            : { name: p.name, result: p.result ?? "" }
        )
      : fallback;
  }, [state]);

  const [patients, setPatients] = useState(initialPatients);
  useEffect(() => setPatients(initialPatients), [initialPatients]);

  const updateResult = (idx, value) => {
    setPatients((list) =>
      list.map((p, i) => (i === idx ? { ...p, result: value } : p))
    );
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
  const confirmSave = () => {
    setShowConfirm(false);
    console.log("Attendance saved for", record?.id, patients);
    setNotif("Attendance saved successfully.");
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
      <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
        <h1 className="text-md font-bold h-full flex items-center">RHU</h1>
      </div>

      {/* Content */}
      <div className="w-full flex-1 py-5 flex flex-col justify-start gap-5 px-5 overflow-auto">
        <h2 className="text-xl font-bold text-left w-full pl-5">Attendance</h2>

        <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-4">
          {/* Basic context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContextField label="Mass ID" value={record.id} />
            <ContextField label="Title" value={record.title} />
            <ContextField label="Date" value={record.date} />
          </div>

          {/* Patient list with result inputs */}
          <div>
            <div className="text-gray2 text-sm mb-1">Patients</div>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {patients.map((p, idx) => (
                <div
                  key={p.name + idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border-t first:border-t-0"
                >
                  <div className="md:col-span-4 font-medium">{p.name}</div>
                  <div className="md:col-span-8">
                    <input
                      type="text"
                      value={p.result}
                      onChange={(e) => updateResult(idx, e.target.value)}
                      placeholder="Encode result…"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md w-[30%] text-center bg-gray-300 text-gray-800 font-semibold"
          >
            Back
          </button>
          <Link
            to="/Rhu/application"
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
                className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
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
