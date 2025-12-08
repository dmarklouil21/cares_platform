import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Check, 
  X, 
  Save, 
  Shield, 
  Eye, 
  EyeOff 
} from "lucide-react";

import { addUser, checkEmailExists } from "../../../../services/userManagementService";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal"; // Using standard modal
import SystemLoader from "src/components/SystemLoader";

// --- Reusable UI Components ---

const InputGroup = ({ label, name, type = "text", value, onChange, error, placeholder, icon: Icon, rightElement }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} <span className="text-red-500">*</span>
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
      {rightElement && <div className="absolute right-3 top-2.5">{rightElement}</div>}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
    </div>
  </div>
);

const AddUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });
  
  const [errors, setErrors] = useState({});

  // Password Logic
  const password = form.password || "";
  const criteria = {
    length: password.length >= 8,
    letterNumber: /[A-Za-z]/.test(password) && /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };
  const allMet = criteria.length && criteria.letterNumber && criteria.special && criteria.upperLower;
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!form.password) newErrors.password = "Password is required.";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
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

    if (!allMet) {
      setErrors((prev) => ({ ...prev, password: "Password is weak." }));
      return;
    }

    setLoading(true);
    try {
      const { exists } = await checkEmailExists({ email: form.email });
      if (exists) {
        setErrors((prev) => ({ ...prev, email: "Email already in use." }));
        setLoading(false);
        return;
      }
    } catch (_) {
      setErrors((prev) => ({ ...prev, email: "Unable to verify email." }));
      setLoading(false);
      return;
    }
    
    setLoading(false);
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    setLoading(true);

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      input_role: form.role,
      is_active: form.status === "active",
    };

    try {
      await addUser(payload);
      setModalInfo({
        type: "success",
        title: "Success",
        message: "User successfully added!",
      });
      setShowModal(true);
      
      setTimeout(() => navigate("/admin/user-management"), 1500);
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Failed",
        message: "Failed to add user. Please try again.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {loading && <SystemLoader />}
      
      <ConfirmationModal
        open={modalOpen}
        title="Add New User?"
        desc="Are you sure you want to create this user account?"
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
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
            User Management
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-primary">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Add New User</h1>
                        <p className="text-xs text-gray-500 mt-1">Create a new account for admin or staff access.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* LEFT COLUMN: Personal Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-primary pl-3">
                        Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                                label="First Name" 
                                name="firstName" 
                                value={form.firstName} 
                                onChange={handleChange} 
                                icon={User}
                                error={errors.firstName}
                            />
                            <InputGroup 
                                label="Last Name" 
                                name="lastName" 
                                value={form.lastName} 
                                onChange={handleChange} 
                                icon={User}
                                error={errors.lastName}
                            />
                        </div>

                        <InputGroup 
                            label="Email Address" 
                            name="email" 
                            type="email"
                            value={form.email} 
                            onChange={handleChange} 
                            icon={Mail}
                            error={errors.email}
                        />

                        <div className="grid grid-cols-2 gap-4">
                             <SelectGroup 
                                label="Role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                options={[
                                    { value: "admin", label: "Admin" },
                                    { value: "beneficiary", label: "Beneficiary" },
                                    { value: "rhu", label: "RHU" },
                                    { value: "private", label: "Private Partner" }
                                ]}
                             />
                             <SelectGroup 
                                label="Status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                options={[
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" }
                                ]}
                             />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Security */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3">
                        Security Credentials
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                        <InputGroup 
                            label="Password" 
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password} 
                            onChange={handleChange} 
                            icon={Lock}
                            error={errors.password}
                            rightElement={
                                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400"/> : <Eye className="w-4 h-4 text-gray-400"/>}
                                </button>
                            }
                        />

                        {/* Password Strength Indicators */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                             <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Password Requirements</p>
                             <ul className="space-y-2">
                                <RequirementItem met={criteria.length} text="At least 8 characters" />
                                <RequirementItem met={criteria.upperLower} text="Uppercase & lowercase letters" />
                                <RequirementItem met={criteria.letterNumber} text="Letters & numbers" />
                                <RequirementItem met={criteria.special} text="Special character (!@#$)" />
                             </ul>
                        </div>

                        <InputGroup 
                            label="Confirm Password" 
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword} 
                            onChange={handleChange} 
                            icon={Lock}
                            error={errors.confirmPassword}
                            rightElement={
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400"/> : <Eye className="w-4 h-4 text-gray-400"/>}
                                </button>
                            }
                        />
                         {form.confirmPassword && (
                            <p className={`text-xs font-medium flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                                {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                            </p>
                         )}
                    </div>
                </div>

            </form>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
                <button
                    type="button"
                    onClick={() => navigate("/admin/user-management")}
                    // className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    // Disable if passwords don't match or criteria not met
                    disabled={!allMet || !passwordsMatch}
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
                    Create User
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

const RequirementItem = ({ met, text }) => (
    <li className={`flex items-center gap-2 text-xs ${met ? "text-green-600 font-medium" : "text-gray-400"}`}>
        {met ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
        {text}
    </li>
);

export default AddUser;