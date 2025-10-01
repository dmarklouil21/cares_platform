import { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { REQUIRED_DOCS } from "src/constants/requiredDocs";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";

import api from "src/api/axiosInstance";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const ViewAttachments = () => {
  const location = useLocation();
  const record = location.state;

  const serviceType = record?.service_type;
  const requiredDocs = [
    ...(REQUIRED_DOCS[serviceType] || []),
    { key: "signedCaseSummary", label: "Signed Case Summary" },
  ];

  const { id } = useParams();

  const [files, setFiles] = useState([]);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  // Loading / Confirm
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm action?");
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    const mappedFiles = record.attachments.reduce((acc, doc) => {
      acc[doc.doc_type] = doc;
      return acc;
    }, {});

    setFiles(mappedFiles);
  }, [record]);

  const handleAddFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = (e) => {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        type: file.type || "file",
        url: URL.createObjectURL(file),
        fileObject: file, // mark as new/local
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    };

    input.click();
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    setModalText("Are you sure you want to delete this attachment?");
    setModalAction({ type: "delete", file: files[index] });
    setModalOpen(true);
  };

  const handleViewFile = (file, e) => {
    e.stopPropagation();
    if (!file?.url || file.url === "#") return;
    // For newly added local files we already have a blob URL
    window.open(file.url, "_blank");
  };

  const handleSave = (e) => {
    e.preventDefault();
    setModalText("Save these attachments (demo only)?");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (modalAction?.type === "delete") {
      const fileToDelete = modalAction.file;
      if (fileToDelete?.url?.startsWith("blob:")) {
        // Free memory for local blobs
        try {
          URL.revokeObjectURL(fileToDelete.url);
        } catch {}
      }
      setFiles((prev) => prev.filter((f) => f !== fileToDelete));

      setModalInfo({
        type: "success",
        title: "Deleted",
        message: "Attachment removed (demo only, no server calls).",
      });
      setShowModal(true);
    }

    if (modalAction?.type === "submit") {
      // Demo: pretend we “saved” to the server and clear fileObject flags
      setLoading(true);
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            fileObject: undefined,
            id: f.id ?? undefined,
          }))
        );
        setLoading(false);
        setModalInfo({
          type: "success",
          title: "Saved",
          message: "Attachments saved locally (no API).",
        });
        setShowModal(true);
      }, 400);
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };
  // const [patientData, setPatientData] = useState(SAMPLE_RECORD);
  console.log("Attachments: ", files);

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

      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 overflow-auto items-center bg-gray">
        <div className=" h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Cancer Management</h1>
          <Link to={`/admin/cancer-management/view/${id}`}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-6"
            />
          </Link>
        </div>

        <div className="h-full w-full flex flex-col gap-5 justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-3xl text-yellow font-bold">
                Submitted Documents
              </h2>
              <p className="font-bold italic">
                Review all uploaded documents before approving or rejecting.
              </p>

              {/* Document List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
                {requiredDocs.map((d) => {
                  const uploaded = files[d.key];
                  // const fileName = uploaded
                  //   ? decodeURIComponent(uploaded.file.split("/").pop()) // extract last part of URL
                  //   : null;

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
          <div className="w-full flex justify-end">
            <Link
              to={`/admin/cancer-management/view/${id}`}
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAttachments;
