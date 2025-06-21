import React from "react";
import { useNavigate } from "react-router-dom";

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    console.log("Password reset confirmed. Navigating to login...");
    navigate("/login_preenrollment/preenrollment");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center p-5 gap-5">
      <img
        src="../../static/images/logo_black_text.png"
        className="h-[70px] mb-10"
        alt="RAFI LOGO"
      />
      <img
        src="../../static/images/login/check_mark.png"
        className="h-[95px]"
        alt="Check Mark"
      />

      <h2 className="text-5xl font-bold text-center">
        Your <span className="text-primary">password</span> has been reset{" "}
        <br />
        successfully!
      </h2>

      <p className="text-sm">You can now use your new password to log in.</p>

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
  );
};

export default PasswordResetSuccess;
