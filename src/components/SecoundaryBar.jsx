"use client";

import React from 'react';
import Link from 'next/link';
import { RiMore2Line } from 'react-icons/ri';
import { usePathname } from 'next/navigation';

const mainLinks = [
  'Editorial',
  'Following',
];

const genres = [
  'Wallpaper',
  '3D Images',
  'Film',
  'Nature',
  'Space',
  'People',
  'Animal',
  'Street Photography',
  'Travel',
];

const getCategoryPath = (name) => `/category/${encodeURIComponent(name)}`;

const SecoundaryBar = () => {
    const pathname = usePathname();
    return (
        <>
        <section className="mt-1 flex items-center bg-black w-full flex-wrap">
            <div className="w-full md:w-1/7 flex items-center">
                <ul className="flex w-full">
                  {mainLinks.map((text) => {
                    const link = getCategoryPath(text);
                    const isActive = pathname === link;
                    return (
                      <li className="flex-1 relative" key={text}>
                        <Link href={link}>
                          <span className={`block w-full text-center font-bold text-base transition-colors py-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white focus:text-white'}`}>{text}
                            {isActive && (
                              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-white animate-flicker2s rounded"></span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
            </div>
            <RiMore2Line className="ml-10 text-white text-2xl" />
            <div className="flex-1 ml-6">
                <ul className="flex items-center justify-around flex-wrap gap-4">
                  {genres.map((cat) => {
                    const link = getCategoryPath(cat);
                    const isActive = pathname === link;
                    return (
                      <li className="relative" key={cat}>
                        <Link href={link}>
                          <span className={`font-bold text-base transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white focus:text-white'}`}>{cat}
                            {isActive && (
                              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-white animate-flicker2s rounded"></span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
            </div>
        </section>
        <style jsx global>{`
          @keyframes flicker2s {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
          .animate-flicker2s {
            animation: flicker2s 2s infinite;
          }
        `}</style>
        </>
    )
}

export default SecoundaryBar;