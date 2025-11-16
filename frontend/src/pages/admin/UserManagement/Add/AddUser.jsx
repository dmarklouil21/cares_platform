import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addUser,
  checkEmailExists,
} from "../../../../services/userManagementService";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

const AddUser = () => {
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
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState(
    "Are you sure you want to proceed with this action?"
  );
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [showReqModal, setShowReqModal] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const password = form.password || "";
  const criteria = {
    length: password.length >= 8,
    letterNumber: /[A-Za-z]/.test(password) && /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };
  const allMet =
    criteria.length &&
    criteria.letterNumber &&
    criteria.special &&
    criteria.upperLower;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

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
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required.";
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!allMet) {
      setErrors((prev) => ({
        ...prev,
        password: "Password does not meet requirements.",
      }));
      return;
    }
    if (!passwordsMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match.",
      }));
      return;
    }
    try {
      const { exists } = await checkEmailExists({ email: form.email });
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
    setModalText("Are you sure you want to add this user?");
    setModalOpen(true);
  };

  // Modal confirm handler
  const handleModalConfirm = async () => {
    setModalOpen(false);
    // Prepare payload for backend
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      input_role: form.role,
      is_active: form.status === "active",
      // Add other fields as needed
    };
    try {
      await addUser(payload);
      setNotification("User successfully added!");
      setNotificationType("success");
      setTimeout(() => {
        setNotification("");
        navigate("/admin/user-management");
      }, 2000);
    } catch (error) {
      setNotification("Failed to add user");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  // Modal cancel handler
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      {/* Confirmation Modal */}
      {/* <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      /> */}
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
      {/* Notification Popup */}
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
                <label className="block text-gray-700 mb-1">Password:</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setShowReqModal(true)}
                    onBlur={() => setShowReqModal(false)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                  />
                  {showReqModal && (
                    <div className="absolute z-50 right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg p-4 border border-lightblue">
                      <h3 className="text-sm font-semibold text-primary mb-2">
                        Password requirements
                      </h3>
                      <ul className="space-y-1.5 text-sm">
                        <li
                          className={`flex items-center gap-2 ${
                            criteria.length ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              criteria.length ? "bg-green-600" : "bg-gray-300"
                            }`}
                          ></span>
                          <span>At least 8 characters</span>
                        </li>
                        <li
                          className={`flex items-center gap-2 ${
                            criteria.upperLower
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              criteria.upperLower
                                ? "bg-green-600"
                                : "bg-gray-300"
                            }`}
                          ></span>
                          <span>Uppercase and lowercase letters</span>
                        </li>
                        <li
                          className={`flex items-center gap-2 ${
                            criteria.letterNumber
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              criteria.letterNumber
                                ? "bg-green-600"
                                : "bg-gray-300"
                            }`}
                          ></span>
                          <span>Combination of letters and numbers</span>
                        </li>
                        <li
                          className={`flex items-center gap-2 ${
                            criteria.special
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              criteria.special ? "bg-green-600" : "bg-gray-300"
                            }`}
                          ></span>
                          <span>At least one special character</span>
                        </li>
                      </ul>
                      <div
                        className={`mt-2 text-xs ${
                          allMet ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {allMet ? "Strong password" : "Keep typing..."}
                      </div>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password}
                  </span>
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
                  disabled
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Confirm Password:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                    aria-pressed={showConfirmPassword}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    title={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {!showConfirmPassword ? (
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
                {form.confirmPassword.length > 0 && (
                  <p
                    className={`text-sm ${
                      passwordsMatch ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
                {errors.confirmPassword && (
                  <span className="text-red-500 text-xs">
                    {errors.confirmPassword}
                  </span>
                )}
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
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black  rounded-md"
            to="/admin/user-management"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            disabled={!allMet || !passwordsMatch}
            className={`text-center font-bold py-2 w-[35%] border rounded-md ${
              !allMet || !passwordsMatch
                ? "bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed"
                : "bg-primary text-white border-primary hover:border-lightblue hover:bg-lightblue"
            }`}
          >
            ADD
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
