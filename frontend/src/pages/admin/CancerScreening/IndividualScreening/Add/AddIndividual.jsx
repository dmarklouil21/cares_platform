import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";

import api from "src/api/axiosInstance";

/* =========================
   Sample Patients (FAKE)
   ========================= */
const SAMPLE_PATIENTS = [
  {
    id: "PT-001",
    full_name: "Alice Santos",
    email: "alice.santos@example.com",
  },
  {
    id: "PT-002",
    full_name: "Bea Dela Cruz",
    email: "bea.delacruz@example.com",
  },
  {
    id: "PT-003",
    full_name: "Carlo Ramirez",
    email: "carlo.ramirez@example.com",
  },
  {
    id: "PT-004",
    full_name: "Diane Flores",
    email: "diane.flores@example.com",
  },
  { id: "PT-005", full_name: "Evan Lim", email: "evan.lim@example.com" },
  { id: "PT-006", full_name: "Faye Tan", email: "faye.tan@example.com" },
  {
    id: "PT-007",
    full_name: "Gio Hernandez",
    email: "gio.hernandez@example.com",
  },
];

/* =========================
   Searchable Select (inline)
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

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-5 w-5 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const AddIndividualScreening = () => {
  const navigate = useNavigate();

  // Form state
  const [patient, setPatient] = useState(null); // from SAMPLE_PATIENTS
  const [procedureName, setProcedureName] = useState("");
  const [procedureDetails, setProcedureDetails] = useState("");
  const [cancerSite, setCancerSite] = useState("");
  const [screeningDate, setScreeningDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const inputRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);

  const requiredDocs = REQUIRED_DOCS["Individual Screening"] || [];

  // helper to build a cleared files map
  const makeEmptyFiles = () =>
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {});

  const [files, setFiles] = useState(makeEmptyFiles);

  // Uploads
  const [preScreeningForm, setPreScreeningForm] = useState(null);
  // const [requiredDocs, setRequiredDocs] = useState([]); // multiple
  const [labResults, setLabResults] = useState(null);
  const [loaFile, setLoaFile] = useState(null); // LOA upload

  // Global modals / UX
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "Record has been created.",
  });

  const handleChooseFile = () => inputRef.current?.click();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState(
    "Create this screening record?"
  );
  const [confirmDesc, setConfirmDesc] = useState(
    "Please review all details before submitting."
  );

  const handleRequiredDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    setRequiredDocs(files);
  };

  const onFilePicked = (f) => {
    if (!f) return;
    const docKey = activeDoc.key;
    setFiles((prev) => ({ ...prev, [docKey]: f }));
  };

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    onFilePicked(f);
    e.target.value = ""; // allow re-picking the same file
  };

  const validate = () => {
    if (!patient) {
      setModalInfo({
        type: "info",
        title: "Missing Patient",
        message: "Please select a patient.",
      });
    } else if (!procedureName.trim()) {
      setModalInfo({
        type: "info",
        title: "Missing Procedure Name",
        message: "Please enter the procedure name.",
      });
    } else if (!cancerSite.trim()) {
      setModalInfo({
        type: "info",
        title: "Missing Cancer Site",
        message: "Please enter the cancer site.",
      });
    } else {
      return true;
    }
    setShowModal(true);
    return false;
  };

  // ✅ UI-only submit: show success then navigate to /admin/cancer-screening
  const handleSubmit = () => {
    if (!validate()) return;

    setConfirmOpen(false);
    // no backend calls; just UI feedback + navigation
    setModalInfo({
      type: "success",
      title: "Created",
      message: "The screening record was created successfully.",
    });
    setShowModal(true);

    // optional: brief loading shimmer if you like
    setLoading(false);

    // go to listing (can also pass state for a toast on the next page)
    navigate("/admin/cancer-screening", {
      state: { type: "success", message: "Created Successfully." },
    });
  };

  return (
    <>
      {/* Global Modals */}
      <ConfirmationModal
        open={confirmOpen}
        title={confirmText}
        desc={confirmDesc}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Creating record..." />

      {/* Screen */}
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-gray overflow-auto">
        {/* Header */}
        {/* <div className=" h-[10%] px-1 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Add Individual Screening</h1>
          <Link to={"/admin/cancer-screening"}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div> */}

        {/* Content */}
        <div className="h-fit w-full flex flex-col gap-4">
          {/* Screening Info */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Screening Information</h2>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  status === "Complete"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <SearchableSelect
                label="Patient Name"
                options={SAMPLE_PATIENTS}
                value={patient}
                onChange={setPatient}
              />

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approve">Approve</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Procedure Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="e.g., Mammogram"
                />
              </div>

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Cancer Site
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={cancerSite}
                  onChange={(e) => setCancerSite(e.target.value)}
                  placeholder="e.g., Breast"
                />
              </div>

              <div className="w-full md:col-span-2">
                <label className="text-sm font-medium block mb-1">
                  Procedure Details
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
                  rows={3}
                  value={procedureDetails}
                  onChange={(e) => setProcedureDetails(e.target.value)}
                  placeholder="Add notes or details about the procedure..."
                />
              </div>

              {/* <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Screening Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={screeningDate}
                  onChange={(e) => setScreeningDate(e.target.value)}
                />
              </div> */}
            </div>
          </div>

          {/* Uploads */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3">
              <h2 className="text-lg font-semibold">Requirements</h2>
            </div>

            {/* <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Pre-Screening Form (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  onChange={(e) =>
                    setPreScreeningForm(e.target.files?.[0] || null)
                  }
                />
                {preScreeningForm && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {preScreeningForm.name}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Lab Results (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  onChange={(e) => setLabResults(e.target.files?.[0] || null)}
                />
                {labResults && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {labResults.name}
                  </p>
                )}
              </div>

              <div className="w-full md:col-span-2">
                <label className="text-sm font-medium block mb-1">
                  Required Documents (Images/PDF — multiple)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  onChange={handleRequiredDocsChange}
                />
                {requiredDocs.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    {requiredDocs.map((f, i) => (
                      <li key={i} className="truncate">
                        • {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>s */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
              {requiredDocs.map((d, idx) => {
                const uploaded = !!files[d.key];
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className="flex items-center gap-3 text-left group"
                  >
                    <CheckIcon active={uploaded} />
                    <span
                      className={`${
                        isActive ? "text-sm font-bold" : "text-sm"
                      }`}
                    >
                      {d.label}
                    </span>
                    {isActive && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOA Actions — Upload only */}
          {/* <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">LOA Actions</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="w-full md:col-span-2 flex items-center justify-between md:justify-start md:gap-10">
                <span className="font-medium">Upload LOA</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full md:w-auto border border-gray-300 rounded px-3 py-2 bg-white"
                  onChange={(e) => setLoaFile(e.target.files?.[0] || null)}
                />
              </div>
              {loaFile && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {loaFile.name}
                  </p>
                </div>
              )}
            </div>
          </div> */}

          {/* Actions */}
          <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
            <Link
              className="text-center bg-white text-black py-2 w-full md:w-[23%] border border-black/15 hover:border-black rounded-md"
              to={"/admin/cancer-screening"}
            >
              CANCEL
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-center font-bold bg-primary text-white py-2 w-full md:w-[23%] rounded-md shadow hover:opacity-90"
            >
              CREATE RECORD
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddIndividualScreening;
