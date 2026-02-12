"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/utils/compressImage";

interface CompanyImageUploadProps {
  existingUrls?: string[];
  onUploadComplete: (urls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 2;
const BUCKET = "product-images";
const FOLDER = "company_info";

export default function CompanyImageUpload({
  existingUrls = [],
  onUploadComplete,
  onUploadingChange,
}: CompanyImageUploadProps) {
  const [slots, setSlots] = useState<(string | null)[]>([
    existingUrls[0] || null,
    existingUrls[1] || null,
  ]);

  const [uploading, setUploading] = useState<[boolean, boolean]>([false, false]);
  const [errors, setErrors] = useState<[string, string]>(["", ""]);

  useEffect(() => {
    setSlots([existingUrls[0] || null, existingUrls[1] || null]);
  }, [existingUrls[0], existingUrls[1]]);

  useEffect(() => {
    onUploadingChange?.(uploading.some(Boolean));
  }, [uploading, onUploadingChange]);

  const updateParent = (newSlots: (string | null)[]) => {
    onUploadComplete(newSlots.filter((u): u is string => !!u));
  };

  const deleteFromStorage = async (publicUrl: string) => {
    const path = publicUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
    if (!path) return;

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Failed to delete company ad image from storage:", error);
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextErrors = [...errors] as [string, string];
    nextErrors[index] = "";
    setErrors(nextErrors);

    if (!file.type.startsWith("image/")) {
      nextErrors[index] = "Only image files allowed";
      setErrors(nextErrors);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      nextErrors[index] = "Max size is 10MB";
      setErrors(nextErrors);
      return;
    }

    setUploading((u) => {
      const n = [...u] as [boolean, boolean];
      n[index] = true;
      return n;
    });

    try {
      const compressed = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const filePath = `${FOLDER}/${fileName}`;

      // Delete old image if exists
      if (slots[index]) {
        await deleteFromStorage(slots[index]!);
      }

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, compressed, {
          cacheControl: "259200", // 3 days
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      const newSlots = [...slots];
      newSlots[index] = publicUrlData.publicUrl;
      setSlots(newSlots);
      updateParent(newSlots);
    } catch (err) {
      console.error(err);
      nextErrors[index] = "Upload failed";
      setErrors(nextErrors);
    } finally {
      setUploading((u) => {
        const n = [...u] as [boolean, boolean];
        n[index] = false;
        return n;
      });
      e.target.value = "";
    }
  };

  const handleRemove = async (index: 0 | 1) => {
    if (slots[index]) await deleteFromStorage(slots[index]!);
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    updateParent(newSlots);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
      {[0, 1].map((i) => {
        const idx = i as 0 | 1;
        const url = slots[idx];
        const isUploading = uploading[idx];
        const error = errors[idx];

        return (
          <div key={idx} className="relative aspect-[4/3] sm:aspect-square border-2 border-stone-200 rounded-2xl overflow-hidden bg-stone-100 group">
            {url ? (
              <>
                <img src={url} className="w-full h-full object-cover" alt={`Ad image ${idx + 1}`} />
                <div className="absolute inset-0 bg-stone-900/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-3 items-center justify-center">
                  <label className="bg-white text-stone-900 px-4 py-2 rounded-xl cursor-pointer text-sm font-bold shadow-lg hover:bg-stone-50 transition-colors">
                    Change
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileSelect(e, idx)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer text-stone-500 hover:text-amber-600 hover:bg-stone-200/50 transition-all gap-2 p-4">
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(e, idx)}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <svg className="animate-spin h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                <span className="text-sm font-bold uppercase tracking-wider">{isUploading ? "Uploading…" : "Add image"}</span>
                <span className="text-[10px] text-stone-400">Max 10MB</span>
              </label>
            )}
            {error && (
              <p className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-red-600 bg-white/90 py-1.5 rounded-lg">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
