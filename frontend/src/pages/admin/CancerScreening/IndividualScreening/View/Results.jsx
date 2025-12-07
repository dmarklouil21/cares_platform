import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/Modal/NotificationModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const ViewResults = () => {
  const location = useLocation();
  const record = location.state;
  const [files, setFiles] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    if (record?.uploaded_result) {
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
  }, [record]);

  const handleAddOrEditFile = () => {
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
        fileObject: file,
      };

      setFiles([newFile]); // Replace any existing file
    };

    input.click();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setModalText("Confirm deletion of this file?");
    setModalDesc("This action cannot be undone.");
    setModalAction({ type: "delete", file: files[0] });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    try {
      if (modalAction?.type === "delete") {
        const fileToDelete = modalAction.file;

        setLoading(true);
        setModalOpen(false);

        if (fileToDelete.url.startsWith("blob:")) {
          URL.revokeObjectURL(fileToDelete.url);
          setFiles(null);
        } else {
          await api.delete(
            `/cancer-screening/individual-screening/results-attachment-delete/${record?.id}/`
          );
          setFiles(null);
          setModalInfo({
            type: "success",
            title: "Deleted Successfully",
            message: "The uploaded result was removed.",
          });
          setShowModal(true);
        }
      } else if (modalAction?.type === "submit") {
        if (!files?.length) {
          alert("No file selected.");
          return;
        }

        const formData = new FormData();
        const fileToUpload = files[0];
        if (fileToUpload.fileObject) {
          formData.append("attachments", fileToUpload.fileObject);
        }

        setLoading(true);
        setModalOpen(false);
        const response = await api.patch(
          `/cancer-screening/individual-screening/results-upload/${record?.id}/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setModalInfo({
          type: "success",
          title: "Success!",
          message: response.data?.message || "File uploaded successfully.",
        });
        setShowModal(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        "Something went wrong.";
      setModalInfo({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
      setShowModal(true);
    } finally {
      setLoading(false);
      setModalOpen(false);
      setModalAction(null);
    }
  };

  const handleViewFile = (file, e) => {
    e.stopPropagation();
    const fileURL = file.fileObject
      ? URL.createObjectURL(file.fileObject)
      : file.url;
    window.open(fileURL, "_blank");
  };

  const handleSave = (e) => {
    e.preventDefault();
    setModalText("Confirm submission of this file?");
    setModalDesc("Make sure the file is correct before submitting.");
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
        onCancel={() => setModalOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {/* <LoadingModal open={loading} text="Processing your request..." /> */}
      {loading && <SystemLoader />}

      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray">
        <div className="h-full w-full flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-lg">
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-3xl text-yellow font-bold">Screening Result</h2>
              <p className="font-bold italic">
                View or update the uploaded result of the patient.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
                <div className="flex items-center gap-3 justify-between bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <CheckIcon active={!!files} />
                    <span className="text-gray-900 font-medium">
                      Patient Result
                    </span>
                  </div>

                  {files ? (
                    <div className="flex gap-3">
                      <a
                        href={record?.uploaded_result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer"
                        // onClick={(e) => handleViewFile(files[0], e)}
                      >
                        View
                      </a>
                      <span
                        className="text-yellow text-sm hover:text-yellow-600 cursor-pointer"
                        onClick={handleAddOrEditFile}
                      >
                        Edit
                      </span>
                      <span
                        className="text-red-500 text-sm hover:text-red-700 cursor-pointer"
                        onClick={handleDelete}
                      >
                        Remove
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-blue-600 text-sm cursor-pointer"
                      onClick={handleAddOrEditFile}
                    >
                      Add
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-around">
            <Link
              to={`/admin/cancer-screening/view/${record.id}`}
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            >
              Back
            </Link>
            <button
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

export default ViewResults;
