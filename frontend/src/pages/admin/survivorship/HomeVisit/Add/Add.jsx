import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  MapPin, 
  FileText, 
  Search, 
  Save, 
  ArrowLeft,
  Activity
} from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal"; 
import SystemLoader from "src/components/SystemLoader";

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

const TextAreaGroup = ({ label, name, value, onChange, required, error, placeholder, rows = 3 }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
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

const HomeVisitAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state;

  // --- Form State ---
  const [form, setForm] = useState({
    patient_id: "",
    purpose_of_visit: "",
    prepared_by: "",
    approved_by: "",
    status: "Pending",
    well_being_data: {} // Default empty object
  });

  const [patientTable, setPatientTable] = useState([]);
  const [patient, setPatient] = useState(null);
  
  // --- UX State ---
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });
  
  // Fetch Patients
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

  // Restore State logic (if coming back from Wellbeing)
  useEffect(() => {
    if (record) {
      if (record.form) setForm(record.form);
      if (record.patient) setPatient(record.patient);
      
      // Merge new wellbeing data if available
      if (record.wellBeingData) {
         setForm(prev => ({ ...prev, well_being_data: record.wellBeingData }));
      }
    }
  }, [record]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if(errors[name]) setErrors(prev => ({...prev, [name]: undefined}));
  };

  const validate = () => {
    const newErrors = {};
    if (!patient) newErrors.patient = "Required";
    if (!form.purpose_of_visit.trim()) newErrors.purpose_of_visit = "Required";
    if (!form.prepared_by.trim()) newErrors.prepared_by = "Required";
    if (!form.approved_by.trim()) newErrors.approved_by = "Required";
    
    return newErrors;
  };

  const handleSave = (e) => {
    e.preventDefault();
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

  const onConfirmCreate = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const payload = {
        ...form,
        patient_id: patient.patient_id // Ensure patient ID is synced
      };

      await api.post("survivorship/home-visit/create/", payload);
      
      navigate("/admin/survivorship", {
        state: { flash: "Home visit record created." },
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

  const handleAddWellbeing = () => {
    if(!patient) {
        setErrors({patient: "Please select a patient first"});
        return;
    }
    
    navigate("/admin/survivorship/add/well-being-form", { 
      state: { 
          patient,
          form // Pass current form state to preserve inputs
      }
    });
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {loading && <SystemLoader />}
      
      <ConfirmationModal
        open={confirmOpen}
        title="Create Home Visit Record?"
        desc="This will add a new home visit entry for the selected patient."
        onConfirm={onConfirmCreate}
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
            Add Home Visit
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">New Visit Record</h1>
                        <p className="text-xs text-gray-500 mt-1">Record details for patient home visitation.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* LEFT COLUMN: Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-green-500 pl-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> Visit Information
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
                            label="Patient ID" 
                            value={patient?.patient_id || ""} 
                            readOnly 
                            placeholder="Auto-filled"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup 
                                label="Prepared By" 
                                name="prepared_by"
                                value={form.prepared_by} 
                                onChange={handleChange}
                                placeholder="e.g. Nurse Alma"
                                required
                                error={errors.prepared_by}
                            />
                            <InputGroup 
                                label="Approved By" 
                                name="approved_by"
                                value={form.approved_by} 
                                onChange={handleChange}
                                placeholder="e.g. Dr. Ramos"
                                required
                                error={errors.approved_by}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Narrative & Extras */}
                <div className="space-y-6 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> Narrative Report
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                        <TextAreaGroup 
                            label="Purpose of Visit"
                            name="purpose_of_visit"
                            value={form.purpose_of_visit}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter purpose or objectives..."
                            required
                            error={errors.purpose_of_visit}
                        />

                        {/* Additional Option Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-700">Wellbeing Assessment</span>
                                    <span className="text-xs text-gray-500">Optional assessment form</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={handleAddWellbeing}
                                className="text-xs font-bold text-white bg-primary px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                {Object.keys(form.well_being_data).length > 0 ? "Edit Form" : "Add Form"}
                            </button>
                        </div>
                        {Object.keys(form.well_being_data).length > 0 && (
                            <p className="text-xs text-green-600 font-medium text-right mt-[-10px]">
                                ✓ Form data attached
                            </p>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="w-full flex justify-around mt-6 mb-2">
                <button
                    type="button"
                    onClick={() => navigate("/admin/survivorship")}
                    // className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    // className="flex items-center gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
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

export default HomeVisitAdd;