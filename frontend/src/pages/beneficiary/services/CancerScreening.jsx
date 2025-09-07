import { useEffect, useState } from "react";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

import api from "src/api/axiosInstance";

const CancerScreening = () => {
  const [isValidated, setIsValidated] = useState(false);

  const [showModal, setShowModal] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      link: "/Beneficiary/services/cancer-screening/screening-requirements-note",
      // isLink: isValidated,
    },
  ];

  useEffect(() => {
    const fetchScreeningData = async () => {
      try {
        // setLoading(true);
        const response = await api.get(
          "/beneficiary/individual-screening/list/"
        );
        const screenings = response.data;
        if (screenings.length > 0) {
          const latestScreening = screenings[screenings.length - 1];
          setIsValidated(latestScreening.status === "Approve" ? true : false);
        }
      } catch (error) {
        console.error("Error fetching screening data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningData();
  }, []);

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
            <h2 className="text-xl font-semibold mb-6">Cancer Screenings</h2>

            <div className="flex flex-col gap-3 w-full bg-white rounded-2xl p-5 md:p-8">
              <h3 className="text-[18px] md:text-2xl font-bold text-secondary">
                CANCER SCREENING MANAGEMENT OPTION
              </h3>
              <p className="text-gray2 mb-4 text-[16px] ">
                Navigate your treatment journey with expert-guided support
              </p>

              <div className="grid grid-cols-1 gap-3">
                {screeningOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-xl custom-shadow gap-5 flex flex-col justify-between py-4 px-12 items-center"
                  >
                    <img
                      src={option.icon}
                      alt={`${option.title} Icon`}
                      className="size-12 "
                    />
                    <div className="flex flex-col gap-2 text-center">
                      <h4 className="text-2xl font-bold text-black">
                        {option.title}
                      </h4>
                      <p className="text-gray2 text-sm">{option.description}</p>
                    </div>
                    <div className="w-full">
                      <h1 className="font-bold text-left w-full ">
                        Key Features:
                      </h1>
                      <ul className="list-disc list-inside text-left ">
                        {option.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* <button 
                      className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                      type="button"
                      onClick={() => setShowModal(true)}
                    >
                      Apply
                    </button> */}

                    {/* {!isValidated ? (
                        <a
                          href="/Beneficiary/services/cancer-screening/pre-screening-form-note"
                          className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                        >
                          Apply
                        </a>
                      ) : (
                        <a
                          href="/Beneficiary/services/cancer-screening/screening-requirements-note"
                          className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                        >
                          Apply
                        </a>
                      )} */}
                      <a
                        href="/Beneficiary/services/cancer-screening/screening-requirements-note"
                        className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                      >
                        Apply
                      </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 bg-secondary"></div>
      </div>
    </div>
  );
};

export default CancerScreening;
