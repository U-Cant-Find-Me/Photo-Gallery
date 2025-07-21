"use client";

import MainLinks from './MainLinks';
import GenresBar from './GenresBar';
import { RiMore2Line } from 'react-icons/ri';

const SecondaryBar = () => {
  return (
    <>
      <section className="mt-1 flex items-center bg-black w-full">
        <MainLinks />
        <RiMore2Line className="hidden md:inline-block ml-9 mr-5 text-white text-2xl" />
        <span className='ml-5 inline-block md:hidden text-2xl text-gray-400'>:</span>
        <GenresBar />
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

export default SecondaryBar;