import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Approve: 0,
  "LOA Generation": 1,
  "In Progress": 2,
  Complete: 3,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewIndividualStatus() {
  const { user } = useAuth();
  const location = useLocation();
  const id = location?.state.id
  const [individualScreening, setIndividualScreening] = useState(null);

  const activeStep = getStepIndexByStatus(individualScreening?.status || "");

  // Step definitions only depend on activeStep
  const stepList = useMemo(() => [
    {
      title: "Screening Procedure",
      description: activeStep === 0 ? (
        <>
          Fill out the Screening Procedure form and submit the required documents.{" "}
          <Link
            to="/Beneficiary/individualscreeningstatus/screening-requirements-note"
            className="text-blue-500 underline"
          >
            Click here to proceed!
          </Link>
        </>
      ) : (
        <>Fill out the Screening Procedure form and submit the required documents.</>
      ),
    },
    {
      title: "LOA Generation",
      description: activeStep === 1 ? (
        <>
          Letter of Authorization (LOA) will be available for download after your documents are validated.{" "}
          <span
            onClick={() => window.print()}
            className="text-blue-500 underline cursor-pointer"
          >
            Download
          </span>{" "}
          and submit it back after signing.{" "}
          <Link
            to="/Beneficiary/individualscreeningstatus/upload-attachments"
            state={{ 
              individual_screening: individualScreening,
              purpose: "loa_upload"
            }}
            className="text-blue-500 underline"
          >
            Click here to upload!
          </Link>
        </>
      ) : (
        <>Letter of Authorization (LOA) will be available for download after your documents are validated.</>
      ),
    },
    {
      title: "In Progress", 
      description: activeStep === 2 ? (
        <>
          Your cancer screening has been scheduled for <b>{new Date(individualScreening?.screening_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. </b> 
          Please make sure to arrive at least 15 minutes early and bring any required identification.
        </>
      ) : (
        <>Your screening date will be scheduled once everything is ready.</>
      )
    },
    {
      title: "Complete",
      description: activeStep === 3 ? (
        <>
          Upload the results of your cancer screening.{" "}
          <Link
            to="/Beneficiary/individualscreeningstatus/upload-attachments"
            state={{ 
              individual_screening: individualScreening,
              purpose: "result_upload"
            }}
            className="text-blue-500 underline"
          >
            Click here to upload!
          </Link>
          {/* <span
            onClick={() => document.getElementById("results-upload")?.click()}
            className="text-blue-500 underline cursor-pointer"
          >
            
          </span> */}
        </>
      ) : (
        <>Upload the results of your cancer screening.</>
      ),
    },
  ], [activeStep]);

  useEffect(() => {
    // if (!user?.patient_id) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get(`/beneficiary/individual-screening/${id}/`);
        console.log("Data: ", data)
        setIndividualScreening(data);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [user]);
  console.log('Screening Data: ', individualScreening);

  return (
    <div className="w-full h-screen flex flex-col bg-gray overflow-auto">
      {/* <div className="bg-white py-4 px-10 flex justify-between items-center">
        <p className="font-bold">Beneficiary</p>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img src="/images/Avatar.png" alt="User Profile" className="rounded-full" />
        </div>
      </div> */}

      <div className="flex-1 w-full flex justify-center items-center">
        <div className="bg-white h-fit flex flex-col gap-7 rounded-lg shadow-md p-6 w-full max-w-2xl">
          <div className="flex w-full justify-end gap-[25%] items-center">
            <h2 className="text-2xl font-bold text-center text-gray-700">
              Screening Progress
            </h2>
            <Link to="/Beneficiary/individualscreeningstatus">
              <img src="/images/back.png" alt="Back" className="h-5" />
            </Link>
          </div>

          <div>
            {stepList.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <div key={idx} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 flex justify-center items-center rounded-full ${
                        idx <= activeStep ? "bg-yellow text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <p className="font-bold text-lg">{idx + 1}</p>
                    </div>
                    {idx !== stepList.length - 1 && (
                      <div className={`w-1 h-16 ${idx < activeStep ? "bg-yellow" : "bg-gray-200"}`} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <LOAPrintTemplate loaData={individualScreening} />
    </div>
  );
}
