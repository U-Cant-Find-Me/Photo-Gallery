import { GoogleGenAI, Modality } from "@google/genai";

import { API_KEYS } from '@/config/api-config';
import { isRateLimitError, rateLimiter } from "@/utils/rateLimiter";

// Use API key from centralized config
const API_KEY = API_KEYS.GEMINI;
const MAX_RETRIES = 3;

if (!API_KEY) {
    console.error("Gemini API key not found. Please check your environment configuration.");
    throw new Error("Gemini API key must be set");
}

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an image using the imagen-4.0 model.
 * @param prompt The text prompt describing the image to generate.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns A base64 encoded data URL of the generated image.
 */
export const generateImage = async (prompt, aspectRatio) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            // Wait for rate limit token
            await rateLimiter.requestLimiter.take();
            
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: aspectRatio,
                },
            });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation returned no images.");
        }
        } catch (error) {
            if (isRateLimitError(error)) {
                console.warn(`Rate limit hit, attempt ${retries + 1}/${MAX_RETRIES}`);
                await handleRateLimit(error);
                retries++;
                continue;
            }
            console.error("Error in generateImage:", error);
            throw error;
        }
        break; // Success, exit loop
    }
    throw new Error("Maximum retries exceeded for image generation");
};

/**
 * Edits an existing image based on a text prompt using the gemini-2.5-flash-image model.
 * @param base64Data The base64 encoded string of the image to edit.
 * @param mimeType The MIME type of the image.
 * @param prompt The text prompt describing the desired edits.
 * @returns A base64 encoded data URL of the edited image.
 */
export const editImage = async (base64Data, mimeType, prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("Image editing returned no image data.");
    } catch (error) {
        console.error("Error in editImage:", error);
        throw new Error("Failed to edit image via Gemini API.");
    }
};

/**
 * Analyzes an image using the gemini-2.5-flash model.
 * @param base64Data The base64 encoded string of the image to analyze.
 * @param mimeType The MIME type of the image.
 * @returns A text description of the image.
 */
export const analyzeImage = async (base64Data, mimeType) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: "Describe this image in detail and suggest some creative edits. Keep the response under 200 words." },
                ],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error in analyzeImage:", error);
        throw new Error("Failed to analyze image via Gemini API.");
    }
};