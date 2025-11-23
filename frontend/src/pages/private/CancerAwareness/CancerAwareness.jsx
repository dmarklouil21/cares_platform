// src/pages/cancer-awareness/CancerAwarenessList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Calendar, Search, Users, Pencil } from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import api from "src/api/axiosInstance";

const CancerAwarenessList = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const [loggedRepresentative, setLoggedRepresentative] = useState(null);

  // Data state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const fetchProfile = async () => {
    const { data } = await api.get("/partners/private/profile/");
    setLoggedRepresentative(data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/partners/cancer-awareness/list-activity/", {
        params: {
          uploader: loggedRepresentative?.institution_name,
        },
      });
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching cancer awareness activities:", error);
      setNotification("Failed to load activities.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedRepresentative]);

  const handleDelete = (id, title) => {
    setModalText("Confirm Delete");
    setModalDesc(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
    setModalAction({ type: "delete", id });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "delete") {
      try {
        setLoading(true);
        await api.delete(`/partners/cancer-awareness/delete-activity/${modalAction.id}/`);
        setNotification("Activity deleted successfully!");
        setNotificationType("success");
        await fetchData();
      } catch (error) {
        setNotification("Failed to delete activity.");
        setNotificationType("error");
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(""), 2000);
      }
    }
    setModalOpen(false);
    setModalAction(null);
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const [monthName, , yearStr] = activity.date.split(" ");
    const monthIndex = months.indexOf(monthName) + 1;
    const yearNum = parseInt(yearStr);

    const monthMatches = selectedMonth === "" || monthIndex === parseInt(selectedMonth);
    const yearMatches = selectedYear === "" || yearNum === parseInt(selectedYear);
    const searchMatches =
      searchTerm === "" ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());

    return monthMatches && yearMatches && searchMatches;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Cancer Awareness Activities
          </h2>
          <Link
            to="/private/cancer-awareness/add"
            className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {/* <Plus className="w-4 h-4" /> */}
            Add Activity
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              View, add, or manage awareness activities for patients and communities.
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 py-2 pl-10 pr-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full text-sm"
                />
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                title="Clear Filters"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                {/* Clear Filters */}
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activities Section */}
          <div className="px-6 py-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-500 text-sm">
                  {activities.length === 0 
                    ? "Get started by adding your first cancer awareness activity."
                    : "No activities match your current filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {activity.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(activity.date)}</span>
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4 mr-2" />
                          <span>{activity.attendees_count || 0} attendees</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          to={`/private/cancer-awareness/view/${activity.id}`}
                          className="bg-primary hover:bg-primary/90 text-white py-1.5 px-2 rounded transition-colors"
                          title="View Activity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/private/cancer-awareness/edit/${activity.id}`}
                          className="bg-yellow hover:bg-yellow/90 text-white py-1.5 px-2 rounded transition-colors"
                          title="Edit Activity"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(activity.id, activity.title)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {activity.description}
                    </p>
                    
                    {activity.photo && (
                      <div className="mt-2">
                        <img
                          src={activity.photo_url}
                          alt={activity.title}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CancerAwarenessList;