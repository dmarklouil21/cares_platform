import { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt="Check"
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const HormonalReplacement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id || null;
  const fileInputRef = useRef(null);

  // Form States
  const [medicines, setMedicines] = useState("");

  const [isResubmitting, setIsResubmitting] = useState(!!id);

  // File Handling
  const requiredDocs = REQUIRED_DOCS["Hormonal Replacement"] || [];
  const makeEmptyFiles = () =>
    requiredDocs.reduce((acc, doc) => ({ ...acc, [doc.key]: null }), {});
  const [files, setFiles] = useState(makeEmptyFiles);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];
  const allUploaded = useMemo(
    () => requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );

  // Modal States
  const [confirmation, setConfirmation] = useState({
    open: false,
    text: "",
    desc: "",
    action: null,
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Loading
  const [loading, setLoading] = useState(false);

  // Fetch latest screening ID (if needed later)
  // useEffect(() => {
  //   const fetchScreeningData = async () => {
  //     try {
  //       const response = await api.get(
  //         "/beneficiary/individual-screening/list/"
  //       );
  //       const screenings = response.data;
  //       if (screenings.length > 0) {
  //         // Example: You can use this ID later for PATCH/PUT requests
  //         const latestScreening = screenings.at(-1);
  //         console.log("Latest Screening ID:", latestScreening.id);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching screening data:", error);
  //     }
  //   };

  //   fetchScreeningData();
  // }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/hormonal-replacement/details/${id}/`
        );
        setMedicines(data.medicines_requested || "");

        if (data.required_attachments) {
          const mappedFiles = data.required_attachments.reduce((acc, doc) => {
            acc[doc.doc_type] = doc;
            return acc;
          }, {});
          setFiles(mappedFiles);
        }

      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [id]);
  // File Handlers
  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDoc) {
      setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
    e.target.value = ""; // allow reselecting the same file
  };

  // Submit Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmation({
      open: true,
      text: "Confirm Submit?",
      desc: "Make sure all your inputs are correct!",
      action: "submit",
    });
  };

  const handleConfirm = async () => {
    if (confirmation.action !== "submit") return;

    setConfirmation({ open: false, text: "", desc: "", action: null });
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("medicines_requested", medicines);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      const endpoint = isResubmitting
        ? `/beneficiary/hormonal-replacement/update/${id}/`
        : `/beneficiary/hormonal-replacement/request/`;
      
      const method = isResubmitting ? api.patch : api.post;

      await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      
      // await api.post(
      //   `/beneficiary/hormonal-replacement/request/`,
      //   formData,
      //   {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   }
      // );

      navigate("/beneficiary/success-application", {
        state: { okLink: "beneficiary/applications/individual-screening" },
      });
    } catch (error) {
      let message = "Something went wrong while submitting the form.";
      if (error.response?.data?.non_field_errors) {
        message = error.response.data.non_field_errors[0];
      }

      setNotification({
        show: true,
        type: "error",
        title: "Submission Failed",
        message,
      });

      console.error("Error submitting a request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmation.open}
        title={confirmation.text}
        desc={confirmation.desc}
        onConfirm={handleConfirm}
        onCancel={() =>
          setConfirmation({ open: false, text: "", desc: "", action: null })
        }
      />

      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      {/* Loader */}
      {loading && <SystemLoader />}

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col flex-1">
          <h2 className="text-xl font-semibold mb-6">
            Hormonal Replacement Medication Application
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto"
          >
            {/* Screening Info */}
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-[22px] md:text-3xl text-yellow">
                Hormonal Replacement
              </h1>

              <label className="flex flex-col gap-2">
                <span>Medicines</span>
                <input
                  type="text"
                  name="medicines"
                  placeholder="ex: Biogesic, Neozip"
                  className="w-full :w-[85%] p-3 border border-gray2 rounded-md"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                />
              </label>

              {/* <label className="flex flex-col gap-2">
                <span>Procedure</span>
                <input
                  type="text"
                  name="procedureName"
                  placeholder="ex: Breast Ultrasound"
                  className="w-full :w-[85%] p-3 border border-gray2 rounded-md"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  required
                />
              </label> */}

              {/* <label className="flex flex-col gap-2">
                <span>Cancer Site</span>
                <input
                  type="text"
                  name="cancerSite"
                  placeholder="ex: Breast"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={cancerSite}
                  onChange={(e) => setCancerSite(e.target.value)}
                  required
                />
              </label> */}
            </div>

            {/* File Upload Section */}
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-xl">Requirements/Attachments</h1>
              <p className="font-bold italic">
                Please comply with the following requirements before submission
              </p>

              {/* Required Docs List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-3">
                {requiredDocs.map((doc, idx) => {
                  const uploaded = !!files[doc.key];
                  const isActive = idx === activeIdx;

                  return (
                    <button
                      key={doc.key}
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
                        {doc.label}
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

              {/* Upload Box */}
              <div
                onClick={handleChooseFile}
                className="mt-1 border border-gray-200 rounded-xl bg-primary/20 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center h-56"
              >
                <div className="px-1.5 py-1 bg-primary rounded-4xl">
                  <img
                    src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                    alt="Upload"
                    className="h-6"
                  />
                </div>
                <div className="text-sm text-gray-700">
                  Choose a file to upload
                </div>
                <div className="text-xs text-gray-400">Size limit: 10MB</div>

                {files[activeDoc?.key] && (
                  <div className="mt-3 text-xs text-gray-700">
                    Selected:{" "}
                    <span className="font-medium">
                      {files[activeDoc.key].name}
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between flex-col-reverse md:flex-row gap-5">
                <Link
                  to="/beneficiary/services/cancer-management"
                  className="border border-black/15 py-3 rounded-md text-center px-6  hover:bg-black/10 hover:border-black w-full md:w-[40%]"
                >
                  Cancel
                </Link>

                {allUploaded ? (
                  <button
                    type="submit"
                    className="bg-[#749AB6] text-white font-bold py-3 px-8 rounded-md border border-[#749AB6] hover:bg-[#C5D7E5] hover:border-[#C5D7E5] w-full md:w-[40%]"
                  >
                    Submit
                  </button>
                ) : (
                  <div className="text-[12px] md:text-sm text-gray-600 max-w-auto">
                    Please upload <span className="font-semibold">all</span>{" "}
                    required files to enable submit.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="h-16 bg-secondary"></div>
      </div>
    </>
  );
};

export default HormonalReplacement;
