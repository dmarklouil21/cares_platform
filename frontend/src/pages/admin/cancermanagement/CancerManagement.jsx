// src/pages/cancer-management/AdminCancerManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Printer, FileText, FileDown } from "lucide-react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import LoadingModal from "src/components/Modal/LoadingModal";
import { Info } from "lucide-react";

// ⬇️ PRINT TEMPLATE
import CancerManagementPrint from "./generate/generate";

const AdminCancerManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- State & Notifications ----------
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

  // ---------- Filters ----------
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
    const dateMatch = !dateFilter || record.date_submitted === dateFilter;
    return statusMatch && searchMatch && dateMatch;
  });

  // ---------- Handlers ----------
  const handleViewClick = (id) => {
    const selected = tableData.find((item) => item.id === id);
    navigate(`/admin/cancer-management/view/${id}`, {
      state: { record: selected },
    });
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

  // ---------- Status badge colors (normalized keys) ----------
  const statusColors = {
    Pending: "text-yellow-700",
    "Interview Process": "text-blue-700",
    Approved: "text-indigo-700",
    "Case Summary Generation": "text-yellow-700",
    Completed: "text-green-700",
    Rejected: "text-red-700",
    Default: "text-gray-700",
  };

  return (
    <>
      {/* --- Print rules: show only print template during print --- */}
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

        /* Screen table tweak to avoid double borders in the scrollable body */
        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* --- PRINT-ONLY CONTENT (all filtered rows, not paginated) --- */}
      <div id="print-root">
        <CancerManagementPrint rows={filteredData} />
      </div>

      {/* --- SCREEN CONTENT --- */}
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
        <LoadingModal open={loading} text="Submitting changes..." />

        <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-left w-full pl-1">
              Cancer Management
            </h2>
            <Link
              to="/admin/cancer-management/add"
              className="bg-yellow px-5 py-1 rounded-sm text-white"
            >
              Add
            </Link>
          </div>

          <div className="flex flex-col bg-white rounded-md w-full shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Service Treatment Application List
            </p>

            {/* Filters + Generate */}
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by patient ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
              />

              {/* UPDATED FILTER OPTIONS */}
              <select
                className="border border-gray-200 rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {/* ⬇️ Generate button with cursor-pointer */}
              <button
                onClick={() => window.print()}
                className="px-3 font-bold rounded-md text-sm text-white bg-primary cursor-pointer"
                title="Print current list"
              >
                {/* Generate */}
                <Printer className="w-4 h-4" />
              </button>
              {/* <div className="flex gap-2">
                <button className="px-7 rounded-md text-sm bg-[#C5D7E5]">
                  Filter
                </button>
              </div> */}
            </div>

            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[13%] text-center text-sm py-3 !bg-lightblue">
                      Patient ID
                    </th>
                    <th className="w-[20%] text-sm py-3">Name</th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Service Requested
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Date Submitted
                    </th>
                    <th className="w-[13.4%] text-center text-sm py-3">
                      Status
                    </th>
                    <th className="w-[22%] text-center text-sm py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>

              <div className="max-h-[200px] min-h-[200px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 master-table">
                  <colgroup>
                    <col className="w-[13%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[13.4%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.id}>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.patient.patient_id}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.patient.full_name}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.service_type}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {new Date(item.date_submitted).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          <span
                            className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-md ${
                              statusColors[item.status] || statusColors.Default
                            }`}
                          >
                            {item.status}
                            <span
                              title={
                                item.has_patient_response
                                  ? item.response_description
                                  : "Info icon."
                              }
                              className="cursor-pointer"
                            >
                              <Info
                                size={14}
                                className={
                                  item.has_patient_response
                                    ? "text-blue-500"
                                    : "text-gray-300"
                                }
                              />
                            </span>
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(item.id)}
                            className="text-white py-1 px-3 rounded-[5px] shadow bg-primary cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500 cursor-pointer"
                            onClick={() => handleDelete(item.id, "delete")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredData.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Pagination (static demo) */}
            <div className="flex justify-end items-center py-2 gap-5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="recordsPerPage"
                  className="text-sm text-gray-700"
                >
                  Record per page:
                </label>
                <select
                  id="recordsPerPage"
                  className="w-16 rounded-md shadow-sm"
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-700">
                  1 – 10 of {filteredData.length}
                </span>
                <button className="text-gray-600">←</button>
                <button className="text-gray-600">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCancerManagement;
