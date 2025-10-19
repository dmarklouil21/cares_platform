import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScanLine, ClipboardCheck } from "lucide-react";
import { logout } from "src/services/authService";

const RhuSidebar = ({ isSidebarOpen = false, setIsSidebarOpen = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isTreatmentOpen, setIsTreatmentOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAwarenessOpen, setIsAwarenessOpen] = useState(false);
  const [isRhuOpen, setIsRhuOpen] = useState(false);
  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 🚫 No active state when on /rhu/profile
  const isProfileRoute = location.pathname === "/private/profile";

  const nav = [
    {
      name: "Dashboard",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/private",
      arrow: "",
    },
    {
      name: "Cancer Awareness",
      icon: "/src/assets/images/navigation/patient/cancerwarenessicon.svg",
      path: "/private/cancer-awareness",
      arrow: "",
    },
    {
      name: "Patient",
      icon: "/src/assets/images/navigation/rhu/rhu.svg",
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
      name: "Services",
      icon: "/src/assets/images/navigation/patient/services.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Applications",
      icon: "/src/assets/images/navigation/admin/cancerscreeningicon.svg",
      // path: "/private/application",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Pychosocial Activities",
      icon: "/src/assets/images/navigation/admin/PychosocialSupport.svg",
      path: "/private/PychosocialSupport",
      arrow: "",
    },
  ];

  const treatmentSubNav = [
    {
      name: "Pre Cancerous",
      path: "/private/treatment-assistance/pre-cancerous",
    },
    // {
    //   name: "Post Treatment",
    //   path: "/admin/treatment-assistance/post-treatment",
    // },
  ];

  const servicesSubNav = [
    { name: "Cancer Screening", path: "/private/services/cancer-screening" },
  ];

  const patientSubNav = [
    { name: "Patient List", path: "/private/patients" },
    // { name: "Mass Screening", path: "/private/patients/mass-screening" },
  ];

  const applicationSubNav = [
    {
      name: "Mass Screening",
      path: "/private/application/mass-screening",
    }
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

    // If on /rhu/profile, clear any active states and keep groups closed
    if (isProfileRoute) {
      setActiveNav("");
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
      setIsPatientOpen(false);
      setIsTreatmentOpen(false);
      setIsApplicationOpen(false);
      return;
    }

    const activeTreatment = treatmentSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeTreatment) {
      setActiveNav("Treatment Assistance");
      setIsTreatmentOpen(true);
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
      setIsPatientOpen(false);
      setIsApplicationOpen(false);
      return;
    }

    // services active check
    const activeService = servicesSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeService) {
      setActiveNav("Services");
      setIsServicesOpen(true);
      setIsAwarenessOpen(false);
      setIsPatientOpen(false);
      setIsApplicationOpen(false);
      return;
    }

    // patient active check
    const activePatient = patientSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activePatient) {
      setActiveNav("Patient");
      setIsPatientOpen(true);
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
      setIsApplicationOpen(false);
      return;
    }

    const activeApplication = applicationSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeApplication) {
      setActiveNav("Applications");
      setIsApplicationOpen(true);
      setIsServicesOpen(false);
      setIsPatientOpen(false);
      setIsAwarenessOpen(false);
      return;
    }

    // main nav exact matches
    const activeMainNav = nav.find((item) => item.path && path === item.path);
    if (activeMainNav) {
      setActiveNav(activeMainNav.name);
      setIsTreatmentOpen(false);
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
      setIsPatientOpen(false);
      setIsApplicationOpen(false);
    }
  }, [location.pathname, isProfileRoute]);

  const handleNavigation = debounce((path) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    navigate(path);
    setIsSidebarOpen(false);
  }, 300);

  const toggleTreatment = () => {
    if (isTransitioning) return;
    setIsTreatmentOpen((prev) => !prev);
    setIsServicesOpen(false);
    setIsPatientOpen(false);
    setIsAwarenessOpen(false);
    setIsApplicationOpen(false);
    if (!isProfileRoute) setActiveNav("Treatment Assistance");
  };

  const toggleServices = () => {
    if (isTransitioning) return;
    setIsServicesOpen((prev) => !prev);
    setIsTreatmentOpen(false);
    setIsAwarenessOpen(false);
    setIsPatientOpen(false);
    setIsApplicationOpen(false);
    // Don't mark active while on /rhu/profile
    if (!isProfileRoute) setActiveNav("Services");
  };

  const togglePatient = () => {
    if (isTransitioning) return;
    setIsPatientOpen((prev) => !prev);
    setIsServicesOpen(false);
    setIsAwarenessOpen(false);
    setIsTreatmentOpen(false);
    setIsApplicationOpen(false);
    // Don't mark active while on /rhu/profile
    if (!isProfileRoute) setActiveNav("Patient");
  };

  const toggleApplications = () => {
    if (isTransitioning) return;
    setIsApplicationOpen((prev) => !prev);
    setIsServicesOpen(false);
    setIsAwarenessOpen(false);
    setIsTreatmentOpen(false);
    setIsPatientOpen(false);
    if (!isProfileRoute) setActiveNav("Applications");
  };

  const handleNavClick = (name) => {
    if (isTransitioning) return;

    if (name === "Services") {
      toggleServices();
    } else if (name === "Patient") {
      togglePatient();
    } else if (name === "Treatment Assistance") {
      toggleTreatment();
    } else if (name === "Applications") {
      toggleApplications();
    } else {
      // Only set active if not on /rhu/profile
      if (!isProfileRoute) {
        setActiveNav(name);
        setIsTreatmentOpen(false);
        setIsServicesOpen(false);
        setIsAwarenessOpen(false);
        setIsPatientOpen(false);
        setIsApplicationOpen(false);
      }
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
            // 🔒 Never show as active on /rhu/profile
            const isActive = !isProfileRoute && activeNav === item.name;

            const isExpandable =
              item.name === "Services" || item.name === "Patient" || item.name === "Treatment Assistance" || item.name === "Applications";

            const isOpen =
              item.name === "Services"
                ? isServicesOpen
                : item.name === "Patient"
                ? isPatientOpen
                : item.name === "Treatment Assistance"
                ? isTreatmentOpen 
                : item.name === "Applications"
                ? isApplicationOpen
                : false;

            const subNav =
              item.name === "Services"
                ? servicesSubNav
                : item.name === "Patient"
                ? patientSubNav
                : item.name === "Treatment Assistance"
                ? treatmentSubNav 
                : item.name === "Applications"
                ? applicationSubNav
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
                    {subNav.map((subItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={`rounded-lg px-5 hover:font-bold hover:text-primary block py-2 hover:bg-gray ${
                          // 🔒 Never highlight subnav on /rhu/profile
                          !isProfileRoute && location.pathname === subItem.path
                            ? "bg-gray text-primary font-bold"
                            : "text-white"
                        } ${isTransitioning ? "pointer-events-none" : ""}`}
                      >
                        <button
                          onClick={() => handleNavigation(subItem.path)}
                          className="w-full text-left cursor-pointer"
                        >
                          {subItem.name}
                        </button>
                      </li>
                    ))}
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

export default RhuSidebar;
