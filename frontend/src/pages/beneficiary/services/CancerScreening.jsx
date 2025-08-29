import React, { useState } from "react";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

const screeningOptions = [
  {
    id: "individual",
    title: "Individual Screening",
    description:
      "One-on-one medical evaluation for persons experiencing symptoms or with high cancer risk (family history, genetic factors). Includes doctor consultations, targeted tests (e.g., mammograms, PSA tests), and personalized results review.",
    features: [
      "Tailored tests based on your symptoms / risk",
      "Physician-guided process",
      "Private results with counseling",
    ],
    icon: "/src/assets/images/patient/services/cancerscreening/individualscreeningicon.png",
    // link: "/Beneficiary/services/cancer-screening/individual-screening-req",
    link: "/Beneficiary/services/cancer-screening/pre-screening-form-note",
    isLink: true,
  },
  /* {
    id: "mass",
    title: "Mass Screening",
    description:
      "Community-based health drives offering free basic cancer checks (e.g., clinical breast exams, oral cancer checks) for early detection. No appointments needed – walk-ins welcome at scheduled locations.",
    features: [
      "Accessible neighborhood events",
      "Quick procedures",
      "Group education on cancer prevention",
    ],
    icon: "/src/assets/images/patient/services/cancerscreening/masscreeningicon.png",
    isLink: false,
  }, */
];

const CancerScreening = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-full w-full">
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


          <div className="py-6 px-10">
            <h2 className="text-xl font-semibold mb-6">Cancer Screening</h2>

            <div className="flex flex-col gap-3 w-full bg-white rounded-2xl p-5 md:p-8">
              <h3 className="text-[18px] md:text-[36px] font-bold text-secondary">
                CANCER SCREENING MANAGEMENT OPTION
              </h3>
              <p className="text-gray2 mb-4 text-[16px] md:text-[22px]">
                Navigate your treatment journey with expert-guided support
              </p>

              <div className="grid grid-cols-1 gap-3 ">
                {screeningOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-xl custom-shadow gap-5 flex flex-col justify-between py-4 px-12 items-center"
                  >
                    <img
                      src={option.icon}
                      alt={`${option.title} Icon`}
                      className="size-12 md:size-15"
                    />
                    <div className="flex flex-col gap-2 text-center">
                      <h4 className="text-[22px] md:text-[38px] font-bold text-black">
                        {option.title}
                      </h4>
                      <p className="text-gray2 text-[14px] md:text-[20px]">{option.description}</p>
                    </div>
                    <div className="w-full">
                      <h1 className="font-bold text-left w-full md:text-[20px]">
                        Key Features:
                      </h1>
                      <ul className="list-disc list-inside text-left text-[14px] md:text-[20px]">
                        {option.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {option.isLink ? (
                      <a
                        href={option.link}
                        className="px-10 py-2 bg-primary text-white text-xl rounded hover:bg-[#5a7c94] transition"
                      >
                        Apply
                      </a>
                    ) : (
                      <button className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition">
                        Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
            </div>
          </div>
          <div className="h-16 bg-secondary"></div>

        </div>
      </div>
    </div>
  );
};

export default CancerScreening;
