import { useState } from "react";

const CancerAwareness = () => {
  // Generate month options
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Sample Data
  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "Breast Cancer Awareness Walk",
      date: "August 17, 2025",
      description:
        "Join our wellness fair for a day of health education and free screenings.",
    },
    {
      id: 2,
      title: "Prostate Cancer Free Checkup",
      date: "September 5, 2025",
      description:
        "Free prostate cancer screening event for all men above 40 years old.",
    },
    {
      id: 3,
      title: "Lung Cancer Awareness Seminar",
      date: "October 12, 2024",
      description:
        "A seminar discussing lung cancer prevention, early detection, and treatment.",
    },
  ]);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Notification state
  const [notification, setNotification] = useState("");

  // Form state
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    date: "",
    attachment: null,
  });

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const [monthName, , yearStr] = activity.date.split(" ");
    const monthIndex = months.indexOf(monthName) + 1;
    const yearNum = parseInt(yearStr);

    const monthMatches =
      selectedMonth === "" || monthIndex === parseInt(selectedMonth);
    const yearMatches =
      selectedYear === "" || yearNum === parseInt(selectedYear);
    const searchMatches =
      searchTerm === "" ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());

    return monthMatches && yearMatches && searchMatches;
  });

  // Handle Add Activity confirm
  const handleAddConfirm = () => {
    if (!newActivity.title || !newActivity.date) {
      alert("Please fill in title and date.");
      return;
    }

    const activityDate = new Date(newActivity.date);
    const formattedDate = `${
      months[activityDate.getMonth()]
    } ${activityDate.getDate()}, ${activityDate.getFullYear()}`;

    const newEntry = {
      id: activities.length + 1,
      title: newActivity.title,
      date: formattedDate,
      description: newActivity.description,
    };

    setActivities([...activities, newEntry]);
    setShowConfirmModal(false);
    setShowAddModal(false);
    setNewActivity({ title: "", description: "", date: "", attachment: null });

    // Show notification
    setNotification("Event successfully added!");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="bg-gray w-full h-screen flex flex-col items-center ">
      {/* Notification */}
      {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
        <h1 className="text-md font-bold h-full flex items-center ">RHU</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow gap-3 flex justify-center items-center px-5 py-1 rounded-sm"
        >
          <p className="text-white text-sm">Add event</p>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full flex-1 py-3 gap-3 flex flex-col justify-start px-5">
        <h2 className="text-xl font-bold text-left w-full pl-5">
          Cancer Awareness Activities
        </h2>
        <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-3 gap-3 flex-1">
          <p className="text-md font-semibold text-yellow">
            View, add, or manage awareness activities for patients and
            communities.
          </p>

          {/* Filters */}
          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
            />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 py-2 px-5 rounded-md"
            >
              <option value="">All Month</option>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-200 py-2 px-5 rounded-md"
            >
              <option value="">All year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button className="px-7 rounded-md text-sm text-white bg-lightblue">
              Filter
            </button>
          </div>

          {/* Activity List */}
          <div className="flex flex-col overflow-auto gap-5 h-[340px] custom-rightspaceSB ">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex border-b-[1.5px] border-primary h-36 gap-5 justify-between"
                >
                  <div className="flex flex-col justify-start gap-4.5 items-start h-full">
                    <h1 className="font-bold text-xl">{activity.title}</h1>
                    <p className="flex gap-4 text-primary text-[12px]">
                      <img
                        src="/src/assets/images/input_icons/datebirth.svg"
                        alt="Calendar Icon"
                        className="h-3.5"
                      />
                      {activity.date}
                    </p>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                  <div className="flex flex-col justify-start gap-9.5 py-5 items-start">
                    <div className="flex gap-3">
                      <button className="bg-primary px-5 py-1 text-sm text-white rounded-sm">
                        Edit
                      </button>
                      <button className="bg-white border-[1.5px] border-red-500 px-3 py-1 text-sm text-red-500 rounded-sm">
                        Delete
                      </button>
                    </div>
                    <a href="#" className="text-primary underline text-sm">
                      Download
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No activities found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[3px] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-lg font-bold mb-4">Add New Activity</h2>
            <input
              type="text"
              placeholder="Title"
              value={newActivity.title}
              onChange={(e) =>
                setNewActivity({ ...newActivity, title: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />
            <textarea
              placeholder="Description"
              value={newActivity.description}
              onChange={(e) =>
                setNewActivity({ ...newActivity, description: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />
            <input
              type="date"
              value={newActivity.date}
              onChange={(e) =>
                setNewActivity({ ...newActivity, date: e.target.value })
              }
              className="border w-full p-2 rounded mb-3"
            />
            <input
              type="file"
              onChange={(e) =>
                setNewActivity({
                  ...newActivity,
                  attachment: e.target.files[0],
                })
              }
              className="border w-full p-2 rounded mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[3px] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[350px] text-center">
            <h3 className="text-lg font-bold mb-4">
              Are you sure you want to add this activity?
            </h3>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleAddConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancerAwareness;
