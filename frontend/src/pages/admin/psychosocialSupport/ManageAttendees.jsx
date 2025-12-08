import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  User 
} from "lucide-react";

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
        api.get(`/psychosocial-support/activity/${id}/`),
        api.get(`/psychosocial-support/activity/${id}/attendees/`),
        api.get('/patient/list/')
      ]);
      
      setActivity(activityResponse.data);
      setAttendees(attendeesResponse.data);
      setAvailablePatients(patientsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification("Failed to load data.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/admin/PychosocialSupport');
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
      attendee.patient?.patient_id === patient.patient_id
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
      
      // Separate existing attendees from new ones if needed, 
      // but usually replacing the list or sending IDs is sufficient depending on backend.
      // Based on original code, we map all current IDs.
      const allAttendeeIds = attendees.map(attendee => attendee.patient.patient_id);
      
      await api.post(`/psychosocial-support/activity/${id}/attendees/`, {
        patient_ids: allAttendeeIds
      });

      setNotification("Attendees updated successfully!");
      setNotificationType("success");
      setTimeout(() => {
        navigate(`/admin/PychosocialSupport/view/${id}`);
      }, 1000);
    } catch (error) {
      setNotification("Failed to save attendees.");
      setNotificationType("error");
      console.error(error);
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(""), 2000);
    }
  };

  const handleSaveClick = () => {
    setModalOpen(true);
  };

  if (loading) return <SystemLoader />;

  if (!activity) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray">
        <p className="text-gray-500 font-medium">Activity not found.</p>
        <Link to="/admin/PychosocialSupport" className="text-primary hover:underline mt-2">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <>
      {saving && <SystemLoader />}
      
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Save"
        desc="Are you sure you want to update the attendee list for this activity?"
        onConfirm={saveAttendees}
        onCancel={() => setModalOpen(false)}
      />
      
      <Notification message={notification} type={notificationType} />

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Psychosocial Support
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                  Manage Attendees
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                   Activity: <span className="font-medium text-gray-700">{activity.title}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercase">
                <Users className="w-3.5 h-3.5" />
                {attendees.length} Registered
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
              
              {/* Left Column: Available Patients */}
              <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" /> Available Patients
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {filteredPatients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <p className="text-sm text-gray-500">
                        {searchTerm ? 'No matching patients found.' : 'All patients are already added.'}
                      </p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.patient_id}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group"
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {patient.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-mono">
                            {patient.patient_id}
                          </p>
                        </div>
                        <button
                          onClick={() => addAttendee(patient)}
                          className="bg-gray-100 hover:bg-green-50 text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors"
                          title="Add"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Current Attendees */}
              <div className="flex flex-col h-full bg-blue-50/50 rounded-lg border border-blue-100 overflow-hidden">
                <div className="p-4 border-b border-blue-100 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" /> Selected Attendees
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {attendees.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <p className="text-sm text-gray-500">No attendees selected yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Select patients from the left list.</p>
                    </div>
                  ) : (
                    attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-3 bg-white rounded border border-blue-100 shadow-sm hover:border-red-200 transition-colors group"
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {attendee.patient?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-mono">
                            {attendee.patient?.patient_id || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAttendee(attendee.id)}
                          className="bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors"
                          title="Remove"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-around gap-4 border-t border-gray-100 pt-6">
              <Link
                to={`/admin/PychosocialSupport/view/${id}`}
                className="text-center w-[35%] gap-2 px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                {/* <ArrowLeft className="w-4 h-4" /> */}
                Cancel
              </Link>
              <button
                onClick={handleSaveClick}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                {/* <Save className="w-4 h-4" /> */}
                Save Attendees
              </button>
            </div>

          </div>
        </div>

        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>
    </>
  );
};

export default ManageAttendees;