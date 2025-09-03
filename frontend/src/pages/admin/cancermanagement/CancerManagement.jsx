import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import Notification from "src/components/Notification";
import LoadingModal from "src/components/LoadingModal";
import { Info } from "lucide-react";

const AdminCancerManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- SAMPLE DATA (statuses normalized) ----------
  const sampleData = [
    {
      id: 1,
      patient: {
        patient_id: "PT-0001",
        full_name: "Ana L. Reyes",
        city: "Cebu City",
        email: "ana.reyes@example.com",
      },
      created_at: "2025-08-15",
      status: "Pending",
      has_patient_response: false,
      response_description: "",
      service_type: "Chemotherapy",
      procedure_name: "FEC",
      procedure_details: "Cycle 1 of 6",
      cancer_site: "Breast",
      screening_date: "",
    },
    {
      id: 2,
      patient: {
        patient_id: "PT-0002",
        full_name: "Bea S. Dizon",
        city: "Mandaue City",
        email: "bea.dizon@example.com",
      },
      created_at: "2025-08-18",
      status: "In Progress",
      has_patient_response: true,
      response_description: "Rescheduled due to fever.",
      service_type: "Radiotherapy",
      procedure_name: "IMRT",
      procedure_details: "Planning CT done",
      cancer_site: "Cervical",
      screening_date: "2025-08-25",
    },
    {
      id: 3,
      patient: {
        patient_id: "PT-0003",
        full_name: "Carlo M. Uy",
        city: "Talisay City",
        email: "carlo.uy@example.com",
      },
      created_at: "2025-08-20",
      status: "Complete",
      has_patient_response: false,
      response_description: "",
      service_type: "Surgery",
      procedure_name: "Lumpectomy",
      procedure_details: "Post-op follow-up",
      cancer_site: "Breast",
      screening_date: "2025-08-22",
    },
    {
      id: 4,
      patient: {
        patient_id: "PT-0004",
        full_name: "Dino K. Ong",
        city: "Lapu-Lapu City",
        email: "dino.ong@example.com",
      },
      created_at: "2025-08-28",
      status: "Approved", // was "LOA Generation"
      has_patient_response: false,
      response_description: "",
      service_type: "Chemotherapy",
      procedure_name: "Paclitaxel",
      procedure_details: "Awaiting LOA",
      cancer_site: "Lung",
      screening_date: "",
    },
    {
      id: 5,
      patient: {
        patient_id: "PT-0005",
        full_name: "Ella P. Gomez",
        city: "Minglanilla",
        email: "ella.gomez@example.com",
      },
      created_at: "2025-08-30",
      status: "Rejected", // was "Reject"
      has_patient_response: true,
      response_description: "Incomplete documents.",
      service_type: "Diagnostics",
      procedure_name: "MRI",
      procedure_details: "Chest MRI request",
      cancer_site: "Thoracic",
      screening_date: "",
    },
  ];

  useEffect(() => {
    sessionStorage.setItem("cm_sample_data", JSON.stringify(sampleData));
  }, []);

  // ---------- State & Notifications ----------
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableData, setTableData] = useState(sampleData);

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
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} });
      const t = setTimeout(() => setNotification(""), 2000);
      return () => clearTimeout(t);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

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
    const dateMatch = !dateFilter || record.created_at === dateFilter;
    return statusMatch && searchMatch && dateMatch;
  });

  // ---------- Handlers ----------
  const handleViewClick = (id) => {
    const selected = tableData.find((item) => item.id === id);
    navigate(`/Admin/CancerManagement/view/cancermanagementview/${id}`, {
      state: { record: selected },
    });
  };

  const handleModalConfirm = () => {
    if (modalAction?.action === "delete") {
      setLoading(true);
      setModalOpen(false);
      setTimeout(() => {
        setTableData((prev) => prev.filter((x) => x.id !== modalAction.id));
        setLoading(false);
        setModalInfo({
          type: "success",
          title: "Deleted",
          message: "Record deleted (sample only).",
        });
        setShowModal(true);
      }, 600);
    }
    setModalAction(null);
    setModalText("");
  };

  const handleActionClick = (id, action) => {
    if (action === "delete") {
      setModalText("Confirm delete?");
      setModalAction({ id, action });
      setModalOpen(true);
    }
  };

  // ---------- Status badge colors (normalized keys) ----------
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-blue-100 text-blue-700",
    "In Progress": "bg-orange-100 text-orange-700",
    Complete: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
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

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div>

        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Cancer Management
          </h2>

          <div className="flex flex-col bg-white rounded-[4px] w-full shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Cancer management list
            </p>

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
                <option value="Complete">Complete</option>
                <option value="Rejected">Rejected</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <button className="px-7 rounded-md text-sm bg-[#C5D7E5]">
                Filter
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
                    <th className="w-[15%] text-center text-sm py-3">
                      Service Type
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
                <table className="min-w-full divide-y divide-gray-200">
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
                          {new Date(item.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.service_type}
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
                            onClick={() => handleActionClick(item.id, "delete")}
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
