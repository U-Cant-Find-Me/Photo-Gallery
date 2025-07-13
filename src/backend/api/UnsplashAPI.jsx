"use client";

import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const unsplash_api_key = process.env.NEXT_PUBLIC_API_UNSPLASH;
const unsplash_enpoint_url = `https://api.unsplash.com/photos/random?client_id=${unsplash_api_key}&count=20`;
// const unsplash_enpoint_url = `https://api.unsplash.com/photos/random?page=${page}&client_id=${unsplash_api_key}&per_page=20`;

const UnsplashAPI = () => {
    const [unsplashData, setUnsplashData] = useState([]);

    useEffect(() => {
        axios.get(`${unsplash_enpoint_url}`)
            .then(response => {
                setUnsplashData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);
    return (
        <>
            {unsplashData.map((data) => (
                <li className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto" key={data.id}>
                    <Image src={data.urls?.regular} alt={data.alt_description || data.description || ''} width={420} height={450} className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" style={{ minWidth: '380px' }} />
                    {
                        data.alt_description &&
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {data.alt_description}
                        </div>
                    }
                </li>
            ))}
        </>
    )
}

export default UnsplashAPI;