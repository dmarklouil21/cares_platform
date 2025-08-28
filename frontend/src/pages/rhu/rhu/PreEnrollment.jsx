import { useState, useEffect, useCallback, use } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

// Notification component for showing popup messages
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

const PatientMasterList = () => {
  const { user } = useAuth();
  const [tableData, setTableData] = useState([]);
  // const [statusFilter, setStatusFilter] = useState("pending");
  // const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  // const [recordsPerPage, setRecordsPerPage] = useState(10);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [notification, setNotification] = useState("");

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const fetchData = async () => { //?status=validated&registered_by=rhu&city=${user.city}
    try {
      const response = await api.get("/patient/list/", {
        params: {
          status: "validated",
          registered_by: "rhu",
          city: user.city,
        },
      }); 
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  /* useEffect(() => {
    setCurrentPage(1);
  }, [tableData]); */

  const filteredResults = patients.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();
    const fullName = `${patient.first_name || ""} ${patient.last_name || ""} ${
      patient.middle_name || ""
    }`
      .trim()
      .toLowerCase();
    const matchesSearch =
      !query ||
      patient.patient_id?.toString().toLowerCase().includes(query) ||
      fullName.includes(query) ||
      (patient.lgu || "").toLowerCase().includes(query);
    /* const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && patient.is_active) ||
      (statusFilter === "inactive" && !patient.is_active); */
    return matchesSearch /* && matchesStatus; */
  });

  const handleViewClick = (id) => {
    const patient = patients.find((p) => p.patient_id === id);
    if (patient) {
      navigate(`/Rhu/rhu/view/RhuPreEnrollmentView`, { ///Admin/patient/view/AdminPatientMasterListView
        state: { patient },
      });
    }
  };

  const handleEditClick = (id) => {
    const patient = patients.find((p) => p.patient_id === id);
    if (patient) {
      navigate(`/Rhu/rhu/edit/RhuPreEnrollmentEdit`, {
        state: { patient },
      });
    }
  };

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedData = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleModalConfirm = async () => {
    if (modalAction && modalAction.action === "delete" && modalAction.id) {
      try {
        setModalOpen(false);
        setLoading(true);
        const response = await api.delete(`/patient/delete/${modalAction.id}/`);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Deleted Successfully.",
        });
        setShowModal(true);
      } catch (error) {
        // setNotification("Failed to delete patient");
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
      // setTimeout(() => setNotification(""), 3500);
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleActionClick = (id, action) => {
    if (action === "delete") {
      setModalText("Are you sure you want to delete this patient?");
      setModalAction({ id, action });
      setModalOpen(true);
    }
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
      <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
        <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
          <h1 className="text-md font-bold h-full flex items-center ">Admin</h1>
          <Link
            to="/Rhu/rhu/add/RhuPreEnrollmentAdd"
            className="bg-yellow gap-3 flex justify-center items-center px-5 py-1 rounded-sm"
          >
            <img
              src="/images/add.svg"
              alt="Add User Icon"
              className="h-[18px]"
            />
            <p className="text-white text-sm">Add Patient</p>
          </Link>
        </div>
        <div className=" w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Patient List
          </h2>
          <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Manage all RHU patients
            </p>
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by patient ID, name, or LGU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
              />

              <select
                className="border border-gray-200 rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
              />
              <button className="px-7 rounded-md text-sm text-white bg-lightblue">
                Filter
              </button>
            </div>
            <div className="bg-white shadow overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[13%] text-center text-sm py-3 !bg-lightblue">
                      Patient ID
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">First Name</th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Last Name
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Middle Name
                    </th>
                    {/* <th className="w-[12%] text-center text-sm py-3">
                      Birthdate
                    </th> */}
                    <th className="w-[13%] text-center text-sm py-3">LGU</th>
                    <th className="w-[21%] text-center text-sm py-3 ">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[200px] min-h-[200px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
                  <colgroup>
                    <col className="w-[13%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    {/* <col className="w-[13%]" /> */}
                    <col className="w-[21%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((patient) => (
                      <tr key={patient.patient_id}>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {patient.patient_id}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {patient.first_name}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {patient.last_name}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {patient.middle_name}
                        </td>
                        {/* <td className="text-center text-sm py-4 text-gray-800">
                          {patient.date_of_birth}
                        </td> */}
                        <td className="text-center text-sm py-4 text-gray-800">
                          {patient.city}
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(patient.patient_id)}
                            className="text-white py-1 px-2 rounded-md shadow bg-primary"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(patient.patient_id)}
                            className="text-white py-1 px-2 rounded-md shadow bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleActionClick(patient.patient_id, "delete")
                            }
                            className="text-white py-1 px-2 rounded-md shadow bg-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td
                          colSpan="8"
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
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-700">
                  {Math.min(
                    (currentPage - 1) * recordsPerPage + 1,
                    totalRecords
                  )}{" "}
                  – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                  {totalRecords}
                </span>
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="text-gray-600"
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="text-gray-600"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientMasterList;
