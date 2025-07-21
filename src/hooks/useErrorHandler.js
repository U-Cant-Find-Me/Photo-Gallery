import { useState, useCallback } from 'react';

const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Set user-friendly error message
    let userMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // API error response
      switch (error.response.status) {
        case 400:
          userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          userMessage = 'Access denied. You don\'t have permission.';
          break;
        case 404:
          userMessage = 'Content not found.';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        case 503:
          userMessage = 'Service temporarily unavailable.';
          break;
        default:
          userMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Network error
      userMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      // Other error
      userMessage = error.message;
    }

    setError({
      message: userMessage,
      original: error,
      context,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (operation) => {
    if (!operation) return;
    
    clearError();
    setIsLoading(true);
    
    try {
      await operation();
      setIsLoading(false);
    } catch (err) {
      handleError(err, 'retry operation');
    }
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    retry,
    setLoading: setIsLoading
  };
};

export default useErrorHandler; 