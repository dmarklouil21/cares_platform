import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { REQUIRED_DOCS } from "src/constants/requiredDocs";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";
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
  const [modalDesc, setModalDesc] = useState("Please confirm before proceeding.")
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    if (!record?.required_attachments) return;
    const mappedFiles = record.required_attachments.reduce((acc, doc) => {
      acc[doc.doc_type] = doc;
      return acc;
    }, {});
    setFiles(mappedFiles);
  }, [record]);

  /** ========== Helper Functions ========== */
  const openFilePicker = (callback) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*"; // Accept any type
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) callback(file);
    };
    input.click();
  };

  const showError = (title, message) => {
    setModalInfo({ type: "error", title, message });
    setShowModal(true);
  };

  const showSuccess = (title, message) => {
    setModalInfo({ type: "success", title, message });
    setShowModal(true);
  };

  /** ========== File Actions ========== */
  const handleAddFile = (docKey) => {
    openFilePicker((file) => {
      const newFile = {
        name: file.name,
        type: file.type.split("/")[1] || "file",
        url: URL.createObjectURL(file),
        fileObject: file,
      };
      setFiles((prev) => ({ ...prev, [docKey]: newFile }));
    });
  };

  const handleEditFile = (docKey) => {
    openFilePicker((file) => {
      const updatedFile = {
        ...files[docKey],
        name: file.name,
        type: file.type.split("/")[1] || "file",
        url: URL.createObjectURL(file),
        fileObject: file,
      };
      setFiles((prev) => ({ ...prev, [docKey]: updatedFile }));
    });
  };

  const handleDelete = (docKey, e) => {
    e.stopPropagation();
    setModalText("Confirm deletion of this file?");
    setModalDesc("This action cannot be undone.");
    setModalAction({ type: "delete", file: files[docKey], key: docKey });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setModalText("Are you sure you want to add this file?");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "delete") {
      await confirmDelete(modalAction.file, modalAction.key);
    } else if (modalAction?.type === "submit") {
      await submitFiles();
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
    setModalDesc("");
  };

  const confirmDelete = async (fileToDelete, key) => {
    try {
      setLoading(true);
      if (fileToDelete?.id) {
        await api.delete(
          `/post-treatment/attachments-delete/${fileToDelete.id}/`
        );
      }
      setFiles((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      showSuccess("Success!", "File deleted successfully.");
    } catch (error) {
      showError("Deletion Failed", "Unable to delete the selected file.");
    } finally {
      setLoading(false);
    }
  };

  const submitFiles = async () => {
    const formData = new FormData();
    const entries = Object.entries(files || {});

    // Collect which backend attachments (existing) need to be removed if we're replacing them
    const toDeleteIds = [];
    
    entries.forEach(([key, item]) => {
      // item may either be an existing backend file (has `id` and `file`)
      // or a newly selected file object we stored as { fileObject, url, name, ... }
      if (!item) return;

      if (item.fileObject instanceof File) {
        // append the raw File under the exact key your DRF expects
        formData.append(`files.${key}`, item.fileObject);
      } else {
        // existing backend file - nothing to append (unless you want to re-upload it)
        // If you want to replace it, add its id to toDeleteIds so we can remove it first
        if (item.id) {
          // toDeleteIds.push(item.id); // uncomment if you want to delete old file first
        }
      }
    });

    // If nothing to upload, inform user
    const hasNew = Array.from(formData.keys()).length > 0;
    if (!hasNew) {
      showError("No Files", "There are no new attachments to upload.");
      return;
    }

    try {
      setLoading(true);

      if (toDeleteIds.length) {
        // Delete each existing attachment first so the new upload does not create duplicates
        await Promise.all(
          toDeleteIds.map((id) =>
            api.delete(
              `/post-treatment/attachments-delete/${id}/`
            )
          )
        );
      }

      await api.patch(
        `/post-treatment/attachments-update/${record.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showSuccess("Uploaded!", "Files added successfully.");
    } catch (error) {
      showError("Upload Failed", "Error uploading new attachments.");
    } finally {
      setLoading(false);
    }
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
      {/* <LoadingModal open={loading} text="Submitting your data..." /> */}
      {loading && <SystemLoader />}

      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray">
        {/* Main content */}
        <div className="h-full w-full flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Required Documents</h2>
          <div className="border border-black/15 p-3 bg-white rounded-lg">
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
              <h2 className="text-2xl text-yellow font-bold">
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
                        <span className="text-gray-900 text-sm font-medium">
                          {d.label}
                        </span>
                      </div>
                      {uploaded ? (
                        <div className="flex gap-3">
                          <a
                            href={uploaded.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:text-blue-800"
                          >
                            View
                          </a>
                          <span
                            className="text-yellow text-sm hover:text-yellow-600 cursor-pointer"
                            onClick={() => handleEditFile(d.key)}
                          >
                            Edit
                          </span>
                          <span
                            onClick={(e) => handleDelete(d.key, e)}
                            className="text-red-500 text-sm hover:text-red-700 cursor-pointer"
                          >
                            Remove
                          </span>
                        </div>
                      ) : (
                        // <span className="text-red-500 text-sm">Missing</span>
                        <div className="flex gap-3">
                          <span
                            className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer"
                            onClick={() => handleAddFile(d.key)}
                          >
                            Add
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Actions */}
            <div className="w-full flex justify-around mt-6 mb-2">
              <Link
                to={`/admin/treatment-assistance/postview/${id}`}
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
              <button
                type="button"
                onClick={handleSave}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </>
  );
};

export default LabRequest;
