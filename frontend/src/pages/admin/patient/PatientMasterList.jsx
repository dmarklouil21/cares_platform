// Modal component for confirmation
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

import { useState, useEffect, useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

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
  // Sample patient data with historical updates
  const [tableData, setTableData] = useState([]);
  // const [statusFilter, setStatusFilter] = useState("pending");
  // const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  // const [recordsPerPage, setRecordsPerPage] = useState(10);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [notification, setNotification] = useState("");

  const samplePatients = [
    {
      id: 1,
      patient_id: "PT-001",
      name: "Juan",
      last_name: "Dela Cruz",
      middle_name: "Reyes",
      suffix: "Jr.",
      birthdate: "1990-05-15",
      sex: "Male",
      barangay: "Ermita",
      lgu: "Manila",
      date_diagnosed: "2022-01-10",
      diagnosis: "Lung Cancer",
      cancer_stage: "III",
      cancer_site: "Left Lung",
      historical_updates: [
        { date: "2022-01-10", note: "Initial diagnosis confirmed" },
        { date: "2022-02-15", note: "Started chemotherapy" },
        { date: "2022-04-20", note: "First follow-up checkup" },
      ],
    },
    {
      id: 2,
      patient_id: "PT-002",
      name: "Maria",
      last_name: "Santos",
      middle_name: "Lopez",
      suffix: "",
      birthdate: "1985-08-22",
      sex: "Female",
      barangay: "Kamuning",
      lgu: "Quezon City",
      date_diagnosed: "2021-11-05",
      diagnosis: "Breast Cancer",
      cancer_stage: "II",
      cancer_site: "Right Breast",
      historical_updates: [
        { date: "2021-11-05", note: "Initial mammogram results" },
        { date: "2021-11-20", note: "Biopsy confirmed malignancy" },
      ],
    },
    {
      id: 3,
      patient_id: "PT-003",
      name: "Pedro",
      last_name: "Gonzales",
      middle_name: "Martinez",
      suffix: "Sr.",
      birthdate: "1978-11-30",
      sex: "Male",
      barangay: "San Antonio",
      lgu: "Makati",
      date_diagnosed: "2023-02-18",
      diagnosis: "Colon Cancer",
      cancer_stage: "IV",
      cancer_site: "Colon",
      historical_updates: [
        { date: "2023-02-18", note: "Colonoscopy results" },
        { date: "2023-03-05", note: "Started targeted therapy" },
      ],
    },
    {
      id: 4,
      patient_id: "PT-004",
      name: "Ana",
      last_name: "Ramos",
      middle_name: "Diaz",
      suffix: "",
      birthdate: "1995-03-10",
      sex: "Female",
      barangay: "San Miguel",
      lgu: "Pasig",
      date_diagnosed: "2022-09-12",
      diagnosis: "Leukemia",
      cancer_stage: "I",
      cancer_site: "Blood",
      historical_updates: [
        { date: "2022-09-12", note: "Blood test results" },
        { date: "2022-10-01", note: "Bone marrow biopsy" },
        { date: "2022-10-15", note: "Started treatment plan" },
      ],
    },
  ];

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/");
      setPatients(response.data);
      console.log(response.data);
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
      navigate(`/Admin/patient/view/AdminPatientMasterListView`, {
        state: { patient },
      });
    }
  };

  const handleEditClick = (id) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      navigate(`/Admin/patient/edit/AdminPatientMasterListEdit`, {
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
        setPatients(
          patients.filter((patient) => patient.id !== modalAction.id)
        );
        setNotification("Patient deleted successfully");
      } catch (error) {
        setNotification("Failed to delete patient");
      }
      setTimeout(() => setNotification(""), 3500);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleModalCancel = () => {
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
        onCancel={handleModalCancel}
      />
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
        <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
          <h1 className="text-md font-bold h-full flex items-center ">Admin</h1>
          <Link
            to="/Admin/patient/add/AdminPatientMasterListAdd"
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
            Patient Master List
          </h2>
          <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Manage all patients
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
