"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import CompanyAdImageUpload from "@/components/CompanyAdImageUpload";

export interface CompanyInfoData {
  email: string;
  phone_number: string;
  instagram: string;
  whatsapp: string;
  telegram: string;
  ad_img: string[];
}

const COMPANY_ID = 1; // single-row pattern

export default function CompanyInfoForm() {
  const [formData, setFormData] = useState<CompanyInfoData>({
    email: "",
    phone_number: "",
    instagram: "",
    whatsapp: "",
    telegram: "",
    ad_img: [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ─────────────────────────────────────────
  // Fetch existing company info (EDIT mode)
  // Use .maybeSingle() so 0 rows returns data: null instead of 406.
  // ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("company_info")
        .select("*")
        .eq("id", COMPANY_ID)
        .maybeSingle();

      if (error) {
        // PGRST116 = no rows; that's ok for new company info
        if (error.code !== "PGRST116") {
          console.error("Failed to fetch company info:", error);
        }
      }

      if (data) {
        setFormData({
          email: data.email ?? "",
          phone_number: data.phone_number ?? "",
          instagram: data.instagram ?? "",
          whatsapp: data.whatsapp ?? "",
          telegram: data.telegram ?? "",
          ad_img: data.ad_img ?? [],
        });
      }

      setLoading(false);
    })();
  }, []);

  // ─────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────
  const validationErrors = useMemo(() => {
    const errors: Partial<Record<keyof CompanyInfoData, string>> = {};

    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phone_number.trim()) errors.phone_number = "Phone number is required";
    if (formData.ad_img.length === 0) errors.ad_img = "At least one ad image is required";
    if (formData.ad_img.length > 2) errors.ad_img = "Maximum 2 images allowed";

    return errors;
  }, [formData]);

  const isValid = Object.keys(validationErrors).length === 0;

  // ─────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesUpdate = (urls: string[]) => {
    setFormData(prev => ({ ...prev, ad_img: urls.slice(0, 2) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isValid) {
      setError("Please fix the errors before saving.");
      return;
    }

    setSaving(true);

    const payload = {
      email: formData.email.trim(),
      phone_number: formData.phone_number.trim(),
      instagram: formData.instagram.trim() || null,
      whatsapp: formData.whatsapp.trim() || null,
      telegram: formData.telegram.trim() || null,
      ad_img: formData.ad_img,
    };

    const { error } = await supabase
      .from("company_info")
      .upsert({ id: COMPANY_ID, ...payload });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setSaving(false);
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-stone-500 font-medium text-sm">Loading company info…</p>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all text-stone-900 font-medium placeholder:text-stone-400";
  const labelBase = "block text-[10px] uppercase font-black tracking-widest text-stone-500 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Saved successfully. Your company info is up to date.
        </div>
      )}

      {/* Contact & Social */}
      <div className="bg-stone-50/50 rounded-2xl border border-stone-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">Contact & social</h2>
            <p className="text-xs text-stone-500 font-medium">Required: email and phone. Optional: social links.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label htmlFor="email" className={labelBase}>Company email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="hello@company.com"
              value={formData.email}
              onChange={handleChange}
              className={inputBase}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600 font-bold mt-1.5 uppercase tracking-tight">{validationErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone_number" className={labelBase}>Phone number *</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="+251 912 345 678"
              value={formData.phone_number}
              onChange={handleChange}
              className={inputBase}
            />
            {validationErrors.phone_number && (
              <p className="text-xs text-red-600 font-bold mt-1.5 uppercase tracking-tight">{validationErrors.phone_number}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="instagram" className={labelBase}>Instagram (optional)</label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/yourbrand"
              value={formData.instagram}
              onChange={handleChange}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className={labelBase}>WhatsApp (optional)</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              placeholder="Number or invite link"
              value={formData.whatsapp}
              onChange={handleChange}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="telegram" className={labelBase}>Telegram (optional)</label>
            <input
              id="telegram"
              name="telegram"
              type="url"
              placeholder="https://t.me/yourbrand"
              value={formData.telegram}
              onChange={handleChange}
              className={inputBase}
            />
          </div>
        </div>
      </div>

      {/* Ad Images */}
      <div className="bg-stone-50/50 rounded-2xl border border-stone-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">Advertisement images</h2>
            <p className="text-xs text-stone-500 font-medium">Upload up to 2 images (e.g. banners or promos). At least one required.</p>
          </div>
        </div>
        <CompanyAdImageUpload
          existingUrls={formData.ad_img}
          onUploadComplete={handleImagesUpdate}
        />
        {validationErrors.ad_img && (
          <p className="text-xs text-red-600 font-bold mt-3 uppercase tracking-tight">{validationErrors.ad_img}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
            saving
              ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
              : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/25 active:scale-[0.98]"
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving…
            </span>
          ) : (
            "Save company info"
          )}
        </button>
        <p className="text-xs text-stone-400 font-medium">Changes apply to the public company profile.</p>
      </div>
    </form>
  );
}
