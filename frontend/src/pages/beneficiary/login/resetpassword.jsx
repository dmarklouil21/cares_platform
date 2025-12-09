import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Check, 
  ShieldCheck, 
  KeyRound,
  X,
  CheckCircle // Used for the success popup
} from "lucide-react";

import { resetPasswordAPI } from "src/services/authService";
import SystemLoader from "src/components/SystemLoader";

// --- Sub-component for Password Strength ---
const RequirementItem = ({ met, text }) => (
  <li className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-green-600 font-medium" : "text-gray-400"}`}>
    {met ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
    {text}
  </li>
);

// --- Reusable Password Input ---
const PasswordInput = ({ id, label, name, value, onChange, placeholder, onFocus, onBlur }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const ResetPasswordPanel = () => {
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  
  // Validation Logic
  const password = formData.newPassword || "";
  const criteria = {
    length: password.length >= 8,
    letterNumber: /[A-Za-z]/.test(password) && /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };
  
  const allMet = criteria.length && criteria.letterNumber && criteria.special && criteria.upperLower;
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.newPassword === formData.confirmPassword;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;

    if (!email) {
      alert("User session expired. Please log in again.");
      return;
    }
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (!allMet) {
      alert("Password does not meet the required strength.");
      return;
    }
    if (!passwordsMatch) {
      alert("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordAPI(email, formData.oldPassword, formData.newPassword);
      const updatedUser = { ...(user || {}), is_active: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowPopup(true);
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Password reset failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowPopup(false);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    if (currentUser?.is_superuser) {
      navigate("/admin");
    } else if (currentUser?.is_rhu) {
      navigate("/rhu");
    } else if (currentUser?.is_private) {
      navigate("/private");
    } else {
      navigate("/beneficiary/pre-enrollment/note");
    }
  };

  return (
    <>
      {loading && <SystemLoader />}

      <div className="flex min-h-screen w-full bg-gray items-center justify-center p-6">
        
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-100 relative">
            
            {/* Header */}
            <div className="flex flex-col items-center mb-8 text-center gap-3">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-2">
                    <KeyRound className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Update your password to continue.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Old Password */}
                <PasswordInput 
                    id="oldPassword"
                    label="Current Password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                />

                {/* New Password with Floating Requirements */}
                <div className="relative">
                  <PasswordInput 
                      id="newPassword"
                      label="New Password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onFocus={() => setShowReqModal(true)}
                      onBlur={() => setShowReqModal(false)}
                      placeholder="Enter new password"
                  />

                   {/* Floating Requirements Popup */}
                   {showReqModal && (
                      <div className="absolute z-50 left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl p-4 border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xs font-bold text-primary uppercase mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> Password requirements
                        </h3>
                        <ul className="space-y-2 text-xs">
                          <RequirementItem met={criteria.length} text="At least 8 characters" />
                          <RequirementItem met={criteria.upperLower} text="Uppercase & lowercase letters" />
                          <RequirementItem met={criteria.letterNumber} text="Combination of letters & numbers" />
                          <RequirementItem met={criteria.special} text="Special character (!@#$)" />
                        </ul>
                        <div className={`mt-3 text-xs font-medium ${allMet ? "text-green-600" : "text-gray-400"}`}>
                           {allMet ? "✓ Strong password" : "Keep typing..."}
                        </div>
                      </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <PasswordInput 
                        id="confirmPassword"
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter new password"
                    />
                    {formData.confirmPassword && (
                        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                            {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                >
                    Update Password
                </button>

            </form>
        </div>
      </div>

      {/* Success Popup - Styled exactly like previous one but cleaner */}
      {showPopup && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-5 animate-in fade-in zoom-in-95 duration-300">
             
             {/* 1. Logo */}
             <img 
                src="/images/logo_black_text.png" 
                className="h-16 mb-8 object-contain"
                alt="RAFI LOGO" 
             />

             {/* 2. Visual Indicator (Large Checkmark) */}
             <div className="mb-6">
                 {/* This uses Lucide to mimic the large checkmark asset cleanly */}
                 {/* <CheckCircle className="w-24 h-24 text-primary" strokeWidth={1.5} /> */}
                  <img
                    src="/assets/images/login/checkmark.svg"
                    className="h-[95px]"
                    alt="Check Mark"
                  />
             </div>

             {/* 3. Headline */}
             <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
                Your <span className="text-primary">password</span> has been <br className="hidden md:block"/>
                reset successfully!
             </h2>

             {/* 4. Subtext */}
             <p className="text-gray-500 text-lg mb-10 text-center">
                You can now use your new password to log in.
             </p>

             {/* 5. Action Area */}
             <div className="w-full max-w-sm flex flex-col items-center gap-8">
                 <button
                    onClick={handleContinue}
                    className="w-full md:w-2/3 bg-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all transform active:scale-95"
                 >
                    Continue
                 </button>
                 
                 <div className="w-1/2 border-t border-gray-300"></div>
             </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordPanel;