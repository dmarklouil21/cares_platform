import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

// Simple Modal component
function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification component
function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

const ScreeningRequest = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {id, action}
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await api.get("/cancer-screening/individual-screening-list/?status=Pending");
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(tableData);

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

  const handleViewClick = (patientId) => {
    const selected = tableData.find((item) => item.patient.patient_id === patientId);
    navigate(`/Admin/cancerscreening/view/AdminIndividualScreeningView`, {
      state: { 
        pre_screening_form: selected.pre_screening_form, 
        screening_procedure: selected.screening_procedure
      },
    });
  };

  // Modal confirm handler
  const handleModalConfirm = () => {
    if (modalAction) {
      setTimeout(() => {
        let actionWord =
          modalAction.action === "verify"
            ? "Verified"
            : modalAction.action === "reject"
            ? "Rejected"
            : "";
        setNotification(`${actionWord} Successfully`);
        setTimeout(() => setNotification(""), 3500);
      }, 300);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Modal cancel handler (just close modal, no action)
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Show modal for verify/reject
  const handleActionClick = async (id, action) => {
    try {
      if (action === "approve") {
        // setModalText("Confirm verification?");
        // setModalAction({ id, action });
        // setModalOpen(true); ejacc/individual-screening/approve/<str:patient_id>/
        const response = await api.patch(`/ejacc/individual-screening/approve/${id}/`, {
          status: "Next Steps Needed",
        });
        if (response.status === 200) {
          setNotification("Screening Verified Successfully");
          setTimeout(() => setNotification(""), 3500);
          fetchData(); // Refresh data after verification
        }
      } else if (action === "reject") {
        setModalText("Confirm Rejection?");
        setModalAction({ id, action });
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
        <div className="bg-white h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
        </div>
        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Screening Request
          </h2>

          <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">Screening Request List</p>

            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by Request No ..."
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
                <option value="Verified">Verified</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <button className="px-7 rounded-md text-sm text-white bg-lightblue">
                Filter
              </button>
            </div>

            <div className=" bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[10%] text-center text-sm py-3 !bg-lightblue">
                      Patient ID
                    </th>
                    <th className="w-[15%] text-sm py-3">Name</th>
                    <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                      Type
                    </th>
                    <th className="w-[13%] text-center text-sm py-3">
                      Date Submitted
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">LGU</th>
                    {/* <th className="w-[13.4%] text-center text-sm py-3">
                      Status
                    </th> */}
                    <th className="w-[17%] text-center text-sm py-3">
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
                    <col className="w-[10%]" />
                    <col className="w-[15%] " />
                    <col className="w-[15%]" />
                    <col className="w-[13%]" />
                    <col className="w-[15%]" />
                    <col className="w-[13.4%]" />
                    <col className="w-[17%]" />
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
                          Individual Screening
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
                          {item.patient.beneficiary.city}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-md bg-amber-50 text-amber-600">
                            {item.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(item.patient.patient_id)}
                            className="text-white py-1 px-3 rounded-md shadow bg-primary"
                          >
                            View
                          </button>
                          <button
                            className="text-white py-1 px-3 rounded-md shadow bg-green-500"
                            onClick={() => handleActionClick(item.patient.patient_id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="text-white py-1 px-3 rounded-md shadow bg-red-500"
                            onClick={() => handleActionClick(item.patient.patient_id, "reject")}
                          >
                            Reject
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

export default ScreeningRequest;
