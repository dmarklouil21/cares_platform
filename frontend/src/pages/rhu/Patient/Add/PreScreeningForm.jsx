import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  User, 
  Stethoscope, 
  Activity, 
  AlertCircle, 
  Calendar
} from "lucide-react";

import api from "src/api/axiosInstance";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// --- Constants ---
const DIAGNOSIS_BASIS_OPTIONS = [
  "None Microscopic", "Death Certificates Only", "Clinical Investigation",
  "Specific Tumor Markers", "Microscopic", "Cytology or Hermotology",
  "Histology of Metastasis", "Histology of Primary"
];

const PRIMARY_SITES_OPTIONS = [
  "Colon", "Brain", "Bladder", "Skin", "Kidney", "Testis", "Liver",
  "Corpus Uteri", "Urinary", "Prostate", "Nasopharnyx", "Oral Cavity",
  "Ovary", "Lung", "Gull", "Thyroid", "Rectum", "Blood", "Stomach",
  "Pancreas", "Esophagus", "Breast", "Uterine Cervix"
];

const METASTASIS_OPTIONS = [
  "None", "Destant Lymph Nodes", "Bone", "Liver(Pleura)", "Kidney",
  "Brain", "Ovary", "Skin", "Prostate", "Unknown"
];

const ADJUVANT_OPTIONS = [
  "Surgery", "Radiotherapy", "Chemotherapy", "Immunotherapy/Cytrotherapy",
  "Hormonal", "None", "Unknown"
];

// --- Reusable UI Helpers (Outside component) ---
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4 mt-6 first:mt-0">
    <Icon className="w-5 h-5 text-yellow-600" />
    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
  </div>
);

const InputGroup = ({ label, name, type = "text", value, onChange, required, error, ...props }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const TextAreaGroup = ({ label, name, value, onChange, required, error, rows = 3 }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options, required, error }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    >
      <option value="" disabled>Select</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const CheckboxGroup = ({ label, groupName, options, currentValues, onChange, error }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
      {label} {error && <span className="text-red-500 ml-2 normal-case font-normal">{error}</span>}
    </label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {options.map((opt) => {
         // Handle backend structure: array of objects {name: "Value"}
         const isChecked = Array.isArray(currentValues) && currentValues.some(item => item.name === opt);
         
         return (
            <label key={opt} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isChecked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={isChecked}
                onChange={() => onChange(groupName, opt)}
              />
              <span className="text-xs font-medium text-gray-700">{opt}</span>
            </label>
         );
      })}
    </div>
  </div>
);

const RadioGroup = ({ label, name, options, value, onChange, required, error }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={String(value) === String(opt)}
            onChange={onChange}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const PatientPreScreeningForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data passed from Step 1
  const generalData = location.state?.formData;
  const photoUrl = location.state?.photoUrl; 

  // Initial State for a fresh form
  const [form, setForm] = useState({
    referred_from: "",
    reason_for_referral: "",
    date_of_consultation: "",
    referring_doctor_or_facility: "",
    chief_complaint: "",
    date_of_diagnosis: "",
    diagnosis_basis: [], 
    primary_sites: [],
    primary_sites_other: "",
    laterality: "",
    multiple_primaries: "",
    histology: "",
    staging: "",
    t_system: "",
    n_system: "",
    m_system: "",
    distant_metastasis_sites: [],
    distant_metastasis_sites_other: "",
    final_diagnosis: "",
    final_diagnosis_icd10: "",
    treatment_purpose: "",
    treatment_purpose_other: "",
    primary_assistance_by_ejacc: "",
    date_of_assistance: "",
    adjuvant_treatments_received: [],
    adjuvant_treatments_other: "",
    other_source_treatments: [],
    other_source_treatments_other: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  useEffect(() => {
    if (!generalData) {
        // If data is missing (refresh or direct access), redirect to Step 1
        navigate("/rhu/patients/add");
    }
  }, [generalData, navigate]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const handleCheckboxChange = (groupName, value) => {
    setForm((prev) => {
      const currentValues = prev[groupName] || [];
      const exists = currentValues.some((v) => v.name === value);
      
      const updatedValues = exists
        ? currentValues.filter((v) => v.name !== value) // Remove
        : [...currentValues, { name: value }]; // Add

      return { ...prev, [groupName]: updatedValues };
    });
    if(errors[groupName]) setErrors(prev => ({...prev, [groupName]: null}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // --- Validation ---
    const requiredText = [
        "referred_from", "referring_doctor_or_facility", "reason_for_referral", "chief_complaint",
        "date_of_consultation", "date_of_diagnosis", "histology", "laterality", "staging",
        "final_diagnosis", "final_diagnosis_icd10", "treatment_purpose",
        "primary_assistance_by_ejacc", "multiple_primaries"
    ];

    requiredText.forEach(field => {
        if (!form[field]) newErrors[field] = "Required";
    });

    if(!form.t_system || !form.n_system || !form.m_system) {
        newErrors.tnm_system = "All fields required";
    }

    const requiredChecks = [
        { key: "diagnosis_basis", label: "Diagnosis Basis" },
        { key: "primary_sites", label: "Primary Site" },
        { key: "distant_metastasis_sites", label: "Metastasis Site" },
        { key: "adjuvant_treatments_received", label: "Adjuvant Treatment" },
        { key: "other_source_treatments", label: "Other Treatment" }
    ];

    requiredChecks.forEach(group => {
        if (!form[group.key] || form[group.key].length === 0) {
            newErrors[group.key] = `Select at least one option.`;
        }
    });

    // Date Validation
    const today = new Date().toISOString().split('T')[0];
    if (form.date_of_consultation > today) newErrors.date_of_consultation = "Cannot be future date";
    if (form.date_of_diagnosis > today) newErrors.date_of_diagnosis = "Cannot be future date";
    if (form.date_of_assistance && form.date_of_assistance > today) newErrors.date_of_assistance = "Cannot be future date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setModalInfo({ type: "error", title: "Validation Error", message: "Please fill in all required fields." });
      setShowModal(true);
      return;
    }

    setModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setModalOpen(false);
    setLoading(true);

    try {
        const formData = new FormData();
        
        // Handle optional date
        const finalCancerData = { ...form };
        if(!finalCancerData.date_of_assistance) finalCancerData.date_of_assistance = null;

        // Structure matches API expectations
        formData.append("cancer_data", JSON.stringify(finalCancerData));
        formData.append("general_data", JSON.stringify(generalData));
        
        if (photoUrl) {
            formData.append("photo_url", photoUrl); // photoUrl passed from state is the File object
        }

        // POST request to create new patient
        await api.post("/patient/pre-enrollment/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // Navigate back to list on success
        navigate("/rhu/patients", { state: { flash: "Patient created successfully!" }});

    } catch (error) {
        console.error(error);
        let msg = "Something went wrong while submitting the form.";
        if (error.response?.data?.non_field_errors) msg = error.response.data.non_field_errors[0];
        else if (error.response?.data?.detail) msg = error.response.data.detail;

        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: msg,
        });
        setShowModal(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        title="Create Patient Record?"
        desc="Ensure all information is correct. This will add a new patient to the system."
        onConfirm={handleConfirmSubmit}
        onCancel={() => setModalOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {loading && <SystemLoader />}

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
            
            {/* Top Title */}
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Add New Patient
            </h2>

            {/* Main Form Card */}
            <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                                Cancer Data
                            </h1>
                            <p className="text-sm text-gray-500">
                                Pre-Screening Information (Step 2 of 2)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-10">
                    
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Referral */}
                        <div className="space-y-4">
                            <SectionHeader icon={User} title="Referral Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Referred From" name="referred_from" value={form.referred_from} onChange={handleInputChange} required error={errors.referred_from} />
                                <InputGroup label="Date of Consultation" name="date_of_consultation" type="date" value={form.date_of_consultation} onChange={handleInputChange} required error={errors.date_of_consultation} />
                                <div className="col-span-1 md:col-span-2">
                                    <InputGroup label="Referring Doctor/Facility" name="referring_doctor_or_facility" value={form.referring_doctor_or_facility} onChange={handleInputChange} required error={errors.referring_doctor_or_facility} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <TextAreaGroup label="Reason for Referral" name="reason_for_referral" value={form.reason_for_referral} onChange={handleInputChange} required error={errors.reason_for_referral} />
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="space-y-4">
                            <SectionHeader icon={Stethoscope} title="Diagnosis Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Date of Diagnosis" name="date_of_diagnosis" type="date" value={form.date_of_diagnosis} onChange={handleInputChange} required error={errors.date_of_diagnosis} />
                                <div className="col-span-1 md:col-span-2">
                                    <TextAreaGroup label="Chief Complaint" name="chief_complaint" value={form.chief_complaint} onChange={handleInputChange} required error={errors.chief_complaint} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <CheckboxGroup 
                                        label="Basis of Diagnosis *" 
                                        groupName="diagnosis_basis" 
                                        options={DIAGNOSIS_BASIS_OPTIONS} 
                                        currentValues={form.diagnosis_basis} 
                                        onChange={handleCheckboxChange} 
                                        error={errors.diagnosis_basis}
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <TextAreaGroup label="Final Diagnosis" name="final_diagnosis" value={form.final_diagnosis} onChange={handleInputChange} required error={errors.final_diagnosis} />
                                </div>
                                <InputGroup label="ICD-10 Code" name="final_diagnosis_icd10" value={form.final_diagnosis_icd10} onChange={handleInputChange} required error={errors.final_diagnosis_icd10} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Pathology */}
                        <div className="space-y-4">
                            <SectionHeader icon={AlertCircle} title="Pathology & Staging" />
                            
                            <CheckboxGroup 
                                label="Primary Sites *" 
                                groupName="primary_sites" 
                                options={PRIMARY_SITES_OPTIONS} 
                                currentValues={form.primary_sites} 
                                onChange={handleCheckboxChange} 
                                error={errors.primary_sites}
                            />
                            <InputGroup label="Other Primary Sites" name="primary_sites_other" value={form.primary_sites_other} onChange={handleInputChange} placeholder="Specify other..." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <RadioGroup 
                                    label="Laterality *" 
                                    name="laterality" 
                                    options={["Left", "Right", "Bilateral", "Mild", "Not Stated"]} 
                                    value={form.laterality} 
                                    onChange={handleInputChange} 
                                    error={errors.laterality}
                                />
                                <RadioGroup 
                                    label="Multiple Primaries *" 
                                    name="multiple_primaries" 
                                    options={[1, 2, 3]} 
                                    value={form.multiple_primaries} 
                                    onChange={handleInputChange} 
                                    error={errors.multiple_primaries}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Histology (Morphology)" name="histology" value={form.histology} onChange={handleInputChange} required error={errors.histology} />
                                <SelectGroup 
                                    label="Staging" 
                                    name="staging" 
                                    value={form.staging} 
                                    onChange={handleInputChange} 
                                    required 
                                    error={errors.staging}
                                    options={["In-Situ", "Localized", "Direct Extension", "Regional Lymph Node", "3+4", "Distant Metastasis", "Unknown"]}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">TNM System *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex items-center gap-1 border rounded px-2"><span className="text-sm font-bold text-gray-400">T</span><input name="t_system" maxLength={1} value={form.t_system || ""} onChange={handleInputChange} className="w-full py-2 outline-none text-center" /></div>
                                    <div className="flex items-center gap-1 border rounded px-2"><span className="text-sm font-bold text-gray-400">N</span><input name="n_system" maxLength={1} value={form.n_system || ""} onChange={handleInputChange} className="w-full py-2 outline-none text-center" /></div>
                                    <div className="flex items-center gap-1 border rounded px-2"><span className="text-sm font-bold text-gray-400">M</span><input name="m_system" maxLength={1} value={form.m_system || ""} onChange={handleInputChange} className="w-full py-2 outline-none text-center" /></div>
                                </div>
                                {errors.tnm_system && <p className="text-xs text-red-500 mt-1">{errors.tnm_system}</p>}
                            </div>

                            <CheckboxGroup 
                                label="Distant Metastasis *" 
                                groupName="distant_metastasis_sites" 
                                options={METASTASIS_OPTIONS} 
                                currentValues={form.distant_metastasis_sites} 
                                onChange={handleCheckboxChange} 
                                error={errors.distant_metastasis_sites}
                            />
                            <InputGroup label="Other Metastasis" name="distant_metastasis_sites_other" value={form.distant_metastasis_sites_other} onChange={handleInputChange} placeholder="Specify other..." />
                        </div>

                        {/* Treatment */}
                        <div className="space-y-4">
                            <SectionHeader icon={Calendar} title="Treatment Plan" />
                            
                            <RadioGroup 
                                label="Treatment Purpose *" 
                                name="treatment_purpose" 
                                options={["Curative-Complete", "Curative-Incomplete", "Palliative Only"]} 
                                value={form.treatment_purpose} 
                                onChange={handleInputChange} 
                                error={errors.treatment_purpose}
                            />
                            <InputGroup label="Other Purpose" name="treatment_purpose_other" value={form.treatment_purpose_other} onChange={handleInputChange} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Primary Assistance (RAFI-EJACC)" name="primary_assistance_by_ejacc" value={form.primary_assistance_by_ejacc} onChange={handleInputChange} required error={errors.primary_assistance_by_ejacc} />
                                <InputGroup label="Date of Assistance" name="date_of_assistance" type="date" value={form.date_of_assistance} onChange={handleInputChange} error={errors.date_of_assistance} />
                            </div>

                            <div className="space-y-4 pt-2">
                                <CheckboxGroup 
                                    label="Adjuvant Treatments (RAFI-EJACC) *" 
                                    groupName="adjuvant_treatments_received" 
                                    options={ADJUVANT_OPTIONS} 
                                    currentValues={form.adjuvant_treatments_received} 
                                    onChange={handleCheckboxChange} 
                                    error={errors.adjuvant_treatments_received}
                                />
                                <InputGroup label="Other Adjuvant" name="adjuvant_treatments_other" value={form.adjuvant_treatments_other} onChange={handleInputChange} />

                                <CheckboxGroup 
                                    label="Treatments from Other Sources *" 
                                    groupName="other_source_treatments" 
                                    options={ADJUVANT_OPTIONS} 
                                    currentValues={form.other_source_treatments} 
                                    onChange={handleCheckboxChange} 
                                    error={errors.other_source_treatments}
                                />
                                <InputGroup label="Other Sources" name="other_source_treatments_other" value={form.other_source_treatments_other} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/rhu/patients/add", { state: { formData: generalData, photoUrl: photoUrl } })}
                        className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Submit
                    </button>
                </div>

            </div>
        </div>
        
        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
    </div>
    </>
  );
};

export default PatientPreScreeningForm;