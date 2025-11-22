import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, X, Trash2 } from "lucide-react";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import {
  listPreCancerousMeds,
  cancelPreCancerousMeds,
} from "src/api/precancerous";

const PreCancerStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setNotification(""), 2000);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      const data = await listPreCancerousMeds();
      const mapped = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.id,
        patientNo: item.patient.patient_id,
        lastName: item.patient.last_name,
        firstName: item.patient.first_name,
        middleInitial: item.patient.middle_name || "",
        dateOfBirth: item.patient.date_of_birth,
        interpretationOfResult: item.interpretation_of_result,
        status: item.status,
        created_at: item.created_at,
      }));
      setTableData(mapped);
    } catch (e) {
      // fallback to sample if API fails
      setTableData(SAMPLE_PRE_CANCEROUS_APPS);
      setNotificationMessage(
        "Unable to load applications. Showing sample data."
      );
      setNotificationType("warning");
      setNotification("Unable to load applications. Showing sample data.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = (id) => {
    setModalText("Confirm Cancel");
    setModalDesc("Are you sure you want to cancel this application?");
    setModalAction({ type: "cancel", id: id });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "cancel") {
      try {
        setModalOpen(false);
        setLoading(true);
        const res = await cancelPreCancerousMeds(modalAction.id);

        fetchData();

        setNotificationMessage("Canceled Successfully.");
        setNotificationType("success");
        setNotification("Canceled Successfully.");
        setTimeout(() => setNotification(""), 2000);
      } catch (error) {
        setNotificationMessage("Failed to cancel this request.");
        setNotificationType("error");
        setNotification("Failed to cancel this request.");
        setTimeout(() => setNotification(""), 2000);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleView = (id) => {
    navigate(`/beneficiary/applications/precancerous/view/${id}`);
  };

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "all" || record.status === statusFilter;
    const searchMatch =
      !searchQuery ||
      record.patientNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.interpretationOfResult
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const dateMatch = !dateFilter || recordDate === dateFilter;

    return statusMatch && searchMatch && dateMatch;
  });

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Verified: "bg-blue-100 text-blue-700",
    // Done: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-100 text-gray-700",
    Completed: "bg-green-100 text-green-700",
    Default: "bg-gray-100 text-gray-700",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Pre-cancerous Meds Applications
          </h2>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Track the status of your pre-cancerous meds applications here.
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by patient No. or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-sm"
              />

              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                {/* <option value="Verified">Verified</option> */}
                <option value="Approved">Approved</option>
                <option value="Completed">Complete</option>
                <option value="Rejected">Rejected</option>
                {/* <option value="Cancelled">Cancelled</option> */}
              </select>

              <input
                type="date"
                className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("");
                }}
                title="Clear Filters"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                {/* Clear Filters */}
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="px-6 py-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
              {/* Table Header */}
              <div className="bg-lightblue px-4 py-3 w-[500px] md:w-[100%]">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-2 text-center">Patient No.</div>
                  <div className="col-span-2 text-center">Last Name</div>
                  <div className="col-span-2 text-center">First Name</div>
                  <div className="col-span-2 text-center">Interpretation</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto w-[500px] md:w-[100%]">
                {filteredData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pre-cancerous applications found matching your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredData.map((app) => (
                      <div
                        key={app.id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm text-[12px] md:text-[14px]"
                      >
                        <div
                          className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                          onClick={() => handleView(app.id)}
                        >
                          {app.patientNo}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {app.lastName}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {app.firstName}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {app.interpretationOfResult}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[app.status] || statusColors.Default
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center gap-2">
                          {app.status === "Rejected" && (
                            <button
                              onClick={() => {
                                // Add resubmit navigation logic here
                              }}
                              className="bg-yellow hover:bg-yellow/90 cursor-pointer text-white py-1.5 px-2 rounded transition-colors"
                              title="Resubmit Application"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {app.status !== "Completed" && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreCancerStatus;
