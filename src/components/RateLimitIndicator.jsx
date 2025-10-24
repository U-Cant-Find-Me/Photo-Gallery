import React from 'react';

export const RateLimitIndicator = ({ retryAfter, onClose }) => {
    const [timeLeft, setTimeLeft] = React.useState(retryAfter);

    React.useEffect(() => {
        if (!retryAfter) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [retryAfter, onClose]);

    if (!retryAfter) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-red-900/90 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Rate limit reached. Retry in {timeLeft}s</span>
            </div>
            <div className="mt-2 text-sm text-red-200">
                Please wait while we respect API limits
            </div>
        </div>
    );
};