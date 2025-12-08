import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

// import { getPreCancerousMedsDetail } from "src/api/precancerous"; // Unused in this snippet but kept if needed

import FileUploadModal from "src/components/Modal/FileUploadModal";
import CheckupScheduleModal from "src/components/Modal/CheckupScheduleModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Approved: 1,
  Completed: 2,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function PreCancerousView() {
  const { user } = useAuth();
  const { id } = useParams();
  const [preCancerousMeds, setPreCancerousMeds] = useState(null);

  const [uploadResultModalOpen, setUploadResultModalOpen] = useState(false);
  const [resultFile, setResultFile] = useState(null);

  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  const [loading, setLoading] = useState(false);

  const activeStep = getStepIndexByStatus(preCancerousMeds?.status || "");

  // Step definitions
  const stepList = useMemo(() => {
    const baseSteps = [
      {
        title: "Pending",
        description: (() => {
          // 1. PAST
          if (activeStep > 0) {
            return (
              <>
                Your request has been approved. You have been notified regarding
                your medicine release details.
              </>
            );
          }
          // 2. CURRENT
          return (
            <>
              Your request for pre-cancerous medication has been submitted
              and is currently under review. Once approved, you’ll receive
              instructions on the next steps.
            </>
          );
        })(),
      },
      {
        title: "Approved",
        description: (() => {
          // 1. PAST
          if (activeStep > 1) {
            return (
              <>
                Medicine release scheduled for{" "}
                <b>
                  {preCancerousMeds?.release_date_of_meds
                    ? new Date(
                        preCancerousMeds.release_date_of_meds
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
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
                Your pre-cancerous medication request has been approved and is scheduled for released in{" "}
                <b>
                  {preCancerousMeds?.release_date_of_meds
                    ? new Date(
                        preCancerousMeds.release_date_of_meds
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </b>
                . Please make sure to arrive at the designated date and bring
                any required identification.
              </>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              Once approved, your medicine release date will appear here.
            </span>
          );
        })(),
      },
      {
        title: "Completed",
        description: (() => {
          // 1. PAST (If there were steps after this)
          if (activeStep > 2) {
            return (
              <p className="text-green-600 font-medium">
                Medication claimed successfully.
              </p>
            );
          }
          // 2. CURRENT
          if (activeStep === 2) {
            return (
              <p className="text-green-600 font-medium">
                Your pre-cancerous medication has been successfully claimed.
              </p>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              You will be notified here once the medicine is successfully claimed.
            </span>
          );
        })(),
      },
    ];

    return baseSteps;
  }, [activeStep, preCancerousMeds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/beneficiary/precancerous-meds/${id}/`);
        setPreCancerousMeds(data);
      } catch (error) {
        console.error("Error fetching record data:", error);
      }
    };

    fetchData();
  }, [user, id]);

  const handleUpload = async () => {
    try {
      if (!resultFile) {
        setUploadResultModalOpen(false);
        setModalInfo({
          type: "info",
          title: "Note",
          message: "Please select a file before uploading.",
        });
        setShowModal(true);
        return;
      }
      setUploadResultModalOpen(false);
      setResultFile(null);

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", resultFile);

        // Note: Check if this endpoint is correct for Pre-Cancerous. 
        // Kept as provided in the snippet.
        await api.patch(
          `/beneficiary/post-treatment/result/upload/${preCancerousMeds.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setModalInfo({
          type: "success",
          title: "Result Uploaded",
          message: "The result has been uploaded successfully.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed",
          message: "Something went wrong while uploading the result.",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {loading && <SystemLoader />}

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <FileUploadModal
        open={uploadResultModalOpen}
        title="Upload Result"
        onFileChange={setResultFile}
        onConfirm={handleUpload}
        onCancel={() => setUploadResultModalOpen(false)}
      />

      <CheckupScheduleModal
        open={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        data={preCancerousMeds}
      />

      {/* Main Container mirroring the modern design */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6">Application Status</h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto">
            
            {/* Header */}
            <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
              Pre-Cancerous Medication Progress
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
                to="/beneficiary/applications/precancerous"
                // className="border border-black/15 py-3 rounded-md text-center px-6 hover:bg-black/10 hover:border-black w-full md:w-[40%]"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom decorative strip */}
        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
}