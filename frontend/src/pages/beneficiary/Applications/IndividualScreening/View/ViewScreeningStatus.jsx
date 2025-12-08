import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";
import { Camera } from 'lucide-react';

import FileUploadModal from "src/components/Modal/FileUploadModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Approved: 1,
  // "In Progress": 2,
  Completed: 2,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewIndividualStatus() {
  const { user } = useAuth();
  const location = useLocation();
  const id = location?.state.id;
  const [individualScreening, setIndividualScreening] = useState(null);

  const [uploadResultModalOpen, setUploadResultModalOpen] = useState(false);
  const [resultFile, setResultFile] = useState(null);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  const [loading, setLoading] = useState(false);

  const activeStep = getStepIndexByStatus(individualScreening?.status || "");

  const stepList = useMemo(
    () => [
      {
        title: "Pending",
        description:
          activeStep === 0 ? (
            // CURRENT: Step 0
            <>
              Your request for cancer screening has been submitted and is currently
              under review. Once approved, you’ll receive instructions on the next
              steps.
            </>
          ) : (
            // COMPLETED: Step 0 (User is on Step 1 or 2)
            <>
              Your request has been approved. You have been notified via email regarding
              your screening details.
            </>
          ),
      },
      {
        title: "Approve",
        description: (() => {
          if (activeStep > 1) {
            return (
              <>
                Screening was scheduled for{" "}
                <b>
                  {individualScreening?.screening_date
                    ? new Date(individualScreening.screening_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </b>
                . Procedure marked as done.
              </>
            );
          }
          if (activeStep === 1) {
            return (
              <>
                Your cancer screening has been scheduled for{" "}
                <b>
                  {individualScreening?.screening_date
                    ? new Date(individualScreening.screening_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </b>
                . Please make sure to arrive at least 15 minutes early and bring any
                required identification.
              </>
            );
          }
          return (
            <span className="text-gray-500">
              Once your request is approved, your screening date and instructions will appear here.
            </span>
          );
        })(),
      },
      {
        title: "Complete",
        description: (() => {
          if (activeStep > 2) {
            return (
              <p className="text-green-600 font-medium">
                Results have been uploaded successfully.
              </p>
            );
          }
          if (activeStep === 2) {
            return (
              <div className="space-y-2">
                <p>Upload the results of your cancer screening.</p>
                <div
                  className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                  onClick={() => setUploadResultModalOpen(true)}
                >
                  <Camera className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                      Upload results
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <p className="text-gray-500">
              After your screening is completed, you will be required to upload the results here.
            </p>
          );
        })(),
      },
    ],
    [activeStep, individualScreening]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/individual-screening/${id}/`
        );
        setIndividualScreening(data);
      } catch (error) {
        console.error("Error fetching screening data:", error);
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
        formData.append("screening_attachments", resultFile);

        await api.patch(
          `/beneficiary/individual-screening/results-upload/${individualScreening.id}/`,
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
        let errorMessage =
          "Something went wrong while submitting the attachment.";

        if (error.response && error.response.data) {
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          }
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
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

      {/* Main Container mirroring IndividualScreening layout */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title similar to "Cancer Screening Application" */}
          <h2 className="text-xl font-semibold mb-6">
            Application Status
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto">
            
            {/* Header similar to "Individual Screening" */}
            <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
              Screening Progress
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
                to="/beneficiary/applications/individual-screening"
                // Styled to match the "Cancel" button in the other component
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom decorative strip */}
        <div className="h-16 bg-secondary"></div>
    </>
  );
}