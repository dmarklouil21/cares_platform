import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import { Printer, Plus, Eye, Edit, Trash2, Pencil } from "lucide-react";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";

const PatientMasterList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loggedRepresentative, setLoggedRepresentative] = useState(null);

  // Data state
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modals
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

  const fetchProfile = async () => {
    const { data } = await api.get("/partners/private/profile/");
    setLoggedRepresentative(data);
    console.log("Profile: ", data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/", {
        params: {
          registered_by: loggedRepresentative?.institution_name,
        },
      });
      console.log("Patients: ", response.data);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setNotification("Failed to load patient data.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedRepresentative]);

  // Filter data
  const filteredResults = patients.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();
    const fullName = `${patient.first_name || ""} ${patient.last_name || ""} ${
      patient.middle_name || ""
    }`
      .trim()
      .toLowerCase();

    const recordDate = new Date(patient.created_at || patient.date_submitted);
    const recordDay = recordDate.getDate();
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    const matchesSearch =
      !query ||
      patient.patient_id?.toString().toLowerCase().includes(query) ||
      fullName.includes(query) ||
      (patient.lgu || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && patient.is_active) ||
      (statusFilter === "inactive" && !patient.is_active);

    const matchesDay = !dayFilter || recordDay === Number(dayFilter);
    const matchesMonth = !monthFilter || recordMonth === Number(monthFilter);
    const matchesYear = !yearFilter || recordYear === Number(yearFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDay &&
      matchesMonth &&
      matchesYear
    );
  });

  const handleViewClick = (id) => {
    navigate(`/private/patients/view/${id}`);
  };

  const handleEditClick = (id) => {
    const patient = patients.find((p) => p.patient_id === id);
    if (patient) {
      navigate(`/private/patients/edit/${id}`);
    }
  };

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, searchQuery, statusFilter, totalRecords]);

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
    if (modalAction?.type === "delete") {
      try {
        setModalOpen(false);
        setLoading(true);
        await api.delete(`/patient/delete/${modalAction.id}/`);
        
        setNotification("Patient deleted successfully.");
        setNotificationType("success");
        setTimeout(() => setNotification(""), 2000);
        await fetchData();
      } catch (error) {
        setNotification("Failed to delete patient.");
        setNotificationType("error");
        setTimeout(() => setNotification(""), 2000);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    setModalOpen(false);
    setModalAction(null);
  };

  const handleDeleteClick = (id) => {
    setModalText("Confirm Delete");
    setModalDesc("Are you sure you want to delete this patient? This action cannot be undone.");
    setModalAction({ type: "delete", id });
    setModalOpen(true);
  };

  return (
    <>
      {loading && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">Patient List</h2>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white cursor-pointer rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              to="/private/patients/add"
              className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
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
              Manage all Private patients
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by patient ID, name, or LGU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-sm"
              />

              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Day Filter */}
              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {Array.from(
                  new Set(
                    patients.map((p) =>
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
                  setStatusFilter("all");
                  setDayFilter("");
                  setMonthFilter("");
                  setYearFilter("");
                }}
                title="Clear Filters"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                {/* Clear Filters */}
                <Trash2 className="w-4 h-4" />
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
                  <div className="col-span-2 text-center">First Name</div>
                  <div className="col-span-2 text-center">Last Name</div>
                  <div className="col-span-2 text-center">Middle Name</div>
                  <div className="col-span-2 text-center">LGU</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto">
                {paginatedData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No patients found matching your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {paginatedData.map((patient) => (
                      <div
                        key={patient.patient_id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                      >
                        <div 
                          className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                          onClick={() => handleViewClick(patient.patient_id)}
                        >
                          {patient.patient_id}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {patient.first_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {patient.last_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {patient.middle_name || "--"}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {patient.city}
                        </div>
                        <div className="col-span-2 flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(patient.patient_id)}
                            className="bg-yellow cursor-pointer hover:bg-yellow/90 text-white py-1.5 px-2 rounded transition-colors"
                            title="Edit Patient"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(patient.patient_id)}
                            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="flex items-center gap-2">
                <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                  Records per page:
                </label>
                <select
                  id="recordsPerPage"
                  className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)} -{" "}
                  {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientMasterList;