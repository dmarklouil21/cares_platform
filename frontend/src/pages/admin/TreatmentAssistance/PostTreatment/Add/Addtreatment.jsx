import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Check, 
  Search, 
  Pill,
  Save,
  ArrowLeft,
  User
} from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal"; // Using standard modal
import SystemLoader from "src/components/SystemLoader";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";
import api from "src/api/axiosInstance";

// --- Reusable UI Helpers ---

const InputGroup = ({ label, name, type = "text", value, onChange, required, error, placeholder, readOnly, ...props }) => (
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
      readOnly={readOnly}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
        error ? 'border-red-500 bg-red-50' : readOnly ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300 bg-white'
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
      
      <button
        type="button" 
        className={`w-full border rounded-md px-3 py-2 text-sm flex items-center justify-between cursor-pointer bg-white text-left ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
            {value ? value.full_name : placeholder}
        </span>
        <Search className="w-4 h-4 text-gray-400" />
      </button>

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

const LIST_PATH = "/admin/treatment-assistance/post-treatment";

const AdminPostTreatmentAdd = () => {
  const navigate = useNavigate();

  // State
  const [patientTable, setPatientTable] = useState([]);
  const [patient, setPatient] = useState(null);
  
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Approved");
  const [providerName, setProviderName] = useState("Chong Hua Hospital Mandaue");

  // UX State
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  // File Upload State
  const requiredDocs = REQUIRED_DOCS["Post Treatment"] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];
  const inputRef = useRef(null);

  const [files, setFiles] = useState(() => 
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {})
  );

  const allUploaded = useMemo(
    () => requiredDocs.length > 0 && requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );

  // Load Patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/patient/list/");
        setPatientTable(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchData();
  }, []);

  // Update Diagnosis
  useEffect(() => {
    if (patient && patient.diagnosis && patient.diagnosis.length > 0) {
        setDiagnosis(patient.diagnosis[0].diagnosis || "");
    } else {
        setDiagnosis("");
    }
  }, [patient]);

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
    if (!procedure.trim()) newErrors.procedure_name = "Required";
    if (!date) newErrors.laboratory_test_date = "Required";

    if (date && date < new Date().toISOString().split('T')[0]) {
        newErrors.laboratory_test_date = "Cannot be in past";
    }

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

  const doSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_id", patient.patient_id);
      formData.append("status", status); // "Approved"
      formData.append("procedure_name", procedure);
      formData.append("laboratory_test_date", date);
      formData.append("service_provider", providerName);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      await api.post(`/post-treatment/create/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(LIST_PATH, {
        state: { flash: "Record created successfully." },
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
        title="Create Post-Treatment Record?"
        desc="This will create a new post-treatment lab request record."
        onConfirm={doSubmit}
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
            Add Post Treatment
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header / Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">New Lab Request</h1>
                        <p className="text-xs text-gray-500 mt-1">Select patient and input procedure details.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* LEFT COLUMN: Request Information */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-purple-500 pl-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> Patient Details
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <SearchableSelect 
                            label="Patient Name"
                            placeholder="Search by name or ID..."
                            options={patientTable}
                            value={patient}
                            onChange={setPatient}
                            error={errors.patient}
                        />

                         <InputGroup 
                            label="Diagnosis" 
                            value={diagnosis} 
                            readOnly 
                            placeholder="Auto-filled upon selection"
                        />

                        <InputGroup 
                            label="Procedure Name" 
                            value={procedure} 
                            onChange={(e) => setProcedure(e.target.value)} 
                            placeholder="e.g. Basic Metabolic Panel"
                            required
                            error={errors.procedure_name}
                        />

                        <InputGroup 
                            label="Lab Test Date" 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            required 
                            error={errors.laboratory_test_date}
                        />

                        <SelectGroup 
                            label="Service Provider"
                            value={providerName}
                            onChange={(e) => setProviderName(e.target.value)}
                            options={[{ value: "Chong Hua Hospital Mandaue", label: "Chong Hua Hospital Mandaue" }]}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: File Uploads */}
                <div className="space-y-6 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> Required Documents
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
            <div className="flex justify-around print:hidden mt-6">
                <button
                    type="button"
                    onClick={() => navigate(LIST_PATH)}
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={requiredDocs.length > 0 && !allUploaded}
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
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

export default AdminPostTreatmentAdd;