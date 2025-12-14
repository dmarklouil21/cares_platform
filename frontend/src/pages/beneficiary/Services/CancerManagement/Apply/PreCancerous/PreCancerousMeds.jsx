import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Activity, 
  Save, 
  ArrowLeft,
  Building2,
  Stethoscope
} from "lucide-react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

// --- Reusable UI Helpers ---
const InputGroup = ({ label, name, type = "text", value, onChange, required, error, placeholder, readOnly, ...props }) => (
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
      readOnly={readOnly}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
        error ? 'border-red-500 bg-red-50' : readOnly ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300 bg-white'
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, value, onChange, options, required, error }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const PreCancerousMeds = () => {
  const navigate = useNavigate();

  // Form States
  const [interpretationOfResult, setInterpretationOfResult] = useState("");
  const [requestDestination, setRequestDestination] = useState("");
  const [selectedRHU, setSelectedRHU] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");

  // Data Lists
  const [rhuList, setRhuList] = useState([]);
  const [privateList, setPrivateList] = useState([]);

  // UX States
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ type: "success", title: "", message: "" });

  useEffect(() => {
    const fetchLocations = async () => {
        try {
            const [rhuRes, privateRes] = await Promise.all([
                api.get("/rhu/list/"),
                api.get("/partners/private/list/")
            ]);
            setRhuList(rhuRes.data);
            setPrivateList(privateRes.data);
        } catch (error) {
            console.error("Error fetching location data", error);
        }
    };
    fetchLocations();
  }, []);

  // Submit Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation could go here
    if (!interpretationOfResult || !requestDestination) {
        setModalInfo({ type: "error", title: "Validation Error", message: "Please fill in all required fields." });
        setShowModal(true);
        return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const payload = {
        interpretation_of_result: interpretationOfResult,
        request_destination: requestDestination,
        destination_name: 
            requestDestination === "Rural Health Unit" ? selectedRHU :
            requestDestination === "Private Partners" ? selectedPartner : 
            'Rafi-EJACC'
      };

      await api.post(`/beneficiary/precancerous-meds/submit/`, payload);

      navigate("/beneficiary/success-application", {
        state: { okLink: "beneficiary/applications/precancerous" },
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      let message = "Something went wrong while submitting the form.";
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
        title="Submit Application?"
        desc="Are you sure all information is correct?"
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
            Application Form
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
                        <h1 className="text-xl font-bold text-gray-800">Pre-Cancerous Medication</h1>
                        <p className="text-xs text-gray-500 mt-1">Submit your request for medication assistance.</p>
                    </div>
                </div>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1: Clinical Info */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-primary pl-3 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" /> Clinical Data
                    </h3>

                    <div className="flex flex-col gap-5">
                         <InputGroup 
                            label="Diagnosis / Impression" 
                            value="Breast Mass, right" 
                            readOnly 
                            placeholder="Auto-filled"
                        />

                        <SelectGroup 
                            label="Interpretation of Result"
                            value={interpretationOfResult}
                            onChange={(e) => setInterpretationOfResult(e.target.value)}
                            required
                            options={[
                                { value: "", label: "Select Interpretation" },
                                { value: "Negative", label: "Negative" },
                                { value: "ASC-US", label: "ASC-US" },
                                { value: "HPV Positive", label: "HPV Positive" },
                                { value: "Unsatisfactory", label: "Unsatisfactory" }
                            ]}
                        />
                    </div>
                </div>

                {/* Column 2: Logistics */}
                <div className="space-y-6">
                     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-l-4 border-yellow-500 pl-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" /> Request Details
                    </h3>

                    <div className="flex flex-col gap-5">
                        <SelectGroup 
                            label="Request Destination"
                            value={requestDestination}
                            onChange={(e) => setRequestDestination(e.target.value)}
                            required
                            options={[
                                { value: "", label: "Select Destination" },
                                { value: "RAFI - EJACC", label: "RAFI - EJACC" },
                                { value: "Rural Health Unit", label: "Rural Health Unit" },
                                { value: "Private Partners", label: "Private Partners" }
                            ]}
                        />

                        {/* Conditional Selects based on Destination */}
                        {requestDestination === "Rural Health Unit" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <SelectGroup 
                                    label="Select Rural Health Unit"
                                    value={selectedRHU}
                                    onChange={(e) => setSelectedRHU(e.target.value)}
                                    required
                                    options={[
                                        { value: "", label: "Select RHU" },
                                        ...rhuList.map(rhu => ({ value: rhu.lgu, label: rhu.lgu }))
                                    ]}
                                />
                            </div>
                        )}

                        {requestDestination === "Private Partners" && (
                             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <SelectGroup 
                                    label="Select Private Partner"
                                    value={selectedPartner}
                                    onChange={(e) => setSelectedPartner(e.target.value)}
                                    required
                                    options={[
                                        { value: "", label: "Select Partner" },
                                        ...privateList.map(partner => ({ value: partner.institution_name, label: partner.institution_name }))
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </form>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
                <button
                    type="button"
                    onClick={() => navigate("/beneficiary/applications")}
                    // className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                >
                    {/* <ArrowLeft className="w-4 h-4" /> */}
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    // className="flex items-center gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                    className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                >
                    {/* <Save className="w-4 h-4" /> */}
                    Submit Application
                </button>
            </div>

        </div>
      </div>

      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default PreCancerousMeds;