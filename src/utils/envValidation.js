// Environment variable validation utility
export const validateEnvVars = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_UNSPLASH',
    'NEXT_PUBLIC_API_PIXABAY',
    'NEXT_PUBLIC_API_PEXELS',
    'NEXT_PUBLIC_GEMINI_API_KEY',
    'GEMINI_API_KEY'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    
    // In development, show detailed error
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Environment Variables Error:', errorMessage);
      console.error('📝 Please add the following to your .env.local file:');
      missing.forEach(key => {
        console.error(`   ${key}=your_GEMINI_API_KEY_here`);
      });
      console.error('🔗 Get API keys from:');
      console.error('   - Unsplash: https://unsplash.com/developers');
      console.error('   - Pixabay: https://pixabay.com/api/docs/');
      console.error('   - Pexels: https://www.pexels.com/api/');
    }
    
    return {
      isValid: false,
      missing,
      error: errorMessage
    };
  }

  return {
    isValid: true,
    missing: [],
    error: null
  };
};

// Check if we're in browser environment
export const isBrowser = typeof window !== 'undefined';

// Get API status for each service
export const getAPIStatus = () => {
  const status = {
    unsplash: !!process.env.NEXT_PUBLIC_API_UNSPLASH,
    pixabay: !!process.env.NEXT_PUBLIC_API_PIXABAY,
    pexels: !!process.env.NEXT_PUBLIC_API_PEXELS,
    picsum: true, // Picsum doesn't require API key
    gemini: !!(typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.GEMINI_API_KEY)
  };

  return {
    ...status,
    totalConfigured: Object.values(status).filter(Boolean).length,
    totalAvailable: Object.keys(status).length
  };
};

// Validate API keys format (basic validation)
export const validateAPIKeyFormat = (key, service) => {
  if (!key) return false;
  
  const patterns = {
    unsplash: /^[a-zA-Z0-9_-]{40,}$/,
    pixabay: /^[0-9]+-[a-zA-Z0-9]+$/,
    pexels: /^[a-zA-Z0-9]{56}$/,
    gemini: /^[A-Za-z0-9-_]+$/
  };

  const pattern = patterns[service];
  return pattern ? pattern.test(key) : true;
};

export default validateEnvVars; 