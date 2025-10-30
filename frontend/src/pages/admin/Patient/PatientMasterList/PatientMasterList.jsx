import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Printer, FileText, FileDown } from "lucide-react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

// ⬇️ NEW: print template
import GenerateMasterPrintTemplate from "./generate/generate";

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
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("active");
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
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Date Filters for created_at
  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/");
      setPatients(response.data);
      console.log("Responses: ", response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

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
      (patient.city || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && (patient.status || "active") === "active");

    return matchesSearch && matchesStatus;
  });

  const filterByCreatedAt = (data) => {
    if (!dateFilter && !dayFilter && !monthFilter && !yearFilter) return data;

    return data.filter((record) => {
      if (!record.created_at) return false;

      const recordDate = new Date(record.created_at);
      if (isNaN(recordDate)) return false;

      const recordDay = recordDate.getDate();
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      const recordDateString = recordDate.toISOString().split("T")[0];

      const dateMatch = !dateFilter || recordDateString === dateFilter;
      const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
      const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
      const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);

      return dateMatch && dayMatch && monthMatch && yearMatch;
    });
  };

  const handleViewClick = (patient_id) =>
    navigate(`/admin/patient/view/${patient_id}`);
  const handleEditClick = (id) => {
    const patient = patients.find((p) => p.patient_id === id);
    if (patient) navigate(`/admin/patient/edit/${id}`);
  };

  const filteredAndDateMatched = filterByCreatedAt(filteredResults);

  const totalRecords = filteredAndDateMatched.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedData = filteredAndDateMatched.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleModalConfirm = async () => {
    if (modalAction && modalAction.action === "delete" && modalAction.id) {
      try {
        setModalOpen(false);
        setLoading(true);
        await api.delete(`/patient/delete/${modalAction.id}/`);
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

  const handleActionClick = (id, action) => {
    if (action === "delete") {
      setModalText("Are you sure you want to delete this patient?");
      setModalDesc("This action cannot be undone.");
      setModalAction({ id, action });
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* --- Print rules: only show GenerateMasterPrintTemplate during print --- */}
      <style>{`
        @media print {
          #masterlist-root { display: none !important; }
          #print-root { display: block !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }
        /* optional: remove borders like the pre-enroll list */
        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* --- PRINT-ONLY CONTENT --- */}
      <div id="print-root">
        {/* pass ALL filtered rows (not paginated) */}
        <GenerateMasterPrintTemplate rows={filteredResults} />
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
      <LoadingModal open={loading} text="Submitting changes..." />

      <div
        id="masterlist-root"
        className="h-screen w-full flex flex-col justify-start gap-3 p-5 items-center bg-gray"
      >
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-left w-full pl-1">
            Patient Master List
          </h2>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/patient/add/general-data"
              className="bg-yellow px-5 py-1 rounded-sm text-white"
            >
              Add
            </Link>
          </div>
        </div>

        <div className="flex flex-col bg-white w-full rounded-md shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">
            Manage All Patients
          </p>

          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by patient ID, name, or LGU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 py-2 w-[360px] px-5 rounded-md"
            />

            {/* Day Filter (1–31) */}
            <select
              className="border border-gray-200 py-2 px-3 rounded-md"
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

            {/* Month Filter */}
            <select
              className="border border-gray-200 py-2 px-3 rounded-md"
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

            {/* Year Filter */}
            <select
              className="border border-gray-200 py-2 px-3 rounded-md"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              {Array.from(
                new Set(
                  patients
                    .map((p) =>
                      p.created_at ? new Date(p.created_at).getFullYear() : null
                    )
                    .filter((y) => y !== null)
                )
              )
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>

            {/* Reset filters button */}
            <button
              onClick={() => {
                setDateFilter("");
                setDayFilter("");
                setMonthFilter("");
                setYearFilter("");
              }}
              className="ml-2 px-3 py-2 hover:bg-lightblue bg-primary text-white cursor-pointer rounded-md text-sm"
            >
              Clear
            </button>

            {/* ⬇️ NEW: Generate button mirrors the Pre-Enrollment page */}
            <button
              onClick={() => window.print()}
              className="bg-primary px-3 py-1 rounded-sm text-white cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {/* Generate */}
            </button>
          </div>

          <div className="bg-white shadow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[13%] text-center text-sm py-3 !bg-lightblue">
                    Patient ID
                  </th>
                  <th className="w-[15%] text-center text-sm py-3">
                    First Name
                  </th>
                  <th className="w-[15%] text-center text-sm py-3">
                    Last Name
                  </th>
                  <th className="w-[15%] text-center text-sm py-3">
                    Middle Name
                  </th>
                  <th className="w-[13%] text-center text-sm py-3">LGU</th>

                  <th className="w-[21%] text-center text-sm py-3 ">Actions</th>
                </tr>
              </thead>
            </table>

            <div className="max-h-[200px] min-h-[200px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 border-spacing-0 master-table">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[13%]" />
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
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
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
                {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
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
    </>
  );
};

export default PatientMasterList;
