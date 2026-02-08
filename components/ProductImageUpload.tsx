"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/utils/compressImage";

interface ProductImageUploadProps {
  productName: string;
  onUploadComplete: (urls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  existingUrls?: string[];
  mode: "create" | "edit";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ProductImageUpload({
  productName,
  onUploadComplete,
  onUploadingChange,
  existingUrls = [],
  mode: _mode,
}: ProductImageUploadProps) {
  const [slots, setSlots] = useState<(string | null)[]>([
    existingUrls[0] || null,
    existingUrls[1] || null,
    existingUrls[2] || null,
  ]);
  const [uploadingState, setUploadingState] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [errors, setErrors] = useState<[string, string, string]>(["", "", ""]);

  useEffect(() => {
    if (existingUrls.length > 0) {
      setSlots([
        existingUrls[0] || null,
        existingUrls[1] || null,
        existingUrls[2] || null,
      ]);
    }
  }, [existingUrls]);

  useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(uploadingState[0] || uploadingState[1] || uploadingState[2]);
    }
  }, [uploadingState, onUploadingChange]);

  const updateParent = (newSlots: (string | null)[]) => {
    const validUrls = newSlots.filter((url): url is string => !!url);
    onUploadComplete(validUrls);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: 0 | 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newErrors = [...errors] as [string, string, string];
    newErrors[slotIndex] = "";
    setErrors(newErrors);

    if (!file.type.startsWith("image/")) {
      newErrors[slotIndex] = "Only image files are allowed";
      setErrors(newErrors);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      newErrors[slotIndex] = "File exceeds 10MB limit";
      setErrors(newErrors);
      return;
    }
    if (!productName.trim()) {
      newErrors[slotIndex] = "Enter Product Name first";
      setErrors(newErrors);
      return;
    }

    setUploadingState(prev => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[slotIndex] = true;
      return next;
    });

    try {
      const compressedFile = await compressImage(file);

      // Versioned file name to avoid cache conflicts
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const safeName = productName.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const fileName = `shoes/${safeName}/${timestamp}-${randomStr}.webp`;

      // Upload with 3-day cache
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressedFile, {
          cacheControl: "259200", // 3 days in seconds
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Delete old image in this slot to save storage
      if (slots[slotIndex]) {
        const oldPath = slots[slotIndex].split("/storage/v1/object/public/product-images/")[1];
        if (oldPath) {
          await supabase.storage.from("product-images").remove([oldPath]);
        }
      }

      const newSlots = [...slots];
      newSlots[slotIndex] = publicUrl;
      setSlots(newSlots);
      updateParent(newSlots);

    } catch (err) {
      console.error("Upload failed:", err);
      newErrors[slotIndex] = "Upload failed. Try again.";
      setErrors(newErrors);
    } finally {
      setUploadingState(prev => {
        const next = [...prev] as [boolean, boolean, boolean];
        next[slotIndex] = false;
        return next;
      });
      e.target.value = "";
    }
  };

  const handleRemove = (slotIndex: 0 | 1 | 2) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    updateParent(newSlots);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-stone-500 mb-2">
        <p>Upload 1-3 images. First is Primary.</p>
        <div className="text-xs">{slots.filter(s => s).length} / 3 uploaded</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => {
          const slotIndex = index as 0 | 1 | 2;
          const url = slots[slotIndex];
          const isUploading = uploadingState[slotIndex];
          const error = errors[slotIndex];

          return (
            <div key={slotIndex} className="relative group">
              <div className={`
                relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-dashed transition-all
                ${error ? "border-red-300 bg-red-50" : url ? "border-amber-500 bg-white border-solid" : "border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50"}
              `}>
                {url ? (
                  <>
                    <img src={url} alt={`Product ${slotIndex + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-semibold hover:bg-white/30 transition-colors">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e, slotIndex)}
                          disabled={isUploading}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemove(slotIndex)}
                        className="px-4 py-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, slotIndex)}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <svg className="animate-spin w-10 h-10 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-amber-500 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    <span className="text-stone-600 font-medium text-center">
                      {isUploading ? "Uploading..." : `Add Image ${slotIndex + 1}`}
                    </span>
                  </label>
                )}
              </div>
              {error && <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-500 font-medium truncate">{error}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-xs text-stone-400 px-1 pt-2">
        <p>Supported: JPEG, PNG, WebP</p>
        <p>Max size: 10MB per file</p>
      </div>
    </div>
  );
}
