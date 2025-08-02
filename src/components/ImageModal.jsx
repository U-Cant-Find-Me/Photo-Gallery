import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useNotifications } from './NotificationContext';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageData, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious,
  currentIndex,
  totalImages 
}) => {
  const modalRef = useRef();
  const imageRef = useRef();
  const imageContainerRef = useRef();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [showTooltip, setShowTooltip] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const { addNotification } = useNotifications();

  // Reset states when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen && imageData) {
      setIsImageLoading(true);
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setImageError(false);
      setIsLiked(false);
    }
  }, [isOpen, imageData?.id, imageData?.url]);

  // Constrain image position within bounds
  const constrainPosition = useCallback((newPosition, containerBounds, imageBounds) => {
    if (!containerBounds || !imageBounds) return newPosition;
    
    const maxX = Math.max(0, (imageBounds.width - containerBounds.width) / 2);
    const maxY = Math.max(0, (imageBounds.height - containerBounds.height) / 2);
    
    return {
      x: Math.max(-maxX, Math.min(maxX, newPosition.x)),
      y: Math.max(-maxY, Math.min(maxY, newPosition.y))
    };
  }, []);

  // Get container and image bounds
  const getBounds = useCallback(() => {
    if (!imageContainerRef.current || !imageRef.current) return null;
    
    const container = imageContainerRef.current.getBoundingClientRect();
    const image = imageRef.current.getBoundingClientRect();
    
    return {
      container: { width: container.width, height: container.height },
      image: { 
        width: image.width * zoomLevel, 
        height: image.height * zoomLevel 
      }
    };
  }, [zoomLevel]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape': 
          onClose(); 
          break;
        case 'ArrowLeft': 
          e.preventDefault();
          if (canGoPrevious) onPrevious(); 
          break;
        case 'ArrowRight': 
          e.preventDefault();
          if (canGoNext) onNext(); 
          break;
        case ' ': 
          e.preventDefault(); 
          handleZoomToggle(); 
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('overflow-hidden');
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, onClose, onNext, onPrevious, canGoNext, canGoPrevious, isZoomed]);

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && canGoNext) {
        onNext();
      } else if (diff < 0 && canGoPrevious) {
        onPrevious();
      }
    }
    setTouchStart(null);
  };

  // Zoom functionality with constraints
  const handleZoomToggle = () => {
    if (isZoomed) {
      resetZoom();
    } else {
      setIsZoomed(true);
      setZoomLevel(2);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setIsZoomed(true);
    const newZoomLevel = Math.min(zoomLevel + 0.5, 4);
    setZoomLevel(newZoomLevel);
    
    // Constrain position when zooming
    const bounds = getBounds();
    if (bounds) {
      const constrainedPosition = constrainPosition(imagePosition, bounds.container, {
        width: bounds.image.width * (newZoomLevel / zoomLevel),
        height: bounds.image.height * (newZoomLevel / zoomLevel)
      });
      setImagePosition(constrainedPosition);
    }
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoomLevel);
    
    if (newZoomLevel === 1) {
      setIsZoomed(false);
      setImagePosition({ x: 0, y: 0 });
    } else {
      // Constrain position when zooming out
      const bounds = getBounds();
      if (bounds) {
        const constrainedPosition = constrainPosition(imagePosition, bounds.container, {
          width: bounds.image.width * (newZoomLevel / zoomLevel),
          height: bounds.image.height * (newZoomLevel / zoomLevel)
        });
        setImagePosition(constrainedPosition);
      }
    }
  };

  const resetZoom = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag for zoomed images with constraints
  const handleMouseDown = (e) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isZoomed) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    const bounds = getBounds();
    if (bounds) {
      const constrainedPosition = constrainPosition(newPosition, bounds.container, bounds.image);
      setImagePosition(constrainedPosition);
    } else {
      setImagePosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Action handlers
  const handleDownload = async () => {
    try {
      // Priority order for highest quality image
      let downloadUrl = imageData.url; // fallback
      
      // Try to get the highest quality version available
      if (imageData.fullUrl) {
        downloadUrl = imageData.fullUrl;
      } else if (imageData.source === 'Unsplash' && imageData.id) {
        // For Unsplash, try to construct the raw/full quality URL
        downloadUrl = `https://unsplash.com/photos/${imageData.id}/download?force=true`;
      } else if (imageData.source === 'Pixabay' && imageData.id) {
        // For Pixabay, try to get the largest size
        downloadUrl = imageData.url.replace('_640', '_1920') || imageData.url;
      }

      // Show downloading toast
      const downloadingToast = toast.loading('📥 Downloading high quality image...', {
        style: {
          background: '#1f2937',
          color: '#f9fafb',
          border: '1px solid #374151',
        },
      });
      
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        // If high quality fails, fallback to regular quality
        console.warn('High quality download failed, falling back to regular quality');
        const fallbackResponse = await fetch(imageData.url);
        if (!fallbackResponse.ok) throw new Error('Download failed');
        
        const blob = await fallbackResponse.blob();
        toast.dismiss(downloadingToast);
        await downloadBlob(blob, 'standard');
      } else {
        const blob = await response.blob();
        toast.dismiss(downloadingToast);
        await downloadBlob(blob, 'high');
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('❌ Download failed - trying direct link...', {
        duration: 4000,
      });
      
      // Final fallback: try to open the source URL
      if (imageData.sourceUrl) {
        window.open(imageData.sourceUrl, '_blank');
      }
    }
  };

  // Helper function to handle the actual download
  const downloadBlob = async (blob, quality) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with quality indicator
    const extension = blob.type.includes('png') ? 'png' : 'jpg';
    const qualitysuffix = quality === 'high' ? '_HQ' : '';
    a.download = `${imageData.source}_${imageData.id}${qualitysuffix}.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success toast
    toast.success(`✅ ${quality === 'high' ? 'High quality' : 'Standard'} image downloaded!`, {
      duration: 3000,
      icon: '📁',
    });

    // Add notification
    addNotification({
      type: 'download',
      title: 'Image Downloaded',
      message: `Successfully downloaded ${quality === 'high' ? 'high quality' : 'standard'} image by ${imageData.photographer}`,
      imageData: imageData
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    if (!isLiked) {
      toast.success('❤️ Added to your likes!', {
        duration: 2000,
        style: {
          background: '#000000',
          color: '#ffffff',
        },
      });

      // Add notification for like
      addNotification({
        type: 'like',
        title: 'Added to Likes',
        message: `You liked a photo by ${imageData.photographer}`,
        imageData: imageData
      });
    } else {
      toast('💔 Removed from likes', {
        duration: 2000,
        style: {
          background: '#6b7280',
          color: '#ffffff',
        },
      });

      // Add notification for unlike
      addNotification({
        type: 'unlike',
        title: 'Removed from Likes',
        message: `You removed a photo by ${imageData.photographer} from your likes`,
        imageData: imageData
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: imageData.alt,
          text: `Check out this amazing photo by ${imageData.photographer}`,
          url: imageData.sourceUrl || window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(imageData.sourceUrl || window.location.href);
        setShowTooltip('Link copied to clipboard!');
        setTimeout(() => setShowTooltip(''), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const handleAddToCollection = () => {
    // Placeholder for collection functionality
    setShowTooltip('Collection feature coming soon!');
    setTimeout(() => setShowTooltip(''), 2000);
    
    // Add notification for collection
    addNotification({
      type: 'collection',
      title: 'Added to Collection',
      message: `Added "${imageData.alt}" by ${imageData.photographer} to your collection`,
      imageData: imageData
    });
    
    // toast.success('📚 Added to collection!', {
    //   duration: 2000,
    //   icon: '✨',
    //   style: {
    //     background: '#059669',
    //     color: '#ffffff',
    //   },
    // });
  };

  const handleImageLoad = (e) => {
    setIsImageLoading(false);
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  if (!isOpen || !imageData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-3xl bg-blue-900/20 transition-all duration-300 p-4 overflow-y-auto"
      onClick={onClose}
      ref={modalRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backdropFilter: 'blur(20px) saturate(120%)',
        background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.25) 50%, rgba(15, 23, 42, 0.4) 100%)'
      }}
    >
      {/* Navigation arrows */}
      {canGoPrevious && (
        <button
          className="fixed left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onPrevious(); }}
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {canGoNext && (
        <button
          className="fixed right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Main modal content */}
      <div
        className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-0 w-full max-w-7xl flex flex-col animate-modalCenter overflow-hidden border border-gray-700/50 max-h-[calc(100vh-2rem)]"
        onClick={e => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 bg-gray-800/90 backdrop-blur-sm rounded-t-2xl border-b border-gray-700/50 flex-shrink-0">
          <div className="text-white text-sm">
            {/* Image counter can be added back if needed */}
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/80 hover:bg-red-500 text-gray-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image container */}
        <div 
          className="relative flex-1 flex items-center justify-center p-4 sm:p-6 bg-gray-900/90 overflow-hidden min-h-0"
          ref={imageContainerRef}
          style={{ maxHeight: 'calc(100vh - 20rem)' }}
        >
          {/* Enhanced Loading skeleton */}
          {isImageLoading && (
            <div className="absolute inset-4 sm:inset-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl animate-pulse overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/20 to-transparent animate-shimmer"></div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-400 text-lg font-medium">Loading image...</div>
                  <div className="flex justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="text-center text-gray-400">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-lg">Failed to load image</p>
              <button 
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => {
                  setImageError(false);
                  setIsImageLoading(true);
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Main image */}
          <div
            className={`relative transition-transform duration-200 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'} max-w-full max-h-full`}
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`
            }}
            onClick={!isZoomed ? handleZoomToggle : undefined}
            onMouseDown={handleMouseDown}
            ref={imageRef}
          >
            <Image
              src={imageData.url}
              alt={imageData.alt || ''}
              width={1200}
              height={800}
              className="w-auto h-auto rounded-xl object-contain"
              style={{ 
                background: '#374151',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
              priority
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Zoom controls */}
          {!imageError && !isImageLoading && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                disabled={zoomLevel >= 4}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                disabled={zoomLevel <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              {isZoomed && (
                <button
                  className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                  onClick={resetZoom}
                  aria-label="Reset zoom"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata and actions footer */}
        <div className="p-4 sm:p-6 bg-gray-800/90 backdrop-blur-sm rounded-b-2xl border-t border-gray-700/50 flex-shrink-0 max-h-80 overflow-y-auto">
          {/* Image description */}
          {imageData.alt && (
            <h3 className="text-white text-lg font-medium mb-4 break-words">
              {imageData.alt}
            </h3>
          )}

          {/* Photographer and metadata */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              {imageData.photographerAvatar && (
                <img 
                  src={imageData.photographerAvatar} 
                  alt={imageData.photographer}
                  className="w-10 h-10 rounded-full border border-gray-600"
                />
              )}
              <div>
                <p className="text-gray-300">
                  Photo by <span className="text-white font-medium">{imageData.photographer}</span>
                </p>
                <p className="text-gray-400 text-sm">Source: {imageData.source}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-300 text-sm">
              {imageData.likes > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {imageData.likes}
                </span>
              )}
              {imageData.downloads > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {imageData.downloads}
                </span>
              )}
              {imageDimensions.width && imageDimensions.height && (
                <span>{imageDimensions.width} × {imageDimensions.height}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {imageData.tags && imageData.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {imageData.tags.slice(0, 6).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-700/80 text-gray-300 text-sm rounded-full backdrop-blur-sm border border-gray-600/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Like button */}
            <button
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm ${
                isLiked 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700/80 hover:bg-red-600 text-white border border-gray-600/50 hover:border-red-500'
              }`}
              onClick={handleLike}
            >
              <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isLiked ? 'Liked' : 'Like'}
            </button>

            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm"
              onClick={handleDownload}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
            
            <button
              className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm border border-gray-600/50"
              onClick={handleShare}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
            
            <button
              className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm border border-gray-600/50"
              onClick={handleAddToCollection}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Add to Collection
            </button>

            {imageData.sourceUrl && (
              <a
                href={imageData.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm border border-gray-600/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Source
              </a>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 pt-4 border-t border-white/50 hidden md:block">
            <p className="text-gray-400 text-xs">
              <span className="font-semibold">Keyboard shortcuts:</span> ← → for navigation, Space to zoom, + - for zoom in/out, 0 to reset, Esc to close
            </p>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm z-30 animate-fadeIn backdrop-blur-sm border border-gray-600/50">
          {showTooltip}
        </div>
      )}

      <style jsx global>{`
        @keyframes modalCenter {
          from { 
            opacity: 0; 
            transform: scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-modalCenter {
          animation: modalCenter 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ImageModal;