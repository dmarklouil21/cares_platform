import React from "react";
import { Link, useLocation } from "react-router-dom";

const NotePanel = ({ onAccept, onDecline }) => {
  const location = useLocation();
  const serviceType = location.state;

  return (
    <div className="w-full h-screen bg-gray flex flex-col  gap-5 p-5 md:px-8 py-8 ">
      <div className="w-full flex justify-between">
        <h1 className="font-bold text-2xl">Cancer Treatment Registration</h1>
      </div>
      <div className="flex flex-col gap-5 bg-white w-full rounded-xl shadow px-8 py-6">
        <h1 className="font-bold text-[17px]">
          NOTE: Before applying for this service, you must first complete the 
          well-being survey form. Completion of this form does not guarantee assistance from RAFI
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
            to={"/beneficiary/services/cancer-management"} 
            id="i-accept-btn" 
            className="  font-bold text-center py-2 w-[45%] border-[1px] hover:border-lightblue hover:bg-lightblue rounded-md"
            // onClick={onAccept} 
          >
            I Don't Accept
          </Link>
          <Link
            to={"/beneficiary/services/cancer-management/apply/well-being-tool"}
            state={serviceType}
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
