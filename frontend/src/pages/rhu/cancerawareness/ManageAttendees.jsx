// src/pages/cancer-awareness/ManageAttendees.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, UserPlus, UserMinus } from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import api from "src/api/axiosInstance";

const ManageAttendees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activityResponse, attendeesResponse, patientsResponse] = await Promise.all([
        api.get(`/partners/cancer-awareness/activity/${id}/`),
        api.get(`/partners/cancer-awareness/activity/${id}/attendees/`),
        api.get('/patient/list/', {
          params: {
            status: "validated",
            registered_by: "rhu",
          }
        })
      ]);
      
      setActivity(activityResponse.data);
      setAttendees(attendeesResponse.data);
      setAvailablePatients(patientsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification("Failed to load data.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/rhu/cancer-awareness');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = availablePatients.filter(patient => {
    const searchMatch = 
      searchTerm === "" ||
      patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id?.toString().includes(searchTerm);
    
    const isAlreadyAttendee = attendees.some(attendee => 
      attendee.patient?.id === patient.id
    );
    
    return searchMatch && !isAlreadyAttendee;
  });

  const addAttendee = (patient) => {
    setAttendees(prev => [...prev, {
      id: `temp-${Date.now()}`,
      patient: patient,
      activity: id
    }]);
  };

  const removeAttendee = (attendeeId) => {
    setAttendees(prev => prev.filter(attendee => attendee.id !== attendeeId));
  };

  const saveAttendees = async () => {
    setModalOpen(false);
    try {
      setSaving(true);
      const attendeeIds = attendees
        .filter(attendee => !attendee.id.startsWith('temp-'))
        .map(attendee => attendee.patient.patient_id);
      
      const newAttendeeIds = attendees
        .filter(attendee => attendee.id.startsWith('temp-'))
        .map(attendee => attendee.patient.patient_id);

      const allAttendeeIds = [...attendeeIds, ...newAttendeeIds];
      console.log("All Attendees: ", allAttendeeIds);
      await api.post(`/partners/cancer-awareness/activity/${id}/attendees/`, {
        patient_ids: allAttendeeIds
      });

      setNotification("Attendees updated successfully!");
      setNotificationType("success");
      setTimeout(() => {
        navigate(`/rhu/cancer-awareness/view/${id}`);
      }, 1000);
    } catch (error) {
      setNotification("Failed to save attendees.");
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

  if (!activity) {
    return (
      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Activity not found
          </h3>
          <Link
            to="/rhu/cancer-awareness"
            className="text-primary hover:underline"
          >
            Return to activities list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {saving && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Save"
        desc="Are you sure you want to save the attendee changes?"
        onConfirm={saveAttendees}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="flex justify-end items-center w-full">
          <div className="flex items-center gap-4">
            <Link
              to={`/rhu/cancer-awareness/view/${id}`}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
              title="Back to Activity"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Manage Attendees - {activity.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add or remove patients who attended this activity
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div> */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Patients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">
                Available Patients
              </h3>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 py-2 pl-10 pr-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full text-sm"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {searchTerm ? 'No patients found matching your search.' : 'No available patients.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.patient_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {patient.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {patient.patient_id}
                          </p>
                        </div>
                        <button
                          onClick={() => addAttendee(patient)}
                          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition-colors"
                          title="Add Attendee"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Attendees */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-600">
                  Current Attendees
                </h3>
                <span className="text-sm text-gray-600">
                  {attendees.length} patients
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="max-h-96 overflow-y-auto">
                {attendees.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No attendees added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {attendee.patient?.full_name || 'Unknown Patient'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {attendee.patient?.patient_id || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAttendee(attendee.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors"
                          title="Remove Attendee"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-around print:hidden">
          <Link
            to={`/rhu/cancer-awareness`}
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
      </div>
    </>
  );
};

export default ManageAttendees;