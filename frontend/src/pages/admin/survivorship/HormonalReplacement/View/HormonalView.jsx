import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
// import LOAPrintTemplate from "../generate/LOAPrintTemplate";
import api from "src/api/axiosInstance";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";

const HormonalView = () => {
  const { id } = useParams();
  const location = useLocation();

  // Data
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [releaseDate, setReleaseDate] = useState(null);
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

  // Treatment Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [dateModalTitle, setDateModalTitle] = useState("Set Medicine Release Date");

  // Fetch Data
  const fetchData = async () => {
    try {
      const { data } = await api.get(`/survivorship/hormonal-replacement/view/${id}/`);
      setData(data);
      setStatus(data.status);
      setReleaseDate(data.released_date || null);
      console.log("Data: ", data);
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

  const handleDateModalConfirm = async () => {
    if (!releaseDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    // setReleaseDate(tempDate);
    setModalAction((prev) => ({ ...prev, newReleaseDate: releaseDate }));
    // setIsNewDate(true);
    setDateModalOpen(false);
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    setModalAction({ newStatus: null });
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setModalOpen(false);

      let payload = {
        status: modalAction.newStatus || status,
        released_date: modalAction.newReleaseDate || releaseDate,
      };

      await api.patch(`/survivorship/hormonal-replacement/update/${data.id}/`, payload);

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
  }

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

  const statusLevels = {
    "Pending": 0,
    "Approved": 1,
    "Completed": 2,
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
      <DateModal
        open={dateModalOpen}
        title={dateModalTitle}
        value={releaseDate}
        onChange={setReleaseDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />

      {/* <LOAPrintTemplate loaData={loaData} /> */}

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
              <h2 className="text-lg font-semibold">Hormonal Replacement Medication Request</h2>
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
                <span className="font-medium w-40">Service Completed</span>
                <span className="text-gray-700">{data?.service_completed}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Status</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
                  value={status}
                  onChange={handleStatusChange}
                  disabled={data?.status === "Completed"}
                >
                  <option value="Pending" disabled={currentLevel > 0}>Pending</option>
                  <option value="Approved" disabled={currentLevel > 1}>Approved</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Date Submitted</span>
                <span className="text-gray-700">
                  {data?.date_submitted
                    ? new Date(data?.date_submitted).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Medicines Requested</span>
                <span className="text-gray-700 break-words flex-1">
                  {data?.medicines_requested}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Released Date</span>
                <span className="text-gray-700">
                  {releaseDate
                    ? new Date(releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
                {status === "Approved" && releaseDate && (
                  <span
                    className="text-sm text-blue-700 cursor-pointer"
                    onClick={() => setDateModalOpen(true)}
                  >
                    Edit
                  </span>
                )}
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
                <span className="font-medium w-40">Doctor's Prescription</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/survivorship/hormonal-replacement/view/${data.id}/doctors-prescription`}
                  state={data}
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-around print:hidden">
            <Link
              to={`/admin/survivorship/hormonal-replacement`}
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

export default HormonalView;
