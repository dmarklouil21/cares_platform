import { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";

import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import ConfirmationModal from "src/components/ConfirmationModal";

import api from "src/api/axiosInstance";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const REQUIRED_DOCS = [
  { key: "quotation", label: "Quotation" },
  { key: "letter", label: "Letter of Request" },
  { key: "abstract", label: "Medical Abstract" },
  { key: "caseStudy", label: "Case Study Report" },
  { key: "sketch", label: "Sketch of Address" },
  { key: "incomeTax", label: "Income Tax Report" },
  { key: "barangay", label: "Barangay Indigency" },
  { key: "caseSummary", label: "Signed Case Summary" },
];

const ViewAttachments = () => {
  const location = useLocation();
  const record = location.state;
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
    // const fromServer =
    //   record?.attachments?.map((fileObj) => {
    //     const fileUrl = fileObj.file || fileObj.url || "";
    //     const fileName = (
    //       fileObj.name ||
    //       fileUrl.split("/").pop() ||
    //       "file"
    //     ).trim();
    //     const ext = (fileName.split(".").pop() || "").toLowerCase();

    //     const typeGuess =
    //       fileObj.type ||
    //       (ext === "pdf"
    //         ? "pdf"
    //         : /jpe?g|png|gif|webp/.test(ext)
    //         ? "image/jpeg"
    //         : ext || "file");

    //     return {
    //       id: fileObj.id ?? null,
    //       name: fileName,
    //       type: typeGuess,
    //       url: fileUrl || "#",
    //     };
    //   }) || [];

    // setFiles(fromServer.length ? fromServer : SAMPLE_FILES);
    // setFiles(record.attachments);
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

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Cancer Management</h1>
          <div className="p-3">
            <Link to={`/admin/cancer-management/view/${id}`}>
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
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-3xl text-yellow font-bold">Submitted Documents</h2>
              <p className="font-bold italic">
                Review all uploaded documents before approving or rejecting.
              </p>

              {/* Document List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
                {REQUIRED_DOCS.map((d) => {
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
                        <span className="text-gray-900 font-medium">{d.label}</span>
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
              className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
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
