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

  const [loggedRepresentative, setLoggedRepresentative] = useState(null);
  
  const [activity, setActivity] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // --- Logic: Fetch Profile First ---
  const fetchProfile = async () => {
    try {
        const { data } = await api.get("/partners/private/profile/");
        setLoggedRepresentative(data);
    } catch (e) {
        console.error("Error fetching profile", e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  
  useEffect(() => {
    if (id && loggedRepresentative) {
      fetchData();
    } else if (id && !loading && !loggedRepresentative) {
       // Fallback if profile fails or isn't needed immediately for other calls
       // But based on logic, we need it for the patient list params
       fetchData(); 
    }
  }, [id, loggedRepresentative]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const promises = [
        api.get(`/partners/cancer-awareness/activity/${id}/`),
        api.get(`/partners/cancer-awareness/activity/${id}/attendees/`),
      ];

      // Only fetch patient list if we have the institution name to filter by
      // Adjust logic if you want to allow fetching without it
      let patientsPromise = null;
      if (loggedRepresentative?.institution_name) {
         patientsPromise = api.get('/patient/list/', {
            params: {
                registered_by: loggedRepresentative.institution_name,
            }
         });
      } else {
         // Fallback or empty promise
         patientsPromise = Promise.resolve({ data: [] });
      }

      const [activityResponse, attendeesResponse, patientsResponse] = await Promise.all([
        ...promises,
        patientsPromise
      ]);
      
      setActivity(activityResponse.data);
      setAttendees(attendeesResponse.data);
      setAvailablePatients(patientsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification("Failed to load data.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/private/cancer-awareness');
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
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

  // --- Handlers ---
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
      
      // Filter existing vs new if needed, but logic sends all IDs
      const allAttendeeIds = attendees.map(attendee => attendee.patient.patient_id);
    
      await api.post(`/partners/cancer-awareness/activity/${id}/attendees/`, {
        patient_ids: allAttendeeIds
      });

      setNotification("Attendees updated successfully!");
      setNotificationType("success");
      setTimeout(() => {
        navigate(`/private/cancer-awareness/view/${id}`);
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

  if (loading) return <SystemLoader />;

  if (!activity) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray">
        <p className="text-gray-500 font-medium">Activity not found.</p>
        <Link to="/private/cancer-awareness" className="text-primary hover:underline mt-2">
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
            Cancer Awareness
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
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" />
                {attendees.length} Registered
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
              
              {/* Left Column: Available Patients 

[Image of Patient Search UI]
 */}
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
                        {searchTerm ? 'No matching patients found.' : 'No available patients.'}
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

              {/* Right Column: Selected Attendees */}
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
            <div className="flex justify-around print:hidden mt-6">
              <Link
                to={`/private/cancer-awareness/view/${id}`}
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
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