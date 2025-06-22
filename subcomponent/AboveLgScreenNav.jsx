"use client"

import React, { useState } from 'react'
import Link from 'next/link';
import Search from '@/components/Search';
import { usePathname } from 'next/navigation';
import { CgProfile } from 'react-icons/cg';
import { MdNotificationsActive } from 'react-icons/md';
// import { VscThreeBars } from 'react-icons/vsc';
import { BsCloudUpload } from "react-icons/bs";

const AboveLgScreenNav = () => {
    const [showPopup, setShowPopup] = useState(false);
    const pathname = usePathname();

    return (
        <div className="relative w-full">
            <header className="flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img className="h-10 w-auto" src="logo.png" alt="logo image" />
                </Link>
                {/* Search bar (flex-grow) */}
                <div className="flex-1 min-w-0">
                    <Search />
                </div>
                {/* Menu items */}
                <nav className="flex items-center gap-2 ml-2">
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
                    <button className="flex items-center px-2 py-2 text-gray-400 hover:text-black transition-colors" aria-label="Notifications">
                        <MdNotificationsActive className="text-2xl" />
                    </button>
                    <button className="flex items-center px-2 py-2 text-gray-400 hover:text-black transition-colors" aria-label="Profile">
                        <CgProfile className="text-2xl" />
                    </button>
                    {/* <button className="flex items-center px-2 py-2 text-gray-400 hover:text-black transition-colors" aria-label="Menu">
                        <VscThreeBars className="text-2xl" />
                    </button> */}
                </nav>
            </header>
        </div>
    );
}

export default AboveLgScreenNav;