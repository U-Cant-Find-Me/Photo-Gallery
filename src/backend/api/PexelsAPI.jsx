'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

const pexels_api_key = process.env.NEXT_PUBLIC_API_PEXELS;
const pexels_enpoint_url = `https://api.pexels.com/v1/curated`;

const searchPhotos = async (query, page) => {
    const res = await axios.get(`${pexels_enpoint_url}`, {
        headers: {
            Authorization: pexels_api_key,
        },
        params: {
            query,
            per_page: 20,
            page: page || 1, // Default to page 1 if not provided
        },
    });
    return res.data.photos;
};

export default function PexelsAPI() {
    const [pexelsData, setPexelsData] = useState([]);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('nature');
    const loader = useRef(null);

    useEffect(() => {
        loadPhotos();
    }, [page]);

    const loadPhotos = async () => {
        const newPhotos = await searchPhotos(query, page);
        setPexelsData(prev => [...prev, ...newPhotos]);
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
    // console.log("call pexels api");
    return (
        <>
            {pexelsData.map((data) => (
                <li className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto" key={data.url}>
                    <Image src={data.src?.large} alt={data.alt} width={420} height={450} className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" style={{ minWidth: '380px' }} />
                    {
                        data.alt &&
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {data.alt}
                        </div>
                    }
                </li>
            ))}
            <div ref={loader} className="h-10 w-full col-span-full text-center text-gray-500">
                Loading more...
            </div>
        </>
    );
}
