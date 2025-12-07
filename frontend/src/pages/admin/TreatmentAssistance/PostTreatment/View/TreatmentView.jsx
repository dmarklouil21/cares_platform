import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Printer, 
  Send, 
  Save, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  ArrowLeft
} from "lucide-react";

import api from "src/api/axiosInstance";
import LOAPrintTemplate from "../generate/LOAPrintTemplate";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal";

const PostTreatmentView = () => {
  const { id } = useParams();
  const location = useLocation();

  // Data
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [labTestDate, setLabTestDate] = useState(null);

  // Loading & Notification
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(location.state?.type || "");

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Action?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "Info",
    message: "",
  });

  // Treatment Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [dateModalTitle, setDateModalTitle] = useState("Set Laboratory Test Date");

  // LOA Modal
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);

  // Followup Checkups State
  const [followupCheckups, setFollowupCheckups] = useState([
    { date: "", note: "" },
  ]);

  // Fetch Data
  const fetchData = async () => {
    try {
      const { data } = await api.get(`/post-treatment/view/${id}/`);
      setData(data);
      setStatus(data.status);
      setLabTestDate(data.laboratory_test_date || null);
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Auto-hide notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // --- Handlers ---

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approved") {
      setDateModalTitle("Set Laboratory Test Date");
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  // Follow-up Input Handlers
  const handleFollowupCheckupsChanges = (index, e) => {
    const { name, value } = e.target;
    const updatedUpdates = [...followupCheckups];
    updatedUpdates[index] = { ...updatedUpdates[index], [name]: value };
    setFollowupCheckups(updatedUpdates);
  };

  const addFollowupCheckups = () => {
    setFollowupCheckups([...followupCheckups, { date: "", note: "" }]);
  };

  const removeFollowupCheckups = (index) => {
    if (followupCheckups.length > 1) {
      const updatedUpdates = followupCheckups.filter((_, i) => i !== index);
      setFollowupCheckups(updatedUpdates);
    }
  };

  // Date Modal Handler
  const handleDateModalConfirm = async () => {
    if (!tempDate) {
      alert("Please select a date before proceeding.");
      return;
    }

    if (modalAction?.type === "reschedule") {
      // Immediate API call for rescheduling existing
      try {
        setLoading(true);
        setDateModalOpen(false);
        await api.patch(
          `/post-treatment/followup-checkups/reschedule/${modalAction?.id}/`,
          { date: tempDate }
        );
        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } catch (error) {
        setNotificationType("error");
        setNotification("Something went wrong while rescheduling.");
      } finally {
        setLoading(false);
      }
    } else {
      // Just setting state for main Save
      setLabTestDate(tempDate);
      setModalAction((prev) => ({ ...prev, newLabTestDate: tempDate }));
      setDateModalOpen(false);
    }
  };

  const handleSendLOA = async () => {
    if (!loaFile) {
      setSendLOAModalOpen(false);
      setModalInfo({ type: "info", title: "Note", message: "Please select a file before sending." });
      setShowModal(true);
      return;
    }

    try {
      setSendLOAModalOpen(false);
      setLoading(true);
      const formData = new FormData();
      formData.append("file", loaFile);
      formData.append("patient_name", data.patient?.full_name);
      formData.append("email", data.patient?.email);

      await api.post(`/post-treatment/send-loa/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotificationType("success");
      setNotification("Success.");
    } catch (error) {
      setNotificationType("error");
      setNotification("Something went wrong while sending the LOA.");
    } finally {
      setLoading(false);
      setLoaFile(null);
    }
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    setModalAction({ newStatus: null });
  };

  // Immediate Actions for Checkups
  const handleMarkDone = (id) => {
    setModalText("Mark As Done?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    setModalAction({ type: "markDone", id: id });
  };

  const handleReschedule = (id) => {
    setTempDate("");
    setDateModalTitle("Reschedule Checkup Date");
    setDateModalOpen(true);
    setModalAction({ type: "reschedule", id: id });
  };

  const handleCancel = (id) => {
    setModalText("Cancel this schedule?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    setModalAction({ type: "cancel", id: id });
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    setLoading(true);

    try {
      if (modalAction?.type === "markDone") {
        await api.patch(`/post-treatment/followup-checkups/mark-as-done/${modalAction?.id}/`);
        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } else if (modalAction?.type === "cancel") {
        await api.delete(`/post-treatment/cancel-schedule/${modalAction?.id}/`);
        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } else {
        // Main Form Save
        const today = new Date().toISOString().split('T')[0];
        
        if (labTestDate && labTestDate < today && status === 'Approved') {
           // Basic check, though DateModal handles some of this
           console.warn("Past date selected");
        }

        let payload = {
          status: modalAction?.newStatus || status,
          laboratory_test_date: modalAction?.newLabTestDate || labTestDate,
          followup_checkups: followupCheckups.filter((f) => f.date) || [],
        };

        await api.patch(`/post-treatment/update/${data.id}/`, payload);
        setNotificationType("success");
        setNotification("Success.");
        fetchData();
        // Reset followups input after save
        setFollowupCheckups([{ date: "", note: "" }]);
      }
    } catch (error) {
      setNotificationType("error");
      setNotification("Something went wrong while submitting the changes.");
    } finally {
      setLoading(false);
      setModalAction(null);
    }
  };

  const statusLevels = {
    "Pending": 0,
    "Approved": 1,
    "Completed": 2,
    "Follow-up Required": 3,
    "Closed": 4
  };
  const currentLevel = statusLevels[data?.status] || 0;

  const getStatusColor = (st) => {
    switch (st) {
        case "Completed": return "bg-green-100 text-green-700 border-green-200";
        case "Follow-up Required": return "bg-blue-100 text-blue-700 border-blue-200";
        case "Approved": return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "Closed": return "bg-gray-100 text-gray-700 border-gray-200";
        case "Rejected": return "bg-red-100 text-red-700 border-red-200";
        default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  // Prepare Data for Print Template
  const loaData = {
    patient: {
      full_name: data.patient?.full_name,
      city: data.patient?.city,
      age: data.patient?.age,
      diagnosis: [{}],
    },
    procedure_name: data.procedure_name,
  };

  return (
    <>
      {loading && <SystemLoader />}

      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      
      <Notification message={notification} type={notificationType} />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <DateModal
        open={dateModalOpen}
        title={dateModalTitle}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />

      <FileUploadModal
        open={sendLOAModalOpen}
        title="Send LOA"
        recipient={data?.patient?.email}
        onFileChange={setLoaFile}
        onConfirm={handleSendLOA}
        onCancel={() => setSendLOAModalOpen(false)}
      />

      {/* Hidden Print Template */}
      <div className="hidden print:block">
        <LOAPrintTemplate loaData={loaData} />
      </div>

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto print:hidden">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Application Details</h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                Post-Treatment Request
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(data?.status)}`}>
                {data?.status}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Left Column: Patient & Status */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Patient & Request
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500 font-medium">Patient ID</span>
                    <span className="col-span-2 text-gray-900 font-semibold">{data?.patient?.patient_id || "---"}</span>
                    
                    <span className="text-gray-500 font-medium">Full Name</span>
                    <span className="col-span-2 text-gray-900 font-semibold">{data?.patient?.full_name || "---"}</span>

                    <span className="text-gray-500 font-medium">Diagnosis</span>
                    <span className="col-span-2 text-gray-900">{data?.patient?.diagnosis?.[0]?.diagnosis || "---"}</span>

                    <span className="text-gray-500 font-medium">Procedure</span>
                    <span className="col-span-2 text-gray-900">{data?.procedure_name || "---"}</span>
                  </div>
                </div>

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
                            disabled={data?.status === "Closed"}
                        >
                            <option value="Pending" disabled={currentLevel > 0}>Pending</option>
                            <option value="Approved" disabled={currentLevel > 1}>Approved</option>
                            <option value="Completed" disabled={currentLevel > 2}>Completed</option>
                            <option value="Follow-up Required" disabled={currentLevel > 3}>Follow-up Required</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <span className="text-gray-500 font-medium">Lab Test Date</span>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-gray-900 font-medium">
                        {labTestDate
                          ? new Date(labTestDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : "Not Set"}
                      </span>
                      {status === "Approved" && (
                        <button 
                          onClick={() => { setDateModalTitle("Set Laboratory Test Date"); setTempDate(labTestDate || ""); setDateModalOpen(true); }}
                          className="p-1 hover:bg-gray-200 rounded text-blue-600"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <span className="text-gray-500 font-medium">Provider</span>
                    <div className="col-span-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                        value={data?.service_provider || "Chong Hua Hospital Mandaue"}
                        disabled
                      >
                        <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Links & Documents */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Documents & Links
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Link
                       to={`/admin/treatment-assistance/postview/${data?.id}/lab-request`}
                       state={data}
                       className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                       <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Laboratory Request</span>
                       <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                    </Link>

                    <Link
                       to={`/admin/treatment-assistance/postview/${data?.id}/lab-result`}
                       state={data}
                       className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Lab Results</span>
                         {!data?.uploaded_result && (
                           <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Missing</span>
                         )}
                       </div>
                       <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                    </Link>
                  </div>
                </div>

                {/* LOA Actions */}
                {data?.status !== "Pending" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Workflow Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Letter of Authority
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="text-xs bg-white border border-blue-200 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 transition text-left"
                                >
                                    Download / Print
                                </button>
                                <button
                                    onClick={() => setSendLOAModalOpen(true)}
                                    className="text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-left flex justify-between items-center"
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

            {/* --- Follow-up Section --- */}
            {status === "Follow-up Required" && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide mb-4">
                        Follow-up Management
                    </h3>

                    {/* Checkup Schedules Table */}
                    {data?.followup_checkups?.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data?.followup_checkups?.filter(c => c.status !== "Completed").map((checkup, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{checkup.date}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{checkup.note || "-"}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm flex gap-2">
                                                <button onClick={() => handleMarkDone(checkup.id)} title="Mark Done" className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleReschedule(checkup.id)} title="Reschedule" className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleCancel(checkup.id)} title="Cancel" className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.followup_checkups?.filter(c => c.status !== "Completed").length === 0 && (
                                        <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">No active schedules.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic mb-6">No schedules created yet.</div>
                    )}

                    {/* Add New Checkup Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Add New Schedule</div>
                        {followupCheckups.map((update, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={update.date}
                                        onChange={(e) => handleFollowupCheckupsChanges(index, e)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex-[2] w-full">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Note</label>
                                    <input
                                        type="text"
                                        name="note"
                                        placeholder="Checkup details..."
                                        value={update.note}
                                        onChange={(e) => handleFollowupCheckupsChanges(index, e)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                {followupCheckups.length > 1 && (
                                    <button onClick={() => removeFollowupCheckups(index)} className="p-2 text-red-500 hover:bg-red-100 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFollowupCheckups}
                            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800"
                        >
                            <Plus className="w-3 h-3" /> Add another row
                        </button>
                    </div>
                </div>
            )}

          </div>
          {/* Footer Actions */}
          <div className="flex justify-around print:hidden mt-5">
            <Link
              to="/admin/treatment-assistance/post-treatment"
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
    </>
  );
};

export default PostTreatmentView;