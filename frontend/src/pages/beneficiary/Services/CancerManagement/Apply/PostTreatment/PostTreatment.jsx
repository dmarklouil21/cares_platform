import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Check, 
  Save, 
  ArrowLeft,
  Microscope,
  AlertCircle
} from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import { REQUIRED_DOCS } from "src/constants/requiredDocs";
import api from "src/api/axiosInstance";

// --- Reusable UI Helpers ---
const InputGroup = ({ label, name, type = "text", value, onChange, required, error, placeholder }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const PostTreatment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const id = location.state?.id || null;
  const [isResubmitting, setIsResubmitting] = useState(!!id);

  // Form States
  const [procedureName, setProcedureName] = useState("");

  // File Handling
  const requiredDocs = REQUIRED_DOCS["Post Treatment"] || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDoc = requiredDocs[activeIdx];

  const [files, setFiles] = useState(() => 
    requiredDocs.reduce((acc, doc) => ({ ...acc, [doc.key]: null }), {})
  );

  const allUploaded = useMemo(
    () => requiredDocs.length > 0 && requiredDocs.every((doc) => !!files[doc.key]),
    [files, requiredDocs]
  );

  // UX States
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });
  const [errors, setErrors] = useState({});

  // Fetch Data for Resubmission
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/beneficiary/post-treatment/details/${id}/`);
        setProcedureName(data.procedure_name || "");
  
        if (data.required_attachments) {
          const mappedFiles = data.required_attachments.reduce((acc, doc) => {
            acc[doc.doc_type] = doc;
            return acc;
          }, {});
          setFiles(mappedFiles);
        }
      } catch (error) {
        console.error("Error fetching post treatment data:", error);
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

  const validate = () => {
      const newErrors = {};
      if (!procedureName.trim()) newErrors.procedureName = "Required";
      return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setModalInfo({ type: "error", title: "Validation Error", message: "Please fill in all fields." });
        setShowModal(true);
        return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("procedure_name", procedureName);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(`files.${key}`, file);
      });

      const endpoint = isResubmitting
        ? `/beneficiary/post-treatment/update/${id}/`
        : `/beneficiary/post-treatment/laboratory-request/`;
      
      const method = isResubmitting ? api.patch : api.post;

      await method(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

      navigate("/beneficiary/success-application", {
        state: { okLink: "beneficiary/applications/post-treatment" },
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      let message = "Something went wrong.";
      if (error.response?.data?.non_field_errors) {
        message = error.response.data.non_field_errors[0];
      }
      setModalInfo({
        type: "error",
        title: "Submission Failed",
        message: message,
      });
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
        title={isResubmitting ? "Update Request?" : "Submit Request?"}
        desc="Ensure all information and documents are correct."
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-5xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Laboratory Request Application
        </h2>

        {/* Main Content Card */}
        <div className="flex flex-col gap-8 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <Microscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Post Treatment</h1>
                        <p className="text-xs text-gray-500 mt-1">Submit request for laboratory tests or procedures.</p>
                    </div>
                </div>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* LEFT COLUMN: Form Data */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-purple-500 pl-3">
                        Request Details
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <InputGroup 
                            label="Procedure Name" 
                            placeholder="e.g. Complete Blood Count (CBC)"
                            value={procedureName} 
                            onChange={(e) => setProcedureName(e.target.value)} 
                            required 
                            error={errors.procedureName}
                        />
                        
                        {/* Placeholder for future fields if needed */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                             <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                             <p className="text-xs text-blue-800">
                                Please ensure the procedure name matches your doctor's prescription exactly.
                             </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: File Uploads */}
                <div className="space-y-6 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> Required Documents
                    </h3>

                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col">
                        
                        {/* Requirement List */}
                        <div className="space-y-1 mb-6">
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

                        {/* Dropzone Area */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="mt-auto border-2 border-dashed border-gray-300 rounded-xl bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all group min-h-[200px]"
                        >
                            <div className="p-3 bg-blue-50 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
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
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                        </div>

                    </div>
                </div>

            </form>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
                <button
                    type="button"
                    onClick={() => navigate("/beneficiary/services/cancer-screening")}
                    // className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allUploaded}
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
                    {isResubmitting ? "Update Request" : "Submit Request"}
                </button>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default PostTreatment;