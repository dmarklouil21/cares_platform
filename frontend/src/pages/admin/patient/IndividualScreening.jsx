import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const IndividualScreening = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {id, action}
  const navigate = useNavigate();

  const tableData = [
    {
      id: "001",
      name: "Juan Dela Cruz",
      submissionDate: "2025-04-12",
      lgu: "Municipality of Argao",
      status: "Pending",
      lastName: "dela Cruz",
      firstName: "Juan",
      middleName: "Reyes",
      dob: "1925-01-01",
      age: 100,
      civilStatus: "NCSB",
      sex: "Male",
      numChildren: 17,
      address: "Bogo, Argao, Cebu",
      mobile: "09122332332",
      municipality: "Argao",
      barangay: "Bogo",
      email: "email@sample.com",
    },
    {
      id: "002",
      name: "Maria Santos",
      submissionDate: "2025-04-10",
      lgu: "Municipality of Argao",
      status: "Verified",
      lastName: "Santos",
      firstName: "Maria",
      middleName: "Garcia",
      dob: "1980-05-15",
      age: 43,
      civilStatus: "Married",
      sex: "Female",
      numChildren: 3,
      address: "Poblacion, Argao, Cebu",
      mobile: "09123456789",
      municipality: "Argao",
      barangay: "Poblacion",
      email: "maria.santos@sample.com",
    },
  ];

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "All" || record.status === statusFilter;
    const searchMatch =
      !searchQuery ||
      record.id.includes(searchQuery) ||
      record.name.toLowerCase().includes(searchQuery.toLowerCase());
    const dateMatch = !dateFilter || record.submissionDate === dateFilter;

    return statusMatch && searchMatch && dateMatch;
  });

  const handleViewClick = (patientId) => {
    navigate(`/Admin/patient/view/AdminIndividualScreeningView`);
    // navigate(`/Admin/patient/view/AdminPatientDetails/${patientId}`);
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
  const handleActionClick = (id, action) => {
    if (action === "verify") {
      setModalText("Confirm verification?");
      setModalAction({ id, action });
      setModalOpen(true);
    } else if (action === "reject") {
      setModalText("Confirm Rejection?");
      setModalAction({ id, action });
      setModalOpen(true);
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
            Individual Screening
          </h2>

          <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Individual Screening Applicant List
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
                          {item.id}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.name}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {new Date(item.submissionDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.lgu}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-md bg-amber-50 text-amber-600">
                            {item.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(item.id)}
                            className="text-white py-1 px-3 rounded-md shadow bg-primary"
                          >
                            View
                          </button>
                          <button
                            className="text-white py-1 px-3 rounded-md shadow bg-green-500"
                            onClick={() => handleActionClick(item.id, "verify")}
                          >
                            Verify
                          </button>
                          <button
                            className="text-white py-1 px-3 rounded-md shadow bg-red-500"
                            onClick={() => handleActionClick(item.id, "reject")}
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

export default IndividualScreening;
