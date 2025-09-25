// src/pages/treatment/AdminPostTreatmentAdd.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

/* =========================
   Sample Patients (from your view data)
   ========================= */
const SAMPLE_PATIENTS = [
  {
    id: "PT-001",
    full_name: "Ana Dela Cruz",
    email: "ana.delacruz@example.com",
    age: 41,
    address: "Cebu City",
  },
  {
    id: "PT-002",
    full_name: "Mark Reyes",
    email: "mark.reyes@example.com",
    age: 39,
    address: "Mandaue City",
  },
  {
    id: "PT-003",
    full_name: "Joy Santos",
    email: "joy.santos@example.com",
    age: 28,
    address: "Cebu City",
  },
  {
    id: "PT-004",
    full_name: "Carlos Lim",
    email: "carlos.lim@example.com",
    age: 52,
    address: "Cebu City",
  },
];

/* =========================
   Searchable Select (same UX pattern)
   ========================= */
const SearchableSelect = ({
  label = "Patient Name",
  placeholder = "Search patient...",
  options = [],
  value = null,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!q) return options;
    const s = q.toLowerCase();
    return options.filter(
      (o) =>
        o.full_name.toLowerCase().includes(s) ||
        (o.email && o.email.toLowerCase().includes(s))
    );
  }, [q, options]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="w-full" ref={ref}>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-left"
          onClick={() => setOpen((o) => !o)}
        >
          {value ? value.full_name : "Select patient"}
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow">
            <div className="p-2 border-b border-gray-200">
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <ul className="max-h-56 overflow-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No results</li>
              )}
              {filtered.map((opt) => (
                <li
                  key={opt.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <div className="text-sm font-medium">{opt.full_name}</div>
                  <div className="text-xs text-gray-500">{opt.email}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: <span className="font-medium">{value.full_name}</span>{" "}
          <span className="text-gray-400">({value.email})</span>
        </p>
      )}
    </div>
  );
};

const LIST_PATH = "/admin/treatment-assistance/post-treatment";

const AdminPostTreatmentAdd = () => {
  const navigate = useNavigate();

  // ===== LOA GENERATION (shown first) =====
  const [patient, setPatient] = useState(null); // { id, full_name, email, age, address }
  const [age, setAge] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [date, setDate] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  // ===== Request Post-Treatment Labs (separate card) =====
  const [labRequest, setLabRequest] = useState("");
  const [labResult, setLabResult] = useState("");
  const [schedule, setSchedule] = useState("");

  // ===== Global UX =====
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "success",
    title: "Success!",
    message: "Record has been created.",
  });

  // Defaults for date/schedule
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    if (!date) setDate(`${yyyy}-${mm}-${dd}`);
    if (!schedule) setSchedule(`${yyyy}-${mm}-${dd}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fill Age & Address when selecting a patient
  useEffect(() => {
    if (!patient) return;
    setAge(patient.age != null ? String(patient.age) : "");
    setPatientAddress(patient.address || "");
  }, [patient]);

  const isValid = useMemo(() => {
    return (
      patient &&
      age &&
      date &&
      providerName.trim() &&
      diagnosis.trim() &&
      procedure.trim() &&
      schedule &&
      preparedBy.trim() &&
      approvedBy.trim()
    );
  }, [
    patient,
    age,
    date,
    providerName,
    diagnosis,
    procedure,
    schedule,
    preparedBy,
    approvedBy,
  ]);

  const validateOrNotify = () => {
    if (isValid) return true;

    const msg = !patient
      ? "Please select a patient."
      : !providerName.trim()
      ? "Please enter Service Provider/Lab Name."
      : !diagnosis.trim()
      ? "Please enter Diagnosis."
      : !procedure.trim()
      ? "Please enter Procedure."
      : !preparedBy.trim()
      ? "Please enter Prepared by."
      : !approvedBy.trim()
      ? "Please enter Approved by."
      : !date
      ? "Please set Date."
      : !schedule
      ? "Please set Schedule."
      : "Please complete all required fields.";

    setNotifyInfo({ type: "info", title: "Incomplete", message: msg });
    setNotifyOpen(true);
    return false;
  };

  const doSubmit = () => {
    if (!validateOrNotify()) return;

    setConfirmOpen(false);
    setLoading(true);

    // UI-only payload
    const payload = {
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_age: Number(age),
      patient_address: patientAddress,
      date,
      providerName,
      providerAddress,
      diagnosis,
      procedure,
      labRequest,
      labResult,
      schedule,
      preparedBy,
      approvedBy,
      status: "Pending",
    };
    console.log("[PostTreatmentAdd] mock create payload:", payload);

    setTimeout(() => {
      setLoading(false);
      // optional in-modal success (kept super brief)
      setNotifyInfo({
        type: "success",
        title: "Created",
        message: "Post-treatment record was created.",
      });
      setNotifyOpen(true);

      // navigate to list with a flash toast there
      navigate(LIST_PATH, {
        state: { flash: "Post-treatment record created successfully." },
      });
    }, 600);
  };

  return (
    <>
      {/* Global Modals (same components you already use) */}
      <ConfirmationModal
        open={confirmOpen}
        title="Create this post-treatment record?"
        desc="Please review all details before submitting."
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => setNotifyOpen(false)}
      />
      <LoadingModal open={loading} text="Creating record..." />

      <div className="h-screen w-full flex p-5 gap-4 flex-col justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        <div className="px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Add Post-Treatment Record</h1>
          <Link to={LIST_PATH}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>

        {/* LOA GENERATION FIRST */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">LOA GENERATION</h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Select Patient (Searchable) */}
            <div className="md:col-span-2">
              <SearchableSelect
                label="Patient Name"
                options={SAMPLE_PATIENTS}
                value={patient}
                onChange={setPatient}
                placeholder="Type to search by name or email..."
              />
            </div>

            {/* Auto-filled (editable) */}
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 41"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Patient Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                placeholder="e.g., Cebu City"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Service Provider/Lab Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g., CHONG HUA HOSPITAL - MANDAUE"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Provider Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                placeholder="e.g., Cebu City"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., Hypertension"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Procedure <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="e.g., Basic Metabolic Panel"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Prepared by <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="e.g., Nurse Jane Rivera"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Approved by <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g., Dr. Ramon Cruz"
              />
            </div>
          </div>
        </div>

        {/* REQUEST POST-TREATMENT LABS (second) */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">
              Request Post-Treatment Labs
            </h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Laboratory Request
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={labRequest}
                onChange={(e) => setLabRequest(e.target.value)}
                placeholder="e.g., BMP"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Laboratory Result
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={labResult}
                onChange={(e) => setLabResult(e.target.value)}
                placeholder="e.g., Pending / To follow"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
          <Link
            className="text-center bg-white text-black py-2 w-full md:w-[30%] border border-black/15 hover:border-black rounded-md"
            to={LIST_PATH}
          >
            BACK
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!isValid}
            className={`text-center font-bold text-white py-2 w-full md:w-[30%] rounded-md shadow ${
              !isValid
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:opacity-90"
            }`}
            title={!isValid ? "Complete required fields" : ""}
          >
            CREATE RECORD
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminPostTreatmentAdd;
