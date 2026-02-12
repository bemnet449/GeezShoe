import imageCompression from "browser-image-compression";

const MAX_SIZE_BYTES = 350 * 1024; // 350KB

/**
 * Compresses an image file with the following rules:
 * - Target max size: 350KB
 * - Max dimension: 1200px
 * - Convert to WebP
 * - Use Web Worker
 *
 * Behaviour:
 * - If original file size <= 350KB:
 *    - If already WebP, return original file.
 *    - Otherwise, attempt a light conversion to WebP and only use it
 *      if it does NOT increase the size and stays <= 350KB.
 * - If original file size > 350KB:
 *    - Compress with browser-image-compression targeting 350KB and
 *      max dimension 1200px.
 *    - If the result is still larger than 350KB, throw an error so
 *      callers never upload an oversize file.
 *
 * This ensures we never store files > 350KB and we do not
 * unnecessarily recompress or bloat already small images.
 */
export async function compressImage(file: File): Promise<File> {
    try {
        const isWebP = file.type === "image/webp";

        // If already at or under the size limit, avoid heavy work.
        if (file.size <= MAX_SIZE_BYTES) {
            if (isWebP) {
                // Already optimal format and within size limit.
                return file;
            }

            // Try a light conversion to WebP but only if it helps.
            const originalSizeMB = file.size / (1024 * 1024);
            const maxSizeMB = Math.min(0.35, originalSizeMB);

            const converted = await imageCompression(file, {
                maxSizeMB,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: "image/webp",
            });

            // Only use the converted file if it is not bigger and still <= 350KB
            if (converted.size <= file.size && converted.size <= MAX_SIZE_BYTES) {
                return converted;
            }

            // Otherwise, keep the original small file.
            return file;
        }

        // Larger than 350KB → must compress down.
        const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.35,          // 350KB target
            maxWidthOrHeight: 1200,   // resize if larger
            useWebWorker: true,       // use web worker for performance
            fileType: "image/webp",   // convert to WebP format
        });

        if (compressedFile.size > MAX_SIZE_BYTES) {
            console.error("Compressed image is still too large:", {
                originalSize: file.size,
                compressedSize: compressedFile.size,
            });
            throw new Error("Image is too large even after compression. Please choose a smaller image.");
        }

        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        throw new Error("Failed to compress image. Please try again.");
    }
}
