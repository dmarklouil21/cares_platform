import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";
import { Camera } from "lucide-react";

import FileUploadModal from "src/components/Modal/FileUploadModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  "Interview Process": 1,
  "Case Summary Generation": 2,
  Approved: 3,
  Completed: 4,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewCancerTreatmentStatus() {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [cancerTreatment, setCancerTreatment] = useState(null);

  const [uploadResultModalOpen, setUploadResultModalOpen] = useState(false);
  const [resultFile, setResultFile] = useState(null);

  const [uploadCaseSummaryModalOpen, setUploadCaseSummaryModalOpen] =
    useState(false);
  const [caseFile, setCaseFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  const activeStep = getStepIndexByStatus(cancerTreatment?.status || "");

  // Step definitions with 3-Way Logic (Past, Present, Future)
  const stepList = useMemo(
    () => [
      {
        title: "Pending",
        description:
          activeStep === 0 ? (
            // CURRENT: Step 0
            <>
              Your request for cancer treatment service has been submitted and
              is currently under review. Once approved, you’ll receive
              instructions on the next steps.
            </>
          ) : (
            // PAST
            <>
              Your request has been accepted. You have been notified regarding your
              interview details.
            </>
          ),
      },
      {
        title: "Interview Process",
        description: (() => {
          // 1. PAST (Step > 1)
          if (activeStep > 1) {
            return (
              <>
                Interview process completed on{" "}
                <b>
                  {cancerTreatment?.interview_date
                    ? new Date(cancerTreatment.interview_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "N/A"}
                </b>.
              </>
            );
          }
          // 2. CURRENT (Step == 1)
          if (activeStep === 1) {
            return (
              <>
                Your request for {cancerTreatment?.service_type} has been
                accepted. Please proceed to the Interview process. You are
                scheduled for an interview on{" "}
                <b>
                  {cancerTreatment?.interview_date
                    ? new Date(cancerTreatment.interview_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "TBA"}
                </b>.
              </>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              Once your initial request is approved, your interview schedule will appear here.
            </span>
          );
        })(),
      },
      {
        title: "Case Summary & Intervention Plan",
        description: (() => {
          // 1. PAST
          if (activeStep > 2) {
            return (
              <p className="text-green-600 font-medium">
                Case Summary and Intervention Plan signed and uploaded.
              </p>
            );
          }
          // 2. CURRENT
          if (activeStep === 2) {
            return (
              <div className="space-y-2">
                <p>
                  Your Case Summary and Intervention Plan has been sent to your
                  email. Review, sign and upload it back.
                </p>
                <div
                  className="md:w-[40%] flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                  onClick={() => setUploadCaseSummaryModalOpen(true)}
                >
                  <Camera className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                      Upload Signed Document
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              After the interview, you will need to review and sign the case summary here.
            </span>
          );
        })(),
      },
      {
        title: "Approved",
        description: (() => {
          // 1. PAST
          if (activeStep > 3) {
            return (
              <>
                Treatment scheduled for{" "}
                <b>
                  {cancerTreatment?.treatment_date
                    ? new Date(cancerTreatment.treatment_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "N/A"}
                </b>
                {" "}is marked as done.
              </>
            );
          }
          // 2. CURRENT
          if (activeStep === 3) {
            return (
              <>
                Your cancer treatment has been scheduled for{" "}
                <b>
                  {cancerTreatment?.treatment_date
                    ? new Date(cancerTreatment.treatment_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "N/A"}
                </b>
                . Please make sure to arrive at least 15 minutes early and bring
                any required identification.
              </>
            );
          }
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              Once the case summary is finalized, your treatment date will be displayed here.
            </span>
          );
        })(),
      },
      {
        title: "Completed",
        description: (() => {
          // 1. PAST (If there were further steps) or Completed State
          if (activeStep > 4) {
            return (
              <p className="text-green-600 font-medium">
                Treatment results uploaded successfully.
              </p>
            );
          }
          // 2. CURRENT
          if (activeStep === 4) {
            return (
              <div className="space-y-2">
                <p>Upload the results of your {cancerTreatment?.service_type}.</p>
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
          // 3. FUTURE
          return (
            <span className="text-gray-500">
              After completion of treatment, you are required to upload the results here.
            </span>
          );
        })(),
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

  const handleCaseSummaryUpload = async () => {
    try {
      if (!caseFile) {
        setUploadCaseSummaryModalOpen(false);
        setModalInfo({
          type: "info",
          title: "Note",
          message: "Please select a file before uploading.",
        });
        setShowModal(true);
        return;
      }
      setUploadCaseSummaryModalOpen(false);
      setCaseFile(null);

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("attachments", caseFile);

        await api.patch(
          `/beneficiary/cancer-treatment/case-summary/upload/${cancerTreatment.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setModalInfo({
          type: "success",
          title: "Uploaded Successfully",
          message: "The signed case summary has been uploaded successfully.",
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
        formData.append("attachments", resultFile);

        await api.patch(
          `/beneficiary/cancer-treatment/result/upload/${cancerTreatment.id}/`,
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

      {/* Upload Case Summary Modal */}
      <FileUploadModal
        open={uploadCaseSummaryModalOpen}
        title="Upload Signed Case Summary"
        onFileChange={setCaseFile}
        onConfirm={handleCaseSummaryUpload}
        onCancel={() => setUploadCaseSummaryModalOpen(false)}
      />

      {/* Upload Result Modal */}
      <FileUploadModal
        open={uploadResultModalOpen}
        title="Upload Result"
        onFileChange={setResultFile}
        onConfirm={handleUpload}
        onCancel={() => setUploadResultModalOpen(false)}
      />

      {/* Main Container mirroring the modern design */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-5 md:px-10 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6">
            Application Status
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-5 md:px-8 flex-1 overflow-auto">
            
            {/* Header */}
            <h1 className="font-bold text-[24px] md:text-3xl text-yellow">
              Treatment Progress
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
                to="/beneficiary/applications/cancer-treatment"
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
    </>
  );
}