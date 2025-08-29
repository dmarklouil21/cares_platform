import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";
import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import { Info } from "lucide-react"; 

const IndividualScreening = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

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
  const [modalAction, setModalAction] = useState(null); 

  const fetchData = async () => {
    try {
      const response = await api.get("/cancer-screening/individual-screening-list/");
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
      record.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const dateMatch = !dateFilter || record.created_at === dateFilter;

    return statusMatch && searchMatch && dateMatch;
  });

  const handleViewClick = (id) => {
    const selected = tableData.find((item) => item.id === id);
    navigate(`/Admin/cancerscreening/view/AdminIndividualScreeningView`, {
      state: { record: selected },
    });
  };


  // Modal confirm handler
  const handleModalConfirm = async () => {
    if (modalAction?.action === "delete" || modalAction?.action === "reject") {
      try {
        setModalOpen(false);
        setLoading(true);
        const response = await api.delete(`/cancer-screening/individual-screening/delete/${modalAction.id}/`);
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
      <LoadingModal open={loading} text="Submitting changes..." />
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
        </div>
        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Individual Screening
          </h2>

          <div className="flex flex-col bg-white rounded-[4px] w-full shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Individual Screening
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
                <option value="LOA Generation">LOA Generation</option>
                <option value="In Progress">In Progress</option> 
                <option value="Complete">Complete</option>
                <option value="Reject">Reject</option>
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
                    <th className="w-[15%] text-center text-sm py-3">LGU</th>
                    <th className="w-[13.4%] text-center text-sm py-3">
                      Status
                    </th>
                    <th className="w-[22%] text-center text-sm py-3">
                      Actions
                    </th>
                    {filteredData.length >= 4 && (
                      <th className="!bg-lightblue w-[1.6%] p-0 m-0"></th>
                    )}
                  </tr>
                </thead>
              </table>
              <div className="max-h-[200px] min-h-[200px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                          {item.patient.city}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-md ${
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

            {/* Footer Pagination */}
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

export default IndividualScreening;
