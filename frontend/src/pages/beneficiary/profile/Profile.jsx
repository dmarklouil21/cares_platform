import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  ArrowLeft
} from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import api from "src/api/axiosInstance";

// --- Reusable Profile Input Component ---
const ProfileInput = ({ label, name, type = "text", value, onChange, disabled, placeholder, icon: Icon }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full border rounded-lg py-2.5 pl-10 pr-3 text-sm transition-all outline-none ${
          disabled 
          ? "bg-gray-50 text-gray-500 border-gray-200 cursor-default" 
          : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
        }`}
      />
      {Icon && (
        <Icon className={`w-4 h-4 absolute left-3 top-3 ${disabled ? "text-gray-400" : "text-primary"}`} />
      )}
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();

  // Mode State
  const [readOnly, setReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    age: "",
    email: "",
    phone: "",
    isResident: "",
    lgu: "",
    address: "",
    profilePic: "",
    profileFile: null,
  });

  // Backup for Cancel
  const [beforeEdit, setBeforeEdit] = useState(null);

  // UI State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  // Fetch Initial Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile/");
        const { data } = await api.get("/beneficiary/patient/details/");
        const d = res.data;
        
        const mappedData = {
          firstName: d.first_name || "",
          lastName: d.last_name || "",
          birthDate: d.date_of_birth || "",
          age: d.age != null ? String(d.age) : "",
          email: d.email || "",
          phone: d.phone_number || "",
          isResident: d.is_resident_of_cebu ? "yes" : "no",
          lgu: d.lgu || "",
          address: d.address || "",
          profilePic: data.photo_url || "/images/Avatar.png",
          profileFile: null,
        };

        setFormData(mappedData);
        setBeforeEdit(mappedData);
      } catch (err) {
        console.error("Failed to load profile", err);
        setModalInfo({ type: "error", title: "Error", message: "Failed to load profile data." });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handlers
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData((p) => ({ ...p, phone: digits }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setBeforeEdit(formData);
    setReadOnly(false);
  };

  const handleCancel = () => {
    setFormData(beforeEdit);
    setReadOnly(true);
  };

  const handleSaveClick = () => {
     // Basic Validation
     const required = ["firstName", "lastName", "birthDate", "phone", "lgu", "address"];
     const missing = required.filter(k => !formData[k]);
     
     if (missing.length > 0) {
        setModalInfo({ type: "error", title: "Missing Fields", message: "Please fill in all required fields." });
        setShowModal(true);
        return;
     }

     setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("first_name", formData.firstName);
      payload.append("last_name", formData.lastName);
      payload.append("date_of_birth", formData.birthDate);
      payload.append("phone_number", formData.phone);
      payload.append("lgu", formData.lgu);
      payload.append("address", formData.address);
      
      if (formData.isResident) {
         payload.append("is_resident_of_cebu", formData.isResident === "yes" ? "true" : "false");
      }
      
      if (formData.profileFile) {
        payload.append("avatar", formData.profileFile);
      }

      const res = await api.put("/user/profile/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update state with response (to ensure sync)
      const d = res.data;
      const updatedMap = {
        ...formData,
        profilePic: d.avatar ? `http://localhost:8000${d.avatar}` : formData.profilePic,
        profileFile: null // reset file input
      };
      
      setFormData(updatedMap);
      setBeforeEdit(updatedMap);
      setReadOnly(true);
      
      setModalInfo({ type: "success", title: "Success", message: "Profile updated successfully." });
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setModalInfo({ type: "error", title: "Update Failed", message: "Could not save profile changes." });
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Profile Picture Handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePic: reader.result,
          profileFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
      navigate(-1);
  };

  return (
    <>
      {(loading || saving) && <SystemLoader />}
      
      <ConfirmationModal
        open={confirmOpen}
        title="Save Changes?"
        desc="Are you sure you want to update your profile information?"
        onConfirm={confirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-5xl mx-auto w-full">
            
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
                 <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
                 >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                 </button>

                 <div className="flex gap-3">
                    {readOnly ? (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white font-medium shadow-md hover:bg-primary/90 transition-all transform active:scale-95"
                            // className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveClick}
                                className="flex items-center gap-2 px-5 py-2 rounded-md bg-green-600 text-white font-medium shadow-md hover:bg-green-700 transition-all transform active:scale-95"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </>
                    )}
                 </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex-1">
                
                {/* Banner / Avatar Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 flex flex-col items-center border-b border-gray-100">
                     <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                             {formData.profilePic ? (
                                <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User className="w-12 h-12" />
                                </div>
                             )}
                        </div>

                        {!readOnly && (
                            <label 
                                htmlFor="profileUpload" 
                                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all"
                            >
                                <Camera className="w-4 h-4" />
                                <input 
                                    id="profileUpload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        )}
                     </div>
                     
                     <div className="mt-4 text-center">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {formData.firstName} {formData.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Beneficiary Account</p>
                     </div>
                </div>

                {/* Form Fields */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Personal Information */}
                    <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Personal Information</h3>
                    </div>

                    <ProfileInput 
                        label="First Name" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={onChange} 
                        disabled={readOnly} 
                        icon={User}
                    />
                    <ProfileInput 
                        label="Last Name" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={onChange} 
                        disabled={readOnly} 
                        icon={User}
                    />
                    <ProfileInput 
                        label="Date of Birth" 
                        name="birthDate" 
                        type="date"
                        value={formData.birthDate} 
                        onChange={onChange} 
                        disabled={readOnly} 
                        icon={Calendar}
                    />
                    <ProfileInput 
                        label="Age" 
                        name="age" 
                        value={formData.age} 
                        onChange={onChange} 
                        disabled={true} // Usually calculated
                        icon={Calendar}
                    />

                    {/* Contact Information */}
                    <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2 mt-4">
                        <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wider">Contact Information</h3>
                    </div>

                    <ProfileInput 
                        label="Email Address" 
                        name="email" 
                        value={formData.email} 
                        onChange={onChange} 
                        disabled={true} // Email usually unchangeable
                        icon={Mail}
                    />
                    <ProfileInput 
                        label="Phone Number" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={onChange} 
                        disabled={readOnly} 
                        icon={Phone}
                    />
                    <div className="md:col-span-2">
                        <ProfileInput 
                            label="Current Address" 
                            name="address" 
                            value={formData.address} 
                            onChange={onChange} 
                            disabled={readOnly} 
                            icon={MapPin}
                        />
                    </div>
                    
                    {/* Local Government Unit */}
                    <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2 mt-4">
                        <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider">Residency</h3>
                    </div>

                    <ProfileInput 
                        label="LGU (Local Government Unit)" 
                        name="lgu" 
                        value={formData.lgu} 
                        onChange={onChange} 
                        disabled={readOnly} 
                        icon={MapPin}
                    />

                     {/* Resident Checkbox as Select for consistency */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                            Resident of Cebu?
                        </label>
                        <div className="relative">
                            <select
                                name="isResident"
                                value={formData.isResident}
                                onChange={onChange}
                                disabled={readOnly}
                                className={`w-full border rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none appearance-none ${
                                    readOnly 
                                    ? "bg-gray-50 text-gray-500 border-gray-200 cursor-default" 
                                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary"
                                }`}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            <MapPin className={`w-4 h-4 absolute left-3 top-3 ${readOnly ? "text-gray-400" : "text-primary"}`} />
                        </div>
                     </div>

                </div>
            </div>
        </div>
        
        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>
    </>
  );
};

export default Profile;