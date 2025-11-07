import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/services/authService";
import BeneficiarySidebar from "../navigation/Beneficiary";
import api from "src/api/axiosInstance";

// Custom hook for WebSocket/polling notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/notifications/list/');
      
      // Assuming API returns { notifications: [], unread_count: number }
      const notifs = data.results;
      // const count = data.count
      const count = notifs.filter(n => !n.is_read).length;
    
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/mark-read/`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read/');
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // For multiple notifications
  const markMultipleAsRead = async (notificationIds) => {
    try {
      await api.post('/notifications/mark-multiple-read/', {
        notification_ids: notificationIds
      });
    } catch (err) {
      console.error('Failed to mark multiple notifications as read:', err);
    }
  };

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/notifications/');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'NEW_NOTIFICATION') {
            setNotifications(prev => [message.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (message.type === 'NOTIFICATION_READ') {
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === message.notificationId ? { ...notif, read: true } : notif
              )
            );
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        // Auto-reconnect with exponential backoff
        if (retryCountRef.current < maxRetries) {
          const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          retryCountRef.current += 1;
          setTimeout(connectWebSocket, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
    }
  }, []);

  // Polling fallback if WebSocket fails
  const startPolling = useCallback(() => {
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Try WebSocket first, fallback to polling
    if (window.WebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchNotifications, connectWebSocket, startPolling]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

// Notification item component for better reusability
const NotificationItem = React.memo(({ notification, onMarkAsRead }) => {
  const handleClick = useCallback(() => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  }, [notification, onMarkAsRead]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  return (
    <li
      className={`px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'text-gray-600'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
          )}
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">
          {formatTime(notification.created_at || notification.timestamp)}
        </span>
        {notification.type && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            notification.type === 'alert' ? 'bg-red-100 text-red-800' :
            notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {notification.type}
          </span>
        )}
      </div>
    </li>
  );
});

const AdminHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileName, setProfileName] = useState("Admin");
  const [profileAvatar, setProfileAvatar] = useState("/images/Avatar.png");

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Memoized sorted notifications (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
    );
  }, [notifications]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        notifRef.current && !notifRef.current.contains(e.target)
      ) {
        setOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile/");
        const d = res.data;
        const name = `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Beneficiary";
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

  const handleNotificationClick = useCallback((notificationId) => {
    markAsRead(notificationId);
  }, [markAsRead]);

  return (
    <div className="bg-white py-3.5 px-5 w-full flex justify-between items-center shadow-sm">
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
        alt="Menu"
      />

      <h1 className="text-md font-bold">Beneficiary</h1>

      <div className="relative flex items-center gap-3">
        {/* Enhanced Notification Component */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              setOpen(false);
            }}
            className="relative p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
          >
            <img 
              src="/images/notification-icon.svg" 
              className="size-5" 
              alt="Notifications" 
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[1rem]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    {error}
                  </div>
                ) : sortedNotifications.length > 0 ? (
                  <ul>
                    {sortedNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleNotificationClick}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    {/* <img 
                      src="/images/empty-notifications.svg" 
                      alt="No notifications" 
                      className="w-16 h-16 mx-auto mb-2 opacity-50"
                    /> */}
                    No new notifications
                  </div>
                )}
              </div>
              
              {/* {sortedNotifications.length > 0 && (
                <div className="p-2 border-t border-gray-100 text-center">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              )} */}
            </div>
          )}
        </div>

        {/* Profile dropdown (unchanged) */}
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
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
              <Link
                to="/admin/profile"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                View Profile
              </Link>
              {/* <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                All Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link> */}
              {/* <Link
                to="/admin/notifications"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Notification Settings
              </Link> */}
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