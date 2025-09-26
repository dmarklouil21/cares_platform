import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";
import SystemSuccess from "src/components/SystemSuccess";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-5 w-5 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const IndividualScreening = () => {
  const navigate = useNavigate();
  const [screeningID, setScreeningID] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [screening_procedure_name, setScreening_procedure_name] = useState("");
  const [procedure_details, setProcedure_details] = useState("");
  const [cancer_site, setCancer_site] = useState("");
  const fileInputRef = useRef();

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const [activeIdx, setActiveIdx] = useState(0);

  const requiredDocs = REQUIRED_DOCS["Individual Screening"] || [];

  // helper to build a cleared files map
  const makeEmptyFiles = () =>
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {});

  const [files, setFiles] = useState(makeEmptyFiles);

  const activeDoc = requiredDocs[activeIdx];

  useEffect(() => {
    const fetchScreeningData = async () => {
      try {
        // setLoading(true);
        const response = await api.get(
          "/beneficiary/individual-screening/list/"
        );
        const screenings = response.data;
        if (screenings.length > 0) {
          const latestScreening = screenings[screenings.length - 1];
          setScreeningID(latestScreening.id);
        }
      } catch (error) {
        console.error("Error fetching screening data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningData();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithPreview = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const handleDelete = (indexToRemove) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      const fileToDelete = updated[indexToRemove];
      if (fileToDelete.preview) URL.revokeObjectURL(fileToDelete.preview);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const formData = new FormData();
  formData.append("procedure_name", screening_procedure_name);
  formData.append("procedure_details", procedure_details);
  formData.append("cancer_site", cancer_site);
  uploadedFiles.forEach((item) => {
    formData.append("screening_attachments", item.file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalText("Confirm Submit?");
    setModalDesc("Make sure all your inputs are correct!");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        setModalOpen(false);
        setLoading(true);
        const response = await api.post(
          `/beneficiary/individual-screening/screening-request/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        navigate("/beneficiary/success-application", {
          state: { okLink: "beneficiary/applications/individual-screening" },
        });
        // setSuccess(true);
        // navigate("/beneficiary/applications/individual-screening", {
        //   state: {
        //     type: "success", message: "Submitted Successfully."
        //   }
        // }); beneficiary/services/cancer-screening/procedure
        // setModalInfo({
        //   type: "success",
        //   title: "Success!",
        //   message: "Your form was submitted.",
        // });
        // setShowModal(true);
      } catch (error) {
        let errorMessage = "Something went wrong while submitting the form.";

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } //else if (typeof error.response.data === "string") {
          //errorMessage = error.response.data; // for plain text errors
          //}
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
        setShowModal(true);
        console.error("Error submitting a request:", error);
      } finally {
        setLoading(false);
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
      {loading && <SystemLoader />}
      {/* {success && <SystemSuccess message="Transaction Completed!" />} */}
      {/* <LoadingModal open={loading} text="Submitting your data..." /> */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col flex-1">
          <h2 className="text-xl font-semibold mb-6">Cancer Screening Application</h2>

          <form className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto">
            {/* <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-secondary">
                INDIVIDUAL SCREENING
              </h3>
              <p className="text-gray2 ">
                Monitor and manage cancer screening procedures, generate LOA, and
                upload diagnostic results.
              </p>
            </div> */}
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-3xl text-yellow">Individual Screening</h1>
              <div className="flex flex-col gap-2">
                <label htmlFor="screeningprocedure">Screening Procedure</label>
                <input
                  type="text"
                  name="screening_procedure_name"
                  id="screening_procedure_name"
                  placeholder="ex: Mammogram, MRI"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={screening_procedure_name}
                  onChange={(e) => setScreening_procedure_name(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="proceduredetials">Procedure Details</label>
                <input
                  type="text"
                  name="procedure_details"
                  id="procedure_details"
                  placeholder="ex: Breast screening due to palpable mass"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={procedure_details}
                  onChange={(e) => setProcedure_details(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cancetsite">Cancer Site</label>
                <input
                  type="text"
                  name="cancer_site"
                  id="cancer_site"
                  placeholder="ex: Breast"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={cancer_site}
                  onChange={(e) => setCancer_site(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-xl">Requirements/Attachments</h1>
              <p className="font-bold italic">
                Please comply with the following requirements before submission
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-3">
              {requiredDocs.map((d, idx) => {
                const uploaded = !!files[d.key];
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className="flex items-center gap-3 text-left group"
                  >
                    <CheckIcon active={uploaded} />
                    <span
                      className={`${
                        isActive ? "font-bold text-gray-900" : "text-gray-800"
                      }`}
                    >
                      {d.label}
                    </span>
                    {isActive && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mb-1 text-sm text-gray-600">
              Currently uploading:{" "}
              <span className="font-semibold">{activeDoc?.label}</span>
            </div>

            <div
              // onClick={handleChooseFile}
              // onDragOver={handleDragOver}
              // onDrop={handleDrop}
              className="mt-1 border border-gray-200 rounded-xl bg-primary/20 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center h-56"
            >
              <div className="px-1.5 py-1 bg-primary rounded-4xl">
                <img
                  src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                  alt="upload icon"
                  className="h-6"
                />
              </div>
              <div className="text-sm text-gray-700">
                Choose file or drag here
              </div>
              <div className="text-xs text-gray-400">Size limit: 10MB</div>
              {files[activeDoc?.key] && (
                <div className="mt-3 text-xs text-gray-700">
                  Selected:{" "}
                  <span className="font-medium">{files[activeDoc.key].name}</span>
                </div>
              )}
            </div>

            <input
              // ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods"
              // onChange={handleInputChange}
              className="hidden"
            />
              {/* <div className="font-bold px-3 flex flex-col gap-4">
                <div className="flex gap-5">
                  <img src="/public/images/check-icon.svg" alt="check icon" />
                  <p>Medical Certificate</p>
                </div>
                <div className="flex gap-5">
                  <img src="/public/images/check-icon.svg" alt="check icon" />
                  <p>Laboratory Results</p>
                </div>
                <div className="flex gap-5">
                  <img src="/public/images/check-icon.svg" alt="check icon" />
                  <p>Barangay Certificate of Indigency</p>
                </div>
                {/* <div className="flex gap-5">
                  <img src="/public/images/check-icon.svg" alt="check icon" />
                  <p>One 1x1 Photo</p>
                </div> *s/}
              </div> */}
              {/* <div
                className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer"
                onClick={handleDivClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  required
                />

                <div className="bg-primary p-2 rounded-full">
                  <img
                    src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                    alt="Upload icon"
                  />
                </div>
                <p className="font-semibold mt-4">Choose file</p>
                <p className="text-sm text-gray-500 mt-1">Size limit: 5MB</p>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 w-full">
                    <p className="text-sm font-semibold mb-2">
                      {uploadedFiles.length} file(s) uploaded:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {uploadedFiles.map((item, index) => (
                        <div
                          key={index}
                          className="relative w-32 rounded-lg p-2 bg-yellow/60 shadow flex flex-col items-center text-sm"
                        >
                          <button
                            className="absolute top-1 right-2 text-red-500 font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(index);
                            }}
                          >
                            X
                          </button>

                          {item.preview ? (
                            <img
                              src={item.preview}
                              alt="preview"
                              className="w-full h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-20 bg-primary flex items-center justify-center rounded text-xs text-gray-600 text-center px-1">
                              <img
                                src="/src/assets/images/services/cancerscreening/fileicon.svg"
                                alt="file icon"
                                className="h-13 w-13"
                              />
                            </div>
                          )}

                          <p className="mt-1 truncate w-full text-center text-xs">
                            {item.file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>s */}
              <div className="flex justify-between gap-5">
                <Link
                  to="/beneficiary/services/cancer-screening/requirements"
                  className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSubmit}
                  className="bg-primary text-white py-3 rounded-md font-bold text-center w-full hover:bg-primary/50"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="h-16 bg-secondary"></div>
      </div>
    </>
  );
};

export default IndividualScreening;
