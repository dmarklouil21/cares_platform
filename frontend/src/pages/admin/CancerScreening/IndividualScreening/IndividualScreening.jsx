import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Printer, Info, CheckCircle, X, Trash2 } from "lucide-react";

import api from "src/api/axiosInstance";

import RemarksModal from "src/components/Modal/RemarksModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";

import GeneratePrintTemplate from "./generate/generate";

const IndividualScreening = () => {
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

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
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Date filters
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setNotification(""), 2000);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      const response = await api.get(
        "/cancer-screening/individual-screening-list/"
      );
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "All" || record.status === statusFilter;

    const searchMatch =
      !searchQuery ||
      record.patient.patient_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.patient.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const recordDate = new Date(record.created_at);
    const recordDay = recordDate.getDate();
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
    const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
    const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);

    return statusMatch && searchMatch && dayMatch && monthMatch && yearMatch;
  });

  const handleViewClick = (id) => {
    navigate(`/admin/cancer-screening/view/${id}`);
  };

  const handleReject = async () => {
    setLoading(true);
    setRemarksModalOpen(false);
    try {
      const payload = {
        status: modalAction.status,
        remarks,
      };
      await api.patch(
        `/cancer-screening/individual-screening/status-update/${modalAction.id}/`,
        payload
      );
      navigate("/admin/cancer-screening", {
        state: {
          type: "success",
          message: "Updated Successfully.",
        },
      });
      setNotificationType("success");
      setNotificationMessage("Request Rejected");
      fetchData();
    } catch {
      setModalInfo({
        type: "error",
        title: "Failed",
        message: "Something went wrong while rejecting request.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = async () => {
    if (modalAction?.action === "delete" || modalAction?.action === "reject") {
      try {
        setModalOpen(false);
        setLoading(true);
        await api.delete(
          `/cancer-screening/individual-screening/delete/${modalAction.id}/`
        );
        setNotificationMessage("Deleted Successfully.");
        setNotificationType("success");
        setNotification(notificationMessage);
        setTimeout(() => setNotification(""), 2000);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to delete this object",
          message: "Something went wrong while submitting the request.",
        });
        setShowModal(true);
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

  const handleActionClick = (id, action) => {
    if (action === "delete") {
      setModalText("Confirm delete?");
      setModalDesc("This action cannot be undone.");
      setModalAction({ id, action });
      setModalOpen(true);
    }
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      {loading && <SystemLoader />}
      
      <style>{`
        @media print {
          #individual-root { display: none !important; }
          #print-root { display: block !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }
        .indiv-table { border-collapse: collapse; }
        .indiv-table, .indiv-table th, .indiv-table td, .indiv-table tr { border: 0 !important; }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <GeneratePrintTemplate rows={filteredData} />
      </div>

      {/* SCREEN CONTENT */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          setModalText("");
        }}
      />
      
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      
      <Notification message={notification} type={notificationType} />
      <RemarksModal 
        open={remarksModalOpen}
        title="Remarks"
        placeholder="Enter your remarks here..."
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        onCancel={() => setRemarksModalOpen(false)}
        onConfirm={handleReject}
        confirmText="Confirm"
      />

      <div
        id="individual-root"
        className="min-h-screen w-full p-5 gap-4 flex flex-col bg-gray"
      > 
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Individual Screening
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              to="/admin/cancer-screening/add/individual"
              className="bg-yellow hover:bg-yellow/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
            >
              Add New
            </Link>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Manage Individual Screening Records
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
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Complete</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Date Filters */}
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
                {Array.from(
                  new Set(
                    tableData.map((p) =>
                      new Date(p.created_at || p.date_submitted).getFullYear()
                    )
                  )
                )
                  .filter((y) => !isNaN(y))
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setDayFilter("");
                  setMonthFilter("");
                  setYearFilter("");
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="px-6 py-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-lightblue px-4 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-2 text-center">Patient ID</div>
                  <div className="col-span-3 text-center">Name</div>
                  <div className="col-span-2 text-center">Date Submitted</div>
                  <div className="col-span-2 text-center">LGU</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto">
                {filteredData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No records found matching your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                      >
                        <div 
                          className="col-span-2 text-center text-blue-500 font-medium cursor-pointer"
                          onClick={() => handleViewClick(item.id)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {item.patient.patient_id}
                            {item.has_patient_response && (
                              <span
                                title={
                                  item.has_patient_response
                                    ? item.response_description
                                    : "No additional information"
                                }
                                className="cursor-pointer flex items-center"
                              >
                                <Info
                                  size={14}
                                  className={
                                    item.has_patient_response
                                      ? "text-yellow"
                                      : "text-gray-300"
                                  }
                                />
                              </span>
                              )}
                          </div>
                        </div>
                        <div className="col-span-3 text-center text-gray-800">
                          {item.patient.full_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {item.patient.city}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[item.status] || statusColors.Default
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-center gap-2">
                          {item.status === "Pending" ? (
                            <>
                              <button
                                onClick={() => handleViewClick(item.id)}
                                className="bg-primary cursor-pointer hover:bg-primary/90 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5"/>
                              </button>
                               <button
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                onClick={() => {
                                  setModalAction({
                                    status: "Rejected",
                                    id: item.id,
                                  });
                                  setRemarksModalOpen(true);
                                }}
                              >
                                {/* Reject */}
                                <X className="w-3.5 h-3.5"/>
                              </button>
                            </>
                          ) : item.status === "Rejected" ||
                            item.status === "Completed" ? (
                            <button
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              onClick={() => handleActionClick(item.id, "delete")}
                            >
                              {/* Delete */}
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          ) : (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              onClick={() => handleActionClick(item.id, "delete")}
                            >
                              {/* Cancel */}
                              <X className="w-3.5 h-3.5"/>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} of {tableData.length} records
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Record per page: 10</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">
                    ←
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndividualScreening;