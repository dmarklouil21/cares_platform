import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordAPI } from "src/services/authService";

const ResetPasswordPanel = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [animationClass, setAnimationClass] = useState("bounce-in");
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    try {
      await resetPasswordAPI(email, formData.oldPassword, formData.newPassword);
      // Optimistically mark user as active in localStorage
      const updatedUser = { ...(user || {}), is_active: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowPopup(true);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Password reset failed. Please try again later.");
      }
    }
  };

  const handleContinue = () => {
    setAnimationClass("bounce-out");
    setTimeout(() => {
      setShowPopup(false);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser?.is_superuser) {
        navigate("/Admin");
      } else if (currentUser?.is_rhu) {
        navigate("/Rhu");
      } else {
        navigate("/NoteBeneficiary");
      }
    }, 400);
  };

  return (
    <div className="bg-gray w-[75%] h-screen flex flex-col items-center justify-center gap-5">
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
                <img src="/src/assets/images/login/lock.svg" alt="Lock Icon" />
              </div>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange}
                className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label htmlFor="newPassword">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img src="/src/assets/images/login/lock.svg" alt="Lock Icon" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img src="/src/assets/images/login/lock.svg" alt="Lock Icon" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border-[#E2E2E2] border-[1px] rounded-md p-2 pl-10 w-full"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className=" font-bold bg-primary text-white py-2 w-[45%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
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
            src="/src/assets/images/login/checkmark.svg"
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
  );
};

export default ResetPasswordPanel;
