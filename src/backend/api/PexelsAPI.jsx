'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LazyImage from '@/components/LazyImage';
import ErrorMessage from '@/components/ErrorHandling/ErrorMessage';
import useErrorHandler from '@/hooks/useErrorHandler';

const pexels_api_key = process.env.NEXT_PUBLIC_API_PEXELS;
const pexels_enpoint_url = `https://api.pexels.com/v1/curated`;

const searchPhotos = async (query, page) => {
    if (!pexels_api_key) {
        throw new Error('Pexels API key is not configured');
    }

    try {
        const res = await axios.get(`${pexels_enpoint_url}`, {
            headers: {
                Authorization: pexels_api_key,
            },
            params: {
                query,
                per_page: 20,
                page: page || 1,
            },
        });
        
        if (!res.data || !res.data.photos) {
            throw new Error('Invalid response format from Pexels API');
        }
        
        return res.data.photos;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Invalid Pexels API key');
        } else if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw error;
    }
};

export default function PexelsAPI({ category, onImageClick }) {
    const [pexelsData, setPexelsData] = useState([]);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState(category || 'nature');
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
    const { error, isLoading, handleError, retry, setLoading } = useErrorHandler();

    const loadPhotos = async () => {
        try {
            setLoading(true);
            const newPhotos = await searchPhotos(query, page);
            
            if (newPhotos.length === 0) {
                setHasMore(false);
            } else {
                setPexelsData(prev => [...prev, ...newPhotos]);
            }
            
            setLoading(false);
        } catch (error) {
            handleError(error, 'Pexels API');
        }
    };

    useEffect(() => {
        setQuery(category || 'nature');
        setPexelsData([]);
        setPage(1);
        setHasMore(true);
    }, [category]);

    useEffect(() => {
        loadPhotos();
    }, [page, query]);

    // Lazy load when last element is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
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
    }, [hasMore, isLoading]);

    // Show error state
    if (error && pexelsData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <ErrorMessage
                    error={error.original}
                    onRetry={() => retry(() => {
                        setPage(1);
                        setPexelsData([]);
                        setHasMore(true);
                        return loadPhotos();
                    })}
                    title="Failed to load Pexels images"
                    message={error.message}
                    className="h-[450px]"
                />
            </li>
        );
    }

    // Show loading state for initial load
    if (isLoading && pexelsData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <div className="flex items-center justify-center h-[450px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading Pexels images...</p>
                    </div>
                </div>
            </li>
        );
    }

    // Show no data state
    if (!isLoading && pexelsData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <div className="flex items-center justify-center h-[450px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No images available</p>
                        <button
                            onClick={() => retry(() => {
                                setPage(1);
                                setPexelsData([]);
                                setHasMore(true);
                                return loadPhotos();
                            })}
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
            {pexelsData.map((data, index) => (
            <li 
                className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto cursor-pointer" 
                key={`pexels-${data.id}-${index}`}
                onClick={() => onImageClick && onImageClick({
                    url: data.src?.large,
                    fullUrl: data.src?.original || data.src?.large2x || data.src?.large,
                    alt: data.alt || 'Pexels image',
                    photographer: data.photographer || 'Unknown',
                    photographerUrl: data.photographer_url,
                    likes: 0, // Pexels doesn't provide likes in API
                    source: 'Pexels',
                    sourceUrl: data.url,
                    id: data.id,
                    width: data.width,
                    height: data.height,
                    tags: []
                })}
            >
                    <LazyImage 
                        src={data.src?.large} 
                        alt={data.alt || 'Pexels image'} 
                        width={420} 
                        height={450} 
                        className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        style={{ minWidth: '380px' }}
                        priority={index < 3}
                    />
                    {/* Like button at top right, no background */}
                    <button className="absolute top-2 right-2 flex items-center gap-1 text-white z-10 hover:cursor-pointer">
                        <svg className="w-6 h-6 drop-shadow" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
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
            {hasMore && (
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
            
            {/* Error state for pagination */}
            {error && pexelsData.length > 0 && (
                <li className="w-full max-w-[420px] mx-auto">
                    <ErrorMessage
                        error={error.original}
                        onRetry={() => retry(loadPhotos)}
                        title="Failed to load more images"
                        message={error.message}
                        className="h-20"
                    />
                </li>
            )}
        </>
    );
}
