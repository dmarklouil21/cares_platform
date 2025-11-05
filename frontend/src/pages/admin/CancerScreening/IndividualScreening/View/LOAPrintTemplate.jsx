const LOAPrintTemplate = ({ loaData }) => (
  <div
    id="loa-print-content"
    className="hidden print:flex fixed top-0 left-0 w-full h-full flex-col bg-white z-50 p-0 m-0"
    style={{ margin: 0, padding: 0 }}
  >
    <style>{`
      @media print {
        @page { margin: 0 !important; }
        body { margin: 0 !important; }
       #loa-print-content { 
          margin: 0 !important; 
          padding: 0 !important; 
          height: 100vh; 
        }
      }
    `}</style>
    <div
      className="fixed left-10 bg-primary px-5 py-4 rounded-b-4xl
"
    >
      <img src="/images/logo_white_text.png" alt="Rafi Logo" />
    </div>
    <div className="bg-yellow w-full flex justify-end items-end text-md pr-8 pb-1.5 h-[5%]">
      <h1 className="text-gray2 font-bold ">
        Touching People, Shaping the Future
      </h1>
    </div>
    <div className="bg-lightblue w-full flex justify-end items-end pr-8 py-1">
      <p className="text-gray2 text-sm font-bold">
        Upholding the dignity of man by working with communities to elevate
        their well-being
      </p>
    </div>
    <div className="flex-1 flex flex-col px-26 pt-32">
      <h1 className="font-bold">CHONG HUA HOSPITAL-MANDAUE</h1>
      <p className="mb-7">Cebu City</p>
      <h1 className="font-bold mb-5 text-right">Serial No DAA275</h1>
      <h1 className="font-bold mb-11 text-center">LETTER OF AUTHORITY (LOA)</h1>
      <div className="flex justify-between text-sm mb-10">
        <div>
          <p>
            <span className="font-bold">Patient Name: </span>{" "}
            {loaData?.patient.full_name}
          </p>
          <p>
            <span className="font-bold">Address: </span> {loaData?.patient.city}
          </p>
        </div>

        <div className="text-left">
          <p>
            <span className="font-bold">Date: </span>{" "}
            {new Date().toLocaleDateString()}
          </p>
          <p>
            <span className="font-bold">Age: </span> {loaData?.patient.age}{" "}
            years old
          </p>
        </div>
      </div>
      <div className="text-sm space-y-6">
        <p>
          <span className="font-semibold">Diagnosis/ Impression: </span>
          {loaData?.patient.diagnosis[0]?.diagnosis}
        </p>

        <div>
          <p className="font-semibold">
            Diagnostic/ Treatment / Procedure:
            <span className="font-normal"> {loaData?.procedure_name}</span>
          </p>
          <p className="italic pl-[39%]">
            (Excluding Doctor's Professional Fee)
          </p>
        </div>

        <p className="font-semibold">
          Please accommodate this request and send the result and bill of said
          patient to:
        </p>

        <div>
          <p>RAMON ABOITIZ FOUNDATION INC.</p>
          <p>35 Eduardo Aboitiz St. Brgy Tinago, Cebu City</p>
          <p>Tel. No. 411-1700</p>
        </div>

        <p className="font-semibold ">This serves as an original LOA.</p>
        <div className="my-8"></div>
        <p>Thank you.</p>

        <div className="flex justify-left gap-[53.5%] mt-10">
          <div>
            <p>Prepared by:</p>
          </div>
          <div>
            <p>Approved by:</p>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <div className="text-center">
            <p className="font-bold uppercase">Gina A. Mariquit</p>
            <p>Senior Program Officer</p>
            <p>RAFI-EJACC</p>
          </div>
          <div className="text-center">
            <p className="font-bold uppercase">Karen Jane D. Wenceslao</p>
            <p>Health Program-OIC</p>
            <p>RAFI</p>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-yellow h-[1.3%] "></div>
    <div className="flex gap-2 justify-end items-center pr-8 py-2 bg-primary">
      <img
        src="/src/assets/images/patient/applicationstatus/printlocation.svg"
        className="h-3"
        alt="location icon"
      />
      <p className="text-white text-[9.5px]">
        35 Eduardo Aboitiz Street, Cebu City 6000 Philippines
      </p>
      <img
        src="/src/assets/images/patient/applicationstatus/printtelephone.svg"
        className="h-3"
        alt="telephone icon"
      />
      <p className="text-white text-[9.5px]">
        +63 (032) 265-5910, +63 998 967 1917, +63 998 966 0737
      </p>
      <img
        src="/src/assets/images/patient/applicationstatus/printemail.svg"
        className="h-3"
        alt="email icon"
      />
      <p className="text-white text-[9.5px]">communicate@rafi.ph</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#fff" /* Tailwind primary: #2563eb */
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15"
        />
      </svg>
      <p className="text-white text-[9.5px]">www.rafi.org.ph</p>
    </div>
  </div>
);

export default LOAPrintTemplate;
