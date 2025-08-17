"use client";

import UnsplashAPI from '@/backend/api/UnsplashAPI';
import PixabayAPI from '@/backend/api/PixabayAPI';
import PicsumAPI from '@/backend/api/PicsumAPI';
import PexelsAPI from '@/backend/api/PexelsAPI';
import useProgressiveLoading from '../hooks/useProgressiveLoading';
import ImageModal from './ImageModal';
import { useState, useEffect } from 'react';

const RenderImages = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImg, setModalImg] = useState(null);
    const [allImages, setAllImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageClick = (imageData) => {
        // Find index of clicked image in allImages array
        const index = allImages.findIndex(img => img.id === imageData.id && img.source === imageData.source);
        
        if (index !== -1) {
            setCurrentImageIndex(index);
            setModalImg(imageData);
        } else {
            // If image not found in array, add it and set as current
            setAllImages(prev => [...prev, imageData]);
            setCurrentImageIndex(allImages.length);
            setModalImg(imageData);
        }
        setModalOpen(true);
    };

    const handleNext = () => {
        if (currentImageIndex < allImages.length - 1) {
            const nextIndex = currentImageIndex + 1;
            setCurrentImageIndex(nextIndex);
            setModalImg(allImages[nextIndex]);
        }
    };

    const handlePrevious = () => {
        if (currentImageIndex > 0) {
            const prevIndex = currentImageIndex - 1;
            setCurrentImageIndex(prevIndex);
            setModalImg(allImages[prevIndex]);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        // Small delay to let animation finish
        setTimeout(() => {
            setModalImg(null);
        }, 300);
    };

    // Collect images from child components
    const updateAllImages = (newImages, source) => {
        setAllImages(prev => {
            // Remove existing images from this source and add new ones
            const filtered = prev.filter(img => img.source !== source);
            return [...filtered, ...newImages.map(img => ({ ...img, source }))];
        });
    };

    const totalComponents = 4;
    
    const {
        loadedComponents,
        componentProgress,
        isLoading,
        setComponentRef,
        getLoadingStatus,
        manuallyLoadNext,
        config
    } = useProgressiveLoading(totalComponents);

    const status = getLoadingStatus();

    const renderComponent = (index) => {
        if (!loadedComponents.includes(index)) {
            return (
                <li 
                    key={`placeholder-${index}`}
                    className="flex items-center justify-center h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"
                >
                    <div className="text-center">
                        {config.PERFORMANCE.SHOW_LOADING_ANIMATIONS && (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        )}
                        <p className="text-gray-500">Loading...</p>
                        {isLoading && index === Math.max(...loadedComponents) + 1 && (
                            <p className="text-xs text-gray-400 mt-1">Preparing to load...</p>
                        )}
                        {/* Manual load button for testing */}
                        <button 
                            onClick={() => manuallyLoadNext()}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                            Load Now
                        </button>
                    </div>
                </li>
            );
        }

        // Pass the click handler to each API component via props
        const components = [
            <PixabayAPI key="pixabay" onImageClick={handleImageClick} />,
            <PexelsAPI key="pexels" onImageClick={handleImageClick} />,
            <PicsumAPI key="picsum" onImageClick={handleImageClick} />,
            <UnsplashAPI key="unsplash" onImageClick={handleImageClick} />,
        ];

        return (
            <div 
                key={`component-${index}`}
                ref={el => setComponentRef(index, el)}
                className="contents"
            >
                {components[index]}
            </div>
        );
    };

    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-400 mb-8 drop-shadow-lg">Popular Images</h1>
            <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {Array.from({ length: totalComponents }, (_, index) => renderComponent(index))}
            </ul>
            <ImageModal 
                isOpen={modalOpen} 
                onClose={handleCloseModal} 
                imageData={modalImg}
                onNext={handleNext}
                onPrevious={handlePrevious}
                canGoNext={currentImageIndex < allImages.length - 1}
                canGoPrevious={currentImageIndex > 0}
                currentIndex={currentImageIndex + 1}
                totalImages={allImages.length}
            />
        </div>
    )
}

export default RenderImages;