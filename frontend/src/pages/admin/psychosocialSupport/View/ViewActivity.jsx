import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  Image as ImageIcon,
  UserCog,
  FileText
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import api from "src/api/axiosInstance";

const ViewActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const [activityResponse, attendeesResponse] = await Promise.all([
        api.get(`/psychosocial-support/activity/${id}/`),
        api.get(`/psychosocial-support/activity/${id}/attendees/`)
      ]);
      
      setActivity(activityResponse.data);
      setAttendees(attendeesResponse.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setNotification("Failed to load activity details.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/admin/PychosocialSupport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchActivity();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <SystemLoader />;

  if (!activity) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-5 bg-gray">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Activity not found</h3>
          <Link to="/admin/PychosocialSupport" className="text-primary hover:underline">
            Return to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
                  {activity.title}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                   ID: <span className="font-mono text-gray-700">{activity.id}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercase">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(activity.date)}
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
              
              {/* Left Column: Details (Takes 2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Activity Details
                  </h3>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</span>
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {activity.description || "No description provided."}
                    </p>
                  </div>

                  {/* Metadata Grid (if you had more fields like Venue, they would go here) */}
                  {/* <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">Venue</span>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                           <MapPin className="w-4 h-4 text-gray-400" />
                           {activity.venue || "---"}
                        </div>
                     </div>
                  </div> */}
                </div>

                {/* Photo Section */}
                {activity.photo && (
                  <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-400" /> Photo Documentation
                    </h3>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 inline-block">
                      <img
                        src={activity.photo}
                        alt={activity.title}
                        className="w-full max-w-md h-auto rounded shadow-sm object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Attendance (Takes 1/3 width) */}
              <div className="lg:col-span-1 space-y-8">
                
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" /> Participants
                  </h3>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[400px]">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Attendees List</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {attendees.length}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {attendees.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                             <Users className="w-8 h-8 text-gray-300 mb-2" />
                             <p className="text-sm text-gray-500">No participants yet.</p>
                          </div>
                        ) : (
                          attendees.map((attendee) => (
                            <div key={attendee.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-colors">
                               <div className="w-8 h-8 rounded-full bg-yellow/10 flex items-center justify-center text-yellow font-bold text-xs shrink-0">
                                  {attendee.patient?.full_name?.charAt(0) || "?"}
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {attendee.patient?.full_name || 'Unknown'}
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    ID: {attendee.patient?.patient_id || 'N/A'}
                                  </p>
                               </div>
                            </div>
                          ))
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                       <button
                          onClick={() => navigate(`/admin/PychosocialSupport/${id}/manage-attendees`)}
                          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded text-sm font-medium transition-all shadow-sm"
                       >
                          <UserCog className="w-4 h-4 text-primary" />
                          Manage Attendees
                       </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-end gap-4">
              <Link
                to="/admin/PychosocialSupport"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                {/* <ArrowLeft className="w-4 h-4" /> */}
                Back
              </Link>
            </div>

          </div>
        </div>

        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>
    </>
  );
};

export default ViewActivity;