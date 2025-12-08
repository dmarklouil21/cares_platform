import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Save, 
  ArrowLeft,
  Pill,
  User,
  Calendar
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
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// --- Styled Searchable Select ---
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

const LIST_PATH = "/admin/treatment-assistance/pre-cancerous";

const AdminHormonalReplacementAdd = () => {
  const navigate = useNavigate();

  // State
  const [patientTable, setPatientTable] = useState([]);
  const [patient, setPatient] = useState(null);
  
  const [diagnosis, setDiagnosis] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Approved");
  const [interpretationOfResult, setInterpretationOfResult] = useState("Negative");
  const [destinationName, setDestinationName] = useState("Rafi - EJACC"); // Default/Hidden if needed

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
        setPatientTable(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchData();
  }, []);

  // Update Diagnosis when patient changes
  useEffect(() => {
    if (patient && patient.diagnosis && patient.diagnosis.length > 0) {
        setDiagnosis(patient.diagnosis[0].diagnosis || "");
    } else {
        setDiagnosis("");
    }
  }, [patient]);

  const validate = () => {
    const newErrors = {};
    if (!patient) newErrors.patient = "Required";
    if (!date) newErrors.release_date_of_meds = "Required";
    if (!interpretationOfResult) newErrors.interpretation_of_result = "Required";

    if (date && date < new Date().toISOString().split('T')[0]) {
        newErrors.release_date_of_meds = "Cannot be in past";
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
      formData.append("status", "Approved"); // Hardcoded as per your logic
      formData.append("interpretation_of_result", interpretationOfResult);
      formData.append("release_date_of_meds", date);
      formData.append("request_destination", "Rafi - EJACC");
      formData.append("destination_name", destinationName);

      await api.post(`/precancerous/create/`, formData, {
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
        title="Create Medication Record?"
        desc="This will create a new pre-cancerous medication record."
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

      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-5xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Add Pre-Cancerous Medication
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Medication Record</h1>
                        <p className="text-xs text-gray-500 mt-1">Select patient and record medication details.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Left Column */}
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

                         {/* Diagnosis Auto-fill */}
                         <InputGroup 
                            label="Diagnosis" 
                            value={diagnosis} 
                            readOnly 
                            placeholder="Auto-filled upon selection"
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-purple-500 pl-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> Treatment Details
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                        <SelectGroup 
                            label="Interpretation of Result"
                            value={interpretationOfResult}
                            onChange={(e) => setInterpretationOfResult(e.target.value)}
                            required
                            error={errors.interpretation_of_result}
                            options={[
                                { value: "Negative", label: "Negative" },
                                { value: "ASC-US", label: "ASC-US" },
                                { value: "HPV Positive", label: "HPV Positive" },
                                { value: "Unsatisfactory", label: "Unsatisfactory" }
                            ]}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputGroup 
                                label="Release Date" 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                required 
                                error={errors.release_date_of_meds}
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
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
                    Save Record
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default AdminHormonalReplacementAdd;