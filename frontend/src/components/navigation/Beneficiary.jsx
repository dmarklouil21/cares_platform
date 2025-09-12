import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScanLine, ClipboardCheck } from "lucide-react";
import { logout } from "src/services/authService";

const BeneficiarySidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nav = [
    {
      name: "Home",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/beneficiary",
      arrow: "",
    },
    {
      name: "Cancer Awareness",
      icon: "/src/assets/images/navigation/patient/cancerwarenessicon.svg",
      path: "/beneficiary/cancer-awareness",
      arrow: "",
    },
    {
      name: "Services",
      icon: "/src/assets/images/navigation/patient/services.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Applications",
      icon: "/src/assets/images/navigation/admin/patient.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
  ];

  const servicesSubNav = [
    {
      name: "Cancer Screening",
      path: "/beneficiary/services/cancer-screening",
    },
    {
      name: "Cancer Management",
      path: "/beneficiary/services/cancer-management",
    },
    { name: "Survivorship", path: "/beneficiary/services/survivorship" },
  ];

  const applicationSubNav = [
    {
      name: "Individual Screening",
      path: "/beneficiary/applications/individual-screening",
    },
    {
      name: "Cancer Management",
      path: "/beneficiary/applications/cancer-treatment",
    },
    {
      name: "Pre Cancerous",
      path: "/beneficiary/applications/precancerous",
    },
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

    const activeService = servicesSubNav.find((item) =>
      path.startsWith(item.path)
    );
    if (activeService) {
      setActiveNav("Services");
      setIsServicesOpen(true);
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
      return;
    }

    const activeMainNav = nav.find((item) => item.path && path === item.path);
    if (activeMainNav) {
      setActiveNav(activeMainNav.name);
      setIsServicesOpen(false);
      setIsApplicationOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = debounce((path) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    navigate(path);
  }, 300);

  const toggleServices = () => {
    if (isTransitioning) return;
    setIsServicesOpen((prev) => !prev);
    setIsApplicationOpen(false);
    setActiveNav("Services");
  };

  const toggleApplications = () => {
    if (isTransitioning) return;
    setIsApplicationOpen((prev) => !prev);
    setIsServicesOpen(false);
    setActiveNav("Applications");
  };

  const handleNavClick = (name) => {
    if (isTransitioning) return;

    if (name === "Services") {
      toggleServices();
    } else if (name === "Applications") {
      toggleApplications();
    } else {
      setActiveNav(name);
      setIsServicesOpen(false);
      setIsApplicationOpen(false);
      const targetPath = nav.find((item) => item.name === name)?.path;
      if (targetPath) handleNavigation(targetPath);
    }
  };

  return (
    <div
      className={`fixed md:static top-0 left-0 h-screen w-[70%] md:w-[30%] bg-primary px-3 py-7 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className=" flex justify-between  items-center gap-3 text-white">
        <div className="flex items-center justify-center  ">
          <img
            src="/images/logo_white_text.png"
            className="h-15 w-15"
            alt="Rafi Logo"
          />
          <h1 className="font-bold text-xl text-white ml-3">
            CARES <br />
            Platform
          </h1>
        </div>

        <img
          className="md:hidden  cursor-pointer  size-[30px]"
          src="/images/close-svgrepo-com.svg"
          alt="Close"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="h-[80%] flex flex-col justify-between overflow-auto">
        <ul className="flex flex-col overflow-auto custom-scrollbar flex-1">
          {nav.map((item, index) => {
            const isActive = activeNav === item.name;
            const isExpandable =
              item.name === "Services" || item.name === "Applications";
            const isOpen =
              item.name === "Services" ? isServicesOpen : isApplicationOpen;
            const subNav =
              item.name === "Services" ? servicesSubNav : applicationSubNav;

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

export default BeneficiarySidebar;
