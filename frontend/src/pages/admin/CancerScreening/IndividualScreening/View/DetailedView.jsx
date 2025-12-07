import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Printer, Send, FileText, ArrowLeft, Save } from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";

import api from "src/api/axiosInstance";
import LOAPrintTemplate from "./LOAPrintTemplate";

const DetailedView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("");
  const [screeningDate, setScreeningDate] = useState(null);

  // --- Modals State ---
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  
  // Confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Date
  const [dateModalOpen, setDateModalOpen] = useState(false);
  
  // Remarks
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // LOA
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/cancer-screening/individual-screening/details/${id}/`
        );
        setRecord(data);
        setStatus(data.status);
        setScreeningDate(data.screening_date || null);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, [id]);

  // --- Handlers ---

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approved") {
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else if (selectedStatus === "Rejected") {
      setRemarksModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = () => {
    if (!screeningDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, newScreeningDate: screeningDate }));
    setDateModalOpen(false);
  };

  const handleSendLOA = async () => {
    if (!loaFile) {
      setSendLOAModalOpen(false);
      setModalInfo({
        type: "info",
        title: "Note",
        message: "Please select a file before sending.",
      });
      setShowModal(true);
      return;
    }
    setSendLOAModalOpen(false);
    setLoaFile(null);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", loaFile);
      formData.append("patient_name", record.patient.full_name);
      formData.append("email", record.patient.email);

      await api.post(
        `/cancer-screening/individual-screening/send-loa/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setModalInfo({
        type: "success",
        title: "LOA Sent",
        message: "The LOA has been sent successfully.",
      });
      setShowModal(true);
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Failed",
        message: "Something went wrong while sending the LOA.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    // setModalAction({ newStatus: null }); // Preserve existing action if any
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    setLoading(true);
    try {
      const payload = {
        status: modalAction?.newStatus || status,
        screening_date: modalAction?.newScreeningDate || screeningDate,
        remarks: remarks || "",
      };

      await api.patch(
        `/cancer-screening/individual-screening/status-update/${record.id}/`,
        payload
      );
      
      navigate("/admin/cancer-screening", {
        state: {
          flash: "Updated Successfully.", // Changed to 'flash' to match previous component patterns
        },
      });
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Update Failed",
        message: "Something went wrong while submitting the form.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
      setModalAction(null);
    }
  };

  const handlePrint = () => {
    if (!record || !record.patient) {
      window.print();
      return;
    }
    const originalTitle = document.title;
    const newTitle = `LOA_${record.patient.patient_id}_${record.patient.full_name}`;
    document.title = newTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (!record) {
    return <SystemLoader />;
  }

  // Helper for Status Colors
  const getStatusColor = (st) => {
    switch(st) {
      case 'Completed': return "bg-green-100 text-green-700 border-green-200";
      case 'Approved': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'Rejected': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <>
      {/* Styles for Printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      {/* --- Modals --- */}
      {loading && <SystemLoader />}
      
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          // Optional: Don't clear modalAction here if you want to allow re-opening save
        }}
      />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <DateModal
        open={dateModalOpen}
        title="Set Screening Date"
        value={screeningDate}
        onChange={setScreeningDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />

      {/* Remarks Modal (Inline Implementation for simplicity, matching previous pattern) */}
      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Remarks</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4 resize-none text-sm"
              rows={4}
              placeholder="Enter reason for rejection..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                onClick={() => setRemarksModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                onClick={() => setRemarksModalOpen(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send LOA Modal */}
      {sendLOAModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Send LOA</h2>
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded border">
              Recipient: <span className="font-semibold text-gray-800">{record.patient.email}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload LOA File (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              className="w-full p-2 border border-gray-300 rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              onChange={(e) => setLoaFile(e.target.files[0])}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                onClick={() => setSendLOAModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                onClick={handleSendLOA}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main UI --- */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto no-print">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Application Details</h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                Individual Screening
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              
              {/* Left Column: Personal & Procedure */}
              <div className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Patient & Request
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                       <span className="text-gray-500 font-medium">Patient ID</span>
                       <span className="col-span-2 text-gray-900 font-semibold">{record.patient.patient_id}</span>
                       
                       <span className="text-gray-500 font-medium">Full Name</span>
                       <span className="col-span-2 text-gray-900 font-semibold">{record.patient.full_name}</span>

                       <span className="text-gray-500 font-medium">Date Submitted</span>
                       <span className="col-span-2 text-gray-900">
                         {new Date(record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                       </span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Procedure Details
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                       <span className="text-gray-500 font-medium">Procedure</span>
                       <span className="col-span-2 text-gray-900">{record.procedure_name || "---"}</span>
                       
                       <span className="text-gray-500 font-medium">Details</span>
                       <span className="col-span-2 text-gray-900">{record.procedure_details || "---"}</span>

                       <span className="text-gray-500 font-medium">Cancer Site</span>
                       <span className="col-span-2 text-gray-900">{record.cancer_site || "---"}</span>

                       <span className="text-gray-500 font-medium">Provider</span>
                       <span className="col-span-2 text-gray-900">
                          <select
                            className="w-full p-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-1 focus:ring-primary outline-none"
                            value={record?.service_provider || "Chong Hua Hospital Mandaue"}
                            disabled
                          >
                            <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
                          </select>
                       </span>
                    </div>
                 </div>
              </div>

              {/* Right Column: Status & Links */}
              <div className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Status Management
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm items-center">
                       <span className="text-gray-500 font-medium">Current Status</span>
                       <div className="col-span-2">
                          <select
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            value={status}
                            onChange={handleStatusChange}
                            disabled={record?.status === "Completed" || record?.status === "Rejected"}
                          >
                            <option value="Pending" disabled={record?.status !== "Pending"}>Pending</option>
                            <option value="Approved" disabled={record?.status === "Completed"}>Approve</option>
                            <option value="Completed">Complete</option>
                            <option value="Rejected">Reject</option>
                          </select>
                       </div>

                       <span className="text-gray-500 font-medium">Screening Date</span>
                       <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                          <span className="text-gray-900 font-medium">
                            {screeningDate
                              ? new Date(screeningDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                              : "Not Set"}
                          </span>
                          {status === "Approved" && (
                            <button 
                              onClick={() => setDateModalOpen(true)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wide"
                            >
                              Edit
                            </button>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Documents & Links
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                        <Link
                           to="/admin/cancer-screening/view/pre-screening-form"
                           state={record}
                           className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                        >
                           <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Pre-Screening Form</span>
                           <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        </Link>

                        <Link
                           to="/admin/cancer-screening/view/attachments"
                           state={record}
                           className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                        >
                           <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Required Documents</span>
                           <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        </Link>

                        <Link
                           to="/admin/cancer-screening/view/results"
                           state={record}
                           className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                        >
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Screening Results</span>
                             {!record?.uploaded_result && (
                               <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Missing</span>
                             )}
                           </div>
                           <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        </Link>
                    </div>
                 </div>
              </div>
            </div>

            {/* LOA Actions - Only show if not pending */}
            {record?.status !== "Pending" && (
              <div className="mt-4 pt-6 border-t border-gray-100">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide mb-4">
                  Workflow Actions
                </h3>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Letter of Authority
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handlePrint}
                      className="text-xs bg-white border border-blue-200 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 transition text-left"
                    >
                      {/* <Printer className="w-4 h-4" /> */}
                      Download / Print LOA
                    </button>
                    <button
                      onClick={() => setSendLOAModalOpen(true)}
                      className="text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-left flex justify-between items-center"
                    >
                      Send via Email
                      <Send className="ml-3w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            

          </div>
          <div className="flex justify-around print:hidden mt-5">
            <Link
              to="/admin/cancer-screening"
              className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </Link>
            <button
              onClick={handleSaveChanges}
              className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {/* <Save className="w-4 h-4" /> */}
              Save Changes
            </button>
          </div>
        </div>
        

        {/* Decorative Footer */}
        {/* <div className="h-16 bg-secondary shrink-0"></div> */}
      </div>

      {/* Hidden Print Template */}
      <div className="hidden print:block">
        <LOAPrintTemplate loaData={record} />
      </div>
    </>
  );
};

export default DetailedView;