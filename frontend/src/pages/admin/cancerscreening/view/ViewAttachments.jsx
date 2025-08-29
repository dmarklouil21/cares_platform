import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import ConfirmationModal from "src/components/ConfirmationModal";

const ViewAttachments = () => {
  const location = useLocation();
  const record = location.state;
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

  useEffect(() => {
    if (record.screening_procedure) {
      const serverFiles = record.screening_procedure.attachments.map((fileObj) => {
        const fileUrl = fileObj.file;
        const fileName = fileUrl.split("/").pop();
        const fileExtension = fileName.split(".").pop().toLowerCase();

        return {
          id: fileObj.id,
          name: fileName,
          type: fileExtension,
          url: fileUrl,
        };
      });

      setFiles(serverFiles);
    }
  }, [record]);

  const handleAddFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = (e) => {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        type: file.type.split("/")[1] || "file",
        url: URL.createObjectURL(file),
        fileObject: file, // Store the actual file object
      }));

      setFiles([...files, ...newFiles]);
    };

    input.click();
  };

  console.log("Files: ", files)
  const handleDelete = async (index, e) => {
    e.stopPropagation();

    setModalText('Are you sure you want to delete this attachment?');
    setModalAction({ type: "delete", file: files[index] }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "delete") {
      const fileToDelete = modalAction.file;
      console.log("Attachment ID: ", fileToDelete.id)

      if (!fileToDelete) {
        console.error("No file found for deletion.");
        alert("Something went wrong. File not found.");
        return;
      }

      try {
        if (fileToDelete.url.startsWith("blob:")) {
          URL.revokeObjectURL(fileToDelete.url);
          setFiles((prev) => prev.filter((f) => f !== fileToDelete));
        } else if (fileToDelete.id) {
          setModalOpen(false);
          setLoading(true);
          await api.delete(`/cancer-screening/individual-screening/attachments-delete/${fileToDelete.id}/`);
          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Deleted successfully.",
          });
          setShowModal(true);
          setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        }
      } catch (error) {
        let errorMessage = "Something went wrong while deleting the attachment."; 

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          }
        }
        setModalInfo({
          type: "error",
          title: "Failed to delete the file.",
          message: errorMessage,
        });
        setShowModal(true);
        console.error("Error deleting file:", error.message);
      } finally {
        setLoading(false);
      }
    } else if (modalAction?.type === "submit") {
      const formData = new FormData();

      files.forEach((item) => {
        if (item.fileObject) {
          // Only include new files (not existing ones already saved on the backend)
          formData.append("attachments", item.fileObject);
        }
      });

      if (formData.has("attachments")) {
        try {
          setLoading(true);
          setModalOpen(false);
          await api.patch(`/cancer-screening/individual-screening/attachments-update/${record.screening_procedure.id}/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Added successfully.",
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
            title: "Failed to add new file.",
            message: errorMessage,
          });
          setShowModal(true);
          console.error("Error uploading attachments:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        alert("No new attachments to upload.");
      }
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

    setModalText('Are you sure you want to add this file?');
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
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Attachments</h1>
          <div className="p-3">
            <Link 
              to={"/Admin/cancerscreening/view/AdminIndividualScreeningView"}
              state={{record: record}}
            >
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-6"
              />
            </Link>
          </div>
        </div>
        <div className="h-full w-full p-5 flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Patient ID - {record?.patient.patient_id}</h1>
            </div>
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-[4px] py-10 px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-600">No Attachment Files Found</h2>
                <p className="text-gray-500 mt-2">
                  This patient doesn't have an attachment submitted yet.
                </p>
                <button
                  onClick={handleAddFile}
                  className="text-center font-bold bg-primary text-white mt-5 py-2 w-[15%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
                >
                  Add File
                </button>
              </div>
            ) : (
              <div className="w-full bg-white rounded-[4px] p-4 ">
                <h1 id="details_title" className="text-md font-bold mb-3">
                  Documents Uploaded
                </h1>
                <div className="bg-gray-100 border border-dashed border-gray-300 rounded-sm p-6 flex flex-row gap-4 flex-wrap items-center justify-start min-h-[120px]">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group"
                      onClick={(e) => handleViewFile(file, e)}
                    >
                      <div className="w-32 h-32 bg-white rounded-sm shadow flex flex-col items-center justify-center cursor-pointer border border-gray-200 hover:shadow-lg transition">
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
            )}
          </div>
          {files.length !== 0 && (
            <div className="w-full flex justify-around">
            <button
              onClick={handleAddFile}
              className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
              // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add File
            </button>
            <button
              onClick={handleSave}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewAttachments;
