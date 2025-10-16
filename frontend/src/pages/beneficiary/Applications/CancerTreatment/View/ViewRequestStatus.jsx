import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

// import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  "Interview Process": 1,
  "Case Summary Generation": 2,
  Approved: 3,
  Completed: 4,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewIndividualStatus() {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [cancerTreatment, setCancerTreatment] = useState(null);

  const activeStep = getStepIndexByStatus(cancerTreatment?.status || "");

  // Step definitions
  const stepList = useMemo(
    () => [
      {
        title: "Pending",
        description:
          activeStep === 0 ? (
            <>
              Your request for cancer screening has been submitted and is
              currently under review. Once approved, you’ll receive instructions
              on the next steps.
            </>
          ) : (
            <>
              Your request has been accepted. You will be notified with your
              interview date through email.
            </>
          ),
      },
      {
        title: "Interview Process",
        description:
          activeStep === 1 ? (
            <>
              Your request for radiation therapy has been accepted. Please
              proceed to the Interview process. You are scheduled for an
              interview on{" "}
              {new Date(cancerTreatment?.interview_date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </>
          ) : (
            <>
              Your request has been accepted. You will be notified with your
              interview date through email.
            </>
          ),
      },
      {
        title: "Case Summary & Intervention Plan",
        description:
          activeStep === 2 ? (
            <>
              Your Case Summary and Intervention Plan has been sent to your
              email. Review, sign and upload it back.
              <Link
                to={`/beneficiary/applications/cancer-treatment/view/${id}/upload`}
                state={{
                  cancer_treatment: cancerTreatment,
                  purpose: "case_summary_upload",
                }}
                className="text-blue-500 underline"
              >
                Click here to upload!
              </Link>
            </>
          ) : (
            <>
              Your Case Summary and Intervention Plan has been sent to your
              email. Review, sign and upload it back.
            </>
          ),
      },
      {
        title: "Approved",
        description:
          activeStep === 3 ? (
            <>
              Your cancer treatment has been scheduled for{" "}
              <b>
                {new Date(cancerTreatment?.treatment_date).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </b>
              . Please make sure to arrive at least 15 minutes early and bring
              any required identification.
            </>
          ) : (
            <>
              Your cancer treatment has been scheduled for{" "}
              <b>
                {new Date(cancerTreatment?.treatment_date).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </b>
              . Please make sure to arrive at least 15 minutes early and bring
              any required identification.
            </>
          ),
      },
      {
        title: "Completed",
        description:
          activeStep === 4 ? (
            <>
              Upload the results of your radiation therapy.{" "}
              <Link
                to={`/beneficiary/applications/cancer-treatment/view/${id}/upload`}
                state={{
                  individual_screening: cancerTreatment,
                  purpose: "result_upload",
                }}
                className="text-blue-500 underline"
              >
                Click here to upload!
              </Link>
            </>
          ) : (
            <>
              {" "}
              After completion you are required to upload the results of your
              cancer screening.
            </>
          ),
      },
    ],
    [activeStep, cancerTreatment]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/cancer-management/details/${id}/`);
        setCancerTreatment(data);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [user, id]);

  return (
    // <div className="h-screen w-full flex flex-col bg-[#F8F9FA]">
    <div className="h-screen w-full flex flex-col justify-start items-center p-5 gap-3 bg-gray overflow-auto">
      {/* <div className=" px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Cancer Treatment</h1>
        <Link to="/beneficiary/applications/cancer-treatment">
          <img
            src="/images/back.png"
            alt="Back"
            className="h-6 cursor-pointer"
          />
        </Link>
      </div> */}

      {/* <div className="flex-1 w-full py-5 px-5 flex justify-center items-start"> */}
      <div className="h-full w-full flex flex-col justify-between">
        {/* <div className="bg-white flex flex-col gap-7 rounded-[4px] shadow-md p-6 w-full max-w-3xl"> */}
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="w-full bg-white rounded-[4px] p-4 ">
            <h2 className="text-md font-bold mb-3">
              Treatment Application Progress
            </h2>
            {/* <div className="flex justify-between items-center">
              <h2 className="text-md font-bold mb-3">Screening Progress</h2>
            </div> */}

            {/* Stepper */}
            <div className="flex flex-col gap-0">
              {stepList.map((step, idx) => {
                const isActive = idx === activeStep;
                const isLast = idx === stepList.length - 1;
                return (
                  <div key={idx} className="flex gap-5 relative">
                    {/* Step circle + connector */}
                    <div className="flex flex-col items-center relative">
                      <div
                        className={`w-10 h-10 flex justify-center items-center rounded-full z-10 ${
                          idx <= activeStep
                            ? "bg-yellow text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <p className="font-bold text-lg">{idx + 1}</p>
                      </div>

                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={`absolute top-10 left-1/2 -translate-x-1/2 w-[2px] h-full ${
                            idx < activeStep ? "bg-yellow" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step text */}
                    <div className="flex flex-col gap-1 pb-8">
                      <h3 className="font-semibold text-md text-gray-800">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* <LOAPrintTemplate loaData={individualScreening} /> */}
    </div>
  );
}
