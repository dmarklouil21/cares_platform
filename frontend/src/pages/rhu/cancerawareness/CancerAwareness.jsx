import { useState, useEffect } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

import api from "src/api/axiosInstance";

const CancerAwareness = () => {
  // Generate month options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Notification Modal
  const [notificationModal, setNotificationModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal 
  const [loading, setLoading] = useState(false);
  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalAction, setModalAction] = useState(null); 

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Data container
  const [activities, setActivities] = useState([]);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null); // null = add, object = edit

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    photo: null,
    attachment: null,
  });

  const fetchData = async () => {
    try {
      const response = await api.get("/partners/cancer-awareness/list-activity/");
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildFormData = () => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });
    if (editingActivity?.id) form.append("id", editingActivity.id);
    return form;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({ title: "", description: "", date: "", photo: null, attachment: null });
    setEditingActivity(null);
  };

  // Handle Submit
  const handleSubmit = () => {
    setShowModal(false);
    setModalText('Confirm submit?');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setModalText('Confirm delete?');
    setModalAction({ type: "delete", id }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        const form = buildFormData();
        // form.append("title", formData.title);
        // form.append("description", formData.description);
        // form.append("date", formData.date);

        // if (formData.photo) {
        //   form.append("photo", formData.photo);
        // }
        // if (formData.attachment) {
        //   form.append("attachment", formData.attachment);
        // }

        if (editingActivity) {
          setLoading(true);
          const response = await api.patch(`/partners/cancer-awareness/update-activity/${formData.id}/`, form, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Updated successfully!",
          });
          setNotificationModal(true);
        } else {
          setLoading(true);
          const response = await api.post("/partners/cancer-awareness/create-activity/", form, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          setModalInfo({
            type: "success",
            title: "Success!",
            message: "Added successfully!.",
          });
          setNotificationModal(true);
        }

      } catch(error) {
        let errorMessage = "Something went wrong while submitting the form."; 

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } //else if (typeof error.response.data === "string") {
            //errorMessage = error.response.data; // for plain text errors
          //}
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
        setNotificationModal(true);
        console.error(error)
      } finally {
        fetchData();
        setLoading(false);
      }
    } else if (modalAction?.type === "delete") {
      try {
        setLoading(true);
        const response = await api.delete(`/partners/cancer-awareness/delete-activity/${modalAction.id}/`);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Deleted Successfully.",
        });
        // setShowModal(true);
        setNotificationModal(true);
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

    setShowModal(false);
    resetForm();
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  }

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
        show={notificationModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setNotificationModal(false)}
      />
      <LoadingModal open={loading} text="Submitting your data..." />
      <div className="bg-gray w-full h-screen flex flex-col items-center ">

        {/* Header */}
        <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
          <h1 className="text-md font-bold h-full flex items-center ">RHU</h1>
          <button
            onClick={() => {
              // setShowAddModal(true)
              resetForm();
              setShowModal(true);
              
            }}
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
                        <button 
                          className="bg-primary px-5 py-1 text-sm text-white rounded-sm"
                          onClick={() => {
                            setEditingActivity(activity);
                            setFormData(activity);
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-white border-[1.5px] border-red-500 px-3 py-1 text-sm text-red-500 rounded-sm"
                          onClick={() => handleDelete(activity.id)}
                        >
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

        {/* Add/Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[3px] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </h2>

              {/* Title */}
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border w-full p-2 rounded mb-3"
              />

              {/* Description */}
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border w-full p-2 rounded mb-3"
              />

              {/* Date */}
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="border w-full p-2 rounded mb-3"
              />

              {/* Photo */}
              <label className="block text-sm font-semibold mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, photo: e.target.files[0] })
                }
                className="border w-full p-2 rounded mb-3"
              />
              {formData.photo && (
                <div className="mb-3">
                  <img
                    src={
                      formData.photo instanceof File
                      ? URL.createObjectURL(formData.photo) // Local new upload
                      : formData.photo // Existing image URL from backend
                    }
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {/* Selected image: {formData.photo.name} */}
                    {formData.photo instanceof File
                      ? `Selected image: ${formData.photo.name}`
                      : "Existing image"
                    }
                  </p>
                </div>
              )}

              {/* Attachment */}
              <label className="block text-sm font-semibold mb-1">Attachment</label>
              <input
                type="file"
                onChange={(e) =>
                  setFormData({ ...formData, attachment: e.target.files[0] })
                }
                className="border w-full p-2 rounded mb-3"
              />
              {formData.attachment && (
                <p className="text-xs text-gray-600 mb-2">
                  {formData.attachment instanceof File
                    ? `Selected file: ${formData.attachment.name}`
                    : `Existing file: ${formData.attachment}`}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  {editingActivity ? "Update Activity" : "Add Activity"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CancerAwareness;
