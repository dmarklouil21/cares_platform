import React, { useState } from "react";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

const survivorshipOptions = [
  {
    title: "Hormonal Replacement Therapy",
    icon: "/src/assets/images/patient/services/survivorship/hormonalicon.png",
    description:
      "Support your recovery with prescribed hormonal medications to manage the effects of cancer treatment and hormone imbalances.",
  },
  {
    title: "Patient Home Visit",
    icon: "/src/assets/images/patient/services/survivorship/patienthouseicon.png",
    description:
      "Receive medical guidance, follow-ups, or support services in the comfort of your home through scheduled nurse or health worker visits.",
  },
  {
    title: "Psychological Support",
    icon: "/src/assets/images/patient/services/survivorship/utak.png",
    description:
      "Access mental health services like counseling or therapy to help manage emotional challenges during survivorship.",
  },
];

const SurvivorshipPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-gray overflow-auto">
      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      <div className="bg-white py-4 px-10 flex justify-between items-center ">
        {/* Menu Button for Mobile */}
        <img
          className="md:hidden size-5 cursor-pointer"
          src="/images/menu-line.svg"
          onClick={() => setIsSidebarOpen(true)}
        />

        <div className="font-bold">Beneficiary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="h-full flex flex-col justify-between overflow-auto">
        <div className="py-6 px-10 bg-gray">
          <h2 className="text-xl font-semibold mb-6">Survivorship</h2>
          <div className="flex flex-col gap-3 w-full bg-white rounded-2xl py-7 px-8">
            <h3 className="text-2xl font-bold text-secondary">
              LIFE AFTER CANCER: YOUR SURVIVORSHIP JOURNEY
            </h3>
            <p className="text-gray2 mb-4">
              Your Next Chapter: Guidance for Survivors
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {survivorshipOptions.map((option, index) => (
                <div
                  key={index}
                  className="rounded-md custom-shadow h-72 flex flex-col justify-between p-4 items-center"
                >
                  <img
                    src={option.icon}
                    alt={`${option.title} Icon`}
                    className="h-9 w-9"
                  />
                  <h4 className="text-lg font-bold text-center text-gray-800">
                    {option.title}
                  </h4>
                  <p className="text-gray2 text-center text-sm">
                    {option.description}
                  </p>
                  <button className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-16 bg-secondary"></div>
      </div>
    </div>
  );
};

export default SurvivorshipPage;
