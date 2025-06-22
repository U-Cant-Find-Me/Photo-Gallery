import React from 'react';

const NotificationSidebar = ({ open, onClose, notifClosing }) => {
    if (!open) return null;
    return (
        <div className={`md:flex hidden fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 flex-col ${notifClosing ? 'animate-slideOut' : 'animate-slideIn'}`}>
            <div className="flex justify-between items-center p-4 border-b">
                <span className="font-bold text-lg">Notifications</span>
                <button onClick={onClose} className="text-xl">&times;</button>
            </div>
            <div className="flex-1 p-4">No notifications yet.</div>
        </div>
    );
};

export default NotificationSidebar;
