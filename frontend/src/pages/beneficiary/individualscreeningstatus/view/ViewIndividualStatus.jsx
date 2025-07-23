import { Link } from "react-router-dom";
import LOAPrintTemplate from "../download/LOAPrintTemplate";

const steps = [
  {
    title: "LOA Generation",
    description:
      "Letter of Authorization (LOA) will be generated after your application is approved.",
  },
  {
    title: "Ongoing",
    description: "This step is ongoing. Details will be provided soon.",
  },
  {
    title: "Upload Results",
    description:
      "Upload the results or documents required to complete your application.",
  },
];

import { useLocation } from "react-router-dom";

const getStepIndexByStatus = (status) => {
  // Map status to step index
  switch ((status || "").toLowerCase()) {
    case "approved":
      return 0;
    case "ongoing":
      return 1;
    case "upload":
      return 2;
    // Add more statuses if needed
    default:
      return 0;
  }
};

const ViewIndividualStatus = () => {
  const location = useLocation();
  const status = location.state?.status || "Pending";
  const activeStep = getStepIndexByStatus(status);

  // Sample data for the LOA form
  const loaData = {
    patientName: "Marnie T. Entero",
    date: "August 14, 2024",
    address: "Brgy. Baod, Tuburan",
    age: "33",
    diagnosis: "Breast Mass, right",
    procedure: "Breast Ultrasound ",
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center ">
        <p className="font-bold">Beneficary</p>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex-1 w-full flex justify-center items-center">
        <div className="bg-white h-fit flex flex-col gap-7 rounded-lg shadow-md p-6 w-full max-w-2xl">
          <div className="flex w-full justify-end gap-[25%] items-center">
            <h2 className="text-2xl font-bold text-center text-gray-700">
              Screening Progress
            </h2>

            <Link to="/Beneficiary/individualscreeningstatus">
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-5"
              />
            </Link>
          </div>
          <div className="">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              const isCompleted = idx < activeStep;
              return (
                <div key={idx} className="flex gap-5 ">
                  <div
                    className={`w-fit h-fit flex flex-col items-center justify-center`}
                  >
                    <div
                      className={`w-10 h-10 flex justify-center items-center rounded-full ${
                        idx <= activeStep
                          ? "bg-yellow text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <p className="font-bold text-lg">{idx + 1}</p>
                    </div>
                    {idx !== steps.length - 1 && (
                      <div
                        className={`w-1 h-16 ${
                          idx < activeStep ? "bg-yellow" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    {idx === 1 && (
                      <button
                        className={`w-[30%] py-0.5 rounded-md ${
                          activeStep === 1
                            ? "bg-primary text-white cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={activeStep !== 1}
                        onClick={activeStep === 1 ? handleDownload : undefined}
                      >
                        Download
                      </button>
                    )}
                    {idx === 3 && (
                      <label
                        className={`w-[20%] py-0.5 rounded-md text-center ${
                          activeStep === 3
                            ? "bg-primary text-white cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        style={{ display: "inline-block" }}
                      >
                        <input
                          type="file"
                          className="hidden"
                          disabled={activeStep !== 3}
                          onChange={
                            activeStep === 3
                              ? (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    alert(
                                      `File uploaded: ${e.target.files[0].name}`
                                    );
                                  }
                                }
                              : undefined
                          }
                        />
                        Upload
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Printable LOA template */}
      <LOAPrintTemplate loaData={loaData} />
    </div>
  );
};

export default ViewIndividualStatus;
