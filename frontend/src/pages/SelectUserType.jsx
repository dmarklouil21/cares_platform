import React, { useState } from "react";
import { Link } from "react-router-dom";
import NotificationModal from "src/components/Modal/NotificationModal";

const SelectUserType = () => {
  // Notification State
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "",
    message: "",
  });

  // Handler for Microsoft Sign In
  const handleMicrosoftLogin = () => {
    setModalInfo({
      type: "info",
      title: "Restricted Access",
      message: "This feature is currently available for RAFI-EJACC staff only.",
    });
    setShowModal(true);
  };

  return (
    <>
      {/* Notification Modal Component */}
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <div className="bg-gray w-full h-[100%] flex flex-col items-center md:justify-center gap-10 relative">
        
        {/* Mobile Header Overlay */}
        <div className="bg-primary w-full h-18 absolute flex px-5 py-10 gap-4 items-center md:hidden shadow-xl top-0 left-0 z-10">
          <img src="/images/logo_white_text.png" className="size-15" alt="Logo" />
          <div>
            <p className="font-bold text-white text-[20px] tracking-wider">
              CARES Platform
            </p>
          </div>
        </div>

        {/* Main Title */}
        <div className="flex flex-col items-center mt-36 md:mt-0">
            <h2 className="text-3xl md:text-5xl font-bold text-primary text-center">
            Log in to Your Account
            </h2>
            <p className="text-center text-base text-black mt-2">
            Access your account to manage patient <br />
            services with ease.
            </p>
        </div>

        {/* Selection Card */}
        <div className="flex flex-col items-center gap-2 bg-white w-[400px] md:w-[450px] rounded-xl shadow px-8 py-6 border border-gray-100">
          <label className="block text-gray-700 font-medium mb-3">
            Select User Type
          </label>
          
          <div className="space-y-3 mb-3 w-full">
            <Link
              to="/beneficiary-login"
              className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none transition-colors border border-transparent hover:border-blue-100"
            >
              <img
                src="/assets/images/registration/benlogo.svg"
                alt="Beneficiary Logo"
                className="h-6 w-6"
              />
              Beneficiary
            </Link>
            <Link
              to="/rhu-login"
              className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none transition-colors border border-transparent hover:border-blue-100"
            >
              <img
                src="/assets/images/registration/rhulogo.svg"
                alt="RHU Logo"
                className="h-6 w-6"
              />
              RHU
            </Link>
            <Link
              to="/private-login"
              className="flex gap-5 w-full text-black hover:text-[#636c72] font-bold text-xl px-4 py-3 rounded-lg hover:bg-lightblue focus:outline-none transition-colors border border-transparent hover:border-blue-100"
            >
              <img
                src="/assets/images/registration/privatelogo.svg"
                alt="Private Logo"
                className="h-6 w-6"
              />
              Private/Partner
            </Link>
          </div>

          <div className="flex items-center my-4 w-full">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-4 text-gray-400 text-sm">Or</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          {/* Microsoft Login Button */}
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className="flex cursor-pointer items-center w-full bg-[#f3f7fa] py-2.5 rounded-full justify-center hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <rect fill="#f35325" x="1" y="1" width="10" height="10" />
              <rect fill="#81bc06" x="12" y="1" width="10" height="10" />
              <rect fill="#05a6f0" x="1" y="12" width="10" height="10" />
              <rect fill="#ffba08" x="12" y="12" width="10" height="10" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Sign in with Microsoft</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SelectUserType;