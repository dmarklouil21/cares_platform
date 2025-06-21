import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const PatientSidebar = () => {
  const location = useLocation();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAwarenessOpen, setIsAwarenessOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  const nav = [
    {
      name: "Home",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/Admin",
      arrow: "",
    },
    {
      name: "Cancer Awareness",
      icon: "/src/assets/images/navigation/patient/cancerwarenessicon.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
    {
      name: "Services",
      icon: "/src/assets/images/navigation/patient/services.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
  ];

  const servicesSubNav = [
    { name: "Cancer Screening", path: "/cancer-screening" },
    { name: "Cancer Management", path: "/cancer-management" },
    { name: "Survivorship", path: "/survivorship" },
  ];

  const awarenessSubNav = [
    { name: "Sample", path: "/awareness-sample1" },
    { name: "Sample", path: "/awareness-sample2" },
  ];

  const toggleServices = () => {
    // Close if already open, otherwise open
    setIsServicesOpen((prev) => !prev);
    // Close the other subnav when opening this one
    if (!isServicesOpen) {
      setIsAwarenessOpen(false);
    }
  };

  const toggleAwareness = () => {
    // Close if already open, otherwise open
    setIsAwarenessOpen((prev) => !prev);
    // Close the other subnav when opening this one
    if (!isAwarenessOpen) {
      setIsServicesOpen(false);
    }
  };

  // Update active nav based on path
  useEffect(() => {
    const path = location.pathname;

    // Check if any subnav is active
    const activeSubNav = [...servicesSubNav, ...awarenessSubNav].find(
      (item) => path.startsWith(item.path) && item.path !== ""
    );

    if (activeSubNav) {
      // Find which parent nav this subnav belongs to
      if (servicesSubNav.some((item) => item.name === activeSubNav.name)) {
        setActiveNav("Services");
        setIsServicesOpen(true);
      } else if (
        awarenessSubNav.some((item) => item.name === activeSubNav.name)
      ) {
        setActiveNav("Cancer Awareness");
        setIsAwarenessOpen(true);
      }
    } else if (path === "/Admin") {
      setActiveNav("Home");
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
    }
  }, [location.pathname]);

  const handleNavClick = (name) => {
    setActiveNav(name);

    // Toggle the subnav if it's expandable
    if (name === "Services") {
      toggleServices();
    } else if (name === "Cancer Awareness") {
      toggleAwareness();
    } else {
      // For Home, close all subnavs
      setIsServicesOpen(false);
      setIsAwarenessOpen(false);
    }
  };

  const handleSubNavClick = (name) => {
    setActiveNav(name);
  };

  return (
    <div className="flex flex-col h-screen justify-start gap-20 px-3 py-7 bg-primary w-[25%]">
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

      <ul>
        {nav.map((item, index) => {
          const isActive = activeNav === item.name;
          const isExpandable =
            item.name === "Services" || item.name === "Cancer Awareness";
          const isOpen =
            item.name === "Services" ? isServicesOpen : isAwarenessOpen;
          const subNav =
            item.name === "Services" ? servicesSubNav : awarenessSubNav;

          return (
            <li key={index} className="flex flex-col">
              <div
                onClick={() => handleNavClick(item.name)}
                className={`group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray cursor-pointer ${
                  isActive ? "bg-gray" : ""
                }`}
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
                        e.stopPropagation();
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
                      className={`cursor-pointer dropdown-item rounded-lg px-5 hover:font-bold hover:text-primary block py-2 hover:bg-gray ${
                        location.pathname.startsWith(subItem.path)
                          ? "bg-gray text-primary font-bold"
                          : "text-white"
                      }`}
                      onClick={() => handleSubNavClick(subItem.name)}
                    >
                      <Link to={subItem.path}>{subItem.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PatientSidebar;
