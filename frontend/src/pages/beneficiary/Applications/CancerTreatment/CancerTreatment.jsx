import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, X, Trash2 } from "lucide-react";
import api from "src/api/axiosInstance";

import Notification from "src/components/Notification";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";

const CancerTreatmentApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Date filters
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

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
      const response = await api.get(`/beneficiary/cancer-treatment/list/`);
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching cancer treatment requests:", error);
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
        await api.delete(
          `/beneficiary/cancer-treatment/cancel-request/${modalAction.id}/`
        );

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
        fetchData();
        setLoading(false);
      }
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleView = (id) => {
    navigate(`/beneficiary/applications/cancer-treatment/view/${id}`);
  };

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "all" || record.status === statusFilter;
    const searchMatch =
      !searchQuery ||
      record.patient.patient_id.includes(searchQuery) ||
      record.patient.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Date filtering
    const recordDate = new Date(record.date_submitted);
    if (isNaN(recordDate)) return false;

    const recordDay = recordDate.getDate();
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();
    const recordDateString = recordDate.toISOString().split("T")[0];

    const dateMatch = !dateFilter || recordDateString === dateFilter;
    const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
    const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
    const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);

    return (
      statusMatch &&
      searchMatch &&
      dateMatch &&
      dayMatch &&
      monthMatch &&
      yearMatch
    );
  });

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Complete: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    "Interview Process": "bg-purple-100 text-purple-700",
    "Case Summary Generation": "bg-indigo-100 text-indigo-700",
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

  // Get unique years from table data for year filter
  const availableYears = Array.from(
    new Set(
      tableData
        .map((item) => new Date(item.date_submitted).getFullYear())
        .filter((year) => !isNaN(year))
    )
  ).sort((a, b) => b - a);

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
          <h2 className="text-xl font-bold text-gray-800">Cancer Treatment</h2>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Track the status of your cancer treatment applications here.
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by patient ID or name..."
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
                <option value="Interview Process">Interview Process</option>
                <option value="Case Summary Generation">
                  Case Summary Gen...
                </option>
                <option value="Approved">Approved</option>
                <option value="Complete">Complete</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Date Filters */}
              {/* <input
                type="date"
                className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              /> */}

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <option value="">All Days</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("en", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("");
                  setDayFilter("");
                  setMonthFilter("");
                  setYearFilter("");
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-auto ">
              {/* Table Header */}
              <div className="bg-lightblue px-4 py-3 w-[500px] md:w-[100%]">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-2 text-center">Patient ID</div>
                  <div className="col-span-2 text-center">
                    Service Requested
                  </div>
                  <div className="col-span-2 text-center">Date Submitted</div>
                  <div className="col-span-2 text-center">Date Approved</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto w-[500px] md:w-[100%]">
                {filteredData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No cancer treatment applications found matching your
                    filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredData.map((app) => (
                      <div
                        key={app.id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm text-[12px] md:text-[14px]"
                      >
                        <div
                          className="col-span-2 cursor-pointer text-center text-blue-500 font-medium"
                          onClick={() => handleView(app.id)}
                        >
                          {app.patient.patient_id}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {app.service_type}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {formatDate(app.date_submitted)}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {formatDate(app.date_approved)}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold max-w-[120px] truncate ${
                              statusColors[app.status] || statusColors.Default
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center gap-2">
                          {/* {(app.status !== "Pending" && app.status !== "Rejected") && (
                            <button
                              onClick={() => handleView(app.id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                            >
                              View
                            </button>
                          )} */}
                          {app.status === "Rejected" && (
                            <button
                              onClick={() => {
                                navigate(
                                  "/beneficiary/services/cancer-management/apply/upload-documents",
                                  {
                                    state: { id: app.id },
                                  }
                                );
                              }}
                              className="bg-yellow cursor-pointer hover:bg-yellow/90 text-white py-1.5 px-2 rounded transition-colors"
                              title="Resubmit Application"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {app.status !== "Complete" && (
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

export default CancerTreatmentApplication;
