import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal"

import SystemLoader from "src/components/SystemLoader";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";

import api from "src/api/axiosInstance";

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

const AdminCancerManagementAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const record = location?.state;

  const { wellBeingData } = location.state || {};

  /* ----------------------- Request Information ----------------------- */
  const [patientTable, setPatientTable] = useState([]);
  const [patient, setPatient] = useState(null); // from SearchableSelect
  const [serviceType, setServiceType] = useState("");
  const [status, setStatus] = useState("Interview Process"); 
  const [providerName, setProviderName] = useState("Chong Hua Hospital Mandaue");

  // Optional dates
  const [treatmentDate, setTreatmentDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const [openInterviewModal, setOpenInterviewModal] = useState(false);
  const [tempDate, setTempDate] = useState("");

  /* ----------------------- Files (UI only) ----------------------- */
  const requiredDocs = REQUIRED_DOCS[serviceType] || [];

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

  const [loading, setLoading] = useState(false);

  // Add Lab Result File Modal
  const [addResultFileModal, setAddResultFileModal] =
    useState(false);
  const [labResultFile, setLabResultFile] = useState(null);
  // const [wellBeingData, setWellBeingData] = useState({});

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "info",
    title: "Heads up",
    message: "",
  });

  const handleChooseFile = () => inputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDoc) {
      setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
    e.target.value = ""; // allow reselecting the same file
  };

  const onFilePicked = (f) => {
    if (!f) return;
    const docKey = activeDoc.key;
    setFiles((prev) => ({ ...prev, [docKey]: f }));
  };

  const handleMultiFiles = (e, setter) => {
    const files = Array.from(e.target.files || []);
    setter(files);
  };

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

  // useEffect(() => {
  //   if (record) {
  //     setWellBeingData(record.wellBeningData);
  //     setPatient(record.patient);
  //     // setForm((prev) => {
  //     //   return {
  //     //     ...prev,
  //     //     well_being_data: record.wellBeingData
  //     //   }
  //     // })
  //   }
  //   // if (record?.patient) {
  //   //   setPatient(record.patient);
  //   // }
  // }, [record]);
  console.log("Wellbeing Data: ", wellBeingData);
  // console.log("Record: ", record);

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
  const handleSave = () => {
    // if (!validate()) return;
    // setConfirmText("Create this record?");
    // setConfirmDesc(
    //   "No data will be saved. We'll just show a success toast on the list."
    // );
    setConfirmOpen(true);

  };

  const onConfirmCreate = async () => {
    setConfirmOpen(false);

    const formData = new FormData();
    // append well-being data as JSON
    formData.append("patient_id", patient.patient_id);
    formData.append("well_being_data", JSON.stringify(wellBeingData));
    formData.append("service_type", serviceType);
    formData.append("interview_date", interviewDate);
    formData.append("service_provider", providerName);
    // append files
    for (const key in files) {
      if (files[key]) {
        formData.append(`files.${key}`, files[key]);
      }
    }

    setLoading(true);

    try {
      await api.post("/cancer-management/cancer-treatment/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // alert("Submitted successfully");
      navigate("/admin/cancer-management", {
        state: {
          type: "success",
          message: "Submitted Successfully.",
        },
      });
    } catch (error) {
      alert(error);
      console.error();
    } finally {
      setLoading(false);
    }

    setActiveIdx(0); // go back to Quotation
    if (inputRef.current) inputRef.current.value = ""; // clear hidden input
  };

   // 2) show success notification
    // setNotif("Documents submitted successfully!");
    // setTimeout(() => setNotif(""), 4000);

    // 3) CLEAR everything
    // setFiles(makeEmptyFiles()); // reset all uploaded files

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

  const handleAddWellbeingForm = () => {
    navigate("/admin/cancer-management/add/well-being-form", { 
      state: { wellBeingData,
        patient
      }}
    )
  };

  /* ----------------------- Render ----------------------- */
  return (
    <>
      {loading && <SystemLoader />}
      
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

      <FileUploadModal
        open={addResultFileModal}
        title="Add Lab Result"
        // recipient={recorpatient?.email}
        onFileChange={setLabResultFile}
        // onConfirm={handleSendCaseSummary}
        onCancel={() => setAddResultFileModal(false)}
      />

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="h-[10%] px-5 w-full flex justify-between items-center">
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
        </div> */}

        {/* Content */}
        <div className="h-fit w-full flex flex-col gap-4">
          {/* Request Information */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Cancer Management</h2>
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                {status}
              </span>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* 🔍 Searchable Patient */}
              <SearchableSelect
                label="Patient Name"
                options={patientTable}
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
                  <option value="Radiotherapy">Radiation Therapy</option>
                  <option value="Radioactive Therapy">Radioactive Iodine Therapy</option>
                  <option value="Brachytherapy">Brachytherapy</option>
                  <option value="Chemotherapy">Chemotherapy</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Interview Process">Interview Process</option>
                  <option value="Approved">Approve</option>
                  <option value="Completed">Complete</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  {/* <option value="Reject">Reject</option> */}
                </select>
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

              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              {/* <div className="flex gap-2 items-center">
                <span className="font-medium w-40">Interview Schedule</span>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-gray-700">
                    {interviewDate && asDateString(interviewDate)}
                  </span>
                  {/* <button
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={onPickInterviewDate}
                  >
                    Pick date
                  </button> *s/}
                  {interviewDate ? ( 
                    <span 
                      // to={"/admin/survivorship/add/well-being-form"}
                      // state={patient}
                      // onClick={handleAddWellbeingForm}
                      onClick={() => setDateModalOpen(true)}
                      className="text-sm text-blue-700 cursor-pointer"
                    >
                      Edit
                    </span>
                    ): (
                      <span
                        className="text-blue-700 cursor-pointer"
                        onClick={onPickInterviewDate}
                      >
                        Add
                      </span>
                    ) 
                  }
                </div>
              </div> */}

              {/* <div className="flex gap-2 items-center">
                <span className="font-medium w-40">Treatment Date</span>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-gray-700">
                    {treatmentDate && asDateString(treatmentDate)}
                  </span>
                  {treatmentDate ? (
                    <span 
                      // to={"/admin/survivorship/add/well-being-form"}
                      // state={patient}
                      // onClick={handleAddWellbeingForm}
                      onClick={() => setDateModalOpen(true)}
                      className="text-sm text-blue-700 cursor-pointer"
                    >
                      Edit
                    </span>
                  ) : (
                    <span
                        className="text-blue-700 cursor-pointer"
                        onClick={onPickTreatmentDate}
                      >
                        Add
                      </span>
                    ) 
                  }
                </div>
              </div> */}

            </div>
          </div>

          {/* Additional Information (just inputs; no upload calls) */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* <div className="flex flex-col gap-1">
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
              </div> */}

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <span className="font-medium w-40">Wellbeing Form</span>
                  <button 
                    // to={"/admin/survivorship/add/well-being-form"}
                    // state={patient}
                    onClick={handleAddWellbeingForm}
                    className="text-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {/* <label className="text-sm font-medium">Well Being Form</label>
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
                )} */}
              </div>

              {/* <div className="flex flex-col gap-1">
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
              </div> */}

              {/* <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <span className="font-medium w-40">Lab Result</span>
                  <button 
                    // to={"/admin/survivorship/add/well-being-form"}
                    // state={patient}
                    onClick={() => setAddResultFileModal(true)}
                    className="text-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                  { labResultFile && 
                    <span className="font-medium w-40 text-gray-700">{labResultFile}</span>
                  }
                </div>
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3">
              <h2 className="text-lg font-semibold">Requirements</h2>
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

          {/* Actions */}
          <div className="w-full flex justify-around pb-6">
            <Link
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
              to={"/admin/cancer-management"}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCancerManagementAdd;
