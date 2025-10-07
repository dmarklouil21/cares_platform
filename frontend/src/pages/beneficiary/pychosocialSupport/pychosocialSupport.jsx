import { useState } from "react";

// UI-only mock data (replace or extend as you like)
const MOCK_ACTIVITIES = [
  {
    id: 1,
    title: "Group Sharing Session",
    date: "2025-10-05",
    description:
      "A safe space for beneficiaries to share feelings and coping strategies.",
    photo: "https://picsum.photos/seed/ps1/720/400",
    attachment: "#",
  },
  {
    id: 2,
    title: "Stress Management Workshop",
    date: "2025-10-12",
    description:
      "Breathing exercises, journaling prompts, and grounding techniques.",
    photo: "https://picsum.photos/seed/ps2/720/400",
    attachment: "#",
  },
  {
    id: 3,
    title: "Family Support Counseling",
    date: "2025-10-20",
    description:
      "Guided conversations to help families support each other at home.",
    photo: "https://picsum.photos/seed/ps3/720/400",
    attachment: "",
  },
];

const PychosocialSupport = () => {
  const [activities] = useState(MOCK_ACTIVITIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // kept for parity with your other page

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
        <div className="py-6 px-10">
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
                    className="flex justify-start gap-8 p-5 border-b-[1.5px] border-primary"
                  >
                    <img
                      src={activity.photo || "/images/placeholder-image.png"}
                      alt={activity.title || "Activity photo"}
                      className="h-40 w-72 rounded-md object-cover"
                    />
                    <div className="flex flex-col justify-between py-2 w-[50%]">
                      <h1 className="font-bold text-primary text-xl">
                        {activity.title}
                      </h1>
                      <p className="text-[12px] text-yellow">{activity.date}</p>
                      <p className="font-medium whitespace-pre-wrap">
                        {activity.description}
                      </p>

                      {activity.attachment ? (
                        <a
                          href={activity.attachment}
                          onClick={(e) => e.preventDefault()} // UI only; no real download
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
