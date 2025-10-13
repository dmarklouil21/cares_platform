import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

// import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Processing: 1,
  Recommendation: 2,
  Closed: 3,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewHomeVisitStatus() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  // const id = location?.state.id;
  const [homeVisit, setHomeVisit] = useState(null);

  const activeStep = getStepIndexByStatus(homeVisit?.status || "");

  // Step definitions
  const stepList = useMemo(
    () => [
      {
        title: "Pending",
        description:
          activeStep === 0 ? (
            <>
              You’ve been selected for a home visit. Before it can be scheduled,
              Please fill out and submit the <span onClick={() => navigate(`wellbeing-form`)} className="text-blue-700 underline cursor-pointer">Well-Being Form</span> in this page. This form helps us
              assess your current condition and prepare for the visit.
            </>
          ) : (
            <>
              You’ve completed the Well-Being Form. The team will now review your
              responses to determine your home visit schedule.
            </>
          ),
      },
      {
        title: "Processing",
        description:
          activeStep === 1 ? (
            <>
              Your home visit has been scheduled for{" "}
              <b>
                {new Date(homeVisit?.visit_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </b>
              . Please make sure to be available at your residence during this
              date.
            </>
          ) : activeStep < 1 ? (
            <>
             Your visit date will be schedule after reviewing your well being form.
            </>
          ) : (
            <>
              Home visit is complete, wait for the findings and recommendation to be sent to you.
            </>
          ),
      },
      {
        title: "Recommendation",
        description:
          activeStep === 2 ? (
            <>
              Your home visit has been completed. Our healthcare team is now
              preparing a report and medical recommendation based on the visit
              findings.
            </>
          ) : activeStep > 2 ? (
            <> Your post-visit recommendation has been finalized. </>
          ) : (
            <>
              Your home visit schedule will be set once your Well-Being Form has
              been reviewed.
            </>
          ),
      },
      {
        title: "Closed",
        description:
          activeStep === 3 ? (
            <>
              Your home visit case has been completed. Thank you for your cooperation and have a smooth recovery.
              {/* <Link
                to="/beneficiary/applications/individual-screening/upload-attachments"
                state={{
                  home_visit: homeVisit,
                  purpose: "result_upload",
                }}
                className="text-blue-500 underline"
              >
                Click here to view or upload additional documents.
              </Link> */}
            </>
          ) : (
            <>
              Once the recommendation has been finalized and shared, your case will
              be marked as closed.
            </>
          ),
      },
    ],
    [activeStep, homeVisit]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/home-visit/details/${id}/`
        );
        setHomeVisit(data);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [user]);

  return (
    // <div className="h-screen w-full flex flex-col bg-[#F8F9FA]">
    <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray overflow-auto">
      {/* <div className=" px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Home Visit</h1>
        <Link to="/beneficiary/home-visit">
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
            <h2 className="text-md font-bold mb-3">Home Visit Progress</h2>
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

      {/* <LOAPrintTemplate loaData={homeVisit} /> */}
    </div>
  );
}
