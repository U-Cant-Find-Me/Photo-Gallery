const ErrorMessage = ({ 
  error, 
  onRetry, 
  title = "Something went wrong", 
  message = "We encountered an error while loading the content. Please try again.",
  showRetry = true,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-red-600 text-center mb-4">{message}</p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      )}
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 w-full">
          <summary className="cursor-pointer text-sm text-red-500 hover:text-red-700">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorMessage; 