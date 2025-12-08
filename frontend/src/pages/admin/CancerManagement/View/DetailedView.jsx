import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Printer, 
  Send, 
  FileText, 
  Save, 
  Calendar, 
  ArrowLeft,
  FilePlus 
} from "lucide-react";

import api from "src/api/axiosInstance";

import RemarksModal from "src/components/Modal/RemarksModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal";

import LOAPrintTemplate from "./LOAPrintTemplate/";

const AdminCancerManagementView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("Pending");
  
  // Dates
  const [treatmentDate, setTreatmentDate] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");

  const [providerName, setProviderName] = useState("Chong Hua Hospital Mandaue");

  // --- Modals State ---
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success",
    message: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Date Modals
  const [dateModalOpen, setDateModalOpen] = useState(false); // Treatment
  const [interviewModalOpen, setInterviewModalOpen] = useState(false); // Interview

  // Remarks
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // File Sending
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);
  const [sendCaseSummaryModalOpen, setSendCaseSummaryModalOpen] = useState(false);
  const [caseSummaryFile, setCaseSummaryFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/cancer-management/details/${id}/`);
        setRecord(data);
        setStatus(data.status);
        setInterviewDate(data.interview_date || "");
        setTreatmentDate(data.treatment_date || null);
        if(data.service_provider) setProviderName(data.service_provider);
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
    } else if (selectedStatus === "Interview Process") {
      setInterviewModalOpen(true);
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

  const handleInterviewConfirm = () => {
    if (!interviewDate) {
      alert("Please select an interview date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, interviewDate: interviewDate }));
    setInterviewModalOpen(false);
  };

  const handleDateModalConfirm = () => {
    if (!treatmentDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, treatment_date: treatmentDate }));
    setDateModalOpen(false);
  };

  const handleSendLOA = async () => {
    if (!loaFile) {
      setSendLOAModalOpen(false);
      setModalInfo({ type: "info", title: "Note", message: "Please select a file before sending." });
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

      await api.post(`/cancer-management/send-loa/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setModalInfo({ type: "success", title: "LOA Sent", message: "The LOA has been sent successfully." });
      setShowModal(true);
    } catch (error) {
      setModalInfo({ type: "error", title: "Failed", message: "Something went wrong while sending the LOA." });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCaseSummary = async () => {
    if (!caseSummaryFile) {
      setSendCaseSummaryModalOpen(false);
      setModalInfo({ type: "info", title: "Note", message: "Please select a file before sending." });
      setShowModal(true);
      return;
    }
    setSendCaseSummaryModalOpen(false);
    setCaseSummaryFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", caseSummaryFile);
      formData.append("patient_name", record.patient.full_name);
      formData.append("email", record.patient.email);

      await api.post(`/cancer-management/send-case-summary/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setModalInfo({ type: "success", title: "Case Summary Sent", message: "The case summary has been sent successfully." });
      setShowModal(true);
    } catch (error) {
      setModalInfo({ type: "error", title: "Failed", message: "Something went wrong while sending the case summary." });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    // Note: If user hasn't touched status, modalAction might be null. 
    // We handle current state fallbacks in handleModalConfirm.
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    setLoading(true);
    try {
      const payload = {
        status: modalAction?.newStatus || status,
        interview_date: modalAction?.interviewDate || interviewDate,
        treatment_date: modalAction?.treatment_date || treatmentDate,
        service_provider: modalAction?.newProvider || providerName,
        remarks: remarks || "",
      };

      // Clean up nulls if necessary, but backend usually handles it.
      // If dates are empty strings, DRF might complain depending on settings, 
      // but usually for partial updates it's fine.

      await api.patch(
        `/cancer-management/cancer-treatment/status-update/${record.id}/`,
        payload
      );

      navigate("/admin/cancer-management", {
        state: { flash: "Updated Successfully." },
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

  if (!record) return <SystemLoader />;

  // Workflow Steps Helper
  const statusSteps = {
    "Pending": 0,
    "Interview Process": 1,
    "Case Summary Generation": 2,
    "Approved": 3,
    "Completed": 4,
    "Rejected": 5
  };
  const currentStep = statusSteps[record.status] || 0;

  // Helper for Status Badge Color
  const getStatusColor = (st) => {
    switch (st) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Approved": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Interview Process": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Case Summary Generation": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <>
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
          setModalAction(null);
        }}
      />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      {/* Dates */}
      <DateModal
        open={dateModalOpen}
        title="Set Treatment Date"
        value={treatmentDate}
        onChange={setTreatmentDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />
      <DateModal
        open={interviewModalOpen}
        title="Set Interview Date"
        value={interviewDate}
        onChange={setInterviewDate}
        onConfirm={handleInterviewConfirm}
        onCancel={() => setInterviewModalOpen(false)}
      />

      {/* Remarks */}
      <RemarksModal
        open={remarksModalOpen}
        title="Remarks"
        placeholder="Enter your remarks here..."
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        onCancel={() => setRemarksModalOpen(false)}
        onConfirm={() => setRemarksModalOpen(false)}
        confirmText="Confirm"
      />

      {/* Uploads */}
      <FileUploadModal
        open={sendLOAModalOpen}
        title="Send LOA via Email"
        recipient={record?.patient?.email}
        onFileChange={setLoaFile}
        onConfirm={handleSendLOA}
        onCancel={() => setSendLOAModalOpen(false)}
      />
      <FileUploadModal
        open={sendCaseSummaryModalOpen}
        title="Send Case Summary via Email"
        recipient={record?.patient?.email}
        onFileChange={setCaseSummaryFile}
        onConfirm={handleSendCaseSummary}
        onCancel={() => setSendCaseSummaryModalOpen(false)}
      />

      {/* --- Main Layout --- */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto no-print">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Application Details</h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                Cancer Management
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Left Column: Personal & Status */}
              <div className="space-y-8">
                {/* Patient Info */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Patient & Request
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Patient ID</span>
                    <span className="col-span-2 text-gray-900 font-semibold">{record.patient.patient_id}</span>
                    
                    <span className="text-gray-500 font-medium">Full Name</span>
                    <span className="col-span-2 text-gray-900 font-semibold">{record.patient.full_name}</span>

                    <span className="text-gray-500 font-medium">Service</span>
                    <span className="col-span-2 text-gray-900">{record.service_type || "---"}</span>

                    <span className="text-gray-500 font-medium">Submitted</span>
                    <span className="col-span-2 text-gray-900">
                      {record.date_submitted
                        ? new Date(record.date_submitted).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "---"}
                    </span>
                  </div>
                </div>

                {/* Status Management */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Status Management
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-sm items-center">
                    <span className="text-gray-500 font-medium">Update Status</span>
                    <div className="col-span-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-primary outline-none transition-shadow"
                        value={status}
                        onChange={handleStatusChange}
                        disabled={record?.status === "Completed" || record?.status === "Rejected"}
                      >
                        <option value="Pending" disabled={currentStep > 0}>Pending</option>
                        <option value="Interview Process" disabled={currentStep > 1}>Interview Process</option>
                        <option value="Case Summary Generation" disabled={currentStep > 2}>Case Summary Generation</option>
                        <option value="Approved" disabled={currentStep > 3}>Approve</option>
                        <option value="Rejected">Reject</option>
                        <option value="Completed">Complete</option>
                      </select>
                    </div>

                    <span className="text-gray-500 font-medium">Interview</span>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-gray-900 font-medium">
                        {interviewDate
                          ? new Date(interviewDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : "Not Set"}
                      </span>
                      {(status === "Interview Process" || status === "Pending") && (
                        <button onClick={() => setInterviewModalOpen(true)} className="p-1 hover:bg-gray-200 rounded text-blue-600">
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <span className="text-gray-500 font-medium">Treatment Date</span>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-gray-900 font-medium">
                        {treatmentDate
                          ? new Date(treatmentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : "Not Set"}
                      </span>
                      {status === "Approved" && (
                        <button onClick={() => setDateModalOpen(true)} className="p-1 hover:bg-gray-200 rounded text-blue-600">
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <span className="text-gray-500 font-medium">Provider</span>
                    <div className="col-span-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                      >
                        <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Documents & Actions */}
              <div className="space-y-8">
                
                {/* Documents & Links */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Documents & Links
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { title: "Pre-Screening Form", path: "pre-screening-form", icon: <FileText className="w-4 h-4" /> },
                      { title: "Well Being Form", path: "well-being-form", icon: <FileText className="w-4 h-4" /> },
                      { title: "Required Documents", path: "attachments", icon: <FileText className="w-4 h-4" /> },
                      { title: "Lab Results", path: "results", icon: <FileText className="w-4 h-4" />, missing: !record.uploaded_result },
                    ].map((item, idx) => (
                      <Link
                        key={idx}
                        to={`/admin/cancer-management/view/${record.id}/${item.path}`}
                        state={record}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{item.title}</span>
                          {/* <div className="text-gray-400 group-hover:text-primary">{item.icon}</div> */}
                          {item.missing && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Missing</span>}
                        </div>
                        <div className="text-gray-400 group-hover:text-primary">{item.icon}</div>
                        {/* <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-primary" /> */}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Workflow Actions */}
                {record.status !== "Pending" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Workflow Actions
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* LOA Section */}
                      <div className="col-span-2 md:col-span-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Letter of Authority
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handlePrint}
                            className="text-xs bg-white border border-blue-200 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 transition text-left"
                          >
                            Download / Print LOA
                          </button>
                          <button
                            onClick={() => setSendLOAModalOpen(true)}
                            className="text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-left flex justify-between items-center"
                          >
                            Send via Email <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Case Summary Section */}
                      <div className="col-span-2 md:col-span-1 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="font-semibold text-orange-900 mb-3 text-sm flex items-center gap-2">
                          <FilePlus className="w-4 h-4" />
                          Case Summary
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/admin/cancer-management/view/${record?.id}/case-summary`}
                            state={record}
                            className="text-xs bg-white border border-orange-200 text-orange-700 py-2 px-3 rounded hover:bg-orange-100 transition text-left block"
                          >
                            Create / View
                          </Link>
                          <button
                            onClick={() => setSendCaseSummaryModalOpen(true)}
                            className="text-xs bg-orange-600 text-white py-2 px-3 rounded hover:bg-orange-700 transition text-left flex justify-between items-center"
                          >
                            Send via Email <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-5">
              <Link
                to="/admin/cancer-management"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
              <button
                onClick={handleSaveChanges}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                {/* <Save className="w-4 h-4" /> */}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>

      {/* Hidden Print Template */}
      <div className="hidden print:block">
        <LOAPrintTemplate loaData={record} />
      </div>
    </>
  );
};

export default AdminCancerManagementView;