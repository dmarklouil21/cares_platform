import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

import FileUploadModal from "src/components/Modal/FileUploadModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Approve: 1,
  // "In Progress": 2,
  Complete: 2,
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
              Your request has been approved. You will be notified with your
              screening date through email.
            </>
          ),
      },
      {
        title: "Approve",
        description:
          activeStep === 1 ? (
            <>
              {/* To proceed with your application, fill out the Screening Procedure form and submit the required documents.{" "} */}
              Your cancer screening has been scheduled for{" "}
              <b>
                {new Date(
                  individualScreening?.screening_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </b>
              . Please make sure to arrive at least 15 minutes early and bring
              any required identification.
              {/* <Link
            to="/Beneficiary/services/cancer-screening/screening-requirements-note"
            className="text-blue-500 underline"
          >
            Click here to proceed!
          </Link> */}
            </>
          ) : (
            <>
              {/* Fill out the Screening Procedure form and submit the required documents. */}
              Your cancer screening has been scheduled for{" "}
              <b>
                {new Date(
                  individualScreening?.screening_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </b>
              . Please make sure to arrive at least 15 minutes early and bring
              any required identification.
            </>
          ),
      },
      // {
      //   title: "In Progress",
      //   description:
      //     activeStep === 2 ? (
      //       <>Your cancer screening is in progress.</>
      //     ) : activeStep > 2 ? (
      //       <> Your cancer screening is complete. </>
      //     ) : (
      //       <>
      //         {" "}
      //         Your screening date will be scheduled once everything is ready.{" "}
      //       </>
      //     ),
      // },
      {
        title: "Complete",
        description:
          activeStep === 2 ? (
            <>
              Upload the results of your cancer screening.{" "}
              <span
                className="text-blue-500 underline cursor-pointer"
                onClick={() => setUploadResultModalOpen(true)}
                // to="/beneficiary/applications/individual-screening/upload-attachments"
                // state={{
                //   individual_screening: individualScreening,
                //   purpose: "result_upload",
                // }}
                // className="text-blue-500 underline"
              >
                Click here to upload!
              </span>
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

        await api.patch(`/beneficiary/individual-screening/results-upload/${individualScreening.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

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
          // DRF ValidationError returns an object with arrays of messages
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
    } finally {
      // Stop here
    }
  };

  return (
    // <div className="h-screen w-full flex flex-col bg-[#F8F9FA]">
    <>
      {loading && <SystemLoader />}

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {/* Upload Result Modal */}
      <FileUploadModal
        open={uploadResultModalOpen}
        title="Upload Result"
        // recipient={data?.patient?.email}
        onFileChange={setResultFile}
        onConfirm={handleUpload}
        onCancel={() => setUploadResultModalOpen(false)}
      />

      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray overflow-auto">
        {/* <div className=" px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Individual Screening</h1>
          <Link to="/beneficiary/applications/individual-screening">
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
              <h2 className="text-md font-bold mb-3">Screening Progress</h2>
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
    </>
  );
}
