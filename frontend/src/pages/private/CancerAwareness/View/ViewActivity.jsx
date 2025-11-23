// src/pages/cancer-awareness/ViewActivity.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Download, Edit } from "lucide-react";

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
        api.get(`/partners/cancer-awareness/activity/${id}/`),
        api.get(`/partners/cancer-awareness/activity/${id}/attendees/`)
      ]);
      
      setActivity(activityResponse.data);
      setAttendees(attendeesResponse.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setNotification("Failed to load activity details.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
      navigate('/private/cancer-awareness');
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
      <Notification message={notification} type={notificationType} />
      
      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <Link
              to="/rhu/cancer-awareness"
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
              title="Back to Activities"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {activity.title}
              </h2>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(activity.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/rhu/cancer-awareness/edit/${id}`}
              className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Activity
            </Link>
            {activity.attachment && (
              <a
                href={activity.attachment}
                download
                className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Attachment
              </a>
            )}
          </div>
        </div> */}

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          <div className="px-5 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Activity Details
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-800 leading-relaxed">{activity.description}</p>
                </div>

                {activity.photo && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Photo</h4>
                    <img
                      src={activity.photo_url}
                      alt={activity.title}
                      className="w-full max-w-md rounded-lg shadow-sm border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Attendees Section */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Attendees</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{attendees.length} patients</span>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {attendees.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No attendees registered yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {attendee.patient?.full_name || 'Unknown Patient'}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {attendee.patient?.patient_id || 'N/A'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/private/cancer-awareness/${id}/manage-attendees`}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Manage Attendees
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end print:hidden">
          <Link
            to={`/private/cancer-awareness`}
            className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md"
          >
            Back
          </Link>
          {/* <button
            // onClick={handleSaveClick}
            className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer"
          >
            Save Changes
          </button> */}
        </div>
      </div>
    </>
  );
};

export default ViewActivity;