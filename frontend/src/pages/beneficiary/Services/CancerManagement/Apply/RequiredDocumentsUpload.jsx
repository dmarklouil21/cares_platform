import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Check, 
  Save, 
  ArrowLeft,
  Activity
} from "lucide-react";

import api from "src/api/axiosInstance";
import { REQUIRED_DOCS } from "src/constants/requiredDocs";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

const RadioactiveDocument = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data State
  const id = location.state?.id || null;
  const { wellBeningData } = location.state || {}; // Note: typo 'wellBening' preserved from previous page
  const [serviceType, setServiceType] = useState(wellBeningData?.serviceType || "");
  const [isResubmitting, setIsResubmitting] = useState(!!id);

  // File State
  const requiredDocs = REQUIRED_DOCS[serviceType] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];
  const inputRef = useRef(null);

  // Initialize files
  const [files, setFiles] = useState(() => 
    requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {})
  );

  const allUploaded = useMemo(
    () => requiredDocs.length > 0 && requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );

  // UX State
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  // Reset files if service type changes
  useEffect(() => {
    setFiles(requiredDocs.reduce((acc, d) => ({ ...acc, [d.key]: null }), {}));
    setActiveIdx(0);
  }, [serviceType]);

  // Fetch Existing Data (If Editing)
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/beneficiary/cancer-treatment/details/`);
        
        if (data.attachments) {
          const mappedFiles = data.attachments.reduce((acc, doc) => {
            acc[doc.doc_type] = doc;
            return acc;
          }, {});
          setFiles(mappedFiles);
        }
        if (data.service_type) {
            setServiceType(data.service_type);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- Handlers ---

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDoc) {
      setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
    e.target.value = ""; 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && activeDoc) {
        setFiles((prev) => ({ ...prev, [activeDoc.key]: file }));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSave = () => {
      setConfirmOpen(true);
  };

  const onConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append Wellbeing Data
      if (wellBeningData) {
        formData.append("well_being_data", JSON.stringify(wellBeningData));
      }

      // Append Files
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      const endpoint = isResubmitting
        ? `/beneficiary/cancer-treatment/update/${id}/`
        : `/beneficiary/cancer-treatment/submit/`;
      
      const method = isResubmitting ? api.patch : api.post;

      await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

      navigate("/beneficiary/applications/cancer-treatment", {
        state: { 
            flash: "Application submitted successfully." 
        },
      });

    } catch (error) {
      console.error("Submission error:", error);
      let msg = "Something went wrong.";
      setModalInfo({ type: "error", title: "Submission Failed", message: msg });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {loading && <SystemLoader />}
      
      <ConfirmationModal
        open={confirmOpen}
        title="Submit Application?"
        desc="Please confirm that all documents are correct before submitting."
        onConfirm={onConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Cancer Treatment Application
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{serviceType || "Treatment Request"}</h1>
                        <p className="text-xs text-gray-500 mt-1">Please upload the required documents below.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Left Column: List of Requirements */}
                <div className="flex flex-col h-full">
                     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-primary pl-3 mb-4">
                        Required Documents
                    </h3>
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-y-auto max-h-[500px]">
                         <div className="space-y-2">
                            {requiredDocs.map((doc, idx) => {
                                const isUploaded = !!files[doc.key];
                                const isActive = idx === activeIdx;
                                return (
                                    <button
                                        key={doc.key}
                                        type="button"
                                        onClick={() => setActiveIdx(idx)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-lg text-left transition-all ${
                                            isActive 
                                            ? "bg-white shadow-sm border border-blue-200 ring-1 ring-blue-100" 
                                            : "hover:bg-gray-100 border border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1 rounded-full ${isUploaded ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}>
                                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-600"}`}>
                                                {doc.label}
                                            </span>
                                        </div>
                                        {isActive && <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Uploading</span>}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                </div>

                {/* Right Column: Dropzone */}
                <div className="flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 mb-4">
                        Upload Area
                    </h3>
                    
                    <div 
                        onClick={() => inputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all group min-h-[300px]"
                    >
                        <div className="p-4 bg-blue-50 text-primary rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm">
                            <Upload className="w-8 h-8" />
                        </div>
                        
                        {files[activeDoc?.key] ? (
                            <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm font-bold text-gray-800 break-all px-4">
                                    {files[activeDoc.key].name || "File Uploaded"}
                                </p>
                                <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full inline-block border border-green-100">
                                    Ready to submit
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Click to replace</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-base font-medium text-gray-600 group-hover:text-primary transition-colors">
                                    Click to upload <span className="font-bold text-gray-900">{activeDoc?.label}</span>
                                </p>
                                <p className="text-xs text-gray-400">or drag and drop file here</p>
                                <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-4">Max Size: 10MB</p>
                            </div>
                        )}

                        <input 
                            ref={inputRef}
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
                <Link
                    to="/beneficiary/services/cancer-management/apply/well-being-tool"
                    state={{ wellBeningData, id }} // Pass back state so user doesn't lose wellbeing data
                    // className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    {/* <ArrowLeft className="w-4 h-4" /> */}
                    Back
                </Link>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!allUploaded}
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
                    {isResubmitting ? "Update Application" : "Submit Application"}
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default RadioactiveDocument;