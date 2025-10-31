"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FiImage, FiSend, FiUpload, FiZap } from 'react-icons/fi';
import { Spinner } from './Spinner';
// import { editImage, analyzeImage } from '@/services/geminiServices';
import { fileToBase64 } from '@/utils/fileUtils';
import { analyzeImage, editImage } from '@/services/geminiServices';

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

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

export const EditImagePanel = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [editedImage, setEditedImage] = useState(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const fileInputRef = useRef(null);

    const handleFileSelect = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            fileToBase64(file).then(base64 => {
                setUploadedImage({ file, previewUrl, base64, mimeType: file.type });
                setEditedImage(null);
                setAnalysisResult(null);
                setError(null);
            }).catch(err => {
                console.error(err);
                setError("Failed to read the image file.");
            });
        } else {
            setError("Please select a valid image file.");
        }
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragEvents = (e, dragState) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragState);
    };

    const handleDrop = useCallback((e) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleEdit = async () => {
        if (!uploadedImage || !editPrompt.trim()) {
            setError("Please upload an image and enter an edit prompt.");
            return;
        }
        setIsLoading(true);
        setLoadingAction('edit');
        setError(null);
        setEditedImage(null);
        try {
            const fullPrompt = `${editPrompt}. Make sure the output image has a ${aspectRatio} aspect ratio.`;
            const result = await editImage(uploadedImage.base64, uploadedImage.mimeType, fullPrompt);
            setEditedImage(result);
        } catch (err) {
            console.error(err);
            setError("Failed to edit the image. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedImage) {
            setError("Please upload an image to analyze.");
            return;
        }
        setIsLoading(true);
        setLoadingAction('analyze');
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeImage(uploadedImage.base64, uploadedImage.mimeType);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze the image. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && uploadedImage && editPrompt.trim() && !isLoading) {
            e.preventDefault();
            handleEdit();
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 flex flex-col gap-4 h-full">
            <div>
                <h2 className="text-2xl font-bold text-white">Edit Existing Image</h2>
                <p className="text-slate-400">Upload and enhance your existing images</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div
                    className={`relative flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-700'}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                >
                    {uploadedImage ? (
                        <img src={uploadedImage.previewUrl} alt="Uploaded preview" className="max-h-full max-w-full object-contain rounded-lg" />
                    ) : (
                        <div className="text-center text-slate-400 flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                                <FiUpload className="w-8 h-8 text-slate-400" />
                            </div>
                            <span className="font-semibold text-slate-300">Upload Image</span>
                            <p>Drag & drop your image here or click to browse</p>
                        </div>
                    )}
                </div>

                <div className={`relative flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl p-4 transition-all duration-300 ease-in-out ${getAspectRatioClass(aspectRatio)} mx-auto w-full overflow-hidden`}>
                    {isLoading && loadingAction === 'edit' ? <Spinner /> : editedImage ? (
                        <img src={editedImage} alt="Edited result" className="absolute top-0 left-0 w-full h-full object-contain p-1 rounded-lg" />
                    ) : (
                        <div className="text-center text-slate-400 flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                                <FiImage className="w-8 h-8 text-slate-400" />
                            </div>
                            <p>Edited image will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105">
                    <FiUpload className="w-5 h-5" />
                    {uploadedImage ? "Select Another Image" : "Select Image"}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            {analysisResult && (
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-indigo-400 mb-1">Analysis Result:</h3>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</p>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio for Edited Image</label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${aspectRatio === ratio ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                disabled={isLoading && loadingAction === 'edit'}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe how you want to edit the image..."
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 pr-28 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        disabled={!uploadedImage || isLoading}
                    />
                    <button onClick={handleEdit} className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled={!uploadedImage || isLoading || !editPrompt.trim()}>
                        Edit <FiSend className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!uploadedImage || isLoading}>
                {isLoading && loadingAction === 'analyze' ? <Spinner /> : <><FiZap className="w-5 h-5" /> Analyze Image</>}
            </button>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
    );
};