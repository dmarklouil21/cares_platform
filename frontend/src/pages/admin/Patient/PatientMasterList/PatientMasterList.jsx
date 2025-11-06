import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Printer,
  Info,
  CheckCircle,
  X,
  Trash2,
  Pencil,
  Edit,
} from "lucide-react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";

import GenerateMasterPrintTemplate from "./generate/generate";

const PatientMasterList = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("active");
  const navigate = useNavigate();

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

  // Date Filters
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // ✅ Helper: Get week number of a given date (Week 1–5, resets per month)
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDay.getDay(); // 0 = Sunday
    const offset = firstWeekday === 0 ? 6 : firstWeekday - 1; // start week on Monday
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + offset) / 7);
  };

  // ✅ Update available weeks whenever month or year changes
  useEffect(() => {
    if (monthFilter && yearFilter && patients.length > 0) {
      const weeksWithData = new Set();

      patients.forEach((record) => {
        const recordDate = new Date(record.created_at);
        if (isNaN(recordDate)) return;

        const recordMonth = recordDate.getMonth() + 1;
        const recordYear = recordDate.getFullYear();

        if (
          recordMonth === Number(monthFilter) &&
          recordYear === Number(yearFilter)
        ) {
          const weekNum = getWeekOfMonth(recordDate);
          weeksWithData.add(weekNum);
        }
      });

      // ✅ Sort & limit weeks 1–5
      const sortedWeeks = Array.from(weeksWithData)
        .filter((w) => w >= 1 && w <= 5)
        .sort((a, b) => a - b);

      setAvailableWeeks(sortedWeeks);
    } else {
      setAvailableWeeks([]);
      setWeekFilter("");
    }
  }, [monthFilter, yearFilter, patients]);

  // ✅ Combine week logic into date filter
  const filterByCreatedAtWithWeek = (data) => {
    return data.filter((record) => {
      if (!record.created_at) return false;

      const recordDate = new Date(record.created_at);
      if (isNaN(recordDate)) return false;

      const recordDay = recordDate.getDate();
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      const recordWeek = getWeekOfMonth(recordDate);

      const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
      const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
      const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);
      const weekMatch = !weekFilter || recordWeek === parseInt(weekFilter);

      return dayMatch && monthMatch && yearMatch && weekMatch;
    });
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/");
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
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
    if (!dayFilter && !monthFilter && !yearFilter) return data;

    return data.filter((record) => {
      if (!record.created_at) return false;

      const recordDate = new Date(record.created_at);
      if (isNaN(recordDate)) return false;

      const recordDay = recordDate.getDate();
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();

      const dayMatch = !dayFilter || recordDay === parseInt(dayFilter);
      const monthMatch = !monthFilter || recordMonth === parseInt(monthFilter);
      const yearMatch = !yearFilter || recordYear === parseInt(yearFilter);

      return dayMatch && monthMatch && yearMatch;
    });
  };

  const handleViewClick = (patient_id) =>
    navigate(`/admin/patient/view/${patient_id}`);
  const handleEditClick = (id) => {
    const patient = patients.find((p) => p.patient_id === id);
    if (patient) navigate(`/admin/patient/edit/${id}`);
  };

  const filteredAndDateMatched = filterByCreatedAtWithWeek(filteredResults);

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
  const handlePrintReport = () => {
    // 1. Save original title
    const originalTitle = document.title;

    // 2. Create new title
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    // You can change this title to whatever you like
    const newTitle = `Patient_Master_List_Report - ${formattedDate}`;

    // 3. Set new title
    document.title = newTitle;

    // 4. Call print
    window.print();

    // 5. Restore title
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000); // 1-second delay
  };
  return (
    <>
      <style>{`
        @media print {
          #masterlist-root { display: none !important; }
          #print-root { display: block !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }
        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <GenerateMasterPrintTemplate rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
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
      {loading && <SystemLoader />}
      <Notification message={notification} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Patient Master List
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              to="/admin/patient/add/general-data"
              className="bg-yellow hover:bg-yellow/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
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
              Manage All Patients
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
              </select>

              {/* Date Filters */}
              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {Array.from(
                  new Set(
                    patients
                      .map((p) =>
                        p.created_at
                          ? new Date(p.created_at).getFullYear()
                          : null
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

              <select
                className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                disabled={!monthFilter}
              >
                <option value="">All Weeks</option>
                {availableWeeks.map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("active");
                  setDayFilter("");
                  setMonthFilter("");
                  setYearFilter("");
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                Clear Filters
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
                    No records found matching your filters.
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
                          {patient.middle_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {patient.city}
                        </div>
                        <div className="col-span-2 flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(patient.patient_id)}
                            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleActionClick(patient.patient_id, "delete")
                            }
                            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
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
              <div className="text-sm text-gray-600">
                Showing {paginatedData.length} of {totalRecords} records
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="recordsPerPage"
                    className="text-sm text-gray-700"
                  >
                    Records per page:
                  </label>
                  <select
                    id="recordsPerPage"
                    className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={recordsPerPage}
                    onChange={handleRecordsPerPageChange}
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {Math.min(
                      (currentPage - 1) * recordsPerPage + 1,
                      totalRecords
                    )}{" "}
                    – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                    {totalRecords}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                    >
                      →
                    </button>
                  </div>
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
