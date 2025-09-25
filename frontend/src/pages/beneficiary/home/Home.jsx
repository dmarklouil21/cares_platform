import React, { useState } from "react";
import { Link } from "react-router-dom";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

const supportAgencies = [
  {
    name: "Vicente Sotto Memorial Medical Center (VSMMC)",
    description:
      "Public hospital offering free cancer diagnosis, specialist referrals, and outpatient treatment services.",
    logo: "/src/assets/images/patient/PatientHomePage/sotto.png",
    path: "/agencies/vsmmc",
  },
  {
    name: "Philippine Charity Sweepstakes Office (PCSO)",
    description:
      "Provides financial grants for cancer treatment, medications, and rehabilitation through medical assistance programs.",
    logo: "/src/assets/images/patient/PatientHomePage/pcso.png",
    path: "/agencies/pcso",
  },
  {
    name: "DOH Medical Assistance for Financially Incapacitated Patients (MAIFP)",
    description:
      "Government program covering hospitalization costs for indigent cancer patients in public hospitals.",
    logo: "/src/assets/images/patient/PatientHomePage/doh.png",
    path: "/agencies/doh",
  },
  {
    name: "Department of Social Welfare & Development (DSWD)",
    description:
      "Offers subsistence allowances, transportation aid, and psychosocial support for cancer patients.",
    logo: "/src/assets/images/patient/PatientHomePage/DSWD-LOGO.png",
    path: "/agencies/dswd",
  },
  {
    name: "City Hospitalization Assistance & Medicines Program (CHAMP)",
    description:
      "Local initiative providing free medicines and limited hospitalization subsidies for qualified residents.",
    logo: "/src/assets/images/patient/PatientHomePage/champ.png",
    path: "/agencies/champ",
  },
];

const NavigationGuide = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className=" w-full h-screen bg-gray overflow-auto">
      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* <div className="bg-white py-4 px-10 flex justify-between items-center ">
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
      </div> */}

      <div className="py-6 overflow-auto px-10">
        <h1 className="text-[16px] md:text-lg font-bold mb-6 uppercase">
          CANCER PATIENT NAVIGATION GUIDE
        </h1>

        <div className="bg-white rounded-lg p-10 mb-8 shadow-sm">
          <h2 className="text-[18px] md:text-2xl font-bold text-yellow mb-4">
            WHO IS THIS GUIDE FOR? 🤔
          </h2>
          <p className="mb-4 font-bold text-[16px] ">
            The "Patient Navigation Guide" is designed for
            <span className="text-orange-500 font-medium">
              {" "}
              cancer patients{" "}
            </span>
            and their
            <span className="text-orange-500 font-medium"> caregivers</span>.
            Its primary purpose is to provide guidance and support throughout
            the cancer journey, from diagnosis to recovery.
          </p>
          <p className="text-[15px]">
            The guide offers valuable information on various services and
            programs, helping patients navigate the complexities of treatment,
            managing side effects, and accessing support in areas such as
            emotional well-being, financial assistance, and rehabilitation.
          </p>
        </div>

        <div className="p-5 md:p-10 bg-white flex flex-col md:gap-7 rounded-lg">
          <h2 className="text-[18px] md:text-2xl font-bold mb-6">
            Government Support Agencies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 p-10 ">
            {supportAgencies.map((agency, index) => (
              <div
                key={index}
                className="agency-card bg-white rounded-lg custom-shadow"
              >
                <div className="p-5 text-center ">
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <img
                        src={agency.logo}
                        alt={`${agency.name} Logo`}
                        className={index === 3 ? "" : "rounded-full"}
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-center mb-1 text-[16px] ">
                    {agency.name}
                  </h3>
                  <p className="text-[16px] mb-4 ">{agency.description}</p>
                  <Link
                    to={agency.path}
                    className="learn-more-btn bg-primary text-white px-4 py-1 rounded text-sm inline-block"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Treatment Center</h2>

          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-2xl mb-4 underline">
              Vicente Sotto Memorial Medical Center (VSMMC)
            </h3>

            <div className="flex items-center gap-3 mb-6 b">
              <img
                src="/src/assets/images/patient/PatientHomePage/location.svg"
                alt="Location icon"
                className="size-6 md:size-8"
              />
              <span className="text-[12px] md:text-[16px]">
                B. Rodriguez St, Cebu City, 6000 Cebu
              </span>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-[15px] md:text-2xl mb-3 uppercase">
                FOR PATIENTS DETECTED WITH CANCER
              </h4>
              <div className="text-primary mb-2 font-bold text-[12px] md:text-[16px]">
                Outpatient Department (OPD)
              </div>
              <p className="mb-4 text-[13px] md:text-sm">
                Please approach the OPD Triage so that you can be referred to
                what department you are diagnosed with.
              </p>
              <div className="flex items-center gap-3 mb-1">
                <img
                  src="/src/assets/images/patient/PatientHomePage/calendar.svg"
                  alt="Calendar icon"
                  className="size-6 md:size-8"
                />
                <span className="text-[12px] md:text-sm">
                  Schedule: Monday - Friday | 8 AM - 4 PM
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold text-[15px] md:text-2xl mb-3 uppercase">
                FOR PATIENTS DIAGNOSED WITH CANCER
              </h4>
              <div className="text-primary mb-3 font-bold text-[12px] md:text-[16px]">
                VSMMC Cancer
              </div>
              <p className="mb-2 text-sm text-[12px] md:text-[14px]">
                Bring the following papers:
              </p>
              <ul className="list-disc ml-5 mb-4 text-[12px] md:text-sm">
                <li>Referral</li>
                <li>Medical Abstract/ Medical Certificate</li>
                <li>Doctor's Request</li>
              </ul>
              <div className="flex gap-3 items-center">
                <img
                  src="/src/assets/images/patient/PatientHomePage/calendar.svg"
                  alt="Calendar icon"
                  className="size-6 md:size-8"
                />
                <span className="text-[12px] md:text-sm">
                  Consultation Schedule: Monday - Friday | 8 AM - 4 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};

export default NavigationGuide;
