import React, { useState } from "react";
import { href, Link } from "react-router-dom";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

const cancerTreatmentOptions = [
  {
    title: "Radiation Therapy",
    icon: "/src/assets/images/patient/services/cancermanagement/radiation.png",
    // href: "/Beneficiary/services/cancer-management-options/radiotherapy",
    href: "/Beneficiary/services/cancer-management-options/radiotherapy/form-note",
    description:
      "Radiotherapy uses high-energy radiation (like X-rays) to destroy cancer cells and shrink tumors. It targets a specific area to minimize damage to surrounding healthy tissue. Often used before or after surgery or with chemotherapy.",
  },
  {
    title: "Radioactive Iodine Therapy",
    icon: "/src/assets/images/patient/services/cancermanagement/radioactive.png",
    href: "/Beneficiary/services/cancer-management-options/radioactive",
    description:
      "This therapy involves taking radioactive iodine (I-131) to destroy thyroid cancer cells. The iodine collects in thyroid tissues, making it highly effective and specific for thyroid cancer treatment.",
  },
  {
    title: "Brachytherapy",
    icon: "/src/assets/images/patient/services/cancermanagement/brachy.png",
    href: "/Beneficiary/services/cancer-management-options/brachytherapy",
    description:
      "Brachytherapy delivers radiation directly inside or next to the tumor using implants or radioactive seeds. It allows for a high dose to the cancer with minimal effect on nearby tissues.",
  },
  {
    title: "Chemotherapy",
    icon: "/src/assets/images/patient/services/cancermanagement/chemo.png",
    href: "/Beneficiary/services/cancer-management-options/chemotherapy",
    description:
      "Chemotherapy uses drugs to destroy cancer cells or slow their growth. It may be used alone or with other treatments like surgery and radiation. It often involves cycles of treatment and recovery.",
  },
  {
    title: "Surgery",
    icon: "/src/assets/images/patient/services/cancermanagement/surgery.png",
    href: "/Beneficiary/services/cancer-management-options/surgery",
    description:
      "Surgical procedures remove cancerous tumors and affected tissues. It may be curative, preventive, or part of diagnosis and staging. Recovery time depends on cancer type and surgical complexity.",
  },
  {
    title: "Pre-Cancerous Medications",
    icon: "/src/assets/images/patient/services/cancermanagement/medication.png",
    href: "/Beneficiary/services/cancer-management-options/precancerousmeds",
    description:
      "These medications are used to manage or prevent the development of cancer in high-risk individuals, especially with genetic predisposition or early signs. Includes hormone blockers and immunopreventive drugs.",
  },
  {
    title: "Post-Treatment Laboratory Tests",
    icon: "/src/assets/images/patient/services/cancermanagement/laboratory.png",
    href: "",
    description:
      "Post-treatment lab tests help monitor a patient’s recovery, detect recurrence, and manage long-term effects of treatment. These may include blood counts, tumor markers, and imaging.",
  },
];

const CancerManagementPage = () => {
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

      <div className="py-6 px-10 bg-gray">
        <h2 className="text-xl font-semibold mb-6">
          Cancer Management & Treatment Assistance
        </h2>

        <div className="flex flex-col gap-7 w-full bg-white rounded-2xl py-10 px-8">
          <h3 className="text-2xl font-bold text-secondary">
            CANCER TREATMENT OPTIONS
          </h3>
          <p className="text-gray2  mb-4">
            Explore evidence-based therapies and supportive care at EJACC
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cancerTreatmentOptions.map((option, index) => (
              <div
                key={index}
                className="rounded-md custom-shadow h-72 flex flex-col justify-between p-4 items-center"
              >
                <img
                  src={option.icon}
                  alt={`${option.title} Icon`}
                  className="h-8 w-8"
                />
                <h4 className="text-lg font-bold text-gray-800 text-center">
                  {option.title}
                </h4>
                <p className="text-gray2 text-center text-sm">
                  {option.description}
                </p>

                {!isValidated ? (
                  <a
                    href={option.href}
                    className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                  >
                    Apply
                  </a>
                ) : (
                  <a
                    href="/Beneficiary/services/cancer-management-options/radiotherapy/radio-therapy-well-being-tool"
                    className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                  >
                    Apply
                  </a>
                )}
                {/* <Link
                  to={option.href}
                  state={option.title}
                  className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                >
                  Apply
                </Link> */}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};

export default CancerManagementPage;
