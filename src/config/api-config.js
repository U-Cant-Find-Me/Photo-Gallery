export const API_KEYS = {
    GEMINI: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    UNSPLASH: process.env.NEXT_PUBLIC_API_UNSPLASH,
    PIXABAY: process.env.NEXT_PUBLIC_API_PIXABAY,
    PEXELS: process.env.NEXT_PUBLIC_API_PEXELS,
};

// Validate that required API keys are present
export const validateApiKeys = () => {
    const missing = Object.entries(API_KEYS)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error(`Missing API keys: ${missing.join(', ')}`);
        return false;
    }
    return true;
};