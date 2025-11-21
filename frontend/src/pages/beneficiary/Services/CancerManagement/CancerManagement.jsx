import React, { use, useState, useEffect } from "react";
import { href, Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import BeneficiarySidebar from "src/components/navigation/Beneficiary";

import api from "src/api/axiosInstance";

import NotificationModal from "src/components/Modal/NotificationModal";

const cancerTreatmentOptions = [
  {
    title: "Radiation Therapy",
    serviceType: "Radiotherapy",
    icon: "/assets/images/patient/services/cancermanagement/radiation.png",
    href: "/beneficiary/services/cancer-management/apply/note",
    description:
      "Radiotherapy uses high-energy radiation (like X-rays) to destroy cancer cells and shrink tumors. It targets a specific area to minimize damage to surrounding healthy tissue. Often used before or after surgery or with chemotherapy.",
  },
  {
    title: "Radioactive Iodine Therapy",
    serviceType: "Radioactive Therapy",
    icon: "/assets/images/patient/services/cancermanagement/radioactive.png",
    href: "/beneficiary/services/cancer-management/apply/note",
    description:
      "This therapy involves taking radioactive iodine (I-131) to destroy thyroid cancer cells. The iodine collects in thyroid tissues, making it highly effective and specific for thyroid cancer treatment.",
  },
  {
    title: "Brachytherapy",
    serviceType: "Brachytherapy",
    icon: "/assets/images/patient/services/cancermanagement/brachy.png",
    href: "/beneficiary/services/cancer-management/apply/note",
    description:
      "Brachytherapy delivers radiation directly inside or next to the tumor using implants or radioactive seeds. It allows for a high dose to the cancer with minimal effect on nearby tissues.",
  },
  {
    title: "Chemotherapy",
    serviceType: "Chemotherapy",
    icon: "/assets/images/patient/services/cancermanagement/chemo.png",
    href: "/beneficiary/services/cancer-management/apply/note",
    description:
      "Chemotherapy uses drugs to destroy cancer cells or slow their growth. It may be used alone or with other treatments like surgery and radiation. It often involves cycles of treatment and recovery.",
  },
  {
    title: "Surgery",
    serviceType: "Surgery",
    icon: "/assets/images/patient/services/cancermanagement/surgery.png",
    href: "/beneficiary/services/cancer-management/apply/note",
    description:
      "Surgical procedures remove cancerous tumors and affected tissues. It may be curative, preventive, or part of diagnosis and staging. Recovery time depends on cancer type and surgical complexity.",
  },
  {
    title: "Pre-Cancerous Medications",
    icon: "/assets/images/patient/services/cancermanagement/medication.png",
    href: "/beneficiary/services/cancer-management/apply/precancerous-meds",
    description:
      "These medications are used to manage or prevent the development of cancer in high-risk individuals, especially with genetic predisposition or early signs. Includes hormone blockers and immunopreventive drugs.",
  },
  {
    title: "Post-Treatment Laboratory Tests",
    icon: "/assets/images/patient/services/cancermanagement/laboratory.png",
    href: "/beneficiary/services/cancer-management/apply/post-treatment",
    description:
      "Post-treatment lab tests help monitor a patient’s recovery, detect recurrence, and manage long-term effects of treatment. These may include blood counts, tumor markers, and imaging.",
  },
];

const CancerManagementPage = () => {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isApplicationOngoing, setIsApplicationOngoing] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/beneficiary/cancer-treatment/details/`
        );
        setIsApplicationOngoing(data.status !== "Completed");
        console.log("Treatment Status: ", data.status);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, []);

  // console.log("User: ");

  const handleApply = (serviceType, link) => {
    const relatedServices = [
      "Radiotherapy",
      "Radioactive Therapy",
      "Brachytherapy",
      "Chemotherapy",
      "Surgery",
    ];
    if (relatedServices.includes(serviceType) && isApplicationOngoing) {
      setModalInfo({
        type: "info",
        title: "Invalid Application",
        message:
          "You can only request for a treatment service one at a time. Complete your ongoing application or wait for it's feedback before submitting another.",
      });
      setShowModal(true);
      return;
    }

    navigate(link, { state: serviceType });
  };

  return (
    <>
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <div className="w-full h-screen bg-gray overflow-auto">
        <div className="py-6 p-5 md:px-10 bg-gray">
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

                  {/* {!isValidated ? (
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
                  )} */}
                  {/* <a
                    href="/Beneficiary/services/cancer-management-options/radiotherapy/form-note"
                    className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                  >
                    Apply
                  </a> */}
                  <button
                    onClick={() => handleApply(option.serviceType, option.href)}
                    // to={option.href}
                    // state={option.serviceType}
                    className="px-7 py-1 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};

export default CancerManagementPage;
