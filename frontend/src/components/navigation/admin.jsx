import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const [isPatientOpen, setIsPatientOpen] = useState(false);
  const location = useLocation();

  const nav = [
    {
      name: "Dashboard",
      icon: "/src/assets/images/navigation/admin/dashboard.svg",
      path: "/Admin",
      arrow: "",
    },
    {
      name: "Patient",
      icon: "/src/assets/images/navigation/admin/patient.svg",
      path: "",
      arrow: "/src/assets/images/navigation/admin/arrow.svg",
    },
  ];

  const subNav = [
    { name: "Patient Master List", path: "/patient/master-list" },
    { name: "Individual Screening", path: "/patient/individual" },
    { name: "Mass Screening", path: "/patient/mass" },
    { name: "Pre-Enrollment", path: "/Admin/AdminPreEnrollment" },
    { name: "Cancer Management", path: "/patient/cancer" },
  ];

  const togglePatientSubnav = () => {
    setIsPatientOpen(!isPatientOpen);
  };

  return (
    <div className="flex flex-col h-screen justify-start gap-20 px-5 py-7 bg-primary w-[25%]">
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
          const isActive = location.pathname === item.path;
          console.log("Current Path:", location.pathname);

          return (
            <li key={index} className="flex flex-col">
              <div
                onClick={
                  item.name === "Patient" ? togglePatientSubnav : undefined
                }
                className={` group flex items-center justify-between px-5 py-3 rounded-lg hover:bg-[#F0F2F5] cursor-pointer ${
                  isActive ? "bg-[#F0F2F5]" : ""
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
                  <Link
                    to={item.path}
                    className={`${
                      isActive
                        ? "text-primary font-bold"
                        : "text-white font-medium group-hover:font-bold group-hover:text-primary"
                    } `}
                  >
                    {item.name}
                  </Link>
                </div>

                {item.arrow && (
                  <img
                    src={item.arrow}
                    alt="Arrow icon"
                    className={`w-4 h-4 transition-transform invert brightness-0 group-hover:brightness-100 group-hover:invert-0 ${
                      isPatientOpen ? "transform rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {item.name === "Patient" && (
                <ul
                  className={`pl-5 flex flex-col gap-2  ${
                    isPatientOpen ? "" : "hidden"
                  }`}
                >
                  {subNav.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className="cursor-pointer dropdown-item rounded-lg px-5 text-white hover:font-bold hover:text-[#749AB6] block py-2 hover:bg-[#F0F2F5]"
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

export default AdminSidebar;
