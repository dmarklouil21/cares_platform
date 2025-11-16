import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  updateUser,
  checkEmailExists,
} from "../../../../services/userManagementService";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

// Modal component for confirmation
// function ConfirmationModal({ open, text, onConfirm, onCancel }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
//       <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
//         <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
//         <div className="flex gap-4">
//           <button
//             className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
//             onClick={onConfirm}
//           >
//             Confirm
//           </button>
//           <button
//             className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
//             onClick={onCancel}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

const EditUser = () => {
  const location = useLocation();
  const backendUser = location.state?.user || {};
  // Map backend user fields to form state
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
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);
  const [resetNotification, setResetNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {type: 'reset'|'save'}
  const [modalDesc, setModalDesc] = useState(
    "Are you sure you want to proceed with this action?"
  );
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address.";
    }
    if (form.password || form.confirmPassword) {
      if (!form.password)
        newErrors.password = "Password is required if changing password.";
      if (!form.confirmPassword)
        newErrors.confirmPassword =
          "Confirm password is required if changing password.";
      if (
        form.password &&
        form.confirmPassword &&
        form.password !== form.confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Save changes with confirmation modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Validation errors:", validationErrors);
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
      setErrors((prev) => ({
        ...prev,
        email: "Unable to verify email. Try again.",
      }));
      return;
    }
    setModalText("Are you sure you want to save changes?");
    setModalAction({ type: "save" });
    setModalOpen(true);
  };

  // Reset password with confirmation modal
  const handleResetPassword = () => {
    // Validate reset password fields
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
    setModalText("Are you sure you want to reset the password?");
    setModalAction({ type: "reset", password: resetPassword });
    setModalOpen(true);
  };

  // Modal confirm handler
  const handleModalConfirm = async () => {
    if (modalAction?.type === "save") {
      // Prepare payload for backend
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        input_role: form.role,
        is_active: form.status === "active",
      };
      // Only send password if changed
      if (form.password) payload.password = form.password;
      try {
        await updateUser(backendUser.id, payload);
        setNotification("Profile changes saved successfully!");
        setNotificationType("success");
        setTimeout(() => {
          setNotification("");
          navigate("/admin/user-management");
        }, 2000);
      } catch (error) {
        setNotification("Failed to update user");
        setNotificationType("error");
        setTimeout(() => setNotification(""), 2000);
      }
    } else if (modalAction?.type === "reset") {
      // Only update password
      try {
        await updateUser(backendUser.id, { password: modalAction.password });
        setNotification("Password reset successfully!");
        setNotificationType("success");
      } catch (error) {
        setNotificationType("error");
        setNotification("Failed to reset password");
      }
      setTimeout(() => setNotification(""), 2000);
      setResetPassword("");
      setResetConfirmPassword("");
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Modal cancel handler
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      {/* Main Notification Popup */}
      {/* {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )} */}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-black/15 bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] flex flex-col gap-5 relative">
            <h2 className="text-lg font-bold mb-2 text-center">
              Reset Password
            </h2>
            <div className="relative">
              <input
                type={showResetPassword ? "text" : "password"}
                placeholder="New Password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowResetPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                aria-pressed={showResetPassword}
                aria-label={
                  showResetPassword ? "Hide password" : "Show password"
                }
                title={showResetPassword ? "Hide password" : "Show password"}
              >
                {!showResetPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38M9.88 4.24A9.98 9.98 0 0112 4c5.52 0 10 4.48 10 8 0 1.32-.45 2.56-1.25 3.63M6.35 6.35C4.31 7.68 3 9.69 3 12c0 3.52 4.48 8 9 8 1.04 0 2.04-.17 2.97-.49"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showResetConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowResetConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                aria-pressed={showResetConfirmPassword}
                aria-label={
                  showResetConfirmPassword ? "Hide password" : "Show password"
                }
                title={
                  showResetConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {!showResetConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38M9.88 4.24A9.98 9.98 0 0112 4c5.52 0 10 4.48 10 8 0 1.32-.45 2.56-1.25 3.63M6.35 6.35C4.31 7.68 3 9.69 3 12c0 3.52 4.48 8 9 8 1.04 0 2.04-.17 2.97-.49"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            {resetNotification && (
              <span className="text-red-500 text-xs">{resetNotification}</span>
            )}
            <div className="flex gap-3 justify-end mt-2">
              <button
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
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
                className="bg-primary text-white px-4 py-2 rounded hover:bg-lightblue font-bold"
                onClick={handleResetPassword}
              >
                Reset password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main confirmation modal for save/reset */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          setModalText("");
        }}
      />
      <Notification message={notification} type={notificationType} />

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between"
      >
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className=" rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Account Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            {/* First Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
                {errors.firstName && (
                  <span className="text-red-500 text-xs">
                    {errors.firstName}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">{errors.email}</span>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role:</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none  "
                >
                  <option value="admin">Admin</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="rhu">rhu</option>
                  <option value="private">private</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Password:</label>
                <div className="flex justify-between items-center">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-[70%] border border-gray-300 rounded px-3 py-2 focus:outline-none "
                  />
                  <button
                    type="button"
                    className="underline text-sm text-blue-600 hover:text-black hover:no-underline cursor-pointer"
                    onClick={() => setShowResetModal(true)}
                  >
                    Reset password
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password}
                  </span>
                )}
              </div>
            </div>
            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
                {errors.lastName && (
                  <span className="text-red-500 text-xs">
                    {errors.lastName}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Status:</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none  "
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-around">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            to="/admin/user-management"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
