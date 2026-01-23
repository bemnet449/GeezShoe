import imageCompression from "browser-image-compression";

/**
 * Compresses an image file to WebP format with optimized settings
 * Target: 350KB max, 1200px max width/height
 * 
 * @param file - The image file to compress
 * @returns Compressed image file in WebP format
 */
export async function compressImage(file: File): Promise<File> {
    try {
        const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.35,          // 350KB target
            maxWidthOrHeight: 1200,   // resize if larger
            useWebWorker: true,       // use web worker for performance
            fileType: "image/webp",   // convert to WebP format
        });

        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        throw new Error("Failed to compress image. Please try again.");
    }
}
