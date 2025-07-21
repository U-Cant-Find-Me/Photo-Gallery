"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const LazyImage = ({ src, alt, width, height, className, style, priority = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '50px 0px' // Start loading 50px before the image comes into view
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleImageLoad = () => {
        setIsLoaded(true);
        setHasError(false);
    };

    const handleImageError = () => {
        setHasError(true);
        setIsLoaded(false);
        console.error(`Failed to load image: ${src}`);
    };

    // Custom SVG Loading Spinner
    const LoadingSpinner = () => (
        <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
            style={{ width: width, height: height }}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 200 200" 
                className="w-16 h-16"
                style={{ width: '64px', height: '64px' }}
            >
                <path 
                    fill="#FF156D" 
                    stroke="#FF156D" 
                    strokeWidth="15" 
                    transformOrigin="center" 
                    d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"
                >
                    <animateTransform 
                        type="rotate" 
                        attributeName="transform" 
                        calcMode="spline" 
                        dur="1.5" 
                        values="0;360" 
                        keyTimes="0;1" 
                        keySplines="0.4 0 0.6 1" 
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
    );

    // Error Fallback
    const ErrorFallback = () => (
        <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-200"
            style={{ width: width, height: height }}
        >
            <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Image failed to load</p>
            </div>
        </div>
    );

    return (
        <div ref={imgRef} className="relative" style={{ width: width, height: height }}>
            {isVisible ? (
                <>
                    {/* Show loading spinner while image is loading */}
                    {!isLoaded && !hasError && <LoadingSpinner />}
                    
                    {/* Show error fallback if image failed to load */}
                    {hasError && <ErrorFallback />}
                    
                    <Image 
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className={`transition-opacity duration-300 ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
                        style={style}
                        loading={priority ? "eager" : "lazy"}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                </>
            ) : (
                <LoadingSpinner />
            )}
        </div>
    );
};

export default LazyImage; 