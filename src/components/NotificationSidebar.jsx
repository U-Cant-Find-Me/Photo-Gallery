'use client';

import { useNotifications } from './NotificationContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

const NotificationSidebar = ({ open, onClose, notifClosing }) => {
    const { notifications, markAsRead, clearAllNotifications, markAllAsRead } = useNotifications();
    const [isClearing, setIsClearing] = useState(false);
    const [clearingIds, setClearingIds] = useState(new Set());

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return '❤️';
            case 'unlike': return '💔';
            case 'download': return '📥';
            case 'collection': return '📚';
            default: return '🔔';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    const handleClearAll = async () => {
        if (notifications.length === 0) return;

        setIsClearing(true);
        
        // Add all notification IDs to clearing set for animation
        const allIds = new Set(notifications.map(n => n.id));
        setClearingIds(allIds);

        // Show clearing toast
        const clearingToast = toast.loading('🧹 Clearing notifications...', {
            style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
            },
        });

        // Wait for fade-out animation
        await new Promise(resolve => setTimeout(resolve, 600));

        // Clear notifications
        clearAllNotifications();
        
        // Reset states
        setIsClearing(false);
        setClearingIds(new Set());
        
        // Show success toast
        toast.dismiss(clearingToast);
        toast.success('✨ All notifications cleared!', {
            duration: 2000,
            icon: '🧹',
        });
    };

    if (!open) return null;
    
    return (
        <div className={`md:flex hidden fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 flex-col ${notifClosing ? 'animate-slideOut' : 'animate-slideIn'}`}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <span className="font-bold text-lg">Notifications</span>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded transition-colors"
                            disabled={isClearing}
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-xl hover:text-red-500 w-6 h-6 flex items-center justify-center transition-colors">&times;</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="text-4xl mb-2">🔔</div>
                        <p>No notifications yet.</p>
                        <p className="text-sm mt-1">Your activities will appear here!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !isClearing && handleNotificationClick(notification)}
                                className={`p-4 cursor-pointer transition-all duration-300 ${
                                    clearingIds.has(notification.id) 
                                        ? 'opacity-0 transform scale-95 translate-x-4' 
                                        : 'opacity-100 transform scale-100 translate-x-0 hover:bg-gray-50'
                                } ${
                                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                } ${isClearing ? 'pointer-events-none' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${
                                        clearingIds.has(notification.id) ? 'rotate-12 scale-75' : ''
                                    }`}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm text-gray-900 truncate">
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <div className={`w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 transition-all duration-300 ${
                                                    clearingIds.has(notification.id) ? 'opacity-0 scale-0' : ''
                                                }`}></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        {notification.imageData && (
                                            <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                                <img
                                                    src={notification.imageData.url}
                                                    alt=""
                                                    className={`w-10 h-10 object-cover rounded transition-all duration-300 ${
                                                        clearingIds.has(notification.id) ? 'opacity-50 scale-90' : ''
                                                    }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-600 truncate">
                                                        {notification.imageData.alt}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        by {notification.imageData.photographer}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500">
                                            {formatTime(notification.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {notifications.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={handleClearAll}
                        disabled={isClearing}
                        className={`w-full text-sm py-2 rounded-lg transition-all duration-200 ${
                            isClearing 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                    >
                        {isClearing ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-gray-600"></div>
                                Clearing...
                            </div>
                        ) : (
                            '🧹 Clear all notifications'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationSidebar;
