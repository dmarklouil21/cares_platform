import { useEffect, useState } from "react";
import { publicListPsychosocialActivities } from "src/api/psychosocialSupport";

const PychosocialSupport = () => {
  const [activities, setActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // kept for parity with your other page

  // Pretty print date like "October 9, 2025"
  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicListPsychosocialActivities();
        const normalized = (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          photo: a.photo_url || a.photo,
          attachment: a.attachment_url || a.attachment,
        }));
        setActivities(normalized);
      } catch (e) {
        setActivities([]);
      }
    };
    load();
  }, []);

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {/* 
      // Keep sidebar/header structure commented like your CancerAwareness page
      // <div className="md:hidden">
      //   <BeneficiarySidebar
      //     isSidebarOpen={isSidebarOpen}
      //     setIsSidebarOpen={setIsSidebarOpen}
      //   />
      // </div>
      //
      // <div className="bg-white py-4 px-10 flex justify-between items-center ">
      //   <img
      //     className="md:hidden size-5 cursor-pointer"
      //     src="/images/menu-line.svg"
      //     onClick={() => setIsSidebarOpen(true)}
      //   />
      //
      //   <div className="font-bold">Beneficiary</div>
      //   <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
      //     <img src="/images/Avatar.png" alt="User Profile" className="rounded-full" />
      //   </div>
      // </div>
      */}

      <div className="h-full flex flex-col justify-between overflow-auto ">
        <div className="py-6 px-10 md:px-10">
          <h1 className="text-lg font-bold mb-6">Psychosocial Support</h1>

          <div className="bg-white rounded-lg p-5 md:p-10 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-yellow mb-4">
              Psychosocial Support Activities
            </h2>
            <p className="mb-4 font-bold text-[16px]">
              Browse sessions and programs organized by the RHU.
            </p>

            <div className="flex flex-col gap-7">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col  md:flex-row gap-8 p-5 border-b-[1.5px] border-primary"
                  >
                    <img
                      src={activity.photo || "/images/placeholder-image.png"}
                      alt={activity.title || "Activity photo"}
                      className="h-40 w-72 rounded-md object-cover border"
                    />
                    <div className="flex flex-col   justify-between py-2 w-full md:w-[50%] gap-2">
                      <h1 className="font-bold text-primary text-xl">
                        {activity.title}
                      </h1>
                      <p className="text-[12px] text-yellow">
                        {formatDate(activity.date)}
                      </p>
                      <p className="font-medium whitespace-pre-wrap">
                        {activity.description}
                      </p>

                      {activity.attachment ? (
                        <a
                          href={activity.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-start gap-2 text-[12px] text-blue-600 underline"
                        >
                          <img
                            src="/src/assets/images/input_icons/attachmenticon.svg"
                            alt="attachment icon"
                            className="h-3.5 w-3.5"
                          />
                          Download
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))
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

export default PychosocialSupport;
