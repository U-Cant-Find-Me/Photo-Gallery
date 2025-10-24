"use client";

import React, { useState } from 'react';
import { FiSend, FiZap } from 'react-icons/fi';
import { Spinner } from './Spinner';
import { generateImage, analyzeImage } from '@/services/geminiServices';

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const GenerateImagePanel = () => {
    const [generatePrompt, setGeneratePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!generatePrompt.trim()) {
            setError("Please enter a prompt to generate an image.");
            return;
        }
        setIsLoading(true);
        setLoadingAction('generate');
        setError(null);
        setGeneratedImage(null);
        setAnalysisResult(null);
        try {
            const result = await generateImage(generatePrompt, aspectRatio);
            setGeneratedImage(result);
        } catch (err) {
            console.error(err);
            if (err.error?.code === 429 || err.message?.includes('quota exceeded')) {
                setError("Rate limit reached. Please wait a moment before trying again.");
            } else {
                setError("Failed to generate the image. Please try again.");
            }
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    const handleAnalyze = async () => {
        if (!generatedImage) {
            setError("Please generate an image first to analyze it.");
            return;
        }
        setIsLoading(true);
        setLoadingAction('analyze');
        setError(null);
        setAnalysisResult(null);
        try {
            const [meta, base64Data] = generatedImage.split(',');
            if (!meta || !base64Data) throw new Error("Invalid image data URL format.");

            const mimeTypeMatch = meta.match(/:(.*?);/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not determine MIME type from data URL.");

            const mimeType = mimeTypeMatch[1];
            const result = await analyzeImage(base64Data, mimeType);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            if (err.error?.code === 429 || err.message?.includes('quota exceeded')) {
                setError("API rate limit reached. Please wait a moment before trying again.");
            } else {
                setError("Failed to analyze the image. Please try again.");
            }
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && generatePrompt.trim() && !isLoading) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const getAspectRatioClass = (ratio) => {
        switch (ratio) {
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '1:1':
            default: return 'aspect-square';
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-xl flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-inter mb-1">
                    Generate New Image
                </h2>
                <p className="text-slate-400 text-sm font-poppins">Create unique, AI-generated images from text descriptions</p>
            </div>

            <div className={`relative group flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${getAspectRatioClass(aspectRatio)} mx-auto w-full min-h-[400px] ${generatedImage ? 'border-purple-500/50' : 'border-slate-700/50 hover:border-slate-600/50'}`}>
                {isLoading && loadingAction === 'generate' ? (
                    <div className="flex flex-col items-center gap-4">
                        <Spinner />
                        <p className="text-slate-400 animate-pulse">Creating your masterpiece...</p>
                    </div>
                ) : generatedImage ? (
                    <div className="relative w-full h-full group">
                        <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end justify-center p-4">
                            <button onClick={handleAnalyze} className="bg-purple-500/90 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                <FiZap className="w-4 h-4" /> Analyze Image
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center gap-6 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 p-5">
                            <FiSend className="w-full h-full text-white -rotate-45 transform" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-xl text-slate-200">AI Image Generation</h3>
                            <p className="text-sm text-slate-400">Transform your ideas into stunning visuals using advanced AI</p>
                            <p className="text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                Try: "A serene Japanese garden at twilight with cherry blossoms falling, cinematic lighting, 8k resolution"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {analysisResult && (
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <FiZap className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-purple-400">AI Analysis</h3>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap">{analysisResult}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Choose Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    aspectRatio === ratio
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={generatePrompt}
                            onChange={(e) => setGeneratePrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your imagination in detail..."
                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-3 px-4 pr-32 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !generatePrompt.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500"
                        >
                            Generate <FiSend className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Pro tip: Add details like style, lighting, and quality for better results
                    </p>
                </div>
            </div>

            <button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!generatedImage || isLoading}>
                {isLoading && loadingAction === 'analyze' ? <Spinner /> : <><FiZap className="w-5 h-5" /> Analyze Image</>}
            </button>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};