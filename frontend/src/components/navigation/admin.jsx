import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/services/authService";

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [isCancerScreeningOpen, setIsCancerScreeningOpen] = useState(false);
  const [isTreatmentOpen, setIsTreatmentOpen] = useState(false);
  const [isSurvivorshipOpen, setIsSurvivorshipOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 👇 New: suppress highlights while on /admin/profile
  const isProfilePage = location.pathname.startsWith("/admin/profile");

  const nav = [
    {
      name: "Dashboard",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/admin",
      arrow: "",
    },
    {
      name: "Patient",
      icon: "/src/assets/images/navigation/patient/cancerwarenessicon.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Cancer Screening",
      icon: "/src/assets/images/navigation/admin/cancerscreeningicon.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Treatment Assistance",
      icon: "/src/assets/images/navigation/admin/treatment.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Survivorship",
      icon: "/src/assets/images/navigation/admin/survivorship.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Cancer Management",
      icon: "/src/assets/images/navigation/admin/cancermanagement.svg",
      path: "/admin/cancer-management",
      arrow: "",
    },
    {
      name: "Psychosocial Support ",
      icon: "/src/assets/images/navigation/admin/PychosocialSupport.svg",
      path: "/admin/PychosocialSupport",
      arrow: "",
    },
    {
      name: "User Management",
      icon: "/src/assets/images/navigation/admin/usermanagementicon.svg",
      path: "/admin/user-management",
      arrow: "",
    },
  ];

  const patientSubNav = [
    { name: "Pre-Enrollment", path: "/admin/patient/pre-enrollment" },
    { name: "Patient Master List", path: "/admin/patient/master-list" },
  ];

  const cancerscreeningSubNav = [
    { name: "Individual Screening", path: "/admin/cancer-screening" },
    { name: "Mass Screening", path: "/admin/cancer-screening/mass-screening" },
  ];

  const treatmentSubNav = [
    {
      name: "Pre Cancerous",
      path: "/admin/treatment-assistance/pre-cancerous",
    },
    {
      name: "Post Treatment",
      path: "/admin/treatment-assistance/post-treatment",
    },
  ];

  const survivorshipSubNav = [
    { name: "Home visit", path: "/admin/survivorship" },
    { name: "Hormonal Replacement", path: "/admin/survivorship/hormonal-replacement" },
  ];

  const sampleSubNav = [
    { name: "Sample 1", path: "/admin/Sample1" },
    { name: "Sample 2", path: "/admin/Sample2" },
  ];

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  useEffect(() => {
    const path = location.pathname;
    setIsTransitioning(false);

    // 🛑 While on /admin/profile, clear all active/open states and stop
    if (path.startsWith("/admin/profile")) {
      setActiveNav("");
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      setIsTreatmentOpen(false);
      setIsSurvivorshipOpen(false);
      return;
    }

    const activePatient = patientSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activePatient) {
      setActiveNav("Patient");
      setIsPatientOpen(true);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      setIsTreatmentOpen(false);
      setIsSurvivorshipOpen(false);
      return;
    }

    const activeSample = sampleSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeSample) {
      setActiveNav("Sample");
      setIsSampleOpen(true);
      setIsPatientOpen(false);
      setIsCancerScreeningOpen(false);
      setIsTreatmentOpen(false);
      setIsSurvivorshipOpen(false);
      return;
    }

    const activeCancerScreening = cancerscreeningSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeCancerScreening) {
      setActiveNav("Cancer Screening");
      setIsCancerScreeningOpen(true);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsTreatmentOpen(false);
      setIsSurvivorshipOpen(false);
      return;
    }

    const activeTreatment = treatmentSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeTreatment) {
      setActiveNav("Treatment Assistance");
      setIsTreatmentOpen(true);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      setIsSurvivorshipOpen(false);
      return;
    }

    const activeSurvivorship = survivorshipSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeSurvivorship) {
      setActiveNav("Survivorship");
      setIsSurvivorshipOpen(true);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      setIsTreatmentOpen(false);
      return;
    }

    const activeMainNav = nav.find((item) => item.path && path === item.path);
    if (activeMainNav) {
      setActiveNav(activeMainNav.name);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      setIsTreatmentOpen(false);
      setIsSurvivorshipOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = debounce((path) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    navigate(path);
    setIsSidebarOpen(false);
  }, 300);

  const closeAll = () => {
    setIsPatientOpen(false);
    setIsSampleOpen(false);
    setIsCancerScreeningOpen(false);
    setIsTreatmentOpen(false);
    setIsSurvivorshipOpen(false);
  };

  const togglePatient = () => {
    if (isTransitioning) return;
    setIsPatientOpen((prev) => !prev);
    setIsSampleOpen(false);
    setIsCancerScreeningOpen(false);
    setIsTreatmentOpen(false);
    setIsSurvivorshipOpen(false);
    setActiveNav("Patient");
  };

  const toggleSample = () => {
    if (isTransitioning) return;
    setIsSampleOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsCancerScreeningOpen(false);
    setIsTreatmentOpen(false);
    setIsSurvivorshipOpen(false);
    setActiveNav("Sample");
  };

  const toggleCancerScreening = () => {
    if (isTransitioning) return;
    setIsCancerScreeningOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsSampleOpen(false);
    setIsTreatmentOpen(false);
    setIsSurvivorshipOpen(false);
    setActiveNav("Cancer Screening");
  };

  const toggleTreatment = () => {
    if (isTransitioning) return;
    setIsTreatmentOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsSampleOpen(false);
    setIsCancerScreeningOpen(false);
    setIsSurvivorshipOpen(false);
    setActiveNav("Treatment Assistance");
  };

  const toggleSurvivorship = () => {
    if (isTransitioning) return;
    setIsSurvivorshipOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsSampleOpen(false);
    setIsCancerScreeningOpen(false);
    setIsTreatmentOpen(false);
    setActiveNav("Survivorship");
  };

  const handleNavClick = (name) => {
    if (isTransitioning) return;

    if (name === "Patient") togglePatient();
    else if (name === "Sample") toggleSample();
    else if (name === "Cancer Screening") toggleCancerScreening();
    else if (name === "Treatment Assistance") toggleTreatment();
    else if (name === "Survivorship") toggleSurvivorship();
    else {
      setActiveNav(name);
      closeAll();
      const targetPath = nav.find((item) => item.name === name)?.path;
      if (targetPath) {
        handleNavigation(targetPath);
        setIsSidebarOpen(false); // 👈 close sidebar for main nav link
      }
    }
  };

  return (
    <div
      className={`fixed md:static top-0 left-0 h-screen w-[70%] md:w-[30%] bg-primary px-3 py-7 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex justify-between items-center gap-3 text-white">
        <div className="flex items-center justify-center">
          <img
            src="/images/logo_white_text.png"
            className="h-15 w-15"
            alt="Rafi Logo"
          />
          <h1 className="font-bold text-xl text-white ml-3">
            CARES <br /> Platform
          </h1>
        </div>

        <img
          className="md:hidden cursor-pointer size-[30px]"
          src="/images/close-svgrepo-com.svg"
          alt="Close"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="h-[80%] flex flex-col justify-between overflow-auto">
        <ul className="flex flex-col overflow-auto custom-scrollbar flex-1">
          {nav.map((item, index) => {
            // 🚫 No active state while on /admin/profile
            const isActive = !isProfilePage && activeNav === item.name;

            const isExpandable =
              item.name === "Patient" ||
              item.name === "Sample" ||
              item.name === "Cancer Screening" ||
              item.name === "Treatment Assistance" ||
              item.name === "Survivorship";

            const isOpen =
              item.name === "Patient"
                ? isPatientOpen
                : item.name === "Sample"
                ? isSampleOpen
                : item.name === "Cancer Screening"
                ? isCancerScreeningOpen
                : item.name === "Treatment Assistance"
                ? isTreatmentOpen
                : item.name === "Survivorship"
                ? isSurvivorshipOpen
                : false;

            const subNav =
              item.name === "Patient"
                ? patientSubNav
                : item.name === "Sample"
                ? sampleSubNav
                : item.name === "Cancer Screening"
                ? cancerscreeningSubNav
                : item.name === "Treatment Assistance"
                ? treatmentSubNav
                : item.name === "Survivorship"
                ? survivorshipSubNav
                : [];

            return (
              <li key={index} className="flex flex-col gap-2">
                <div
                  onClick={() => handleNavClick(item.name)}
                  className={`group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray cursor-pointer ${
                    isActive ? "bg-gray" : ""
                  } ${isTransitioning ? "opacity-70 pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.icon}
                      alt={`${item.name} icon`}
                      className={`w-5 h-5 ${
                        isActive
                          ? "custom-blue-filter"
                          : "invert brightness-0 group-hover:brightness-100 group-hover:invert-0"
                      }`}
                    />
                    {item.path ? (
                      <Link
                        to={item.path}
                        className={`${
                          isActive
                            ? "text-primary font-bold"
                            : "text-white font-medium group-hover:font-bold group-hover:text-primary"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.name);
                        }}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span
                        className={`${
                          isActive
                            ? "text-primary font-bold"
                            : "text-white font-medium group-hover:font-bold group-hover:text-primary"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>

                  {item.arrow && (
                    <img
                      src={item.arrow}
                      alt="Arrow icon"
                      className={`w-4 h-4 transition-transform duration-300 invert brightness-0 group-hover:brightness-100 group-hover:invert-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {isExpandable && isOpen && (
                  <ul className="pl-5 flex flex-col gap-2">
                    {subNav.map((subItem, subIndex) => {
                      // 🚫 No sub-item highlight while on /admin/profile
                      const subActive =
                        !isProfilePage && location.pathname === subItem.path;
                      return (
                        <li
                          key={subIndex}
                          className={`rounded-lg px-5 hover:font-bold hover:text-primary block py-2 hover:bg-gray ${
                            subActive
                              ? "bg-gray text-primary font-bold"
                              : "text-white"
                          } ${isTransitioning ? "pointer-events-none" : ""}`}
                        >
                          <button
                            onClick={() => {
                              handleNavigation(subItem.path);
                              setIsSidebarOpen(false);
                            }}
                            className="w-full text-left cursor-pointer"
                          >
                            {subItem.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* <button
          className="bg-white/5 py-1 flex items-center justify-between gap-5 px-5 rounded-md hover:bg-white/50 cursor-pointer"
          onClick={() => {
            logout();
            navigate(0);
          }}
        >
          <h1 className="text-white">Logout</h1>
          <img src="/images/logout.svg" alt="Logout icon" className="h-7" />
        </button> */}
      </div>
    </div>
  );
};

export default AdminSidebar;
