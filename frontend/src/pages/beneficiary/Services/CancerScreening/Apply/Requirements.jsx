import { Link } from "react-router-dom";

const Requirements = () => {
  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Beneficary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="py-6 px-10 flex flex-col flex-1 overflow-auto">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-6">Screening Procedure</h2>
          {/* <p className="font-bold text-gray2 text-sm text-right">
            Screening and
            <br />
            Diagnostics
          </p> */}
        </div>
        <div className="flex flex-col gap-5 w-full justify-between bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
            <p>Beating cancer always begins with early detection.</p>
            <h1 className="font-bold text-xl">
              Before we proceed, please take a moment to read our requirement
              for screening and diagnostics.
            </h1>
            <p className="text-sm text-gray2">
              if you belive you are able to comply with these requirements,
              click on “Continue”
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Requirements:</h1>
            <div className="font-bold px-3 flex flex-col gap-4">
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Medical Certificate</p>
              </div>
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Laboratory Results</p>
              </div>
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Barangay Certification or Certificate of Indigency</p>
              </div>
              {/* <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>One 1x1 Photo</p>
              </div> */}
            </div>
          </div>
          <div className="flex justify-between gap-5">
            <Link
              to="/beneficiary/services/cancer-screening"
              className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
            >
              I can't comply
            </Link>
            <Link
              to="/beneficiary/services/cancer-screening/procedure"
              className="bg-primary text-white py-3 rounded-md font-bold text-center w-full hover:bg-primary/50"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requirements;
