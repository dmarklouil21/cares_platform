import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

// import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Processing: 1,
  Recommendation: 2,
  Completed: 3,
  // Closed: 4,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewHomeVisitStatus() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [homeVisit, setHomeVisit] = useState(null);

  const activeStep = getStepIndexByStatus(homeVisit?.status || "");

  // Step definitions
  const stepList = useMemo(
    () => [
      {
        title: "Pending",
        description: (() => {
          // 1. PAST
          if (activeStep > 0) {
            return (
              <>
                You have submitted your Well-Being Form. The team is currently
                reviewing your responses to determine the schedule.
              </>
            );
          }
          // 2. CURRENT
          return (
            <>
              You’ve been selected for a home visit. Before it can be scheduled,
              please fill out and submit the{" "}
              <span
                onClick={() => navigate(`wellbeing-form`)}
                className="text-blue-700 font-semibold underline cursor-pointer hover:text-blue-800"
              >
                Well-Being Form
              </span>
              . This form helps us assess your current condition and prepare for
              the visit.
            </>
          );
        })(),
      },
      {
        title: "Processing",
        description: (() => {
          // 1. PAST
          if (activeStep > 1) {
            return (
              <>
                Home visit scheduled for{" "}
                <b>
                  {homeVisit?.visit_date
                    ? new Date(homeVisit.visit_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </b>{" "}
                is marked as done.
              </>
            );
          }
          // 2. CURRENT
          if (activeStep === 1) {
            return (
              <>
                Your home visit has been scheduled for{" "}
                <b>
                  {homeVisit?.visit_date
                    ? new Date(homeVisit.visit_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </b>
                . Please make sure to be available at your residence during this
                date.
              </>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              Your visit date will be scheduled after reviewing your well-being
              form.
            </span>
          );
        })(),
      },
      {
        title: "Recommendation",
        description: (() => {
          // 1. PAST
          if (activeStep > 2) {
            return (
              <p className="text-green-600 font-medium">
                Post-visit recommendation report finalized.
              </p>
            );
          }
          // 2. CURRENT
          if (activeStep === 2) {
            return (
              <>
                Your home visit has been completed. Our healthcare team is now
                preparing a report and medical recommendation based on the visit
                findings.
              </>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              Findings and recommendations will be processed here after the visit.
            </span>
          );
        })(),
      },
      {
        title: "Completed",
        description: (() => {
          // 1. PAST / CURRENT (Final Step)
          if (activeStep >= 3) {
            return (
              <p className="text-green-600 font-medium">
                Your home visit case has been completed. Thank you for your
                cooperation and have a smooth recovery.
              </p>
            );
          }
          // 2. FUTURE
          return (
            <span className="text-gray-500">
              Once the recommendation has been finalized and shared, your case
              will be marked as closed.
            </span>
          );
        })(),
      },
    ],
    [activeStep, homeVisit, navigate]
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
  }, [user, id]);

  return (
    // Main Container mirroring the modern design
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-6 px-5 md:px-10 flex flex-col flex-1">
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6">Application Status</h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-5 md:px-8 flex-1 overflow-auto">
          
          {/* Header */}
          <h1 className="font-bold text-[24px] md:text-3xl text-yellow">
            Home Visit Progress
          </h1>

          {/* Stepper Content */}
          <div className="flex-1 w-full max-w-4xl">
            <div className="flex flex-col gap-0 mt-4">
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
                    <div className="flex flex-col gap-1 pb-10">
                      <h3 className="font-semibold text-md text-gray-800">
                        {step.title}
                      </h3>
                      <div className="text-gray-600 text-sm">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions / Footer Button */}
          <div className="mt-6 flex justify-end">
            <Link
              to="/beneficiary/home-visit"
              className="border border-black/15 py-3 rounded-md text-center px-6 hover:bg-black/10 hover:border-black w-full md:w-[40%]"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom decorative strip */}
      <div className="h-16 bg-secondary"></div>
    </div>
  );
}