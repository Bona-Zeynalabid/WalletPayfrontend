import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
  FiClock,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

const Notifications = () => {
  const { fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAllAsReadOnOpen();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsReadOnOpen = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // FIXED: Determine if it's received or sent based on title
  const isReceived = (notification) => {
    return notification.title?.toLowerCase().includes('received') ||
           notification.type === 'receive';
  };

  const isSent = (notification) => {
    return notification.title?.toLowerCase().includes('sent') ||
           notification.type === 'send';
  };

  const getIcon = (notification) => {
    if (isReceived(notification)) {
      return <FiArrowDown className="text-green-500" />;
    }
    if (isSent(notification)) {
      return <FiArrowUp className="text-red-500" />;
    }
    
    switch (notification.type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'transaction':
        return <FiClock className="text-blue-500" />;
      default:
        return <FiInfo className="text-gray-500" />;
    }
  };

  const getAmountColor = (notification) => {
    if (isReceived(notification)) {
      return 'text-green-500';
    }
    if (isSent(notification)) {
      return 'text-red-500';
    }
    return '';
  };

  const getAmountPrefix = (notification) => {
    if (isReceived(notification)) {
      return '+';
    }
    if (isSent(notification)) {
      return '-';
    }
    return '';
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const formatWalletId = (walletId) => {
    if (!walletId) return '';
    if (walletId.length <= 12) return walletId;
    return `${walletId.slice(0, 8)}...${walletId.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
          <FiBell />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={fetchNotifications} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead} 
              className="text-sm text-blue-500 hover:text-blue-600 px-3 py-1"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <FiBell className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-900 rounded-xl p-4 border transition-all ${
                !notification.read 
                  ? 'border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-800 bg-blue-50/30 dark:bg-blue-900/10' 
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {getIcon(notification)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  
                  {/* Show wallet ID */}
                  {notification.fromWalletId && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                      From: {formatWalletId(notification.fromWalletId)}
                    </p>
                  )}
                  {notification.toWalletId && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                      To: {formatWalletId(notification.toWalletId)}
                    </p>
                  )}
                  
                  {/* Show amount with correct color */}
                  {notification.amount && (
                    <p className={`text-sm font-semibold mt-1 ${getAmountColor(notification)}`}>
                      {getAmountPrefix(notification)} ETB{notification.amount}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-1">
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification._id)} 
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
                      title="Mark as read"
                    >
                      <FiCheck className="text-gray-500" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notification._id)} 
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                    title="Delete"
                  >
                    <FiTrash2 className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;