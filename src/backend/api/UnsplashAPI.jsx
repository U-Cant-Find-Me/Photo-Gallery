"use client";

import axios from 'axios';
import { AiFillHeart } from 'react-icons/ai';
import { useEffect, useState, useRef } from 'react'
import LazyImage from '@/components/LazyImage';
import ErrorMessage from '@/components/ErrorHandling/ErrorMessage';
import useErrorHandler from '@/hooks/useErrorHandler';

const unsplash_api_key = process.env.NEXT_PUBLIC_API_UNSPLASH;
const unsplash_enpoint_url = `https://api.unsplash.com/photos/random?client_id=${unsplash_api_key}&count=30`;

const UnsplashAPI = ({ category, onImageClick }) => {
    const [unsplashData, setUnsplashData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
    const { error, isLoading, handleError, retry, setLoading } = useErrorHandler();

    const fetchUnsplashData = async (pageToFetch = 1, reset = false) => {
        if (!unsplash_api_key) {
            throw new Error('Unsplash API key is not configured');
        }
        setLoading(true);
        try {
            let response;
            if (category) {
                response = await axios.get(`https://api.unsplash.com/search/photos?client_id=${unsplash_api_key}&query=${encodeURIComponent(category)}&per_page=20&page=${pageToFetch}`);
                if (!response.data || !Array.isArray(response.data.results)) {
                    throw new Error('Invalid response format from Unsplash API');
                }
                if (reset) {
                    setUnsplashData(response.data.results);
                } else {
                    setUnsplashData(prev => [...prev, ...response.data.results]);
                }
                setHasMore(response.data.results.length > 0 && response.data.total_pages > pageToFetch);
            } else {
                response = await axios.get(unsplash_enpoint_url);
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid response format from Unsplash API');
                }
                setUnsplashData(response.data);
                setHasMore(false);
            }
            setLoading(false);
        } catch (error) {
            handleError(error, 'Unsplash API');
        }
    };

    // Reset data when category changes
    useEffect(() => {
        setUnsplashData([]);
        setPage(1);
        setHasMore(true);
        if (category) {
            fetchUnsplashData(1, true);
        } else {
            fetchUnsplashData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    // Fetch more data when page changes (for infinite scroll)
    useEffect(() => {
        if (page === 1) return; // already loaded in category effect
        if (category) {
            fetchUnsplashData(page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Infinite scroll observer
    useEffect(() => {
        if (!category) return;
        const observer = new window.IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
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
    }, [hasMore, isLoading, category]);

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
                <li 
                    className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto cursor-pointer" 
                    key={`unsplash-${data.id}-${index}`}
                    onClick={() => onImageClick && onImageClick(data.urls?.regular, data.alt_description || data.description || 'Unsplash image')}
                >
                    <LazyImage 
                        src={data.urls?.regular} 
                        alt={data.alt_description || data.description || 'Unsplash image'} 
                        width={420} 
                        height={450} 
                        className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        style={{ minWidth: '380px' }}
                        priority={index < 3}
                    />
                    {/* Like button at top right, no background */}
                    <button className="absolute top-2 right-2 flex items-center gap-1 text-white z-10 hover:cursor-pointer">
                        <AiFillHeart className="w-6 h-6 drop-shadow" />
                        <span className="text-base font-semibold drop-shadow">{data.likes ?? 0}</span>
                    </button>
                    {/* Collection button remains at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75v14.5m7.25-7.25H4.75" />
                            </svg>
                            <span>Add to Collection</span>
                        </button>
                    </div>
                </li>
            ))}
            {/* Loading more indicator */}
            {category && hasMore && (
                <div ref={loader} className="w-full max-w-[420px] mx-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20 bg-gray-100 rounded-xl">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Loading more...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-10 w-full text-center text-gray-500" />
                    )}
                </div>
            )}
        </>
    )
}

export default UnsplashAPI;