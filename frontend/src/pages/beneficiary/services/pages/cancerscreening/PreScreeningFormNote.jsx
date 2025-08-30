import React, { useState } from "react";
import { Link } from "react-router-dom";
import BeneficiarySidebar from "../../../../../components/navigation/Beneficiary";

const NotePanel = ({ onAccept, onDecline }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className=" lg:w-[75%] bg-gray flex flex-col h-screen gap-5 px-8 py-8 ">
      
      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      <div className="w-full flex justify-between flex-col">
        <div className="mb-10 md:hidden flex">
          <img
            className="md:hidden size-5 cursor-pointer"
            src="/images/menu-line.svg"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        <h1 className="font-bold text-[16px] md:text-2xl">
          Indiviudal Screening Registration
        </h1>
        {/* <div className="flex text-right flex-col">
          <p className="text-sm">STEP 01/02</p>
          <h1 className="font-bold text-gray-600">NOTE</h1>
        </div> */}
      </div>

      <div className="flex flex-col gap-5 bg-white w-full rounded-xl shadow px-8 py-6">
        <h1 className="font-bold md:text-[28px]">
          NOTE: Completion of this form does not guarantee assistance from RAFI
          and Eduardo J. Aboitiz Cancer Center (EJACC). All applications are
          subject to review by the EJACC team.
          <br />
          <br />
          Any personal information that you share within this registration form
          will be treated as sensitive information and will only be used for
          checking your eligibility, processing your application, and sending
          you updates on your application. Your information will not be shared
          outside of RAFI without your permission. This question is required.*
        </h1>
        <div className="flex justify-between gap-5">
          <Link
            to={"/Beneficiary/services/cancer-screening"}
            id="i-accept-btn"
            className="  font-bold text-center py-2 w-[45%] border-[1px] hover:border-lightblue hover:bg-lightblue rounded-md"
            onClick={onAccept}
          >
            I Don't Accept
          </Link>
          <Link
            to={"/Beneficiary/services/cancer-screening/pre-screening-form"}
            id="i-accept-btn"
            className="bg-primary font-bold text-center text-white py-2 w-[45%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            onClick={onAccept}
          >
            I Accept
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotePanel;
