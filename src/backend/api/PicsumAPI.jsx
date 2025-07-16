"use client";

import LazyImage from '@/components/LazyImage';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react'

const searchPhotos = async (page) => {
    const picsum_enpoint_url = `https://picsum.photos/v2/list?page=${page || 2}&limit=20`;
    const res = await axios.get(`${picsum_enpoint_url}`);
    return res.data;
}

const PicsumAPI = () => {
    const [picsumData, setPicsumData] = useState([]);
    const [page, setPage] = useState(1);
    const loader = useRef(null);

    useEffect(() => {
        loadPhotos();
    }, [page]);

    const loadPhotos = async () => {
        const newPhotos = await searchPhotos(page);
        setPicsumData(prev => [...prev, ...newPhotos]);
    };

    // Lazy load when last element is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1 }
        );
        if (loader.current) {
            observer.observe(loader.current);
        }
        return () => {
            if (loader.current) observer.unobserve(loader.current);
        };
    }, []);
    
    return (
        <>
            {
                picsumData.map((data) => (
                    <li className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto" key={data.id}>
                        <Image src={data.download_url} alt={data.author} width={420} height={450} className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" style={{ minWidth: '380px' }} />
                        {/* <LazyImage src={data.download_url} alt={data.author} width={420} height={450}/> */}
                        {
                            data.author &&
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {data.author}
                            </div>
                        }
                    </li>
                ))
            }
            <div ref={loader} className="h-10 w-full col-span-full text-center text-gray-500"/>
        </>
    )
}

export default PicsumAPI;