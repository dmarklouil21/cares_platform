import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { REQUIRED_DOCS } from "src/constants/requiredDocs";

import api from "src/api/axiosInstance";

import SystemLoader from "src/components/SystemLoader";

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title = "Submit documents?",
  desc = "Please confirm to submit all files.",
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{desc}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#749AB6] text-white hover:bg-[#5f86a7]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const CheckIcon = ({ active }) => (
  <img
    src="/images/check.svg"
    alt=""
    className={`h-6 w-6 transition ${active ? "" : "grayscale opacity-50"}`}
  />
);

const RadioactiveDocument = () => {
  const location = useLocation();
  const id = location.state?.id || null;
  const navigate = useNavigate();
  const { wellBeningData } = location.state || {};
  const [activeIdx, setActiveIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notif, setNotif] = useState("");
  const inputRef = useRef(null);

  const [serviceType, setServiceType] = useState(wellBeningData?.serviceType || "");
  const requiredDocs = REQUIRED_DOCS[serviceType] || [];

  const [isResubmitting, setIsResubmitting] = useState(!!id);

  const activeDoc = requiredDocs[activeIdx];

  const [loading, setLoading] = useState(false);

  const handleChooseFile = () => inputRef.current?.click();

  // helper to build a cleared files map
  const makeEmptyFiles = () =>
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {});

  const [files, setFiles] = useState(makeEmptyFiles);
  const allUploaded = requiredDocs.every((d) => !!files[d.key]);

  useEffect(() => {
    setFiles(makeEmptyFiles());
    setActiveIdx(0);
  }, [serviceType]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/cancer-treatment/details/`
        );
        // setProcedureName(data.procedure_name || "");
        // setProcedureDetails(data.procedure_details || "");
        // setCancerSite(data.cancer_site || "");
        console.log("Fetched Data: ", data);
        if (data.attachments) {
          const mappedFiles = data.attachments.reduce((acc, doc) => {
            acc[doc.doc_type] = doc;
            return acc;
          }, {});
          setServiceType(data.service_type || "");
          setFiles(mappedFiles);
        }

      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [id]);

  const onFilePicked = (f) => {
    if (!f) return;
    const docKey = activeDoc.key;
    setFiles((prev) => ({ ...prev, [docKey]: f }));
  };

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    onFilePicked(f);
    e.target.value = ""; // allow re-picking the same file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    onFilePicked(f);
  };

  const handleDragOver = (e) => e.preventDefault();

  const submit = () => setConfirmOpen(true);

  const confirmSubmit = async () => {
    setConfirmOpen(false);

    try {
      const formData = new FormData();
      // append well-being data as JSON 
      formData.append("well_being_data", JSON.stringify(wellBeningData));
      // append files
      for (const key in files) {
        if (files[key]) {
          formData.append(`files.${key}`, files[key]);
        }
      }
      setLoading(true);
      const endpoint = isResubmitting
          ? `/beneficiary/cancer-treatment/update/${id}/`
          : `/beneficiary/cancer-treatment/submit/`;
        
        const method = isResubmitting ? api.patch : api.post;

      await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

        navigate("/beneficiary/applications/cancer-treatment", {
        state: {
          type: "success",
          message: "Submitted Successfully.",
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }

    // try {
    //   await api.post("/beneficiary/cancer-treatment/submit/", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });
    //   // alert("Submitted successfully");
    //   navigate("/beneficiary/applications/cancer-treatment", {
    //     state: {
    //       type: "success",
    //       message: "Submitted Successfully.",
    //     },
    //   });
    // } catch (error) {
    //   alert(error);
    //   console.error();
    // } finally {
    //   setLoading(false);
    // }

    // 2) show success notification
    // setNotif("Documents submitted successfully!");
    // setTimeout(() => setNotif(""), 4000);

    // 3) CLEAR everything
    // setFiles(makeEmptyFiles()); // reset all uploaded files
    setActiveIdx(0); // go back to Quotation
    if (inputRef.current) inputRef.current.value = ""; // clear hidden input
  };

  return (
    <>
      {loading && <SystemLoader />}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        {/* <div className="bg-white py-4 px-10 flex justify-between items-center">
          <div className="font-bold">Beneficiary</div>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div> */}

        <div className="py-6 px-5 md:px-10 flex flex-col flex-1 overflow-auto">
          <h2 className="text-xl font-semibold mb-6">
            Cancer Treatment Application
          </h2>

          <div className="rounded-2xl bg-white p-7 flex flex-col gap-3">
            <h2 className="text-3xl text-yellow font-bold">{serviceType}</h2>
            <p className="font-bold italic">
              Please comply with the following requirements before submission
            </p>
            <h1 className="font-bold text-xl mb-4">
              Upload the following documents one at a time
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 mb-6">
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

            <div className="mb-2 text-sm text-gray-600">
              Currently uploading:{" "}
              <span className="font-semibold">{activeDoc?.label}</span>
            </div>

            <div
              onClick={handleChooseFile}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="mt-2 border border-gray-200 rounded-xl bg-primary/20 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center h-56"
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
                  <span className="font-medium">
                    {files[activeDoc.key].name}
                  </span>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="mt-6 flex items-center justify-between flex-col-reverse md:flex-row gap-5">
              <Link
                to="/beneficiary/services/cancer-management/apply/well-being-tool"
                className="border border-black/15 py-3 rounded-md text-center px-6  hover:bg-black/10 hover:border-black w-full md:w-[40%]"
                state={serviceType}
              >
                Back
              </Link>

              {allUploaded ? (
                <button
                  type="button"
                  onClick={submit}
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
        </div>

        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmSubmit}
          title="Submit all documents?"
          desc="Make sure each requirement has the correct file attached."
        />
        <Notification message={notif} onClose={() => setNotif("")} />
      </div>
    </>
  );
};

export default RadioactiveDocument;
