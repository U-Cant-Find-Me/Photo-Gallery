"use client";

import axios from 'axios';
import { useEffect, useState } from 'react'
import LazyImage from '@/components/LazyImage';
import ErrorMessage from '@/components/ErrorHandling/ErrorMessage';
import useErrorHandler from '@/hooks/useErrorHandler';

const unsplash_api_key = process.env.NEXT_PUBLIC_API_UNSPLASH;
const unsplash_enpoint_url = `https://api.unsplash.com/photos/random?client_id=${unsplash_api_key}&count=30`;

const UnsplashAPI = () => {
    const [unsplashData, setUnsplashData] = useState([]);
    const { error, isLoading, handleError, retry, setLoading } = useErrorHandler();

    const fetchUnsplashData = async () => {
        if (!unsplash_api_key) {
            throw new Error('Unsplash API key is not configured');
        }

        setLoading(true);
        try {
            const response = await axios.get(unsplash_enpoint_url);
            
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from Unsplash API');
            }
            
            setUnsplashData(response.data);
            setLoading(false);
        } catch (error) {
            handleError(error, 'Unsplash API');
        }
    };

    useEffect(() => {
        fetchUnsplashData();
    }, []);

    // Show error state
    if (error) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <ErrorMessage
                    error={error.original}
                    onRetry={() => retry(fetchUnsplashData)}
                    title="Failed to load Unsplash images"
                    message={error.message}
                    className="h-[450px]"
                />
            </li>
        );
    }

    // Show loading state
    if (isLoading && unsplashData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <div className="flex items-center justify-center h-[450px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading Unsplash images...</p>
                    </div>
                </div>
            </li>
        );
    }

    // Show no data state
    if (!isLoading && unsplashData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <div className="flex items-center justify-center h-[450px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No images available</p>
                        <button
                            onClick={() => retry(fetchUnsplashData)}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <>
            {unsplashData.map((data, index) => (
                <li className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto" key={`unsplash-${data.id}-${index}`}>
                    <LazyImage 
                        src={data.urls?.regular} 
                        alt={data.alt_description || data.description || 'Unsplash image'} 
                        width={420} 
                        height={450} 
                        className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        style={{ minWidth: '380px' }}
                        priority={index < 3}
                    />
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