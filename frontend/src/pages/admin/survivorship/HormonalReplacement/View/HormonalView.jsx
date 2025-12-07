import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Save, Calendar, ArrowLeft, FileText } from "lucide-react";

import api from "src/api/axiosInstance";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";

const HormonalView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Data
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [releaseDate, setReleaseDate] = useState(null);

  // Loading & Notification
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Action?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Treatment Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/survivorship/hormonal-replacement/view/${id}/`
      );
      setData(data);
      setStatus(data.status);
      setReleaseDate(data.released_date || null);
    } catch (error) {
      console.error("Error fetching record:", error);
      setNotificationType("error");
      setNotification("Failed to load record details.");
    } finally {
      setLoading(false);
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
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = () => {
    if (!releaseDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, newReleaseDate: releaseDate }));
    setDateModalOpen(false);
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    // setModalAction({ newStatus: null }); // Preserve existing changes
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setModalOpen(false);

      let payload = {
        status: modalAction?.newStatus || status,
        released_date: modalAction?.newReleaseDate || releaseDate,
      };

      await api.patch(
        `/survivorship/hormonal-replacement/update/${data.id}/`,
        payload
      );

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

  if (!data && !loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Record not found.</p>
      </div>
    );
  }

  // Helper for Status Badge Color
  const getStatusColor = (st) => {
    switch (st) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const statusLevels = {
    Pending: 0,
    Approved: 1,
    Completed: 2,
  };
  const currentLevel = statusLevels[data?.status] || 0;

  return (
    <>
      {loading && <SystemLoader />}

      {/* --- Modals --- */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <Notification message={notification} type={notificationType} />

      <DateModal
        open={dateModalOpen}
        title="Set Medicine Release Date"
        value={releaseDate}
        onChange={setReleaseDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />

      {/* --- Main Content --- */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Application Details
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <h1 className="font-bold text-[24px] md:text-3xl text-yellow">
                Hormonal Replacement
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(
                  data?.status
                )}`}
              >
                {data?.status}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: Patient & Status */}
              <div className="space-y-8">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500 font-medium">
                      Patient ID
                    </span>
                    <span className="col-span-2 text-gray-900 font-semibold">
                      {data?.patient?.patient_id || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">Full Name</span>
                    <span className="col-span-2 text-gray-900 font-semibold">
                      {data?.patient?.full_name || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">Diagnosis</span>
                    <span className="col-span-2 text-gray-900">
                      {data?.patient?.diagnosis?.[0]?.diagnosis || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">
                      Date Submitted
                    </span>
                    <span className="col-span-2 text-gray-900">
                      {data?.date_submitted
                        ? new Date(data.date_submitted).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
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
                    <span className="text-gray-500 font-medium">
                      Update Status
                    </span>
                    <div className="col-span-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-primary outline-none transition-shadow"
                        value={status}
                        onChange={handleStatusChange}
                        disabled={data?.status === "Completed"}
                      >
                        <option value="Pending" disabled={currentLevel > 0}>
                          Pending
                        </option>
                        <option value="Approved" disabled={currentLevel > 1}>
                          Approved
                        </option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <span className="text-gray-500 font-medium">
                      Release Date
                    </span>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-gray-900 font-medium">
                        {releaseDate
                          ? new Date(releaseDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not Set"}
                      </span>
                      {status === "Approved" && (
                        <button
                          onClick={() => setDateModalOpen(true)}
                          className="p-1 hover:bg-gray-200 rounded text-blue-600"
                          title="Edit Release Date"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Request Details & Docs */}
              <div className="space-y-8">
                {/* Request Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Request Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Medicines Requested
                      </span>
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {data?.medicines_requested || "None specified."}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-1">
                      <span className="block text-xs font-bold text-gray-500 uppercase">
                        Service Status
                      </span>
                      <p className="text-sm text-gray-900 font-medium">
                        {data?.service_completed || "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents & Links */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Documents & Links
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/admin/survivorship/hormonal-replacement/view/${data?.id}/doctors-prescription`}
                      state={data}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {/* <div className="text-gray-400 group-hover:text-primary">
                          <FileText className="w-4 h-4" />
                        </div> */}
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                          Doctor's Prescription
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      {/* <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-primary" /> */}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="flex justify-around print:hidden mt-5">
            <Link
              to="/admin/survivorship/hormonal-replacement"
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

export default HormonalView;