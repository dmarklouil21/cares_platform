import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

import SystemLoader from "src/components/SystemLoader";

import api from "src/api/axiosInstance";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";

/* =========================
   Searchable Select (same UX pattern)
   ========================= */
const SearchableSelect = ({
  label = "Patient Name",
  placeholder = "Search patient...",
  options = [],
  value = null,
  onChange,
  errors = {}
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
      <label className="text-sm font-medium block mb-1">{label} <span className="text-red-500">*</span></label>
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
      {errors.patient && !value && (
        <span className="text-red-500 text-xs">
          {errors.patient}
        </span>
      )}
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: <span className="font-medium">{value.full_name}</span>{" "}
          <span className="text-gray-400">({value.email})</span>
        </p>
      )}
    </div>
  );
};

const LIST_PATH = "/admin/survivorship/hormonal-replacement";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-5 w-5 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const AdminHormonalReplacementAdd = () => {
  const navigate = useNavigate();

  // ===== LOA GENERATION (shown first) =====
  const [patient, setPatient] = useState(null); // { id, full_name, email, age, address }
  const [patientTable, setPatientTable] = useState([]);
  const [age, setAge] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [date, setDate] = useState("");
  const [medicines, setMedicines] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [status, setStatus] = useState("Approved");
  // const [serviceProvider, setServiceProvider] = useState("Chong Hua Hospital Mandaue")

  const requiredDocs = REQUIRED_DOCS["Hormonal Replacement"];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];

  // helper to build a cleared files map
  const makeEmptyFiles = () =>
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {});
  const [files, setFiles] = useState(makeEmptyFiles);

  const allUploaded = useMemo(
    () => requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );
  const inputRef = useRef(null);

  // ===== Request Post-Treatment Labs (separate card) =====
  // Send Report Modal
  const [labRequestModal, setLabRequestModal] = useState(false);
  const [labRequestFile, setLabRequestFile] = useState(null);
  // const [labRequest, setLabRequest] = useState("");
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

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("info");

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/");
      setPatientTable(response.data);
      console.log("Responses: ", response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChooseFile = () => inputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDoc) {
      setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
    e.target.value = ""; // allow reselecting the same file
  };

  const isValid = useMemo(() => {
    return (
      patient &&
      date &&
      medicines.trim()
    );
  }, [
    patient,
    // age,
    date,
    medicines,
  ]);

  const validate = () => {
    const newErrors = {};

    if (!patient)
      newErrors["patient"] = "Select a patient."
    if (!medicines.trim())
      newErrors["medicines_requested"] = "Please input the medicines."
    if (!date)
      newErrors["released_date"] = "Release date is required."

    if (date && date < new Date().toISOString().split('T')[0])
      newErrors["released_date"] = "Date should not be in the past.";

    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const doSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_id", patient.patient_id);
      formData.append("status", "Approved");
      formData.append("medicines_requested", medicines);
      formData.append("released_date", date);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      await api.post(
        `/survivorship/hormonal-replacement/create/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      navigate("/admin/survivorship/hormonal-replacement", {
        state: { type: "success", message: "Created Successfully." },
      });
    } catch (error) {
      let errorMessage = "Something went wrong while submitting the form.";
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.data.detail){
          errorMessage = error.response.data.detail;
        }
      }
      setNotification(errorMessage);
      setNotificationType("error");
      setTimeout(() => setNotification(""), 3000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmSelectedFile = () => {
    setLabRequestModal(false);
    console.log("Selected File: ", labRequestFile)
  };

  return (
    <>
      {loading && <SystemLoader />}
      {/* Global Modals (same components you already use) */}
      <ConfirmationModal
        open={confirmOpen}
        title="Create this post-treatment record?"
        desc="Please review all details before submitting."
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="h-screen w-full flex p-5 gap-4 flex-col justify-start items-center bg-gray overflow-auto">
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Hormonal Replacement Medication</h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Select Patient (Searchable) */}
            <div className="w-full">
              <SearchableSelect
                label="Patient Name"
                options={patientTable}
                value={patient}
                onChange={setPatient}
                placeholder="Type to search by name or email..."
                errors={errors}
              />
            </div>

            {/* Auto-filled (editable) */}
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Diagnosis {/* <span className="text-red-500">*</span> */}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={patient?.diagnosis[0]?.diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Autofill field"
                readOnly
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Medicines <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                placeholder="e.g., Biogesic, Neozep"
              />
              {errors.medicines_requested && (
                <span className="text-red-500 text-xs">
                  {errors.medicines_requested}
                </span>
              )}
            </div>

            {/* <div className="w-full">
              <label className="text-sm font-medium block mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approve</option>
                <option value="Completed">Complete</option>
                <option value="Follow-up Required">Follow-up Required</option>
                {/* <option value="Reject">Reject</option> *s/}
              </select>
            </div> */}

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Release Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.released_date && (
                <span className="text-red-500 text-xs">
                  {errors.released_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">
              Requirements
            </h2>
          </div>
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

            <div
              onClick={handleChooseFile}
              className="m-5 border border-gray-200 rounded-xl bg-primary/20 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center h-36"
            >
              <div className="px-1.5 py-1 bg-primary rounded-4xl">
                <img
                  src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                  alt="Upload"
                  className="h-6"
                />
              </div>
              <div className="text-sm text-gray-700">
                Choose a file to upload
              </div>
              <div className="text-xs text-gray-400">Size limit: 10MB</div>

              {files[activeDoc?.key] && (
                <div className="mt-3 text-xs text-gray-700">
                  Selected:{" "}
                  <span className="font-medium">
                    {files[activeDoc.key].name}
                  </span>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods"
              onChange={handleFileSelect}
              className="hidden"
            />
        </div>

        {/* Bottom actions */}
        <div className="w-full flex justify-around pb-6">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            to={LIST_PATH}
          >
            Cancel
          </Link>
          {allUploaded ? (
            <button
              type="button"
              onClick={handleSave}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              Save
            </button>
            ) : (
              <div className="text-[12px] md:text-sm text-gray-600 max-w-auto">
                Please upload <span className="font-semibold">all</span>{" "}
                required files to enable submit.
              </div>
          )}
          {/* <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!isValid}
            className={`text-center font-bold text-white py-2 w-full md:w-[30%] rounded-md shadow ${
              !isValid
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:opacity-90"
            }`}
            // className={`text-center font-bold text-white py-2 w-full md:w-[30%] rounded-md shadow bg-primary hover:opacity-90`}
            title={!isValid ? "Complete required fields" : ""}
          >
            Save
          </button> */}
        </div>
      </div>
    </>
  );
};

export default AdminHormonalReplacementAdd;
