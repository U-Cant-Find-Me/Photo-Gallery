"use client";

import React, { useEffect, useState } from 'react';
import { EditImagePanel } from "@/components/imageGeneration/EditImagePanel";
import { GenerateImagePanel } from "@/components/imageGeneration/GenerateImagePanel";
import { API_KEYS, validateApiKeys } from '@/config/api-config';

const GenerateImage = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if API keys are properly loaded
        if (!validateApiKeys()) {
            setError('API configuration error. Please check your environment setup.');
            return;
        }

        // Additional validation for Gemini specifically
        if (!API_KEYS.GEMINI) {
            setError('Gemini API key is not configured. Please check your .env.local file.');
            return;
        }

        // Log confirmation of API key presence (development only)
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Gemini API key is properly configured');
        }
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="max-w-2xl mx-auto p-6 bg-red-900/20 rounded-lg border border-red-500">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h2>
                    <p className="text-red-200">{error}</p>
                    <p className="mt-4 text-sm text-red-300">
                        Please check your .env.local file and ensure all required environment variables are set.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-12">
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-inter mb-4">
                    AI Image Studio
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-poppins">
                    Transform your ideas into stunning visuals using advanced AI. Generate new images or enhance existing ones with powerful AI tools.
                </p>
            </div>
            
            <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2">
                <EditImagePanel />
                <GenerateImagePanel />
            </div>
            
            <div className="mt-8 text-center text-sm text-slate-500">
                <p>Powered by advanced AI image generation technology</p>
            </div>
        </div>
    );
}

export default GenerateImage;