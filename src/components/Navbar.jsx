"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Search from './Search';
import NotificationSidebar from './NotificationSidebar';
import NotificationPopup from './NotificationPopup';
import { CgProfile } from 'react-icons/cg';
import { MdNotificationsActive } from 'react-icons/md';
import { VscThreeBars } from 'react-icons/vsc';
import { BsCloudUpload } from "react-icons/bs";

const Navbar = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [notifClosing, setNotifClosing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownMd, setShowDropdownMd] = useState(false);
    const pathname = usePathname();

    const handleNotifClose = () => {
        setNotifClosing(true);
        setTimeout(() => {
            setShowNotif(false);
            setNotifClosing(false);
        }, 250);
    };

    // Close dropdowns on outside click
    React.useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('#navbar-xs-dropdown') && !e.target.closest('#navbar-xs-bars')) setShowDropdown(false);
            if (!e.target.closest('#navbar-md-dropdown') && !e.target.closest('#navbar-md-bars')) setShowDropdownMd(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative w-full">
            {/* Below md */}
            <header className="flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm md:hidden">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img className="h-10 w-auto" src="logo.png" alt="logo image" />
                </Link>
                <div className="flex-1 min-w-0 mx-2">
                    <Search />
                </div>
                <div className="relative">
                    <button id="navbar-xs-bars" className="text-2xl p-2 rounded hover:bg-gray-100 focus:outline-none" onClick={() => setShowDropdown(v => !v)} aria-label="Open menu">
                        <VscThreeBars className="text-2xl" />
                    </button>
                    {showDropdown && (
                        <div id="navbar-xs-dropdown" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn">
                            <ul className="flex flex-col py-2">
                                <li>
                                    <Link href="/advertise" onClick={() => setShowDropdown(false)}>
                                        <span className={`block font-bold text-base px-4 py-2 transition-colors ${pathname === '/advertise' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Advertise</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/blog" onClick={() => setShowDropdown(false)}>
                                        <span className={`block font-bold text-base px-4 py-2 transition-colors ${pathname === '/blog' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Blog</span>
                                    </Link>
                                </li>
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black cursor-not-allowed" disabled>
                                        <BsCloudUpload className="mr-2 text-2xl" /> Upload
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black" onClick={() => { setShowNotif(true); setShowDropdown(false); }}>
                                        <MdNotificationsActive className="mr-2 text-2xl" /> Notifications
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black">
                                        <CgProfile className="mr-2 text-2xl" /> Profile
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            {/* md only */}
            <header className="hidden md:flex lg:hidden items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img className="h-10 w-auto" src="logo.png" alt="logo image" />
                </Link>
                <div className="flex-1 min-w-0 mx-2">
                    <Search />
                </div>
                <Link href="/advertise">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/advertise' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Advertise</span>
                </Link>
                <Link href="/blog">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/blog' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Blog</span>
                </Link>
                <div className="relative">
                    <button id="navbar-md-bars" className="text-2xl p-2 rounded hover:bg-gray-100 focus:outline-none" onClick={() => setShowDropdownMd(v => !v)} aria-label="Open menu">
                        <VscThreeBars className="text-2xl" />
                    </button>
                    {showDropdownMd && (
                        <div id="navbar-md-dropdown" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn">
                            <ul className="flex flex-col py-2">
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black cursor-not-allowed" disabled>
                                        <BsCloudUpload className="mr-2 text-2xl" /> Upload
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black" onClick={() => { setShowNotif(true); setShowDropdownMd(false); }}>
                                        <MdNotificationsActive className="mr-2 text-2xl" /> Notifications
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black">
                                        <CgProfile className="mr-2 text-2xl" /> Profile
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            {/* above md */}
            <header className="hidden lg:flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img className="h-10 w-auto" src="logo.png" alt="logo image" />
                </Link>
                <div className="flex-1 min-w-0 mx-2">
                    <Search />
                </div>
                <Link href="/advertise">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/advertise' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Advertise</span>
                </Link>
                <Link href="/blog">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/blog' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Blog</span>
                </Link>
                <div className="relative" onMouseEnter={() => setShowPopup(true)} onMouseLeave={() => setShowPopup(false)}>
                    <button className="flex items-center px-2 py-1 text-gray-400 border border-black rounded hover:border-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-not-allowed" disabled>
                        <BsCloudUpload className="mr-1 text-2xl" />Upload
                    </button>
                    {showPopup && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
                            Photo Submission Currently Not Allowed
                        </div>
                    )}
                </div>
                <button className="flex items-center px-2 py-2 text-gray-400 hover:text-black transition-colors" aria-label="Notifications" onClick={() => setShowNotif(true)}>
                    <MdNotificationsActive className="text-2xl" />
                </button>
                <button className="flex items-center px-2 py-2 text-gray-400 hover:text-black transition-colors" aria-label="Profile">
                    <CgProfile className="text-2xl" />
                </button>
            </header>
            {/* Notification Sidebar/Popup */}
            {showNotif && (
                <>
                    <div className="fixed inset-0 z-40 bg-opacity-10 backdrop-blur-md" style={{ backdropFilter: 'blur(12px) saturate(160%)' }} onClick={handleNotifClose}></div>
                    <NotificationSidebar open={showNotif} onClose={handleNotifClose} notifClosing={notifClosing} />
                    <NotificationPopup open={showNotif} onClose={handleNotifClose} />
                    <style jsx global>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-8px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.18s cubic-bezier(0.4,0,0.2,1);
                        }
                        @keyframes slideIn {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                        @keyframes slideOut {
                            from { transform: translateX(0); }
                            to { transform: translateX(100%); }
                        }
                        .animate-slideIn {
                            animation: slideIn 0.3s cubic-bezier(0.4,0,0.2,1);
                        }
                        .animate-slideOut {
                            animation: slideOut 0.25s cubic-bezier(0.4,0,0.2,1);
                        }
                    `}</style>
                </>
            )}
        </div>
    )
}

export default Navbar;