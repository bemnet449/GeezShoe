import imageCompression from "browser-image-compression";

const MAX_SIZE_BYTES = 350 * 1024; // 350KB
const MAX_SIZE_MB = 0.35;

export async function compressImage(file: File): Promise<File> {
  try {
    console.log("Original file:", file.type, file.size);

    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    // Prevent unsupported HEIC format crashing on mobile
    if (file.type === "image/heic" || file.type === "image/heif") {
      throw new Error(
        "HEIC format is not supported. Please change your camera format to JPEG."
      );
    }

    // STEP 1: Resize first (VERY IMPORTANT for mobile stability)
    const resizedFile = await imageCompression(file, {
      maxWidthOrHeight: 1000, // smaller dimension = more stable on phones
      useWebWorker: true,
      initialQuality: 0.8,
    });

    // If already small enough after resizing, return
    if (resizedFile.size <= MAX_SIZE_BYTES) {
      return resizedFile;
    }

    // STEP 2: Compress to WebP safely
    const compressedFile = await imageCompression(resizedFile, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.7,
    });

    if (compressedFile.size > MAX_SIZE_BYTES) {
      throw new Error(
        "Image is too large even after compression. Please use a smaller image."
      );
    }

    console.log("Compressed file:", compressedFile.size);

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error(
      "Failed to process image. Please try another image (JPEG or PNG)."
    );
  }
}
