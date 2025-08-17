import { useState, useEffect, useRef, useCallback } from 'react';
import PROGRESSIVE_LOADING_CONFIG from '../components/progressiveLoadingConfig';

const useProgressiveLoading = (totalComponents, customThreshold = null) => {
    const threshold = customThreshold || PROGRESSIVE_LOADING_CONFIG.SCROLL_THRESHOLD;
    const loadingDelay = PROGRESSIVE_LOADING_CONFIG.LOADING_DELAY;
    const rootMargin = PROGRESSIVE_LOADING_CONFIG.ROOT_MARGIN;
    const intersectionThresholds = PROGRESSIVE_LOADING_CONFIG.INTERSECTION_THRESHOLDS;
    
    const [loadedComponents, setLoadedComponents] = useState([0]); // Start with first component
    const [componentProgress, setComponentProgress] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const componentRefs = useRef({});
    const observers = useRef([]);

    // Initialize progress tracking for all components
    useEffect(() => {
        const initialProgress = {};
        for (let i = 0; i < totalComponents; i++) {
            initialProgress[i] = 0;
        }
        setComponentProgress(initialProgress);
    }, [totalComponents]);

    const loadNextComponent = useCallback(() => {
        setIsLoading(true);
        // Use configured loading delay for better UX
        setTimeout(() => {
            // Load the next component
            const nextIndex = loadedComponents.length;
            if (nextIndex < totalComponents) {
                setLoadedComponents(prev => [...prev, nextIndex]);
            }
            setIsLoading(false);
        }, loadingDelay);
    }, [totalComponents, loadingDelay, loadedComponents]);

    const createObserver = useCallback((componentIndex) => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Calculate visible percentage
                        const rect = entry.boundingClientRect;
                        const windowHeight = window.innerHeight;
                        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                        const progress = Math.max(0, Math.min(1, visibleHeight / rect.height));
                        
                        // Only track progress if enabled in config
                        if (PROGRESSIVE_LOADING_CONFIG.PERFORMANCE.TRACK_PROGRESS) {
                            setComponentProgress(prev => ({
                                ...prev,
                                [componentIndex]: Math.max(prev[componentIndex] || 0, progress)
                            }));
                        }

                        // Check if threshold is reached and load next component
                        if (progress >= threshold) {
                            const currentMaxLoaded = Math.max(...loadedComponents);
                            if (componentIndex === currentMaxLoaded && !isLoading) {
                                loadNextComponent();
                            }
                        }
                    }
                });
            },
            {
                threshold: intersectionThresholds,
                rootMargin: rootMargin
            }
        );

        if (componentRefs.current[componentIndex]) {
            observer.observe(componentRefs.current[componentIndex]);
        }

        observers.current.push(observer);
        return observer;
    }, [threshold, loadedComponents, isLoading, loadNextComponent, intersectionThresholds, rootMargin]);

    // Set up observers for loaded components
    useEffect(() => {
        // Clean up previous observers
        observers.current.forEach(observer => observer.disconnect());
        observers.current = [];

        // Create new observers for loaded components
        loadedComponents.forEach(createObserver);

        return () => {
            observers.current.forEach(observer => observer.disconnect());
        };
    }, [loadedComponents, createObserver]);

    const setComponentRef = useCallback((index, element) => {
        componentRefs.current[index] = element;
    }, []);

    const getLoadingStatus = useCallback(() => {
        return {
            loaded: loadedComponents,
            progress: componentProgress,
            isLoading,
            totalComponents,
            allLoaded: loadedComponents.length === totalComponents,
            config: PROGRESSIVE_LOADING_CONFIG
        };
    }, [loadedComponents, componentProgress, isLoading, totalComponents]);

    // Manual trigger to load next component (useful for testing or user interaction)
    const manuallyLoadNext = useCallback(() => {
        if (!isLoading && loadedComponents.length < totalComponents) {
            loadNextComponent();
        }
    }, [isLoading, loadedComponents.length, totalComponents, loadNextComponent]);

    // Reset loading state (useful for testing or page refresh)
    const resetLoading = useCallback(() => {
        setLoadedComponents([0]);
        setComponentProgress({});
        setIsLoading(false);
    }, []);

    return {
        loadedComponents,
        componentProgress,
        isLoading,
        setComponentRef,
        getLoadingStatus,
        loadNextComponent,
        manuallyLoadNext,
        resetLoading,
        config: PROGRESSIVE_LOADING_CONFIG
    };
};

export default useProgressiveLoading; 