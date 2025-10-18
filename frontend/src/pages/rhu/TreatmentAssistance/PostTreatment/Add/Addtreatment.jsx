// src/pages/treatment/AdminPostTreatmentAdd.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

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

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-5 w-5 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const AdminPostTreatmentAdd = () => {
  const navigate = useNavigate();

  // ===== LOA GENERATION (shown first) =====
  const [patient, setPatient] = useState(null); // { id, full_name, email, age, address }
  const [patientTable, setPatientTable] = useState([]);
  const [age, setAge] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [date, setDate] = useState("");
  const [providerName, setProviderName] = useState("Chong Hua Hospital Mandaue");
  const [providerAddress, setProviderAddress] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [status, setStatus] = useState("Approved");
  // const [serviceProvider, setServiceProvider] = useState("Chong Hua Hospital Mandaue")

  const requiredDocs = REQUIRED_DOCS["Post Treatment"];

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

  // Defaults for date/schedule
  // useEffect(() => {
  //   const today = new Date();
  //   const yyyy = today.getFullYear();
  //   const mm = String(today.getMonth() + 1).padStart(2, "0");
  //   const dd = String(today.getDate()).padStart(2, "0");
  //   if (!date) setDate(`${yyyy}-${mm}-${dd}`);
  //   if (!schedule) setSchedule(`${yyyy}-${mm}-${dd}`);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Auto-fill Age & Address when selecting a patient
  // useEffect(() => {
  //   if (!patient) return;
  //   setAge(patient.age != null ? String(patient.age) : "");
  //   setPatientAddress(patient.address || "");
  // }, [patient]);

  const isValid = useMemo(() => {
    return (
      patient &&
      date &&
      providerName.trim() &&
      procedure.trim()
      // schedule &&
      // preparedBy.trim() &&
      // approvedBy.trim()
    );
  }, [
    patient,
    // age,
    date,
    providerName,
    // diagnosis,
    procedure
    // schedule,
    // preparedBy,
    // approvedBy,
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
      : !inputRef
      ? "Please upload the laboratory request."
      : "Please complete all required fields.";

    setNotifyInfo({ type: "info", title: "Incomplete", message: msg });
    setNotifyOpen(true);
    return false;
  };

  const doSubmit = async () => {
    if (!validateOrNotify()) return;

    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_id", patient.patient_id);
      formData.append("status", status);
      formData.append("procedure_name", procedure);
      formData.append("laboratory_test_date", date);
      formData.append("service_provider", providerName);
      console.log("Status: ", status)
      console.log("Procedure: ", procedure)
      console.log("Date: ", date)
      console.log("Service Provider: ", providerName)

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      await api.post(
        `/post-treatment/create/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      navigate("/admin/treatment-assistance/post-treatment", {
        state: { type: "success", message: "Created Successfully." },
      });
    } catch (error) {
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
      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => setNotifyOpen(false)}
      />

      {/* <FileUploadModal
        open={labRequestModal}
        title="Upload Laboratory Request"
        // recipient={data?.patient?.email}
        onFileChange={setLabRequestFile}
        // onConfirm={handleSendReport}
        onCancel={() => setLabRequestModal(false)}
      /> */}
      {/* <LoadingModal open={loading} text="Creating record..." /> */}

      {/* {labRequestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload Laboratory Request</h2>
            
            {/* <p className="text-sm text-gray-600 mb-3">
              Recipient: <span className="font-medium">{data?.patient?.email}</span>
            </p> *s/}

            <input
              type="file"
              accept="application/pdf"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
              onChange={(e) => setLabRequestFile(e.target.files[0])}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setLabRequestModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                onClick={confirmSelectedFile}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )} */}

      <div className="h-screen w-full flex p-5 gap-4 flex-col justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Add Post-Treatment Record</h1>
          <Link to={LIST_PATH}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>  */}

        {/* LOA GENERATION FIRST */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Post Treatment</h2>
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
                {/* <option value="Reject">Reject</option> */}
              </select>
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">
                Lab Test Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium block mb-1">Service Provider</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={status}
                onChange={(e) => setProviderName(e.target.value)}
              >
                <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
              </select>
            </div>

            {/* <div className="w-full">
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
            </div> */}

            {/* <div className="w-full">
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
            </div> */}

           {/*  <div className="w-full">
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
            </div> */}
          </div>
        </div>

        {/* REQUEST POST-TREATMENT LABS (second) */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">
              Requirements
            </h2>
          </div>

          {/* <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <span className="font-medium w-40">Laboratory Request </span>
                {labRequestFile && 
                  <span
                    // href={labRequestFile.url} 
                    // target="_blank" 
                    // rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {labRequestFile.name}
                  </span>
                }
                {labRequestFile ? (
                  <button 
                    // to={"/admin/survivorship/add/well-being-form"}
                    // state={patient}
                    onClick={() => setLabRequestModal(true)}
                    className="text-sm text-blue-700 cursor-pointer"
                  >
                    Edit
                  </button>
                ) : (
                  <button 
                    // to={"/admin/survivorship/add/well-being-form"}
                    // state={patient}
                    onClick={() => setLabRequestModal(true)}
                    className="text-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div> */}
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
        <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
          <Link
            className="text-center bg-white text-black py-2 w-full md:w-[30%] border border-black/15 hover:border-black rounded-md"
            to={LIST_PATH}
          >
            Cancel
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
            // className={`text-center font-bold text-white py-2 w-full md:w-[30%] rounded-md shadow bg-primary hover:opacity-90`}
            title={!isValid ? "Complete required fields" : ""}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminPostTreatmentAdd;
