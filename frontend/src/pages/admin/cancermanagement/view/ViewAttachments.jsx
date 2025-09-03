import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import ConfirmationModal from "src/components/ConfirmationModal";

// ---------- Sample fallbacks (no real data) ----------
const SAMPLE_RECORD = {
  id: 0,
  patient: { patient_id: "PT-0000" },
  screening_attachments: [], // intentionally empty; we'll show sample files below
};

const SAMPLE_FILES = [
  {
    id: null,
    name: "Doctor Referral.pdf",
    type: "pdf", // triggers your PDF icon
    url: "/samples/Doctor-Referral.pdf",
  },
  {
    id: null,
    name: "Valid ID (Front).jpg",
    type: "image/jpeg", // triggers <img> preview
    url: "/samples/sample-id-front.jpg",
  },
  {
    id: null,
    name: "CBC-Result.pdf",
    type: "pdf",
    url: "/samples/CBC-Result.pdf",
  },
];

const ViewAttachments = () => {
  const location = useLocation();

  // Sometimes you pass `state={record}`, sometimes `{ record }`.
  // Support both, and fall back to SAMPLE_RECORD.
  const incoming = location.state?.record ?? location.state ?? null;
  const record = incoming || SAMPLE_RECORD;

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
    // Safely read attachments; if none, use SAMPLE_FILES
    // (Optional chaining avoids crashes when state is missing)
    const fromServer =
      record?.screening_attachments?.map((fileObj) => {
        const fileUrl = fileObj.file || fileObj.url || "";
        const fileName = (
          fileObj.name ||
          fileUrl.split("/").pop() ||
          "file"
        ).trim();
        const ext = (fileName.split(".").pop() || "").toLowerCase();

        const typeGuess =
          fileObj.type ||
          (ext === "pdf"
            ? "pdf"
            : /jpe?g|png|gif|webp/.test(ext)
            ? "image/jpeg"
            : ext || "file");

        return {
          id: fileObj.id ?? null,
          name: fileName,
          type: typeGuess,
          url: fileUrl || "#",
        };
      }) || [];

    setFiles(fromServer.length ? fromServer : SAMPLE_FILES);
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
          <h1 className="text-md font-bold">Individual Screening</h1>
          <div className="p-3">
            <Link to={"/Admin/CancerManagement"} state={{ record }}>
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
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-[4px] py-10 px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-600">
                  No Attachment Files Found
                </h2>
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
                      key={`${file.name}-${idx}`}
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
                        ) : String(file.type).toLowerCase().includes("pdf") ? (
                          <img
                            src="/src/assets/images/admin/cancerscreening/individualscreening/pdf.svg"
                            alt="PDF"
                            className="w-12 h-12 mb-2"
                          />
                        ) : /docx?/.test(String(file.type)) ? (
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
                        title="Delete"
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
              >
                Add File
              </button>
              <button
                onClick={handleSave}
                className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
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
