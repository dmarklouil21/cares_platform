import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Shield, Activity, Lock, Eye, EyeOff, Save, X } from "lucide-react";

import { updateUser, checkEmailExists } from "../../../../services/userManagementService";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

const EditUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const backendUser = location.state?.user || {};

  // Form State
  const [form, setForm] = useState({
    firstName: backendUser.first_name || "",
    lastName: backendUser.last_name || "",
    email: backendUser.email || "",
    username: backendUser.username || backendUser.email || "",
    password: "",
    confirmPassword: "",
    role: backendUser.is_superuser
      ? "admin"
      : backendUser.is_rhu
      ? "rhu"
      : backendUser.is_private
      ? "private"
      : "beneficiary",
    status: backendUser.is_active ? "active" : "inactive",
  });

  const [errors, setErrors] = useState({});
  
  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {type: 'reset'|'save'}
  const [modalDesc, setModalDesc] = useState("");

  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetNotification, setResetNotification] = useState("");

  useEffect(() => {
    setForm({
      firstName: backendUser.first_name || "",
      lastName: backendUser.last_name || "",
      email: backendUser.email || "",
      username: backendUser.username || backendUser.email || "",
      password: "",
      confirmPassword: "",
      role: backendUser.is_superuser
        ? "admin"
        : backendUser.is_rhu
        ? "rhu"
        : backendUser.is_private
        ? "private"
        : "beneficiary",
      status: backendUser.is_active ? "active" : "inactive",
    });
  }, [backendUser]);

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address.";
    }
    // Password change in main form (optional logic if you kept it here, but usually handled via reset modal or separate flow)
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // --- Actions ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const { exists } = await checkEmailExists({
        email: form.email,
        excludeId: backendUser.id,
      });
      if (exists) {
        setErrors((prev) => ({ ...prev, email: "Email already in use." }));
        return;
      }
    } catch (_) {
      setErrors((prev) => ({ ...prev, email: "Unable to verify email. Try again." }));
      return;
    }

    setModalText("Save changes?");
    setModalDesc("Are you sure you want to update this user's profile?");
    setModalAction({ type: "save" });
    setModalOpen(true);
  };

  const handleResetPassword = () => {
    if (!resetPassword) {
      setResetNotification("Password is required.");
      return;
    }
    if (!resetConfirmPassword) {
      setResetNotification("Confirm password is required.");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setResetNotification("Passwords do not match.");
      return;
    }
    
    setShowResetModal(false);
    setModalText("Reset Password?");
    setModalDesc("This action will permanently change the user's password.");
    setModalAction({ type: "reset", password: resetPassword });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);

    if (modalAction?.type === "save") {
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        input_role: form.role,
        is_active: form.status === "active",
      };
      
      try {
        await updateUser(backendUser.id, payload);
        setNotification("Profile updated successfully!");
        setNotificationType("success");
        setTimeout(() => {
          setNotification("");
          navigate("/admin/user-management");
        }, 1500);
      } catch (error) {
        setNotification("Failed to update user.");
        setNotificationType("error");
      }
    } else if (modalAction?.type === "reset") {
      try {
        await updateUser(backendUser.id, { password: modalAction.password });
        setNotification("Password reset successfully!");
        setNotificationType("success");
        setResetPassword("");
        setResetConfirmPassword("");
      } catch (error) {
        setNotification("Failed to reset password.");
        setNotificationType("error");
      }
    }
    setModalAction(null);
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      
      {/* --- Modals --- */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          // If cancelling reset confirmation, maybe re-open reset modal? 
          // For now just close.
        }}
      />

      <Notification message={notification} type={notificationType} />

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative animate-fade-in">
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-1 text-gray-800 text-center">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">Enter a new password for this user.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showResetConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {resetNotification && (
                <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded">
                  {resetNotification}
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-2">
                <button
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetPassword("");
                    setResetConfirmPassword("");
                    setResetNotification("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
                  onClick={handleResetPassword}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          User Management
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 shadow-sm border border-gray-100 flex-1">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                <User className="w-6 h-6" />
              </div> */}
              <h1 className="font-bold text-[24px] md:text-3xl text-yellow">
                Edit User
              </h1>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
              form.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {form.status}
            </span>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mt-2">
            
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Account Security
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="admin">Admin</option>
                        <option value="beneficiary">Beneficiary</option>
                        <option value="rhu">RHU</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Password Reset Section */}
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Management</label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Password is hidden</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-around print:hidden mt-5">
            <Link
              to="/admin/user-management"
              className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer disabled:opacity-5"
            >
              {/* <Save className="w-4 h-4" /> */}
              Save Changes
            </button>
          </div>

        </form>
      </div>

      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default EditUser;