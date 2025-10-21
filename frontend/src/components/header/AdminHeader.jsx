import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/services/authService";
import AdminSidebar from "../navigation/admin";
import api from "src/api/axiosInstance";

const AdminHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Admin profile display (avatar + name)
  const [profileName, setProfileName] = useState("Admin");
  const [profileAvatar, setProfileAvatar] = useState("/images/Avatar.png");

  // Sample notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your profile has been updated." },
    { id: 2, text: "New event: Cancer Awareness Seminar." },
    { id: 3, text: "Reminder: Submit your health report." },
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile/");
        const d = res.data;
        const name = `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Admin";
        const base = (api.defaults?.baseURL || '').replace(/\/$/, '');
        const avatar = d.avatar ? (d.avatar.startsWith('http') ? d.avatar : `${base}${d.avatar}`) : "/images/Avatar.png";
        setProfileName(name);
        setProfileAvatar(avatar);
      } catch (e) {
        // keep defaults
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(0);
  };

  return (
    <div className="bg-white py-3.5 px-5 w-full flex justify-between items-center shadow-sm">
      <div className="md:hidden">
        <AdminSidebar
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
      <div className="relative flex items-center gap-3">
        {/* Notification */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setOpen(false);
            }}
            className="relative"
          >
            <img src="/images/notification-icon.svg" className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute -right-18 md:-right-33 mt-2 w-[300px] md:w-64 bg-white shadow-lg rounded-md z-50">
              <div className="p-2 border-b text-sm font-semibold text-secondary">
                Notifications
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      {notif.text}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-400">
                    No new notifications
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div
          ref={menuRef}
          className="relative flex items-center cursor-pointer gap-1.5"
          onClick={() => {
            setOpen(!open);
            setShowNotifications(false);
          }}
        >
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img
              src={profileAvatar}
              alt="User Profile"
              className="w-6 h-6 object-cover"
            />
          </div>
          <p className="text-primary text-sm">{profileName}</p>
          <img
            src="/src/assets/images/navigation/admin/arrow.svg"
            alt="arrow"
            className={`h-2.5 w-2.5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />

          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <Link
                to="/admin/profile"
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
    </div>
  );
};

export default AdminHeader;
