import React from "react"
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function () {
  const location = useLocation();
  const { okLink } = location.state || {};
  const [animationClass, setAnimationClass] = useState("bounce-in");

  return (
    <div 
      className={`w-full h-screen inset-0 bg-white backdrop-blur-sm flex flex-col justify-center items-center p-5 gap-5`}
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
        Your <span className="text-primary">request</span> has been sent{" "}
        <br />
        successfully!
      </h2>

      <p className="text-sm">
        Please wait for a feedback while we validate your application.
      </p>

      <div className="w-full flex flex-col items-center justify-center gap-6">
        <Link
          // onClick={handleContinue} "/beneficiary/applications/individual-screening"
          to={`/${okLink}`}
          className="text-center font-bold bg-primary text-white py-3 w-[25%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
        >
          OK
        </Link>
        <hr className="w-[45%] border-[#6B7280]" />
      </div>
    </div>
  )
}
