import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaShoppingBag } from 'react-icons/fa';
import apiClient from '../services/api';

const NotificationBell = ({ isAdmin = false }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications/count');
      if (res.data.success) setUnreadCount(res.data.count);
    } catch (_) {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications?limit=15');
      if (res.data.success) setNotifications(res.data.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCount();
    // Poll every 30 seconds
    pollIntervalRef.current = setInterval(fetchCount, 30000);
    return () => clearInterval(pollIntervalRef.current);
  }, [fetchCount]);

  const handleOpen = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNotifLink = (notif) => {
    if (notif.reference_type === 'order') {
      return isAdmin ? `/admin/orders/${notif.reference_id}` : `/orders/${notif.reference_id}`;
    }
    return null;
  };

  const getNotifIcon = (type) => {
    if (type === 'new_order' || type === 'order_status_update') {
      return <FaShoppingBag className="text-blue-500" size={14} />;
    }
    return <FaBell className="text-gray-500" size={14} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition focus:outline-none"
        aria-label="Notifikasi"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="font-semibold text-gray-700 text-sm">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FaCheck size={10} /> Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <FaBell className="mx-auto mb-2 opacity-30" size={24} />
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const link = getNotifLink(notif);
                const content = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <div className="mt-0.5 flex-shrink-0">{getNotifIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-800' : 'text-gray-700'} truncate`}>
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                );

                return link ? (
                  <Link key={notif.id} to={link} onClick={() => { !notif.is_read && markAsRead(notif.id); setIsOpen(false); }}>
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id}>{content}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2 text-center">
            <Link
              to={isAdmin ? '/admin/notifications' : '/notifications'}
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
