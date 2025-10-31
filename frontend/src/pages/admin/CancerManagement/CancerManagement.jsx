// src/pages/cancer-management/AdminCancerManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Printer, Info, CheckCircle, X, Trash2 } from "lucide-react";

import api from "src/api/axiosInstance";

import RemarksModal from "src/components/Modal/RemarksModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import LoadingModal from "src/components/Modal/LoadingModal";

import CancerManagementPrint from "./generate/generate";

const AdminCancerManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State & Notifications
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableData, setTableData] = useState([]);

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

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
      const t = setTimeout(() => setNotification(""), 2000);
      return () => clearTimeout(t);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      const response = await api.get("/cancer-management/list/");
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching cancer treatment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filters
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
    
    const recordDate = new Date(record.date_submitted);
    const recordDay = recordDate.getDate();
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
    const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
    const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);

    // const dateMatch = !dateFilter || record.date_submitted === dateFilter;
    return statusMatch && searchMatch && dayMatch && monthMatch && yearMatch;
  });

  // Handlers
  const handleViewClick = (id) => {
    const selected = tableData.find((item) => item.id === id);
    navigate(`/admin/cancer-management/view/${id}`, {
      state: { record: selected },
    });
  };

  const handleReject = async () => {
    // setModalAction({ status: item.status, id: item.id })
    setLoading(true);
    setRemarksModalOpen(false);
    try {
      const payload = {
        status: modalAction.status,
        remarks,
      };

      await api.patch(
        `/cancer-management/cancer-treatment/status-update/${modalAction.id}/`,
        payload
      );
      navigate("/admin/cancer-management", {
        state: {
          type: "success",
          message: "Updated Successfully.",
        },
      });
      setNotificationType("success");
      setNotificationMessage("Request Rejected");
      fetchData();
      // await api.patch(
      //   `/cancer-screening/individual-screening/status-reject/${modalAction.id}/`,
      //   { status: modalAction.newStatus, remarks }
      // );
      // navigate("/admin/cancer-screening", {
      //   state: {
      //     type: "success", message: "Request Rejected."
      //   }
      // });
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
    if (modalAction?.action === "delete") {
      try {
        setModalOpen(false);
        setLoading(true);
        await api.delete(
          `/cancer-management/cancer-treatment/delete/${modalAction?.id}/`
        );
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Deleted Successfully.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to delete this object",
          message: "Something went wrong while deleting the record.",
        });
        setShowModal(true);
        console.error(error);
      } finally {
        fetchData();
        setLoading(false);
      }
    }
    setModalAction(null);
    setModalText("");
  };

  const handleDelete = (id, action) => {
    setModalText(`Confirm delete?`);
    setModalDesc("This record will be deleted permanently.");
    setModalAction({ id, action });
    setModalOpen(true);
  };

  // Status badge colors
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    "Interview Process": "bg-blue-100 text-blue-700",
    Approved: "bg-indigo-100 text-indigo-700",
    "Case Summary Generation": "bg-yellow-100 text-yellow-700",
    Completed: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        @media print {
          #cancermanagement-root { display: none !important; }
          #print-root { display: block !important; }
          @page { size: Letter; margin: 0 !important; }
          html, body { margin: 0 !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }

        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <CancerManagementPrint rows={filteredData} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="cancermanagement-root">
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
        {loading && <SystemLoader />}
        {/* <LoadingModal open={loading} text="Submitting changes..." /> */}

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-800">
              Cancer Management
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
                to="/admin/cancer-management/add"
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
                Service Treatment Application List
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
                  <option value="Interview Process">Interview Process</option>
                  <option value="Case Summary Generation">
                    Case Summary Gen...
                  </option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* <input
                  type="date"
                  className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                /> */}

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
                    setDateFilter("");
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
                    <div className="col-span-2 text-center">Service Requested</div>
                    <div className="col-span-2 text-center">Date Submitted</div>
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
                            className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
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
                            {item.service_type}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {new Date(item.date_submitted).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold max-w-[120px] truncate ${
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
                                  {/* View */}
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
                                  onClick={() => handleDelete(item.id, "delete")}
                                >
                                  {/* Delete */}
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                          ) : (
                            <button
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              onClick={() => handleDelete(item.id, "delete")}
                            >
                              {/* Cancel */}
                              <X className="w-3.5 h-3.5"/>
                            </button>
                            )}
                            {/* <button
                              // onClick={() => handleViewClick(item.id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                            >
                              {/* View *s/}
                              <CheckCircle className="w-3.5 h-3.5"/>
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              onClick={() => handleDelete(item.id, "delete")}
                            >
                              {/* Delete *s/}
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button> */}
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
                  <div className="flex items-center gap-2">
                    <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                      Record per page:
                    </label>
                    <select 
                      id="recordsPerPage" 
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>1 – {Math.min(10, filteredData.length)} of {filteredData.length}</span>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors">
                        ←
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors">
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCancerManagement;