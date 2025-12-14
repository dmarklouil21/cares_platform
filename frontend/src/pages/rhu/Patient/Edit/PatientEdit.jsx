import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Briefcase, 
  AlertCircle, 
  Info,
  ArrowRight,
  Upload
} from "lucide-react";

import api from "src/api/axiosInstance";
import barangayData from "src/constants/barangayData";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

const DEFAULT_CONTACT = {
  name: "",
  address: "",
  relationship_to_patient: "",
  email: "",
  landline_number: "",
  mobile_number: "",
};

function ensureTwoContacts(arr) {
  const out = Array.isArray(arr) ? [...arr] : [];
  while (out.length < 2) out.push({ ...DEFAULT_CONTACT });
  return out.slice(0, 2).map((c) => ({ ...DEFAULT_CONTACT, ...c }));
}

// --- UI Helpers (Defined outside) ---
const InputGroup = ({ label, name, type = "text", value, required = false, error, onChange, ...props }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, name, value, options, required = false, error, onChange, disabled = false }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 text-gray-400' : ''}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const PatientMasterListEdit = () => {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    suffix: "",
    sex: "Male",
    civil_status: "",
    number_of_children: 0,
    address: "",
    city: "",
    barangay: "",
    mobile_number: "",
    email: "",
    source_of_information: "",
    other_rafi_programs_availed: "",
    highest_educational_attainment: "",
    occupation: "",
    source_of_income: "",
    monthly_income: "",
    registered_by: "self",
    emergency_contacts: [DEFAULT_CONTACT, DEFAULT_CONTACT],
  });

  const [photoUrl, setPhotoUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  const getBarangays = () => {
    if (!form.city) return [];
    return (barangayData[form.city] || []).map(b => ({ value: b, label: b }));
  };

  const getCities = () => Object.keys(barangayData).map(city => ({ 
      value: city, 
      label: city.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }));

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/patient/details/${patient_id}/`);
        if (!isMounted) return;

        setForm({
            ...data,
            emergency_contacts: ensureTwoContacts(data.emergency_contacts),
            number_of_children: parseInt(data.number_of_children || 0),
        });
        setPhotoUrl(data.photo_url);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        if(isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [patient_id]);

  // --- Handlers ---

  const handle2x2Change = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setImageFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setForm((prev) => ({ ...prev, city: value, barangay: "" }));
      return;
    }

    if (name.startsWith("emergencyContact")) {
      const [contactKey, field] = name.split(".");
      const index = contactKey === "emergencyContact1" ? 0 : 1;

      setForm((prev) => {
        const updatedContacts = [...prev.emergency_contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        return { ...prev, emergency_contacts: updatedContacts };
      });
      
      const errorKey = `emergency_contact_${index}_${field}`;
      if (errors[errorKey]) {
          setErrors(prev => ({...prev, [errorKey]: null}));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "number_of_children" ? parseInt(value, 10) || 0 : value,
    }));
    
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = {
      first_name: "First name is required.",
      last_name: "Last name is required.",
      date_of_birth: "Birthdate is required.",
      sex: "Sex is required.",
      civil_status: "Civil status is required.",
      barangay: "Barangay is required.",
      address: "Address is required.",
      email: "Email is required.",
      city: "City is required.",
      mobile_number: "Mobile number is required.",
      source_of_information: "Source is required.",
      highest_educational_attainment: "Education is required.",
      occupation: "Occupation is required.",
      source_of_income: "Income source is required.",
      monthly_income: "Income is required.",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!form[field] || !form[field].toString().trim()) {
        newErrors[field] = message;
      }
    });

    if (form["date_of_birth"] > new Date().toISOString().split('T')[0])
      newErrors["date_of_birth"] = "Date cannot be in future.";

    // Validate emergency contacts (Both Required)
    form.emergency_contacts.forEach((contact, index) => {
        if (!contact.name.trim()) newErrors[`emergency_contact_${index}_name`] = "Required";
        if (!contact.relationship_to_patient.trim()) newErrors[`emergency_contact_${index}_relationship`] = "Required";
        if (!contact.address.trim()) newErrors[`emergency_contact_${index}_address`] = "Required";
        if (!contact.email.trim()) newErrors[`emergency_contact_${index}_email`] = "Required";
        if (!contact.mobile_number.trim()) newErrors[`emergency_contact_${index}_mobile_number`] = "Required";
    });

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setModalInfo({ type: "error", title: "Validation Error", message: "Please check the highlighted fields." });
      setShowModal(true);
      return;
    }

    navigate(`/rhu/patients/edit/${patient_id}/cancer-data`, {
      state: {
        formData: { ...form },
        photoUrl: imageFile, 
      },
    });
  };

  if (loading) return <SystemLoader />;

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
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
            Edit Patient Profile
        </h2>

        {/* Main Form Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header / Photo Upload */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-gray-100 pb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-2">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Upload Photo</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-sm">
                        <Upload className="w-3 h-3" />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handle2x2Change} />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {form.first_name || "New"} {form.last_name || "Patient"}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono mt-1">ID: {form.patient_id || "---"}</p>
                    <p className="text-xs text-gray-400 mt-2">Update the patient's personal and socioeconomic information below.</p>
                </div>
            </div>

            {/* Form Grid */}
            <form className="space-y-8">
                
                {/* 1. Basic Information */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <InputGroup label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required error={errors.first_name} />
                        <InputGroup label="Middle Name" name="middle_name" value={form.middle_name} onChange={handleChange} />
                        <InputGroup label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required error={errors.last_name} />
                        
                        <InputGroup label="Suffix" name="suffix" value={form.suffix} onChange={handleChange} />
                        <SelectGroup 
                            label="Sex" 
                            name="sex" 
                            value={form.sex} 
                            onChange={handleChange}
                            required 
                            error={errors.sex}
                            options={[{value: '', label: 'Select Sex'}, {value: 'Male', label: 'Male'}, {value: 'Female', label: 'Female'}]} 
                        />
                        <InputGroup label="Birthdate" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required error={errors.date_of_birth} />

                        <SelectGroup 
                            label="Civil Status" 
                            name="civil_status" 
                            value={form.civil_status} 
                            onChange={handleChange}
                            required 
                            error={errors.civil_status}
                            options={[
                                {value: '', label: 'Select Status'},
                                {value: 'single', label: 'Single'},
                                {value: 'married', label: 'Married'},
                                {value: 'widower', label: 'Widower'},
                                {value: 'separated', label: 'Separated'},
                                {value: 'co-habitation', label: 'Co-Habitation'},
                                {value: 'annulled', label: 'Annulled'}
                            ]} 
                        />
                        <InputGroup label="No. of Children" name="number_of_children" type="number" value={form.number_of_children} onChange={handleChange} />
                    </div>
                </div>

                {/* 2. Contact & Address */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> Contact & Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                           <InputGroup label="Permanent Address" name="address" value={form.address} onChange={handleChange} required error={errors.address} />
                        </div>
                        <SelectGroup 
                           label="City / Municipality" 
                           name="city" 
                           value={form.city} 
                           onChange={handleChange} 
                           required 
                           error={errors.city}
                           options={[{value: '', label: 'Select City'}, ...getCities()]}
                        />
                        <SelectGroup 
                           label="Barangay" 
                           name="barangay" 
                           value={form.barangay} 
                           onChange={handleChange} 
                           required 
                           error={errors.barangay}
                           disabled={!form.city}
                           options={[{value: '', label: form.city ? 'Select Barangay' : 'Select City First'}, ...getBarangays()]}
                        />
                        <InputGroup label="Mobile Number" name="mobile_number" value={form.mobile_number} onChange={handleChange} required error={errors.mobile_number} />
                        <InputGroup label="Email Address" name="email" value={form.email} onChange={handleChange} required error={errors.email} />
                    </div>
                </div>

                {/* 3. Socioeconomic */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" /> Socioeconomic Data
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="Highest Education" name="highest_educational_attainment" value={form.highest_educational_attainment} onChange={handleChange} required error={errors.highest_educational_attainment} />
                        <InputGroup label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} required error={errors.occupation} />
                        <InputGroup label="Source of Income" name="source_of_income" value={form.source_of_income} onChange={handleChange} required error={errors.source_of_income} />
                        <InputGroup label="Monthly Income" name="monthly_income" value={form.monthly_income} onChange={handleChange} required error={errors.monthly_income} />
                    </div>
                </div>

                {/* 4. Emergency Contacts */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" /> Emergency Contacts
                    </h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Contact 1 */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4 relative">
                            <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-400 uppercase">Primary Contact</span>
                            <InputGroup label="Name" name="emergencyContact1.name" value={form.emergency_contacts[0].name} onChange={handleChange} required error={errors['emergency_contact_0_name']} />
                            <InputGroup label="Relationship" name="emergencyContact1.relationship_to_patient" value={form.emergency_contacts[0].relationship_to_patient} onChange={handleChange} required error={errors['emergency_contact_0_relationship']} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Mobile" name="emergencyContact1.mobile_number" value={form.emergency_contacts[0].mobile_number} onChange={handleChange} required error={errors['emergency_contact_0_mobile_number']} />
                                <InputGroup label="Landline" name="emergencyContact1.landline_number" value={form.emergency_contacts[0].landline_number} onChange={handleChange} />
                            </div>
                            <InputGroup label="Email" name="emergencyContact1.email" value={form.emergency_contacts[0].email} onChange={handleChange} required error={errors['emergency_contact_0_email']} />
                            <InputGroup label="Address" name="emergencyContact1.address" value={form.emergency_contacts[0].address} onChange={handleChange} required error={errors['emergency_contact_0_address']} />
                        </div>

                        {/* Contact 2 */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4 relative">
                            <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-400 uppercase">Secondary Contact</span>
                            <InputGroup label="Name" name="emergencyContact2.name" value={form.emergency_contacts[1].name} onChange={handleChange} required error={errors['emergency_contact_1_name']} />
                            <InputGroup label="Relationship" name="emergencyContact2.relationship_to_patient" value={form.emergency_contacts[1].relationship_to_patient} onChange={handleChange} required error={errors['emergency_contact_1_relationship']} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Mobile" name="emergencyContact2.mobile_number" value={form.emergency_contacts[1].mobile_number} onChange={handleChange} required error={errors['emergency_contact_1_mobile_number']} />
                                <InputGroup label="Landline" name="emergencyContact2.landline_number" value={form.emergency_contacts[1].landline_number} onChange={handleChange} />
                            </div>
                            <InputGroup label="Email" name="emergencyContact2.email" value={form.emergency_contacts[1].email} onChange={handleChange} required error={errors['emergency_contact_1_email']} />
                            <InputGroup label="Address" name="emergencyContact2.address" value={form.emergency_contacts[1].address} onChange={handleChange} required error={errors['emergency_contact_1_address']} />
                        </div>
                    </div>
                </div>

                {/* 5. Additional Info */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-400" /> Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="Source of Information" name="source_of_information" value={form.source_of_information} onChange={handleChange} required error={errors.source_of_information} />
                        <InputGroup label="Other RAFI Programs Availed" name="other_rafi_programs_availed" value={form.other_rafi_programs_availed} onChange={handleChange} />
                    </div>
                </div>

            </form>

            {/* Footer Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                    type="button"
                    onClick={() => navigate("/rhu/patients")}
                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    Next
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default PatientMasterListEdit;