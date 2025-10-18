import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { REQUIRED_DOCS } from "src/constants/requiredDocs";
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

const LabRequest = () => {
  const location = useLocation();
  const record = location.state;

  const { id } = useParams();
  const requiredDocs = REQUIRED_DOCS["Post Treatment"] || [];

  const [files, setFiles] = useState({}); // ✅ initialize as empty object
  const [description, setDescription] = useState(
    record?.result_description || ""
  );

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    if (!record?.required_attachments) return;
    const mappedFiles = record.required_attachments.reduce((acc, doc) => {
      acc[doc.doc_type] = doc;
      return acc;
    }, {});
    setFiles(mappedFiles);
  }, [record]);

  const handleSave = (e) => {
    e.preventDefault();
    setModalText("Are you sure you want to add this file?");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      const formData = new FormData();

      Object.values(files).forEach((item) => {
        if (item.fileObject) {
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
            { headers: { "Content-Type": "multipart/form-data" } }
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
          if (error.response?.data?.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          }
          setModalInfo({
            type: "error",
            title: "Failed to add new file.",
            message: errorMessage,
          });
          setShowModal(true);
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
        {/* Header */}
        {/* <div className="h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Post Treatment</h1>
          <Link to={`/admin/treatment-assistance/postview/${id}`}>
            <img src="/images/back.png" alt="Back button" className="h-6" />
          </Link>
        </div> */}

        {/* Main content */}
        <div className="h-full w-full flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-3xl text-yellow font-bold">
                Laboratory Request File
              </h2>
              <p className="font-bold italic">
                View the uploaded document of the patient.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
                {requiredDocs.map((d) => {
                  const uploaded = files[d.key];
                  return (
                    <div
                      key={d.key}
                      className="flex items-center gap-3 justify-between bg-gray-50 px-4 py-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CheckIcon active={!!uploaded} />
                        <span className="text-gray-900 font-medium">
                          {d.label}
                        </span>
                      </div>
                      {uploaded ? (
                        <a
                          href={uploaded.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-red-500 text-sm">Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex justify-around">
            <Link
              to={`/admin/treatment-assistance/postview/${id}`}
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

export default LabRequest;
