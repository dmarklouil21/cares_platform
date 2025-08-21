import React from "react";
import { Link } from "react-router-dom";

const NotePanel = ({ onAccept, onDecline }) => {
  return (
    <div className="  lg:w-[75%] bg-gray flex flex-col h-screen gap-5 px-8 py-8 items-center">
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-[16px] md:text-2xl">RHU Focal Person registration</h1>
        <div className="flex text-right flex-col">
          <p className="text-[10px] md:text-sm">STEP 01/01</p>
          <h1 className="font-bold text-gray-600 text-[12px] md:text-[16px]">NOTE</h1>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 bg-white rounded-xl shadow px-8 py-6 w-auto h-auto">
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
        <div className="flex justify-between w-full ">
          <Link
            to="/rhu-login"
            className="text-black py-2 w-[45%] border-[1px] text-center hover:bg-gray border-black hover:border-white rounded-md"
          >
            I Don't Accept
          </Link>
          <Link
            to={"/rhu-registration"}
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
