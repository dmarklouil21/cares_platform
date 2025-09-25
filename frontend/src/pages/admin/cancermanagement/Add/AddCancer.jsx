import { Link, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import DateModal from "src/components/Modal/DateModal";

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

const AdminCancerManagementAdd = () => {
  const navigate = useNavigate();

  /* ----------------------- Request Information ----------------------- */
  const [patient, setPatient] = useState(null); // from SearchableSelect
  const [serviceType, setServiceType] = useState("");
  const [status] = useState("Pending"); // UI-only

  // Optional dates
  const [treatmentDate, setTreatmentDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const [openInterviewModal, setOpenInterviewModal] = useState(false);
  const [tempDate, setTempDate] = useState("");

  /* ----------------------- Files (UI only) ----------------------- */
  const [preScreeningForm, setPreScreeningForm] = useState(null);
  const [wellBeingForm, setWellBeingForm] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loaFile, setLoaFile] = useState(null);
  const [caseSummaryFile, setCaseSummaryFile] = useState(null);

  /* ----------------------- Modals / Notices ----------------------- */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("Create this record?");
  const [confirmDesc, setConfirmDesc] = useState(
    "This will create a new cancer management record (UI only)."
  );

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "info",
    title: "Heads up",
    message: "",
  });

  /* ----------------------- Helpers ----------------------- */
  const handleMultiFiles = (e, setter) => {
    const files = Array.from(e.target.files || []);
    setter(files);
  };

  const asDateString = (d) => {
    if (!d) return "---";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const validate = () => {
    if (!patient) {
      setNotifyInfo({
        type: "info",
        title: "Missing Patient",
        message: "Please select a patient.",
      });
    } else if (!serviceType.trim()) {
      setNotifyInfo({
        type: "info",
        title: "Missing Service Type",
        message: "Please choose a service.",
      });
    } else {
      return true;
    }
    setNotifyOpen(true);
    return false;
  };

  /* ----------------------- Submit (UI ONLY) ----------------------- */
  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmText("Create this record?");
    setConfirmDesc(
      "No data will be saved. We'll just show a success toast on the list."
    );
    setConfirmOpen(true);
  };

  const onConfirmCreate = () => {
    setConfirmOpen(false);

    // 🚫 No API calls, no uploads. Just navigate with success state.
    navigate("/admin/cancer-management", {
      state: {
        type: "success",
        title: "Added",
        message: "Cancer management record created (UI only).",
      },
    });
  };

  /* ----------------------- Date pickers ----------------------- */
  const onPickTreatmentDate = () => {
    setTempDate(treatmentDate || "");
    setOpenTreatmentModal(true);
  };
  const onPickInterviewDate = () => {
    setTempDate(interviewDate || "");
    setOpenInterviewModal(true);
  };
  const confirmTreatmentDate = () => {
    setTreatmentDate(tempDate);
    setOpenTreatmentModal(false);
  };
  const confirmInterviewDate = () => {
    setInterviewDate(tempDate);
    setOpenInterviewModal(false);
  };

  /* ----------------------- Render ----------------------- */
  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        title={confirmText}
        desc={confirmDesc}
        onConfirm={onConfirmCreate}
        onCancel={() => setConfirmOpen(false)}
      />

      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => setNotifyOpen(false)}
      />

      {/* Date modals */}
      <DateModal
        open={openTreatmentModal}
        title="Set Treatment Date"
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmTreatmentDate}
        onCancel={() => setOpenTreatmentModal(false)}
      />
      <DateModal
        open={openInterviewModal}
        title="Set Interview Date"
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmInterviewDate}
        onCancel={() => setOpenInterviewModal(false)}
      />

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        <div className="h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Cancer Management — Add</h1>
          <div>
            <Link to={"/admin/cancer-management"}>
              <img
                src="/images/back.png"
                alt="Back"
                className="h-6 cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="h-fit w-full flex flex-col gap-4">
          {/* Request Information */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Request Information</h2>
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                {status}
              </span>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* 🔍 Searchable Patient */}
              <SearchableSelect
                label="Patient Name"
                options={SAMPLE_PATIENTS}
                value={patient}
                onChange={setPatient}
              />

              {/* Read-only email preview */}
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Patient Email
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  value={patient?.email || ""}
                  placeholder="Select a patient to fill email"
                  readOnly
                />
              </div>

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Service Requested
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="">Select service</option>
                  <option value="Chemotherapy">Chemotherapy</option>
                  <option value="Radiation Therapy">Radiation Therapy</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-medium w-40">Treatment Date</span>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-gray-700">
                    {treatmentDate ? asDateString(treatmentDate) : "---"}
                  </span>
                  <button
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={onPickTreatmentDate}
                  >
                    Pick date
                  </button>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-medium w-40">Interview Schedule</span>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-gray-700">
                    {interviewDate ? asDateString(interviewDate) : "---"}
                  </span>
                  <button
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={onPickInterviewDate}
                  >
                    Pick date
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information (just inputs; no upload calls) */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Pre-Screening Form
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setPreScreeningForm(e.target.files?.[0] || null)
                  }
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {preScreeningForm && (
                  <p className="text-xs text-gray-600">
                    Selected: {preScreeningForm.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Well Being Form</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setWellBeingForm(e.target.files?.[0] || null)
                  }
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {wellBeingForm && (
                  <p className="text-xs text-gray-600">
                    Selected: {wellBeingForm.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Required Documents (multiple)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => handleMultiFiles(e, setRequiredDocuments)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {requiredDocuments.length > 0 && (
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    {requiredDocuments.map((f, i) => (
                      <li key={i} className="truncate">
                        • {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Lab Results (multiple)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => handleMultiFiles(e, setLabResults)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {labResults.length > 0 && (
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    {labResults.map((f, i) => (
                      <li key={i} className="truncate">
                        • {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* LOA Actions (UI only) */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">LOA Actions</h2>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Letter of Authority
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setLoaFile(e.target.files?.[0] || null)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {loaFile && (
                  <p className="text-xs text-gray-600">
                    Selected: {loaFile.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Case Summary</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setCaseSummaryFile(e.target.files?.[0] || null)
                  }
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
                {caseSummaryFile && (
                  <p className="text-xs text-gray-600">
                    Selected: {caseSummaryFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-md shadow border border-black/10 px-5 py-4 flex items-center justify-end gap-3">
            <Link
              to="/admin/cancer-management"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
            >
              Save Record
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCancerManagementAdd;
