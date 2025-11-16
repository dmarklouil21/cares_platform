import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";
import { useAuth } from "src/context/AuthContext";

import FileUploadModal from "src/components/Modal/FileUploadModal";
import CheckupScheduleModal from "src/components/Modal/CheckupScheduleModal";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// import LOAPrintTemplate from "../download/LOAPrintTemplate";

// Map status to step index
const STATUS_TO_STEP = {
  Pending: 0,
  Approved: 1,
  Completed: 2,
  // "Follow-up Required": 3,
  // Closed: 3,
};

const getStepIndexByStatus = (status) => STATUS_TO_STEP[status] ?? 0;

export default function ViewhormonalReplacementStatus() {
  const { user } = useAuth();
  // const location = useLocation();
  const { id } = useParams();
  const [hormonalReplacement, setHormonalReplacement] = useState(null);

  const [uploadResultModalOpen, setUploadResultModalOpen] = useState(false);
  const [resultFile, setResultFile] = useState(null);

  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  const [loading, setLoading] = useState(false);

  const activeStep = getStepIndexByStatus(hormonalReplacement?.status || "");

  // Step definitions
  const stepList = useMemo(() => {
    const baseSteps = [
      {
        title: "Pending",
        description:
          activeStep === 0 ? (
            <>
              Your request for hormonal replacement medication has been
              submitted and is currently under review. Once approved, you’ll
              receive instructions on the next steps.
            </>
          ) : (
            <>
              Your request has been approved. You will be notified with your
              medicines release date through email.
            </>
          ),
      },
      {
        title: "Approved",
        description:
          activeStep === 1 ? (
            <>
              Your hormonal replacement medication request has been approved.{" "}
              Your medicines release date has been scheduled for{" "}
              <b>
                {new Date(
                  hormonalReplacement?.released_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </b>
              . Please make sure to arrive at least 15 minutes early and bring
              any required identification.
            </>
          ) : (
            <>
              Your medicines release date has been scheduled for{" "}
              <b>
                {new Date(
                  hormonalReplacement?.released_date
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
      {
        title: "Completed",
        description:
          activeStep === 2 ? (
            <>
              Your hormonal replacement medication request has been successfully
              claimed.
            </>
          ) : activeStep > 2 ? (
            <> Your hormonal replacement is complete. </>
          ) : (
            <>
              {" "}
              You will be notified through email if the medicine is available
              for claiming.{" "}
            </>
          ),
      },
    ];

    return baseSteps;
  }, [activeStep, hormonalReplacement]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/hormonal-replacement/details/${id}/`
        );
        setHormonalReplacement(data);

        if (data?.status === "Follow-up Required") {
          STATUS_TO_STEP["Follow-up Required"] = 3;
          STATUS_TO_STEP["Closed"] = 4;
        }
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
          `/beneficiary/post-treatment/result/upload/${hormonalReplacement.id}/`,
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

      <CheckupScheduleModal
        open={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        data={hormonalReplacement}
      />
      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray overflow-auto">
        {/* <div className=" px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Post Treatment</h1>
          <Link to="/beneficiary/applications/post-treatment">
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
                Hormonal Replacement Medication Request
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
                          {step?.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {step?.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-full mt-4">
                <Link
                  to="/beneficiary/applications/hormonal-replacement"
                  className="flex items-center justify-center border rounded-md w-[300px] py-3 mx-auto border-black/15 hover:bg-black/10 hover:border-black "
                >
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* <LOAPrintTemplate loaData={individualScreening} /> */}
      </div>
    </>
  );
}
