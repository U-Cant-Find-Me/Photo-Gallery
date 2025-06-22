"use client"

import React, { useState } from 'react'
import Link from 'next/link';
import { CgProfile } from 'react-icons/cg';
import { MdNotificationsActive } from 'react-icons/md';
import { VscThreeBars } from 'react-icons/vsc';
import { usePathname } from 'next/navigation';
import { BsCloudUpload } from "react-icons/bs";
import Search from '@/components/Search';

const LgScreenNav = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const pathname = usePathname();

    // Close dropdown when clicking outside
    React.useEffect(() => {
        if (!showDropdown) return;
        const handleClick = (e) => {
            if (!e.target.closest('#lg-nav-dropdown') && !e.target.closest('#lg-nav-bars')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showDropdown]);

    return (
        <div className="relative w-full">
            <header className="flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img className="h-[40px] w-auto" src="logo.png" alt="logo image" />
                </Link>
                {/* Search bar (flex-grow) */}
                <div className="flex-1 min-w-0">
                    <Search />
                </div>
                {/* Menu items */}
                <nav className="flex items-center gap-2 ml-2">
                    <Link href="/advertise">
                        <span className={`font-bold align-middle text-base px-2 py-2 transition-colors ${pathname === '/advertise' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Advertise</span>
                    </Link>
                    <Link href="/blog">
                        <span className={`font-bold align-middle text-base px-2 py-2 transition-colors ${pathname === '/blog' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Blog</span>
                    </Link>
                    {/* VscThreeBars Dropdown */}
                    <div className="relative">
                        <button
                            id="lg-nav-bars"
                            className="text-2xl p-2 rounded hover:bg-gray-100 focus:outline-none"
                            onClick={() => setShowDropdown((v) => !v)}
                            aria-label="Open menu"
                        >
                            <VscThreeBars className="cursor-pointer hover:text-gray-400" />
                        </button>
                        {showDropdown && (
                            <div
                                id="lg-nav-dropdown"
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn"
                            >
                                <ul className="flex flex-col py-2">
                                    <li>
                                        <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black cursor-not-allowed" disabled>
                                            <BsCloudUpload className="mr-2" /> Upload
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black">
                                            <MdNotificationsActive className="mr-2" /> Notifications
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black">
                                            <CgProfile className="mr-2" /> Profile
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.18s cubic-bezier(0.4,0,0.2,1);
                }
            `}</style>
        </div>
    );
}

export default LgScreenNav;