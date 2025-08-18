import { useState, useEffect } from "react";

import api from "src/api/axiosInstance";

const CancerAwareness = () => {
  const [activities, setActivities] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/beneficiary/cancer-awareness-activity/list/");
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-screen bg-gray flex flex-col">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Beneficary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto ">
        <div className="py-6 px-10">
          <h1 className="text-lg font-bold mb-6">Cancer Awareness</h1>
          <div className="bg-white rounded-lg p-10 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-yellow mb-4">
              Cancer Awareness Activities
            </h2>
            <p className="mb-4 font-bold">
              Stay informed about past and upcoming cancer awareness programs
              and events.
            </p>
            <div className="flex flex-col gap-7">
              { activities.length > 0 ? (
                activities.map((activity) => {
                  return (
                    <div className="flex justify-start gap-8 p-5 border-b-[1.5px] border-primary">
                      <img
                        src={activity.photo || ''}
                        alt="sample pic"
                        className="h-40 w-72 rounded-md"
                      />
                      <div className="flex flex-col justify-between py-2 w-[50%]">
                        <h1 className="font-bold text-primary text-xl">
                          {activity.title}
                        </h1>
                        <p className="text-[12px] text-yellow">{activity.date}</p>
                        <p className="font-medium">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-start gap-2">
                          <img
                            src="/src/assets/images/input_icons/attachmenticon.svg"
                            alt="attachment icon"
                            className="h-3.5 w-3.5"
                          />
                          <p className="text-[12px] text-blue-600 underline">
                            Download
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 italic">No Activities</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-yellow h-14 w-full mt-auto"></div>
      </div>
    </div>
  );
};
export default CancerAwareness;
