import React from "react";
import { Link } from "react-router-dom";

const SelectUserType = () => {
  return (
    <div className="bg-gray w-[100%]  md:w-[75%] h-[100%] flex flex-col items-center  md:justify-center gap-10 ">
      <h2 className="text-3xl md:text-5xl font-bold text-primary mt-36 md:mt-0">Log in to Your Account</h2>
      <p className="text-center text-base text-black">
        Access your account to manage patient <br />
          services with ease.
        {/* <br />
        registration and access the right services tailored
        <br />
        for you. */}
      </p>

      <div className="flex flex-col items-center gap-2 bg-white w-[400px]  md:w-[450px] rounded-xl shadow px-8 py-6">
        <label className="block text-gray-700 font-medium mb-3">
          Select User Type
        </label>
        <div className="space-y-3 mb-3 w-full">
          <Link
            to="/beneficiary-login"
            className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none"
          >
            <img
              src="/src/assets/images/registration/benlogo.svg"
              alt="RAFFI LOGO"
              className="h-6 w-6"
            />
            Beneficiary
          </Link>
          <Link
            to="/rhu-login"
            className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none"
          >
            <img
              src="/src/assets/images/registration/rhulogo.svg"
              alt="RAFFI LOGO"
              className="h-6 w-6"
            />
            RHU
          </Link>
          <button className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none">
            <img
              src="/src/assets/images/registration/privatelogo.svg"
              alt="RAFFI LOGO"
              className="h-6 w-6"
            />
            Private/Partner
          </button>
        </div>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-4 text-gray-400">Or</span>
          <hr className="flex-grow border-gray-200" />
        </div>
        <button className="flex items-center w-full bg-[#f3f7fa] py-2 rounded-full justify-center hover:bg-gray-100">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
            <rect fill="#f35325" x="4" y="3.5" width="7" height="7" />
            <rect fill="#81bc06" x="13" y="3.5" width="7" height="7" />
            <rect fill="#05a6f0" x="4" y="12.5" width="7" height="7" />
            <rect fill="#ffba08" x="13" y="12.5" width="7" height="7" />
          </svg>
          <p className="text-sm">Sign in with Microsoft</p>
        </button>
      </div>
      {/* <p className="text-sm font-medium text-black">
        Already have an account?{" "}
        <Link
          to="/Login"
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p> */}
    </div>
  );
};

export default SelectUserType;
