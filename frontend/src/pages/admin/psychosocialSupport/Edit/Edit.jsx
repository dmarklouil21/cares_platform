// src/pages/cancer-awareness/ActivityForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Upload } from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import api from "src/api/axiosInstance";

const ActivityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    photo: null,
    attachment: null,
  });

  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [originalAttachment, setOriginalAttachment] = useState(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchActivity();
    }
  }, [id, isEditing]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/psychosocial-support/activity/${id}/`);
      const activity = response.data;
      console.log("Response Data: ", response.data);
      
      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        date: activity.date || "",
        photo: null,
        attachment: null,
      });
      setOriginalPhoto(activity.photo);
      setOriginalAttachment(activity.attachment);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setNotification("Failed to load activity.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/admin/PychosocialSupport');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null
    }));
  };

  const buildFormData = () => {
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("date", formData.date);
    
    if (formData.photo) {
      form.append("photo", formData.photo);
    }
    if (formData.attachment) {
      form.append("attachment", formData.attachment);
    }
    
    return form;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      setNotification("Please fill in all required fields.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    setModalOpen(false);
    try {
      setSaving(true);
      const form = buildFormData();

      if (isEditing) {
        await api.patch(
          `/psychosocial-support/update-activity/${id}/`,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setNotification("Activity updated successfully!");
      } else {
        await api.post(
          "/psychosocial-support/create-activity/",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setNotification("Activity created successfully!");
      }
      
      setNotificationType("success");
      setTimeout(() => {
        navigate('/admin/PychosocialSupport');
      }, 1000);
    } catch (error) {
      let errorMessage = "Something went wrong while saving the activity.";
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        }
      }
      setNotification(errorMessage);
      setNotificationType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(""), 2000);
    }
  };

  const handleSaveClick = () => {
    setModalOpen(true);
  };

  if (loading) {
    return <SystemLoader />;
  }

  return (
    <>
      {saving && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Save"
        desc={`Are you sure you want to ${isEditing ? 'update' : 'create'} this activity?`}
        onConfirm={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="h-screen w-full flex flex-col p-5 gap-3 bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="flex justify-between items-center w-full"> */}
          {/* <div className="flex items-center gap-4">
            <Link
              to="/rhu/cancer-awareness"
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
              title="Back to Activities"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Activity' : 'Add New Activity'}
            </h2>
          </div> */}
          {/* <button
            onClick={handleSaveClick}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : (isEditing ? 'Update Activity' : 'Create Activity')}
          </button> */}
        {/* </div> */}

        {/* Main Content Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 w-full">
          <div className="px-5 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Activity Information
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Required Fields */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-sm text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter activity title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-sm text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter activity description"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-sm text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 pl-10 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Files */}
              <div className="space-y-6">
                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer bg-primary text-white px-4 py-2 rounded text-sm font-medium inline-block"
                    >
                      Choose Photo
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.photo ? formData.photo.name : (originalPhoto ? 'Current photo uploaded' : 'No photo selected')}
                    </p>
                  </div>
                  {/* {originalPhoto && !formData.photo && (
                    <div className="mt-2">
                      <img
                        src={originalPhoto}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )} */}
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleFileChange}
                      className="hidden"
                      id="attachment-upload"
                    />
                    <label
                      htmlFor="attachment-upload"
                      className="cursor-pointer bg-primary text-white px-4 py-2 rounded text-sm font-medium inline-block"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.attachment ? formData.attachment.name : (originalAttachment ? 'Current file uploaded' : 'No file selected')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-around print:hidden">
          <Link
            to={`/admin/PychosocialSupport`}
            className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md"
          >
            Back
          </Link>
          <button
            onClick={handleSaveClick}
            className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
        <br />
      </div>
    </>
  );
};

export default ActivityForm;