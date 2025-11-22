import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import LOAPrintTemplate from "../generate/LOAPrintTemplate";
import api from "src/api/axiosInstance";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal";
import CheckupScheduleModal from "src/components/Modal/CheckupScheduleModal";

const PostTreatmentView = () => {
  const { id } = useParams();
  const location = useLocation();

  // Data
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [labTestDate, setLabTestDate] = useState(null);
  const [isNewDate, setIsNewDate] = useState(false);

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
    message: "The form has been submitted successfully.",
  });

  // Treatment Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [dateModalTitle, setDateModalTitle] = useState("Set Laboratory Test Date");

  // LOA Modal
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);

  // Checkup Schedules Modal & Followup Checkups
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
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
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Handlers
  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approved") {
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleFollowupCheckupsChanges = (index, e) => {
    const { name, value } = e.target;
    const updatedUpdates = [...followupCheckups];
    updatedUpdates[index] = {
      ...updatedUpdates[index],
      [name]: value,
    };
    setFollowupCheckups(updatedUpdates);
  };

  const addFollowupCheckups = () => {
    setFollowupCheckups([
      ...followupCheckups,
      {
        date: "",
        note: "",
      },
    ]);
  };

  const removeFollowupCheckups = (index) => {
    if (followupCheckups.length > 1) {
      const updatedUpdates = followupCheckups.filter((_, i) => i !== index);
      setFollowupCheckups(updatedUpdates);
    }
  };

  const handleDateModalConfirm = async () => {
    if (!tempDate) {
      alert("Please select a date before proceeding.");
      return;
    }

    if (modalAction?.type === "reschedule") {
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
        setNotification("Something went wrong while submitting the changes.");
        console.error("Error rescheduling checkup:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLabTestDate(tempDate);
      setModalAction((prev) => ({ ...prev, newLabTestDate: tempDate }));
      setIsNewDate(true);
      setDateModalOpen(false);
    }
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
      setNotification("Something went wrong while submitting the changes.");
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

  const handleMarkDone = (id) => {
    setModalText("Mark As Done?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    setModalAction({ type: "markDone", id: id }); // No status change, just save
  };

  const handleReschedule = (id) => {
    setDateModalOpen(true);
    setDateModalTitle("Reschedule Checkup Date");
    setModalAction({ type: "reschedule", id: id }); // No status change, just save
  };

  const handleCancel = (id) => {
    setModalText("Cancel this schedule?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    setModalAction({ type: "cancel", id: id }); 
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "markDone") {
      setModalOpen(false);
      setLoading(true);
      try {
        await api.patch(`/post-treatment/followup-checkups/mark-as-done/${modalAction?.id}/`);

        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } catch (error) {
        setNotificationType("error");
        setNotification("Something went wrong while submitting the changes.");

        console.error(error);
      } finally {
        setLoading(false);
      };
    } else if (modalAction?.type === "cancel") {
      setModalOpen(false);
      setLoading(true);
      try {
        await api.delete(`/post-treatment/cancel-schedule/${modalAction?.id}/`);

        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } catch (error) {
        setNotificationType("error");
        setNotification("Something went wrong while submitting the changes.");

        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        setModalOpen(false);
        const today = new Date().toISOString().split('T')[0];
        console.log(today);

        if (labTestDate < today) {
          console.log("Am")
          setModalInfo({
            type: "info",
            title: "Invalid Date",
            message: "Date cannot be set into the past.",
          });
          setShowModal(true);
          return;
        }
        let payload = {
          status: modalAction.newStatus || status,
          laboratory_test_date: modalAction.newLabTestDate || labTestDate,
          followup_checkups: followupCheckups.filter((f) => f.date) || [],
        };

        await api.patch(`/post-treatment/update/${data.id}/`, payload);

        setNotificationType("success");
        setNotification("Success.");
        fetchData();
      } catch (error) {
        setNotificationType("error");
        setNotification("Something went wrong while submitting the changes.");
      } finally {
        setLoading(false);
        setModalAction(null);
      }
    };
  }

  const loaData = {
    patient: {
      full_name: data.patient?.full_name,
      city: data.patient?.city,
      age: data.patient?.age,
      diagnosis: [{}],
    },
    procedure_name: data.procedure_name,
  };

  const statusPillClasses =
    data?.status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : data?.status === "Follow-up Required"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : data?.status === "Approved"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : data?.status === "Closed"
      ? "bg-gray-100 text-gray-700 border border-gray-200"
      : data?.status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : data?.status === "Rejected"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-yellow-100 text-yellow-700";

      // Define the linear order of your status workflow

  const statusLevels = {
    "Pending": 0,
    "Approved": 1,
    "Completed": 2,
    "Follow-up Required": 3,
    "Closed": 4
  };

  // Get the numeric level of the SAVED record status
  const currentLevel = statusLevels[data?.status] || 0;

  return (
    <>
      {loading && <SystemLoader />}

      {/* Modals */}
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

      <LOAPrintTemplate loaData={loaData} />

      {/* Page Content */}
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Treatment Info</h1>
          <Link to={"/admin/treatment-assistance/post-treatment"}>
            <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
          </Link>
        </div> */}

        {/* Treatment Info */}
        <div className="h-fit w-full flex flex-col gap-4">
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Post-Treatment Laboratory Request</h2>
              <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
                {data?.status}
              </span>
              {/* <div className="flex gap-2">
                <h2 className="text-lg font-semibold">Post-Treatment Laboratory Request</h2>
                <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
                  {data?.status}
                </span>
              </div>
              <div>
                <Link to={"/admin/treatment-assistance/post-treatment"}>
                  <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
                </Link>
              </div> */}
            </div>
            {/* Info Fields */}
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient ID</span>
                <span className="text-gray-700">{data?.patient?.patient_id || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient Name</span>
                <span className="text-gray-700">{data?.patient?.full_name || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Diagnosis</span>
                <span className="text-gray-700">
                  {data?.patient?.diagnosis?.[0]?.diagnosis || "---"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Procedure</span>
                <span className="text-gray-700">{data?.procedure_name || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Status</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
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
              <div className="flex gap-2">
                <span className="font-medium w-40">Date Submitted</span>
                <span className="text-gray-700">
                  {data?.created_at
                    ? new Date(data?.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Lab Test Date</span>
                <span className="text-gray-700">
                  {labTestDate
                    ? new Date(labTestDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
                {status === "Approved" && labTestDate && (
                  <span
                    className="text-sm text-blue-700 cursor-pointer"
                    onClick={() => setDateModalOpen(true)}
                  >
                    Edit
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Service Provider</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
                  value={data?.service_provider || ""}
                  // onChange={handleStatusChange}
                >
                  <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Laboratory Request</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/treatment-assistance/postview/${data?.id}/lab-request`}
                  state={data}
                >
                  View
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Lab Results {" "}
                  <span className="text-xs text-red-500">{data?.uploaded_result ? "" : "(Missing)"}</span>
                </span>
                <Link
                  className="text-blue-700"
                  to={`/admin/treatment-assistance/postview/${data?.id}/lab-result`}
                  state={data}
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* LOA Actions */}
          {data?.status !== "Pending" && (
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">LOA Actions</h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex gap-2">
                  <span className="font-medium w-40">Letter of Authority</span>
                  <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => window.print()}
                  >
                    Download
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-40">Send LOA</span>
                  <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => setSendLOAModalOpen(true)}
                  >
                    Send
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Followup Checkups */}
          {data?.status === "Follow-up Required" && (
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Follow-up Checkups
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {followupCheckups.map((update, index) => (
                  <div key={index} className="flex flex-col gap-3 border-b pb-4">
                    <div className="flex justify-end items-center">
                      {followupCheckups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFollowupCheckups(index)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="text-sm font-medium block mb-1">
                          Checkup Date:
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={update.date}
                          onChange={(e) => handleFollowupCheckupsChanges(index, e)}
                          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-sm font-medium block mb-1">
                          Notes:
                        </label>
                        <textarea
                          name="note"
                          value={update.note}
                          onChange={(e) => handleFollowupCheckupsChanges(index, e)}
                          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFollowupCheckups}
                  className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  + Add Another Checkup
                </button>
              </div>
            </div>
          )}

          {/* Checkup Schedules */}
          {data?.status === "Follow-up Required" && data?.followup_checkups?.length > 0 && (
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Checkup Schedules
                </h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b text-left text-sm font-bold">Checkup Date</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-bold">Note</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.followup_checkups?.filter(checkup => checkup.status !== "Completed")
                        .map((checkup, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="py-2 px-4 border-b text-sm">
                              {checkup?.date ?? ""}
                            </td>
                            <td className="py-2 px-4 border-b text-sm">
                              {checkup?.note ?? ""}
                            </td>
                            <td className="py-2 px-4 border-b text-sm">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleMarkDone(checkup?.id)} 
                                  className="text-sm text-blue-700 cursor-pointer">
                                    Mark as Done
                                </button>
                                <button 
                                  onClick={() => handleReschedule(checkup?.id)} 
                                  className="text-sm text-yellow cursor-pointer">
                                    Reschedule
                                </button>
                                <button 
                                  onClick={() => handleCancel(checkup?.id)} 
                                  className="text-sm text-red-500 cursor-pointer">
                                    Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                      {data?.followup_checkups?.filter(c => c.status !== "Completed").length === 0 && (
                        <tr>
                          <td className="py-2 px-4 border-b text-sm" colSpan={3}>
                            No upcoming checkups available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-around print:hidden">
            <Link
              to={`/admin/treatment-assistance/post-treatment`}
              className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md"
            >
              Back
            </Link>
            <button
              onClick={handleSaveChanges}
              className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostTreatmentView;
