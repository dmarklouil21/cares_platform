import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Check, 
  Search, 
  Save,
  ArrowLeft
} from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";
import api from "src/api/axiosInstance";

// --- Reusable UI Helpers ---

const InputGroup = ({ label, name, type = "text", value, onChange, required, error, placeholder, ...props }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, value, onChange, options, required, error }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const TextAreaGroup = ({ label, value, onChange, required, error, placeholder }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

// --- Searchable Select Component ---
const SearchableSelect = ({ label, placeholder, options = [], value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(
      (o) =>
        o.full_name.toLowerCase().includes(lowerQuery) ||
        (o.email && o.email.toLowerCase().includes(lowerQuery))
    );
  }, [query, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={ref}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <div 
        className={`w-full border rounded-md px-3 py-2 text-sm flex items-center justify-between cursor-pointer bg-white ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
            {value ? value.full_name : placeholder}
        </span>
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <ul className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-xs text-gray-500 text-center">No patients found</li>
            ) : (
                filteredOptions.map((opt) => (
                <li
                    key={opt.patient_id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                    onClick={() => {
                        onChange(opt);
                        setOpen(false);
                        setQuery("");
                    }}
                >
                    <div className="text-sm font-bold text-gray-800">{opt.full_name}</div>
                    <div className="text-xs text-gray-500">{opt.patient_id} • {opt.email || "No Email"}</div>
                </li>
                ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const AddIndividualScreening = () => {
  const navigate = useNavigate();
  
  // State
  const [patientList, setPatientList] = useState([]);
  const [patient, setPatient] = useState(null);
  
  const [procedureName, setProcedureName] = useState("");
  const [procedureDetails, setProcedureDetails] = useState("");
  const [cancerSite, setCancerSite] = useState("");
  const [screeningDate, setScreeningDate] = useState("");
  const [status, setStatus] = useState("Approved");
  const [providerName, setProviderName] = useState("Chong Hua Hospital Mandaue");

  // File Upload State
  const requiredDocs = REQUIRED_DOCS["Individual Screening"] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];
  const inputRef = useRef(null);

  const [files, setFiles] = useState(() => 
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {})
  );

  const allUploaded = useMemo(
    () => requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );

  // UX State
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  // Load Patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/patient/list/");
        setPatientList(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDoc) {
      setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
    e.target.value = ""; 
  };

  const validate = () => {
    const newErrors = {};
    if (!patient) newErrors.patient = "Required";
    if (!procedureName.trim()) newErrors.procedure_name = "Required";
    if (!cancerSite.trim()) newErrors.cancer_site = "Required";
    if (!procedureDetails.trim()) newErrors.procedure_details = "Required";
    if (!screeningDate) newErrors.screening_date = "Required";
    
    // --- UPDATED VALIDATION LOGIC ---
    if (screeningDate) {
        const today = new Date().toISOString().split('T')[0];
        if (screeningDate < today) {
            newErrors.screening_date = "Date cannot be in the past.";
        }
    }
    // -------------------------------

    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setModalInfo({ type: "error", title: "Validation Error", message: "Please check all required fields." });
      setShowModal(true);
      return;
    }
    setErrors({});
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_id", patient.patient_id);
      formData.append("status", status);
      formData.append("procedure_name", procedureName);
      formData.append("procedure_details", procedureDetails);
      formData.append("cancer_site", cancerSite);
      formData.append("screening_date", screeningDate);
      formData.append("service_provider", providerName);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      await api.post(`/cancer-screening/individual-screening/create/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/cancer-screening", {
        state: { flash: "Screening record created successfully." },
      });
    } catch (error) {
      console.error(error);
      let msg = "Something went wrong.";
      if (error.response?.data?.non_field_errors) msg = error.response.data.non_field_errors[0];
      setModalInfo({ type: "error", title: "Creation Failed", message: msg });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {loading && <SystemLoader />}
      
      <ConfirmationModal
        open={confirmOpen}
        title="Create Screening Record?"
        desc="Please confirm the details are correct. This will create a new screening entry."
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

      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Add Individual Screening
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header / Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-primary">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">New Screening Record</h1>
                        <p className="text-xs text-gray-500 mt-1">Fill in the procedure details and attach required documents.</p>
                    </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                    <span className={`text-xs font-bold uppercase ${
                        status === "Approved" ? "text-green-600" : "text-gray-700"
                    }`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* LEFT COLUMN: Form Data */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-primary pl-3">
                        Procedure Details
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <SearchableSelect 
                            label="Patient Name"
                            placeholder="Search by name or ID..."
                            options={patientList}
                            value={patient}
                            onChange={setPatient}
                            error={errors.patient}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <SelectGroup 
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                options={[
                                    { value: "Pending", label: "Pending" },
                                    { value: "Approved", label: "Approve" },
                                    { value: "In Progress", label: "In Progress" },
                                    { value: "Completed", label: "Complete" },
                                    { value: "Rejected", label: "Reject" }
                                ]}
                            />
                            <InputGroup 
                                label="Screening Date" 
                                type="date" 
                                value={screeningDate} 
                                onChange={(e) => setScreeningDate(e.target.value)} 
                                required 
                                error={errors.screening_date}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                                label="Procedure Name" 
                                placeholder="e.g. Mammogram"
                                value={procedureName} 
                                onChange={(e) => setProcedureName(e.target.value)} 
                                required 
                                error={errors.procedure_name}
                            />
                            <InputGroup 
                                label="Cancer Site" 
                                placeholder="e.g. Breast"
                                value={cancerSite} 
                                onChange={(e) => setCancerSite(e.target.value)} 
                                required 
                                error={errors.cancer_site}
                            />
                        </div>

                        <SelectGroup 
                            label="Service Provider"
                            value={providerName}
                            onChange={(e) => setProviderName(e.target.value)}
                            options={[{ value: "Chong Hua Hospital Mandaue", label: "Chong Hua Hospital Mandaue" }]}
                        />

                        <TextAreaGroup 
                            label="Procedure Details"
                            placeholder="Enter any additional notes regarding the procedure..."
                            value={procedureDetails}
                            onChange={(e) => setProcedureDetails(e.target.value)}
                            required
                            error={errors.procedure_details}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: File Uploads */}
                <div className="space-y-6 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3">
                        Required Documents
                    </h3>

                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col">
                        
                        {/* Requirement List */}
                        <div className="space-y-1 mb-6">
                            {requiredDocs.map((doc, idx) => {
                                const isUploaded = !!files[doc.key];
                                const isActive = idx === activeIdx;
                                return (
                                    <button
                                        key={doc.key}
                                        type="button"
                                        onClick={() => setActiveIdx(idx)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                                            isActive 
                                            ? "bg-white shadow-sm border border-blue-200" 
                                            : "hover:bg-gray-100 border border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${isUploaded ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}>
                                                <Check className="w-3 h-3" strokeWidth={4} />
                                            </div>
                                            <span className={`text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-600"}`}>
                                                {doc.label}
                                            </span>
                                        </div>
                                        {isActive && <span className="text-[10px] uppercase font-bold text-blue-400">Uploading</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dropzone Area */}
                        <div 
                            onClick={() => inputRef.current?.click()}
                            className="mt-auto border-2 border-dashed border-gray-300 rounded-xl bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50/50 transition-all group min-h-[160px]"
                        >
                             <div className="p-3 bg-blue-50 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                             </div>
                             
                             {files[activeDoc?.key] ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-800 break-all px-4">
                                        {files[activeDoc.key].name}
                                    </p>
                                    <p className="text-xs text-green-600 font-medium">Ready to upload</p>
                                </div>
                             ) : (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-600 group-hover:text-primary">
                                        Click to upload <span className="font-bold">{activeDoc?.label}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">Supports PDF, JPG, PNG (Max 10MB)</p>
                                </div>
                             )}

                             <input 
                                ref={inputRef}
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                    type="button"
                    onClick={() => navigate("/admin/cancer-screening")}
                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!allUploaded}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-bold shadow-md transition-all transform active:scale-95 ${
                        allUploaded 
                        ? "bg-primary hover:bg-primary/90 hover:shadow-lg" 
                        : "bg-gray-300 cursor-not-allowed shadow-none"
                    }`}
                >
                    <Save className="w-4 h-4" />
                    Create Record
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default AddIndividualScreening;