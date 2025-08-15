import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/services/authService";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCancerScreeningOpen, setIsCancerScreeningOpen] = useState(false);

  const nav = [
    {
      name: "Dashboard",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/Admin",
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
      name: "User Management",
      icon: "/src/assets/images/navigation/admin/usermanagementicon.svg",
      path: "/Admin/UserManagement",
      arrow: "",
    },
  ];

  const patientSubNav = [
    {
      name: "Patient Master List",
      path: "/Admin/patient/AdminPatientMasterList",
    },

    { name: "Pre-Enrollment", path: "/Admin/patient/AdminPreEnrollment" },
    { name: "Cancer Management", path: "/Admin/CancerManagement" },
  ];

  const cancerscreeningSubNav = [
    /* {
      name: "Screening Request",
      path: "/Admin/cancerscreening/AdminScreeningRequest",
    }, */
    {
      name: "Individual Screening",
      path: "/Admin/cancerscreening/AdminIndividualScreening",
    },
    { name: "Mass Screening", path: "/Admin/MassScreening" },
  ];

  const sampleSubNav = [
    { name: "Sample 1", path: "/Admin/Sample1" },
    { name: "Sample 2", path: "/Admin/Sample2" },
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

    const activePatient = patientSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activePatient) {
      setActiveNav("Patient");
      setIsPatientOpen(true);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
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
      return;
    }

    const activeMainNav = nav.find((item) => item.path && path === item.path);
    if (activeMainNav) {
      setActiveNav(activeMainNav.name);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = debounce((path) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    navigate(path);
  }, 300);

  const togglePatient = () => {
    if (isTransitioning) return;
    setIsPatientOpen((prev) => !prev);
    setIsSampleOpen(false);
    setIsCancerScreeningOpen(false);
    setActiveNav("Patient");
  };

  const toggleSample = () => {
    if (isTransitioning) return;
    setIsSampleOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsCancerScreeningOpen(false);
    setActiveNav("Sample");
  };

  const toggleCancerScreening = () => {
    if (isTransitioning) return;
    setIsCancerScreeningOpen((prev) => !prev);
    setIsPatientOpen(false);
    setIsSampleOpen(false);
    setActiveNav("Cancer Screening");
  };

  const handleNavClick = (name) => {
    if (isTransitioning) return;

    if (name === "Patient") {
      togglePatient();
    } else if (name === "Sample") {
      toggleSample();
    } else if (name === "Cancer Screening") {
      toggleCancerScreening();
    } else {
      setActiveNav(name);
      setIsPatientOpen(false);
      setIsSampleOpen(false);
      setIsCancerScreeningOpen(false);
      const targetPath = nav.find((item) => item.name === name)?.path;
      if (targetPath) handleNavigation(targetPath);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-start gap-20 px-3 py-7 bg-primary w-[30%]">
      <div className="flex justify-start items-end gap-3">
        <img
          src="/images/logo_white_text.png"
          className="h-15 w-15"
          alt="Rafi Logo"
        />
        <h1 className="font-bold text-xl text-white">
          CARES <br />
          Platform
        </h1>
      </div>
      <div className="h-[80%] flex flex-col justify-between  overflow-auto">
        <ul className="flex flex-col overflow-auto custom-scrollbar  flex-1">
          {nav.map((item, index) => {
            const isActive = activeNav === item.name;
            const isExpandable =
              item.name === "Patient" ||
              item.name === "Sample" ||
              item.name === "Cancer Screening";
            const isOpen =
              item.name === "Patient"
                ? isPatientOpen
                : item.name === "Sample"
                ? isSampleOpen
                : item.name === "Cancer Screening"
                ? isCancerScreeningOpen
                : false;
            const subNav =
              item.name === "Patient"
                ? patientSubNav
                : item.name === "Sample"
                ? sampleSubNav
                : item.name === "Cancer Screening"
                ? cancerscreeningSubNav
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
                          location.pathname === subItem.path
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
        <button
          className="bg-white/5 py-1 flex items-center justify-between gap-5 px-5 rounded-md hover:bg-white/50 cursor-pointer"
          onClick={() => {
            //usba lang
            // localStorage.clear();
            // sessionStorage.clear();
            // navigate("/Login");
            logout();
            navigate(0);
          }}
        >
          <h1 className="text-white">Logout</h1>
          <img src="/images/logout.svg" alt="Logout icon" className="h-7" />
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
