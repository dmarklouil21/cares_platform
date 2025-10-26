import React from "react";
import { Link } from "react-router-dom";

const NotePanel = ({ onAccept, onDecline }) => {
  return (
    <div className="w-full h-screen bg-gray flex flex-col  gap-5 p-5 md:px-8 py-8 ">
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-[16px] md:text-2xl">
          Beneficiary Pre Enrollment
        </h1>
        {/* <div className="flex text-right flex-col">
          <p className="text-[10px] md:text-sm">STEP 01/02</p>
          <h1 className="font-bold text-gray-600 text-[12px] md:text-[16px]">
            NOTE
          </h1>
        </div> */}
      </div>
      <div className="flex flex-col gap-5 bg-white w-full rounded-xl shadow px-8 py-6">
        <h1 className="font-bold text-[17px]">
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
            id="i-dont-accept-btn"
            to={"/beneficiary-login"}
            className="font-bold text-center py-2 w-[45%] border-[1px] hover:border-lightblue hover:bg-lightblue rounded-md"
            // onClick={onDecline}
          >
            I Don't Accept
          </Link>
          <Link
            to={"/beneficiary/pre-enrollment"}
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
