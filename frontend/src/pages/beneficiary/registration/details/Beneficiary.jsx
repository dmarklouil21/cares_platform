import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle,
  ArrowLeft,
  Save,
  Check
} from "lucide-react";

import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import api from "src/api/axiosInstance";

// --- Reusable UI Components (Admin Theme) ---

const InputGroup = ({ label, name, type = "text", value, onChange, required, error, placeholder, icon: Icon }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
        <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-md px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        />
        {Icon && <Icon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options, required, error, icon: Icon }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border rounded-md px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
            ))}
        </select>
        {Icon && <Icon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Info101 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    isResident: "",
    lgu: "",
    address: "",
    agreed: false,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [animationClass, setAnimationClass] = useState("bounce-in");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "",
  });
  
  const [errors, setErrors] = useState({});

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if(errors[name]) setErrors(prev => ({...prev, [name]: undefined}));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.birthDate) newErrors.birthDate = "Birthdate is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.lgu.trim()) newErrors.lgu = "LGU is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.isResident) newErrors.isResident = "Required.";
    if (!formData.agreed) newErrors.agreed = "You must agree to the terms.";

    if (formData.isResident === "no") {
      newErrors.isResident = "Services are currently limited to Cebu residents.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.birthDate,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        lgu: formData.lgu,
      };
      await api.post("/api/registration/register/", payload);
      setShowPopup(true);
    } catch (error) {
      let msg = "Something went wrong while submitting your form";
      if (error.response?.data?.message) msg = error.response.data.message;
      
      setModalInfo({
        type: "error",
        title: "Registration Failed",
        message: msg,
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    setShowPopup(false);
    navigate("/beneficiary-login");
  };

  return (
    <>
      {loading && <SystemLoader />}

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      {/* Main Container - Adjusted to fit inside a parent flex layout (Sidebar safe) */}
      <div className="w-full h-full bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-5xl mx-auto w-full">
            
            {/* Top Title */}
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Registration
            </h2>

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                   <div>
                        <h1 className="text-xl font-bold text-gray-800">Account Registration</h1>
                        <p className="text-xs text-gray-500 mt-1">Please fill in your details to create an account.</p>
                   </div>
                   <img
                        src="/images/logo_black_text.png"
                        alt="RAFI Logo"
                        className="h-23 object-contain opacity-80"
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-8">
                    
                    {/* Section 1: Personal Details */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-primary pl-3 mb-6">
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup 
                                label="First Name" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                required 
                                error={errors.firstName} 
                                icon={User}
                            />
                            <InputGroup 
                                label="Last Name" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                required 
                                error={errors.lastName} 
                                icon={User}
                            />
                            <InputGroup 
                                label="Date of Birth" 
                                name="birthDate" 
                                type="date"
                                value={formData.birthDate} 
                                onChange={handleChange} 
                                required 
                                error={errors.birthDate} 
                                icon={Calendar}
                            />
                        </div>
                    </div>

                    {/* Section 2: Contact Information */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 mb-6">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup 
                                label="Email Address" 
                                name="email" 
                                type="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                error={errors.email} 
                                placeholder="e.g. name@example.com"
                                icon={Mail}
                            />
                            <InputGroup 
                                label="Phone Number" 
                                name="phone" 
                                type="tel"
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="e.g. 0912 345 6789"
                                icon={Phone}
                            />
                        </div>
                    </div>

                    {/* Section 3: Residency */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-green-500 pl-3 mb-6">
                            Address & Residency
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup 
                                label="Address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                required 
                                error={errors.address} 
                                placeholder="Full street address"
                                icon={MapPin}
                            />
                            <InputGroup 
                                label="LGU" 
                                name="lgu" 
                                value={formData.lgu} 
                                onChange={handleChange} 
                                required 
                                error={errors.lgu} 
                                placeholder="City / Municipality"
                                icon={MapPin}
                            />
                            <SelectGroup 
                                label="Are you a resident of Cebu?"
                                name="isResident"
                                value={formData.isResident}
                                onChange={handleChange}
                                required
                                error={errors.isResident}
                                options={[
                                    { value: "", label: "Select Option", disabled: true },
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="pt-4 border-t border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center pt-1">
                              <input
                                  type="checkbox"
                                  name="agreed"
                                  checked={formData.agreed}
                                  onChange={handleChange}
                                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-primary checked:bg-primary hover:border-primary"
                              />
                              <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                  I agree to the <span className="text-primary font-semibold underline">Data Privacy Notice</span> and confirm the information is correct.
                              </span>
                              {errors.agreed && <span className="text-xs text-red-500 mt-1">{errors.agreed}</span>}
                          </div>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-around print:hidden mt-6">
                        <Link
                            to="/beneficiary-login"
                            // className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-bold text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                        >
                            {/* <ArrowLeft className="w-4 h-4" />  */}
                            Back
                        </Link>
                        <button
                            type="submit"
                            // className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                        >
                            {/* <Save className="w-4 h-4" />  */}
                            Submit
                        </button>
                    </div>

                </form>
            </div>
            
            {/* Decorative Footer to maintain consistent spacing */}
            <div className="h-16 bg-transparent shrink-0"></div>
        </div>
      </div>

      {/* Success Popup */}
      {/* {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-4 transform scale-100 transition-all border border-gray-100">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <Mail className="w-8 h-8" />
             </div>
            <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We’ve sent your login credentials to <strong className="text-gray-900">{formData.email}</strong>. <br/>
              Please check your inbox (and spam folder) to log in.
            </p>
            <button
              onClick={handleOk}
              className="mt-4 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              Back to Login
            </button>
          </div>
        </div>
      )} */}
      {showPopup && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div
              className={`bg-white py-5 px-20 rounded-xl shadow-xl text-center flex flex-col items-center gap-5 ${animationClass}`}
            >
              <h2 className="text-2xl font-bold text-primary">CHECK EMAIL</h2>
              <p className="text-center">
                Please check your messages. We’ve sent you an email and password
                <br />
                to your registered email, use them to log in and reset your password.
              </p>
              <button
                onClick={handleOk}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-lightblue"
              >
                OK
              </button>
            </div>
          </div>
        )}
    </>
  );
};

export default Info101;