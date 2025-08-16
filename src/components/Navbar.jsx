"use client";

import React, { useState } from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Search from './Search';
import NotificationSidebar from './NotificationSidebar';
import NotificationPopup from './NotificationPopup';
import { useNotifications } from './NotificationContext';
import toast from 'react-hot-toast';
import { CgProfile } from 'react-icons/cg';
import { MdNotificationsActive } from 'react-icons/md';
import { VscThreeBars } from 'react-icons/vsc';
import { BsCloudUpload } from "react-icons/bs";
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const Navbar = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [notifClosing, setNotifClosing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownMd, setShowDropdownMd] = useState(false);
    const pathname = usePathname();
    const { unreadCount, addNotification } = useNotifications();
    const { isSignedIn, user, isLoaded } = useUser();
    const [authIntent, setAuthIntent] = useState(null); // 'sign-in' | 'sign-up' | null
    const authCancelTimerRef = React.useRef(null);
    const prevSignedInRef = React.useRef(isSignedIn);

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

    // Show toast + notification on successful auth and on sign-out
    React.useEffect(() => {
        if (!isLoaded) return;
        const wasSignedIn = prevSignedInRef.current;
        if (!wasSignedIn && isSignedIn) {
            const actionLabel = authIntent === 'sign-up' ? 'Sign up' : 'Sign in';
            toast.success(`${actionLabel} successful!`);
            addNotification({
                type: 'auth',
                title: `${actionLabel} successful`,
                message: `Welcome${user?.firstName ? `, ${user.firstName}` : ''}!`,
            });
            setAuthIntent(null);
            if (authCancelTimerRef.current) {
                clearTimeout(authCancelTimerRef.current);
                authCancelTimerRef.current = null;
            }
        } else if (wasSignedIn && !isSignedIn) {
            toast.success('Signed out successfully');
            addNotification({
                type: 'auth_out',
                title: 'Signed out',
                message: 'You have been signed out successfully.',
            });
            setAuthIntent(null);
            if (authCancelTimerRef.current) {
                clearTimeout(authCancelTimerRef.current);
                authCancelTimerRef.current = null;
            }
        }
        prevSignedInRef.current = isSignedIn;
    }, [isLoaded, isSignedIn, authIntent, addNotification, user?.firstName]);

    // Fallback: if auth modal opened but not completed within timeout, treat as unsuccessful/canceled
    React.useEffect(() => {
        if (!authIntent) return;
        if (authCancelTimerRef.current) {
            clearTimeout(authCancelTimerRef.current);
            authCancelTimerRef.current = null;
        }
        authCancelTimerRef.current = setTimeout(() => {
            if (!isSignedIn) {
                const actionLabel = authIntent === 'sign-up' ? 'Sign up' : 'Sign in';
                toast.error(`${actionLabel} unsuccessful or cancelled.`);
                addNotification({
                    type: 'auth_fail',
                    title: `${actionLabel} unsuccessful`,
                    message: `The ${actionLabel.toLowerCase()} attempt didn't complete.`,
                });
                setAuthIntent(null);
            }
        }, 45000); // 45s window
        return () => {
            if (authCancelTimerRef.current) {
                clearTimeout(authCancelTimerRef.current);
                authCancelTimerRef.current = null;
            }
        };
    }, [authIntent, isSignedIn, addNotification]);

    const NotificationBadge = ({ children, count }) => (
        <div className="relative">
            {children}
            {count > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {count > 99 ? '99+' : count}
                </div>
            )}
        </div>
    );

    // Authentication components for different layouts
    const AuthButtonsDropdown = ({ onItemClick }) => {
        if (!isLoaded) {
            return (
                <li>
                    <div className="w-full flex items-center px-4 py-2 text-gray-400">
                        <div className="animate-pulse flex items-center">
                            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                            Loading...
                        </div>
                    </div>
                </li>
            );
        }

        if (isSignedIn) {
            return (
                <li>
                    <div className="w-full flex items-center px-4 py-2 text-gray-700 hover:text-black">
                        <div className="mr-2">
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-6 h-6",
                                        userButtonPopoverCard: "shadow-xl border",
                                        userButtonPopoverActionButton: "hover:bg-gray-50"
                                    }
                                }}
                            />
                        </div>
                        <span className="font-medium">
                            {user?.firstName || user?.username || 'Profile'}
                        </span>
                    </div>
                </li>
            );
        }

        return (
            <>
                <li>
                    <SignInButton mode="modal">
                        <button 
                            className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-black transition-colors"
                            onClick={() => { setAuthIntent('sign-in'); onItemClick && onItemClick(); }}
                        >
                            <CgProfile className="mr-2 text-2xl" /> Sign In
                        </button>
                    </SignInButton>
                </li>
                <li>
                    <SignUpButton mode="modal">
                        <button 
                            className="w-full flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            onClick={() => { setAuthIntent('sign-up'); onItemClick && onItemClick(); }}
                        >
                            <CgProfile className="mr-2 text-2xl" /> Sign Up
                        </button>
                    </SignUpButton>
                </li>
            </>
        );
    };

    const AuthButtonDesktop = () => {
        if (!isLoaded) {
            return (
                <div className="flex items-center px-2 py-2 text-gray-400">
                    <div className="animate-pulse w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
            );
        }

        if (isSignedIn) {
            return (
                <div className="flex items-center px-2 py-2">
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 transition-transform hover:scale-105",
                                userButtonPopoverCard: "shadow-xl border",
                                userButtonPopoverActionButton: "hover:bg-gray-50"
                            }
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                    <button onClick={() => setAuthIntent('sign-in')} className="flex items-center px-3 py-1.5 text-gray-600 hover:text-black hover:cursor-pointer transition-colors text-sm font-medium border border-gray-300 rounded-lg hover:border-gray-400">
                        Sign In
                    </button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <button onClick={() => setAuthIntent('sign-up')} className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white transition-colors text-sm font-medium rounded-lg">
                        Sign Up
                    </button>
                </SignUpButton>
            </div>
        );
    };

    return (
        <div className="relative w-full">
            {/* Below md */}
            <header className="flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm md:hidden">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img
                        className="h-10 w-auto"
                        src="/logo.png"
                        alt="logo image"
                        suppressHydrationWarning={true}
                        onError={e => {
                          if (e.target.src !== window.location.origin + '/logo_dark.png') {
                            e.target.onerror = null;
                            e.target.src = '/logo_dark.png';
                          }
                        }}
                    />
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
                                    <Link href="/collection" onClick={() => setShowDropdown(false)}>
                                        <span className={`block font-bold text-base px-4 py-2 transition-colors ${pathname === '/collection' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Collections</span>
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
                                        <NotificationBadge count={unreadCount}>
                                            <MdNotificationsActive className="mr-2 text-2xl" />
                                        </NotificationBadge>
                                        Notifications
                                    </button>
                                </li>
                                <AuthButtonsDropdown onItemClick={() => setShowDropdown(false)} />
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            {/* md only */}
            <header className="hidden md:flex lg:hidden items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img
                        className="h-10 w-auto"
                        src="/logo.png"
                        alt="logo image"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '/logo_dark.png';
                        }}
                    />
                </Link>
                <div className="flex-1 min-w-0 mx-2">
                    <Search />
                </div>
                <Link href="/collection">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/collection' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Collection</span>
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
                                        <NotificationBadge count={unreadCount}>
                                            <MdNotificationsActive className="mr-2 text-2xl" />
                                        </NotificationBadge>
                                        Notifications
                                    </button>
                                </li>
                                <AuthButtonsDropdown onItemClick={() => setShowDropdownMd(false)} />
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            {/* above md */}
            <header className="hidden lg:flex items-center w-full min-h-[48px] px-2 bg-white shadow-sm">
                <Link href="/" className="flex items-center min-w-[48px]">
                    <img
                        className="h-10 w-auto"
                        src="/logo.png"
                        alt="logo image"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '/logo_dark.png';
                        }}
                    />
                </Link>
                <div className="flex-1 min-w-0 mx-2">
                    <Search />
                </div>
                <Link href="/collection">
                    <span className={`font-bold text-base px-2 py-2 transition-colors ${pathname === '/collection' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>Collection</span>
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
                    <NotificationBadge count={unreadCount}>
                        <MdNotificationsActive className="text-2xl" />
                    </NotificationBadge>
                </button>
                <AuthButtonDesktop />
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