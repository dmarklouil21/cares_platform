import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import ConfirmationModal from "src/components/ConfirmationModal";

const UploadAttachments = () => {
  const location = useLocation();
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

    setModalText('Are you sure you want to delete this attachment?');
    setModalAction({ type: "delete", file: files[index] }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      const formData = new FormData();

      if (files.length > 0 && files[0].fileObject) {
        formData.append("attachments", files[0].fileObject);
      } else {
        alert("Please select a file before submitting.");
        return;
      }

      try {
        setLoading(true);
        const url = purpose === 'loa_upload' ? `/beneficiary/individual-screening/attachments-upload/${individualScreening.screening_procedure.id}/` : 
                    purpose === 'result_upload' ? `/beneficiary/individual-screening/results-upload/${individualScreening.id}/` : '';
         const response = await api.patch(url, formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Submitted successfully.",
        });
        setShowModal(true);
      } catch (error) {
        let errorMessage = "Something went wrong while submitting the attachment."; 

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
    }
    else if (modalAction?.type === "delete") {
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

    setModalText('Make sure to submit the correct file, you can only submit once!');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
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
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col">
          <div className="flex justify-between p-3 items-center">
            <h2 className="text-xl font-semibold">Upload Attachments</h2>
            {/* <h3 className="text-2xl font-bold text-secondary">ATTACHMENTS</h3> */}
            <Link 
              to={"/Beneficiary/individualscreeningstatus/individualstatus-view"}
              // state={{record: record}}
            >
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-7"
              />
            </Link>
          </div>
          <div className="w-full bg-white rounded-2xl py-7 px-8 ">
            <h1 id="details_title" className="font-bold text-xl mb-5">
              Attachments
            </h1>
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-row gap-4 flex-wrap items-center justify-start min-h-[120px]">
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

            <div className="flex gap-5 mt-4">
              <button
                onClick={handleSave}
                className="bg-[#749AB6] text-white px-4 py-2 rounded hover:bg-[#5a7e9c]"
                // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
              <button
                onClick={handleAddFile}
                className="bg-[#749AB6] text-white px-4 py-2 rounded hover:bg-[#5a7e9c]"
                // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadAttachments;
