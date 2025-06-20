import React from "react";
import benlogo from "../../../assets/images/registration/benlogo.png";
import rhulogo from "../../../assets/images/registration/rhulogo.png";
import privatelogo from "../../../assets/images/registration/privatelogo.png";

const SelectUserType = () => {
  return (
    <div className="bg-[#F0F2F5] w-[75%] h-screen flex flex-col items-center justify-between py-7">
      <h2 className="text-5xl font-bold text-[#84a6bd]">Register Now!</h2>
      <p className="text-center text-base text-black">
        Select your role to proceed with
        <br />
        registration and access the right services tailored
        <br />
        for you.
      </p>
      <div className="bg-white w-full max-w-md rounded-xl shadow px-8 py-6">
        <label className="block text-gray-700 font-medium mb-3">
          Select User Type
        </label>
        <div className="space-y-3 mb-3">
          <button className="flex gap-5 w-full text-[#000] hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-[#C5D7E5] focus:outline-none">
            <img src={benlogo} alt="RAFFI LOGO" className="h-6 w-6" />
            Beneficiary
          </button>
          <button className="flex gap-5 w-full text-[#000] hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-[#C5D7E5] focus:outline-none">
            <img src={rhulogo} alt="RAFFI LOGO" className="h-6 w-6" />
            RHU
          </button>
          <button className="flex gap-5 w-full text-[#000] hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-[#C5D7E5] focus:outline-none">
            <img src={privatelogo} alt="RAFFI LOGO" className="h-6 w-6" />
            Private/Partner
          </button>
        </div>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-4 text-gray-400">Or</span>
          <hr className="flex-grow border-gray-200" />
        </div>
        <button className="flex items-center w-full bg-[#f3f7fa]  py-2 rounded-full justify-center hover:bg-gray-100">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
            <rect fill="#f35325" x="4" y="3.5" width="7" height="7" />
            <rect fill="#81bc06" x="13" y="3.5" width="7" height="7" />
            <rect fill="#05a6f0" x="4" y="12.5" width="7" height="7" />
            <rect fill="#ffba08" x="13" y="12.5" width="7" height="7" />
          </svg>
          <p className=" text-sm ">Sign up with Microsoft Single Sign-on</p>
        </button>
      </div>
      <p className="text-sm font-medium text-black">
        Already have an account?
        <a
          href="../login_preenrollment/login.html"
          className="text-[#84a6bd] font-semibold hover:underline"
        >
          Sign In
        </a>
      </p>
    </div>
  );
};

export default SelectUserType;
