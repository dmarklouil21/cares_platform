import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/services/authService";
import BeneficiarySidebar from "../navigation/Beneficiary";

const BeneficiaryHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(0);
  };

  return (
    <div className="bg-white h-[10%] px-5 w-full flex justify-between items-center shadow-sm">
      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
      <img
        className="md:hidden size-5 cursor-pointer"
        src="/images/menu-line.svg"
        onClick={() => setIsSidebarOpen(true)}
      />
      <h1 className="text-md font-bold">Admin</h1>

      {/* Hover container */}
      <div
        ref={menuRef}
        className="relative flex items-center gap-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="w-6 h-6 object-cover"
          />
        </div>

        {/* Name + Arrow */}
        <div className="flex items-center cursor-pointer gap-1.5">
          <p className="text-primary text-sm">John Doe</p>
          <img
            src="/src/assets/images/navigation/admin/arrow.svg"
            alt="arrow"
            className={`h-2.5 w-2.5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg z-50">
            <Link
              to="/beneficiary/profile"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2 text-sm text-yellow hover:bg-gray-100 transition"
            >
              View Profile
            </Link>

            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryHeader;
