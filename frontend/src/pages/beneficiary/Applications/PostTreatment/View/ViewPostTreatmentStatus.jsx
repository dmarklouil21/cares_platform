import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";
import { Camera } from "lucide-react";

import FileUploadModal from "src/components/Modal/FileUploadModal";
import CheckupScheduleModal from "src/components/Modal/CheckupScheduleModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// Map status to step index
// Note: We handle the dynamic "Follow-up" index inside the component logic
const STATUS_TO_STEP = {
  Pending: 0,
  Approved: 1,
  Completed: 2,
  "Follow-up Required": 3,
  Closed: 3, // Default closed index, might shift if follow-up exists
};

export default function ViewPostTreatmentStatus() {
  const { user } = useAuth();
  const { id } = useParams();
  const [postTreatment, setPostTreatment] = useState(null);

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

  // Calculate active step dynamically based on whether Follow-up is required
  const activeStep = useMemo(() => {
    const status = postTreatment?.status || "";
    let step = STATUS_TO_STEP[status] ?? 0;

    // If "Closed" and we previously had a follow-up, the step should be 4
    // (This logic depends on how your backend stores history, but assuming simple status check:)
    if (status === "Closed" && postTreatment?.follow_up_required_previously) { 
       // You might need a flag in your data if 'Closed' doesn't distinguish between 
       // closed-after-followup vs closed-normally. 
       // For now, we will stick to the basic mapping, but if Follow-up is visible, Closed is step 4.
       return 4; 
    }
    
    // Simple override for visual flow if strict "Closed" mapping is needed
    if (status === "Closed" && postTreatment?.status === "Follow-up Required") {
        return 4;
    }

    return step;
  }, [postTreatment]);

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
                Your request has been approved. You have been notified regarding your
                laboratory test details.
              </>
            );
          }
          // 2. CURRENT
          return (
            <>
              Your request for post-treatment care has been submitted and is
              currently under review. Once approved, you’ll receive instructions
              on the next steps.
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
                Laboratory test scheduled for{" "}
                <b>
                  {postTreatment?.laboratory_test_date
                    ? new Date(postTreatment.laboratory_test_date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
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
                Your post treatment laboratory test request has been approved for{" "}
                <b>
                  {postTreatment?.laboratory_test_date
                    ? new Date(postTreatment.laboratory_test_date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
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
              Once approved, your laboratory test schedule will appear here.
            </span>
          );
        })(),
      },
      {
        title: "Completed",
        description: (() => {
          // 1. PAST
          if (activeStep > 2) {
            return (
              <p className="text-green-600 font-medium">
                Laboratory test results uploaded successfully.
              </p>
            );
          }
          // 2. CURRENT
          if (activeStep === 2) {
            return (
              <div className="space-y-2">
                <p>
                  Your laboratory test is complete. Please upload the result of
                  your test.
                </p>
                <div
                  className="md:w-[40%] flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
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
              After your test is completed, you are required to upload the results
              here.
            </span>
          );
        })(),
      },
    ];

    // Dynamic Logic: Check if Follow-up is required
    // We check the actual status string or a specific flag from backend
    const isFollowUp = postTreatment?.status === "Follow-up Required";
    
    if (isFollowUp) {
      baseSteps.push({
        title: "Follow-up Required",
        description: (() => {
            // 1. PAST (If we had a step after this)
            if (activeStep > 3) return "Follow-up process completed.";
            
            // 2. CURRENT
            if (activeStep === 3) {
                return (
                    <div className="space-y-1">
                        <p>Based on your results, a follow-up checkup is required.</p>
                        <span
                            onClick={() => setIsCheckupModalOpen(true)}
                            className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        >
                            View Checkup Schedules &rarr;
                        </span>
                    </div>
                )
            }
            // 3. FUTURE (Shouldn't really happen if logic is correct, but safe fallback)
            return "Follow-up details will appear here if required.";
        })()
      });
      
      baseSteps.push({
        title: "Closed",
        description: "Case is closed, thank you for your cooperation.",
      });
    } else {
      // Normal Closure
      baseSteps.push({
        title: "Closed",
        description: (() => {
            if (activeStep === 3 || activeStep === 4) return "Case is closed, thank you for your cooperation.";
            return <span className="text-gray-500">Case will be closed upon completion.</span>;
        })()
      });
    }

    return baseSteps;
  }, [activeStep, postTreatment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/post-treatment/view/${id}/`);
        setPostTreatment(data);
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

        await api.patch(
          `/beneficiary/post-treatment/result/upload/${postTreatment.id}/`,
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

      {/* Upload Result Modal */}
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
        data={postTreatment}
      />

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6">Application Status</h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto">
            
            {/* Header */}
            <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
              Post Treatment Progress
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
                to="/beneficiary/applications/post-treatment"
                // className="border border-black/15 py-3 rounded-md text-center px-6 hover:bg-black/10 hover:border-black w-full md:w-[40%]"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
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