/**
 * Converts a File object to a base64 encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the base64 string (without the data URL prefix).
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            // The result is a data URL (e.g., "data:image/jpeg;base64,ABC..."). 
            // We want just the base64 part.
            const base64String = result.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Failed to extract base64 string from file."));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};