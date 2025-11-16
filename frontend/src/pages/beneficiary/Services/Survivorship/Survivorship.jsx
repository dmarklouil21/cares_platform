import React, { useState } from "react";
import { Link } from "react-router-dom";
import BeneficiarySidebar from "src/components/navigation/Beneficiary";

const survivorshipOptions = [
  {
    title: "Hormonal Replacement Therapy",
    icon: "/src/assets/images/patient/services/survivorship/hormonalicon.png",
    description:
      "Support your recovery with prescribed hormonal medications to manage the effects of cancer treatment and hormone imbalances.",
    link: "/beneficiary/services/survivorship/hormonal-replacement",
  },
  // {
  //   title: "Patient Home Visit",
  //   icon: "/src/assets/images/patient/services/survivorship/patienthouseicon.png",
  //   description:
  //     "Receive medical guidance, follow-ups, or support services in the comfort of your home through scheduled nurse or health worker visits.",
  //   link: "/beneficiary/services/survivorship/hormonal-replacement",
  // },
  {
    title: "Psychosocial Support",
    icon: "/src/assets/images/patient/services/survivorship/utak.png",
    description:
      "Access mental health services like counseling or therapy to help manage emotional challenges during survivorship.",
    link: "/beneficiary/services/survivorship/hormonal-replacement",
  },
];

const SurvivorshipPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 h-full w-full bg-gray py-7 px-8 overflow-auto">
      <h3 className="text-2xl font-bold text-secondary">
        LIFE AFTER CANCER: YOUR SURVIVORSHIP JOURNEY
      </h3>
      <p className="text-gray2 mb-4">
        Your Next Chapter: Guidance for Survivors
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {survivorshipOptions.map((option, index) => (
          <div
            key={index}
            className="rounded-md bg-white custom-shadow h-72 flex flex-col justify-between p-4 items-center "
          >
            <img
              src={option.icon}
              alt={`${option.title} Icon`}
              className="h-9 w-9"
            />
            <h4 className="text-lg font-bold text-center text-gray-800">
              {option.title}
            </h4>
            <p className="text-gray2 text-center text-sm w-[70%]">
              {option.description}
            </p>
            <Link
              className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
              to={option.link}
            >
              {option.title === "Psychosocial Support" ? "Explore" : "Apply"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurvivorshipPage;
