import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordAPI } from "src/services/authService";

import LoadingModal from "src/components/Modal/LoadingModal";

const ResetPasswordPanel = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [animationClass, setAnimationClass] = useState("bounce-in");
  const [showReqModal, setShowReqModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading Modal
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const password = formData.newPassword || "";
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
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get email from localStorage user
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;
    if (!email) {
      alert("User email not found. Please log in again.");
      return;
    }
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }
    if (!allMet) {
      alert("Password does not meet the required strength.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordAPI(email, formData.oldPassword, formData.newPassword);
      // Optimistically mark user as active in localStorage
      const updatedUser = { ...(user || {}), is_active: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowPopup(true);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Password reset failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setAnimationClass("bounce-out");
    setTimeout(() => {
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
    }, 400);
  };

  return (
    <>
      <LoadingModal open={loading} text="Loading..." />
      <div className="bg-gray w-full lg:w-[75%] h-screen flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-3xl font-bold">Reset Your Password</h2>
          <p className="text-center text-base text-black">
            You must change your password before accessing <br />
            your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6 bg-white w-full max-w-md rounded-xl shadow px-8 py-6"
        >
          <div className="w-full space-y-3 mb-3">
            <div className="flex gap-2 flex-col">
              <label htmlFor="oldPassword">Old Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/assets/images/login/lock.svg"
                    alt="Lock Icon"
                  />
                </div>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                  aria-pressed={showOldPassword}
                  aria-label={
                    showOldPassword ? "Hide password" : "Show password"
                  }
                  title={showOldPassword ? "Hide password" : "Show password"}
                >
                  {!showOldPassword ? (
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
            </div>

            <div className="flex gap-2 flex-col">
              <label htmlFor="newPassword">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/assets/images/login/lock.svg"
                    alt="Lock Icon"
                  />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  onFocus={() => setShowReqModal(true)}
                  onBlur={() => setShowReqModal(false)}
                  className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                  aria-pressed={showNewPassword}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {!showNewPassword ? (
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
                            criteria.upperLower ? "bg-green-600" : "bg-gray-300"
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
                          criteria.special ? "text-green-600" : "text-gray-500"
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
            </div>

            <div className="flex gap-2 flex-col">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/assets/images/login/lock.svg"
                    alt="Lock Icon"
                  />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 pr-10 w-full"
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
              {formData.confirmPassword.length > 0 && (
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
            </div>
          </div>

          <button
            type="submit"
            disabled={!allMet || !passwordsMatch || !formData.oldPassword}
            className={`font-bold py-2 w-[45%] border-[1px] rounded-md ${
              !allMet || !passwordsMatch || !formData.oldPassword
                ? "bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed"
                : "bg-primary text-white border-primary hover:border-lightblue hover:bg-lightblue"
            }`}
          >
            Reset Password
          </button>
        </form>
        {showPopup && (
          <div
            className={`fixed inset-0 bg-white backdrop-blur-sm h-screen w-full flex flex-col items-center p-5 gap-5 bounce-in ${animationClass}`}
          >
            <img
              src="/images/logo_black_text.png"
              className="h-[70px] mb-10"
              alt="RAFI LOGO"
            />
            <img
              src="/assets/images/login/checkmark.svg"
              className="h-[95px]"
              alt="Check Mark"
            />

            <h2 className="text-5xl font-bold text-center">
              Your <span className="text-primary">password</span> has been reset{" "}
              <br />
              successfully!
            </h2>

            <p className="text-sm">
              You can now use your new password to log in.
            </p>

            <div className="w-full flex flex-col items-center justify-center gap-6">
              <button
                onClick={handleContinue}
                className="text-center font-bold bg-primary text-white py-3 w-[25%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              >
                Continue
              </button>
              <hr className="w-[45%] border-[#6B7280]" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResetPasswordPanel;
