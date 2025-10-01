import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";

const UploadAttachments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const individualScreening = location.state.individual_screening;
  const purpose = location.state.purpose;
  const [files, setFiles] = useState([]);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal
  const [loading, setLoading] = useState(false);
  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const handleAddFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false; // Only allow one file

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const newFile = {
        name: file.name,
        type: file.type.split("/")[1] || "file",
        url: URL.createObjectURL(file),
        fileObject: file, // Store actual file object
      };

      setFiles([newFile]); // Replace any existing file
    };

    input.click();
  };

  const handleDelete = async (index, e) => {
    e.stopPropagation();

    setModalText("Are you sure you want to delete this attachment?");
    setModalDesc("This action cannot be undone.");
    setModalAction({ type: "delete", file: files[index] });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      const formData = new FormData();

      if (files.length > 0 && files[0].fileObject) {
        formData.append("screening_attachments", files[0].fileObject);
      } else {
        alert("Please select a file before submitting.");
        return;
      }

      try {
        setModalOpen(false);
        setLoading(true);
        const url =
          purpose === "loa_upload"
            ? `/beneficiary/individual-screening/attachments-upload/${individualScreening.id}/`
            : purpose === "result_upload"
            ? `/beneficiary/individual-screening/results-upload/${individualScreening.id}/`
            : "";
        const response = await api.patch(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        navigate("/Beneficiary/individualscreeningstatus", {
          state: {
            type: "success",
            message: "Submitted Successfully.",
          },
        });
        // setModalInfo({
        //   type: "success",
        //   title: "Success!",
        //   message: "Submitted successfully.",
        // });
        // setShowModal(true);
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
        console.error("Error uploading attachment:", error.message);
      } finally {
        setLoading(false);
      }
    } else if (modalAction?.type === "delete") {
      const fileToDelete = modalAction.file;

      if (!fileToDelete) {
        console.error("No file found for deletion.");
        alert("Something went wrong. File not found.");
        return;
      }

      URL.revokeObjectURL(fileToDelete.url);
      setFiles((prev) => prev.filter((f) => f !== fileToDelete));
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleViewFile = (file, e) => {
    e.stopPropagation();
    if (file.fileObject) {
      // For newly uploaded files
      const fileURL = URL.createObjectURL(file.fileObject);
      window.open(fileURL, "_blank");
    } else {
      // For sample files
      window.open(file.url, "_blank");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setModalText("Confirm Submission?");
    setModalDesc(
      "Make sure to submit the correct file, you can only submit once!"
    );
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          setModalText("");
        }}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Submitting your data..." />
      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-[#F8F9FA]">
        <div className=" px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Individual Screening</h1>
          <Link
            to={"/beneficiary/applications/individual-screening/view"}
            state={individualScreening}
          >
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>
        <div className="h-full w-full flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="w-full bg-white rounded-[4px] p-4 ">
              <h1 id="details_title" className="text-md font-bold mb-3">
                Upload Results
              </h1>
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-sm p-6 flex flex-row gap-4 flex-wrap items-center justify-start min-h-[120px]">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group"
                    onClick={(e) => handleViewFile(file, e)}
                  >
                    <div className="w-32 h-32 bg-white rounded-lg shadow flex flex-col items-center justify-center cursor-pointer border border-gray-200 hover:shadow-lg transition">
                      {file?.type?.match(/image/) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-16 h-16 object-contain mb-2"
                        />
                      ) : file.type.includes("pdf") ? (
                        <img
                          src="/src/assets/images/admin/cancerscreening/individualscreening/pdf.svg"
                          alt="PDF"
                          className="w-12 h-12 mb-2"
                        />
                      ) : file.type.match(/docx?/) ? (
                        <img
                          src="/src/assets/images/admin/cancerscreening/individualscreening/docs.svg"
                          alt="DOC"
                          className="w-12 h-12 mb-2"
                        />
                      ) : (
                        <span className="w-12 h-12 mb-2 bg-gray-300 rounded" />
                      )}
                      <span className="text-xs text-center break-all px-1">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(idx, e)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex justify-around">
            <button
              onClick={handleAddFile}
              className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
              // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Choose File
            </button>
            <button
              onClick={handleSave}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadAttachments;
