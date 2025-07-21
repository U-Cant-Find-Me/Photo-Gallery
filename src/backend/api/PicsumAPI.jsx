"use client";

import axios from 'axios';
import { useEffect, useState, useRef } from 'react'
import LazyImage from '@/components/LazyImage';
import ErrorMessage from '@/components/ErrorHandling/ErrorMessage';
import useErrorHandler from '@/hooks/useErrorHandler';

const searchPhotos = async (page) => {
    const picsum_enpoint_url = `https://picsum.photos/v2/list?page=${page || 2}&limit=20`;
    
    try {
        const res = await axios.get(picsum_enpoint_url);
        
        if (!res.data || !Array.isArray(res.data)) {
            throw new Error('Invalid response format from Picsum API');
        }
        
        return res.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('No more images available');
        }
        throw error;
    }
}

const PicsumAPI = () => {
    const [picsumData, setPicsumData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
    const { error, isLoading, handleError, retry, setLoading } = useErrorHandler();

    const loadPhotos = async () => {
        try {
            setLoading(true);
            const newPhotos = await searchPhotos(page);
            
            if (newPhotos.length === 0) {
                setHasMore(false);
            } else {
                setPicsumData(prev => [...prev, ...newPhotos]);
            }
            
            setLoading(false);
        } catch (error) {
            handleError(error, 'Picsum API');
        }
    };

    useEffect(() => {
        loadPhotos();
    }, [page]);

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
    if (error && picsumData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <ErrorMessage
                    error={error.original}
                    onRetry={() => retry(() => {
                        setPage(1);
                        setPicsumData([]);
                        setHasMore(true);
                        return loadPhotos();
                    })}
                    title="Failed to load Picsum images"
                    message={error.message}
                    className="h-[450px]"
                />
            </li>
        );
    }

    // Show loading state for initial load
    if (isLoading && picsumData.length === 0) {
        return (
            <li className="w-full max-w-[420px] mx-auto">
                <div className="flex items-center justify-center h-[450px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading Picsum images...</p>
                    </div>
                </div>
            </li>
        );
    }

    // Show no data state
    if (!isLoading && picsumData.length === 0) {
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
                                setPicsumData([]);
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
            {
                picsumData.map((data, index) => (
                    <li className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 bg-gray-800 w-full max-w-[420px] mx-auto" key={`picsum-${data.id}-${index}`}>
                        <LazyImage 
                            src={data.download_url} 
                            alt={data.author || 'Picsum image'} 
                            width={420} 
                            height={450} 
                            className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" 
                            style={{ minWidth: '380px' }}
                            priority={index < 3}
                        />
                        {
                            data.author &&
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {data.author}
                            </div>
                        }
                    </li>
                ))
            }
            
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
            {error && picsumData.length > 0 && (
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
    )
}

export default PicsumAPI;