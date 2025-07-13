import React from 'react';

const NotificationPopup = ({ open, onClose }) => {
    if (!open) return null;
    return (
        <div className={`flex md:hidden fixed inset-0 z-50 items-center justify-center`}>
            <div className={`bg-white rounded-lg shadow-2xl p-6 w-11/12 max-w-sm relative`}>
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-black">&times;</button>
                <div className="font-bold text-lg mb-2">Notifications</div>
                <div>No notifications yet.</div>
            </div>
        </div>
    );
};

export default NotificationPopup;