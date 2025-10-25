import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, data } from "react-router-dom";
import { Printer, FileText, FileDown } from "lucide-react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";

import Notification from "src/components/Notification";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";
import { Info } from "lucide-react";

// ⬇️ NEW (print component)
import GeneratePrintTemplate from "./generate/generate";

const IndividualScreening = () => {
  const location = useLocation();
  // Filters and Table Data
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
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

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal
  const [loading, setLoading] = useState(false);
  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Remark Message Modal
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

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
      record.patient.patient_id.includes(searchQuery) ||
      record.patient.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const dateMatch = !dateFilter || record.created_at === dateFilter;
    return statusMatch && searchMatch && dateMatch;
  });

  const handleViewClick = (id) => {
    const selected = tableData.find((item) => item.id === id);
    navigate(`/admin/cancer-screening/view/details`, {
      state: { record: selected },
    });
  };

  const handleReject = async () => {
    setLoading(true);
    setRemarksModalOpen(false);
    try {
      const response = await api.delete(
        `/cancer-screening/individual-screening/delete/${modalAction.id}/`,
        { 
          data: {
            status: "Reject", 
            remarks 
          }
        }
      );
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

  // Modal confirm handler
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

  // Show modal for verify/reject
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
    "LOA Generation": "bg-blue-100 text-blue-700",
    "In Progress": "bg-orange-100 text-orange-700",
    Complete: "bg-green-100 text-green-700",
    Reject: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      {loading && <SystemLoader />}
      {/* --- Print rules: only show GeneratePrintTemplate during print --- */}
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

      {/* --- PRINT-ONLY CONTENT --- */}
      <div id="print-root">
        {/* print ALL filtered rows (not paginated) */}
        <GeneratePrintTemplate rows={filteredData} />
      </div>

      {/* --- SCREEN CONTENT --- */}
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
      {/* <LoadingModal open={loading} text="Submitting changes..." /> */}

      {/* Reject remarks Modal */}
      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Remarks</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4 resize-none"
              rows={4}
              placeholder="Enter your remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setRemarksModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                onClick={handleReject}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}


      <div
        id="individual-root"
        className="h-screen w-full flex p-5 gap-3 flex-col justify-start items-center bg-gray"
      >
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-left w-full pl-1">
            Individual Screening
          </h2>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/cancer-screening/add/individual"
              className="bg-yellow px-5 py-1 rounded-sm text-white"
            >
              Add
            </Link>
          </div>
        </div>

        <div className="flex flex-col bg-white rounded-md w-full shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">
            Manage Individual Screening Records
          </p>

          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by patient ID ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
            />

            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              {/* <option value="LOA Generation">LOA Generation</option> */}
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              {/* <option value="Reject">Reject</option> */}
            </select>

            <input
              type="date"
              className="border border-gray-200 py-2 px-5 rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {/* ⬇️ NEW: Generate button */}
            <button
              onClick={() => window.print()}
              className="bg-primary px-3 py-1 rounded-sm text-white cursor-pointer"
            >
              {/* Generate */}
              <Printer className="w-4 h-4" />
            </button>
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
                    Submission Date
                  </th>
                  <th className="w-[15%] text-center text-sm py-3">LGU</th>
                  <th className="w-[13.4%] text-center text-sm py-3">Status</th>
                  <th className="w-[22%] text-center text-sm py-3">Actions</th>
                  {filteredData.length >= 4 && (
                    <th className="!bg-lightblue w-[1.6%] p-0 m-0"></th>
                  )}
                </tr>
              </thead>
            </table>
            <div className="max-h-[200px] min-h-[200px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 indiv-table">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[20%] " />
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
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="text-center text-sm py-4 text-gray-800">
                        {item.patient.city}
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
                        {item.status === "Pending" ? (
                            <button
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500 cursor-pointer"
                              onClick={() => {
                                setModalAction({ status: item.status, id: item.id })
                                setRemarksModalOpen(true)
                              }}
                            >
                              Reject
                            </button>
                          ) : (
                            <button
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500 cursor-pointer"
                              onClick={() => handleActionClick(item.id, "delete")}
                            >
                              Delete
                            </button>
                          )
                        }
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

          {/* Footer Pagination (static numbers for now since you don't paginate here) */}
          <div className="flex justify-end items-center py-2 gap-5">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                Record per page:
              </label>
              <select id="recordsPerPage" className="w-16 rounded-md shadow-sm">
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
    </>
  );
};

export default IndividualScreening;
