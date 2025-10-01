import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const LabResult = () => {
  const location = useLocation();
  const record = location.state;
  const { id } = useParams();
  const [files, setFiles] = useState(null);
  const [description, setDescription] = useState(
    record?.result_description || ""
  );
  const [showDescriptionField, setShowDescriptionField] = useState(
    !!record?.result_description // show by default if description already exists
  );

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
    if (record.uploaded_result) {
      if (record.uploaded_result) {
        const fileUrl = record.uploaded_result;
        const fileName = fileUrl.split("/").pop();
        const fileExtension = fileName.split(".").pop().toLowerCase();

        setFiles([
          {
            id: record.id,
            name: fileName,
            type: fileExtension,
            url: fileUrl,
          },
        ]);
      }
    }
  }, [record]);

  console.log("Files: ", files);

  const handleAddFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;

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
    setModalAction({ type: "delete", file: files[index] });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "delete") {
      const fileToDelete = modalAction.file;

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
          setLoading(true);
          setModalOpen(false);
          await api.delete(
            `/cancer-screening/individual-screening/results-attachment-delete/${record?.id}/`
          );
          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Deleted successfully.",
          });
          setShowModal(true);
          setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        }
      } catch (error) {
        let errorMessage =
          "Something went wrong while deleting the attachment.";

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

      formData.append("description", description);

      if (formData.has("attachments")) {
        try {
          setLoading(true);
          setModalOpen(false);
          await api.patch(
            `/cancer-screening/individual-screening/results-upload/${record?.id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Added successfully.",
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

    setModalText("Are you sure you want to add this file?");
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
      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray">
        <div className=" h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Post Treatment</h1>
          <Link to={`/admin/treatment-assistance/postview/${id}`}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-6"
            />
          </Link>
        </div>

        <div className="h-full w-full flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-3xl text-yellow font-bold">
                Laboratory Test Result
              </h2>
              <p className="font-bold italic">
                View the uploaded result of the patient.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
                <div className="flex items-center gap-3 justify-between bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <CheckIcon active={files} />
                    <span className="text-gray-900 font-medium">
                      Patient Result
                    </span>
                  </div>
                  {files ? (
                    <a
                      href={files[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-red-500 text-sm">Missing</span>
                  )}
                </div>
              </div>

              {/* ADD NOTE BUTTON */}
              {!showDescriptionField && (
                <button
                  onClick={() => setShowDescriptionField(true)}
                  className="self-start bg-yellow-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm hover:bg-yellow-600"
                >
                  + Add Note
                </button>
              )}

              {/* NEW DESCRIPTION FIELD */}
              {showDescriptionField && (
                <div className="flex flex-col gap-2">
                  <label className="text-gray-900 font-medium">
                    Result Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for the result..."
                    className="w-full px-4 py-3 border border-black/15 rounded-lg shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-around">
            <Link
              to={`/admin/treatment-assistance/postview/${id}`}
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            >
              Back
            </Link>
            <button
              // type="submit"
              type="button"
              onClick={handleSave}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabResult;
