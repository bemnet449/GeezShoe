"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductImageUpload from "./ProductImageUpload";

interface ProductFormProps {
    mode: "create" | "edit";
    productId?: number;
    onSuccess?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATA TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProductData {
    name: string;
    description: string;
    item_number: number | string; // Treated as Stock Quantity
    real_price: number | string;
    fake_price: number | string;
    discount: boolean;
    discount_title: string;
    discount_price: number | string;
    image_urls: string[];
    sizes_available: number[];
    is_active: boolean;
}

const AVAILABLE_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const MAX_IMAGES = 2;

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductForm({ mode, productId, onSuccess }: ProductFormProps) {
    // 1. Form State
    const [formData, setFormData] = useState<ProductData>({
        name: "",
        description: "",
        item_number: "",
        real_price: "",
        fake_price: "",
        discount: false,
        discount_title: "",
        discount_price: "",
        image_urls: [],
        sizes_available: [],
        is_active: true,
    });

    // 2. Touched State (to show errors only after interaction)
    const [touched, setTouched] = useState<Partial<Record<keyof ProductData, boolean>>>({});

    // 3. UI States
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [, setIsImageUploading] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────────
    //  VALIDATION LOGIC (Declarative & Real-time)
    // ─────────────────────────────────────────────────────────────────────────────

    // calculated on every render for immediate feedback
    const validationErrors = useMemo(() => {
        const errors: Partial<Record<keyof ProductData, string>> = {};

        const isEmpty = (val: unknown) =>
            val === null || val === undefined || String(val).trim() === "";

        const num = (val: unknown) => Number(val);

        if (isEmpty(formData.name)) errors.name = "Product name is required.";
        if (isEmpty(formData.description)) errors.description = "Product description is required.";

        if (isEmpty(formData.item_number)) {
            errors.item_number = "Stock quantity is required.";
        } else if (num(formData.item_number) < 0) {
            errors.item_number = "Stock cannot be negative.";
        }

        if (isEmpty(formData.real_price)) {
            errors.real_price = "Price is required.";
        } else if (num(formData.real_price) <= 0) {
            errors.real_price = "Price must be greater than zero.";
        }

        if (formData.discount) {
            if (isEmpty(formData.discount_price)) {
                errors.discount_price = "Sale price is required.";
            } else if (num(formData.discount_price) >= num(formData.real_price)) {
                errors.discount_price = "Sale price must be lower than regular price.";
            }
        }

        if (formData.image_urls.length === 0)
            errors.image_urls = "Add at least one image.";

        if (formData.sizes_available.length === 0)
            errors.sizes_available = "Select at least one size.";

        return errors;
    }, [formData]);

    const isValid = Object.keys(validationErrors).length === 0;

    // ─────────────────────────────────────────────────────────────────────────────
    //  EFFECTS
    // ─────────────────────────────────────────────────────────────────────────────

    // Auto-update stock status based on quantity
    useEffect(() => {
        // Treat empty string as 0 stock for status calculation
        const stock = formData.item_number === "" ? 0 : Number(formData.item_number);
        if (isNaN(stock)) return;

        setFormData(prev => {
            const shouldBeActive = stock > 0;
            if (prev.is_active !== shouldBeActive) {
                return { ...prev, is_active: shouldBeActive };
            }
            return prev;
        });
    }, [formData.item_number]);


    // Load Data for Edit Mode
    useEffect(() => {
        if (mode === "edit" && productId) {
            (async () => {
                try {
                    const { data, error } = await supabase
                        .from("products")
                        .select("*")
                        .eq("id", productId)
                        .single();

                    if (error) throw error;
                    if (data) {
                        setFormData({
                            name: data.Name || "",
                            description: data.description || "",
                            item_number: data.item_number ?? "",
                            real_price: data.real_price ?? "",
                            fake_price: data.fake_price ?? "",
                            discount: data.discount || false,
                            discount_title: data.discount_title || "",
                            discount_price: data.discount_price ?? "",
                            image_urls: data.image_urls || [],
                            sizes_available: data.sizes_available || [],
                            is_active: data.is_active ?? true,
                        });
                    }
                } catch (err) {
                    console.error("Load error:", err);
                    setSubmitError("Could not load product details.");
                }
            })();
        }
    }, [mode, productId]);

    // ─────────────────────────────────────────────────────────────────────────────
    //  HANDLERS
    // ─────────────────────────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleBlur = (field: keyof ProductData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSizeToggle = (size: number) => {
        setFormData(prev => {
            const currentSizes = prev.sizes_available;
            const newSizes = currentSizes.includes(size)
                ? currentSizes.filter(s => s !== size)
                : [...currentSizes, size].sort((a, b) => a - b);
            return { ...prev, sizes_available: newSizes };
        });
        // Mark sizes as touched immediately upon interaction
        if (!touched.sizes_available) setTouched(prev => ({ ...prev, sizes_available: true }));
    };

    const handleImagesUpdate = (urls: string[]) => {
        setFormData(prev => ({ ...prev, image_urls: urls }));
        if (!touched.image_urls) setTouched(prev => ({ ...prev, image_urls: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Mark all as touched to show any hidden errors
        const allTouched = Object.keys(formData).reduce((acc, key) => ({
            ...acc, [key]: true
        }), {} as Record<keyof ProductData, boolean>);
        setTouched(allTouched);

        // 2. Stop if invalid
        if (!isValid) {
            setSubmitError("Please correct the highlighted errors before saving.");
            return;
        }

        // 3. Submit
        setLoading(true);
        setSubmitError("");
        setSubmitSuccess(false);

        // Helper to safely convert inputs to numbers or null for DB
        const toNum = (val: string | number | null | undefined) => {
            if (val === "" || val === null || val === undefined) return null;
            const num = Number(val);
            return isNaN(num) ? null : num;
        };

        try {
            const payload = {
                Name: formData.name.trim(),
                description: formData.description.trim(),
                item_number: toNum(formData.item_number) ?? 0,
                real_price: toNum(formData.real_price) ?? 0,

                fake_price: formData.discount
                    ? toNum(formData.real_price)
                    : toNum(formData.fake_price),

                discount: formData.discount,
                discount_title: formData.discount ? formData.discount_title.trim() : null,
                discount_price: formData.discount ? toNum(formData.discount_price) : null,

                image_urls: formData.image_urls,
                sizes_available: formData.sizes_available,
                is_active: (toNum(formData.item_number) ?? 0) > 0,
            };

            // Log payload for debugging
            console.log("Form Submission Payload:", payload);

            if (mode === "create") {
                const { error, data } = await supabase.from("products").insert([payload]).select();
                if (error) {
                    console.error("Supabase Insert detailed error:", error);
                    throw new Error(`Database Error: ${error.message} (Code: ${error.code})`);
                }
                console.log("Insert success:", data);
            } else {
                const { error, data } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", productId)
                    .select();
                if (error) {
                    console.error("Supabase Update detailed error:", error);
                    throw new Error(`Database Error: ${error.message} (Code: ${error.code})`);
                }
                console.log("Update success:", data);
            }

            setSubmitSuccess(true);
            setTimeout(() => onSuccess?.(), 1500);

        } catch (err) {
            console.error("Submission failed fully:", err);
            // Show more detailed error message to UI
            setSubmitError(err instanceof Error ? err.message : "Something went wrong during database save.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to render error message
    const renderError = (field: keyof ProductData) => {
        if (touched[field] && validationErrors[field]) {
            return (
                <p className="mt-1 text-sm text-red-600 animate-pulse font-medium">
                    {validationErrors[field]}
                </p>
            );
        }
        return null;
    };

    // ─────────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────────────────

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Status Messages */}
            {submitSuccess && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center text-green-800 shadow-sm">
                    <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <div>
                        <p className="font-bold">{mode === "create" ? "Success!" : "Updated!"}</p>
                        <p className="text-sm">Redirecting...</p>
                    </div>
                </div>
            )}

            {submitError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center text-red-800 shadow-sm">
                    <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium">{submitError}</span>
                </div>
            )}

            {/* 1. Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center border-b pb-2 border-stone-100">
                    <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded flex items-center justify-center mr-2 text-sm">1</span>
                    Basic Details
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Product Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={() => handleBlur("name")}
                            className={`w-full p-3 rounded-lg border text-stone-900 ${touched.name && validationErrors.name ? "border-red-500 bg-red-50" : "border-stone-200 bg-white"} focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all`}
                            placeholder="e.g. Vintage Leather Boots"
                        />
                        {renderError("name")}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={() => handleBlur("description")}
                            rows={3}
                            className={`w-full p-3 rounded-lg border text-stone-900 ${touched.description && validationErrors.description ? "border-red-500 bg-red-50" : "border-stone-200 bg-white"} focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none`}
                            placeholder="Describe the material, style, and fit..."
                        />
                        {renderError("description")}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                        <input
                            type="number"
                            name="item_number"
                            value={formData.item_number}
                            onChange={handleChange}
                            onBlur={() => handleBlur("item_number")}
                            className={`w-full p-3 rounded-lg border text-stone-900 ${touched.item_number && validationErrors.item_number ? "border-red-500 bg-red-50" : "border-stone-200 bg-white"} focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all`}
                            placeholder="0"
                        />
                        <p className="text-xs text-stone-500 mt-1">If 0, functionality auto-hides the product.</p>
                        {renderError("item_number")}
                    </div>
                </div>
            </div>

            {/* 2. Pricing */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center border-b pb-2 border-stone-100">
                    <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded flex items-center justify-center mr-2 text-sm">2</span>
                    Price & Offers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Regular Price ($) *</label>
                        <input
                            type="number"
                            name="real_price"
                            value={formData.real_price}
                            onChange={handleChange}
                            onBlur={() => handleBlur("real_price")}
                            className={`w-full p-3 rounded-lg border ${touched.real_price && validationErrors.real_price ? "border-red-500 bg-red-50" : "border-stone-200 bg-white"} ${formData.discount ? "line-through text-stone-400" : "text-stone-900"} focus:ring-2 focus:ring-amber-400 outline-none transition-all`}
                            placeholder="0.00"
                        />
                        {renderError("real_price")}
                    </div>

                    {!formData.discount && (
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Crossed-Out Price ($)</label>
                            <input
                                type="number"
                                name="fake_price"
                                value={formData.fake_price}
                                onChange={handleChange}
                                onBlur={() => handleBlur("fake_price")}
                                className={`w-full p-3 rounded-lg border text-stone-900 ${touched.fake_price && validationErrors.fake_price ? "border-red-500 bg-red-50" : "border-stone-200 bg-white"} focus:ring-2 focus:ring-amber-400 outline-none transition-all`}
                                placeholder="Higher than regular..."
                            />
                            {renderError("fake_price")}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100">
                    <label className="flex items-center space-x-3 cursor-pointer group w-max">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${formData.discount ? 'bg-amber-500' : 'bg-stone-300'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${formData.discount ? 'translate-x-6' : ''}`} />
                        </div>
                        <input
                            type="checkbox"
                            name="discount"
                            checked={formData.discount}
                            onChange={handleChange}
                            className="hidden"
                        />
                        <span className="font-semibold text-stone-700 group-hover:text-amber-600 transition-colors">Enable Promotional Discount</span>
                    </label>

                    {formData.discount && (
                        <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-semibold text-amber-900 mb-1">Discount Tag</label>
                                <input
                                    name="discount_title"
                                    value={formData.discount_title}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded border border-amber-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                    placeholder="e.g. FLASH SALE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-amber-900 mb-1">Sale Price ($) *</label>
                                <input
                                    type="number"
                                    name="discount_price"
                                    value={formData.discount_price}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("discount_price")}
                                    className={`w-full p-2 rounded border text-stone-900 ${touched.discount_price && validationErrors.discount_price ? "border-red-500 bg-red-50" : "border-amber-300 bg-white"} focus:ring-2 focus:ring-amber-500 outline-none`}
                                    placeholder="Lower than regular..."
                                />
                                {renderError("discount_price")}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Media */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center border-b pb-2 border-stone-100">
                    <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded flex items-center justify-center mr-2 text-sm">3</span>
                    Images
                </h3>
                <ProductImageUpload
                    productName={formData.name}
                    onUploadComplete={handleImagesUpdate}
                    onUploadingChange={setIsImageUploading}
                    existingUrls={formData.image_urls}
                    mode={mode}
                />

                {renderError("image_urls")}
                <p className="text-xs text-stone-500 mt-2">Max {MAX_IMAGES} images allowed.</p>
            </div>

            {/* 4. Sizes */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center border-b pb-2 border-stone-100">
                    <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded flex items-center justify-center mr-2 text-sm">4</span>
                    Sizes & Visibility
                </h3>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Available Sizes *</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SIZES.map(size => {
                            const isSelected = formData.sizes_available.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleSizeToggle(size)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${isSelected
                                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300 ring-offset-1'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                    {renderError("sizes_available")}
                </div>

                <div className="border-t border-stone-100 pt-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                        <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                        <div>
                            <span className="block font-semibold text-stone-800">
                                {formData.is_active ? "In Stock (Visible to Customers)" : "Out of Stock (Hidden)"}
                            </span>
                            <span className="text-xs text-stone-500">
                                Status is managed automatically based on Stock Quantity.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`
                        px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all
                        flex items-center space-x-2
                        ${loading
                            ? 'bg-stone-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 hover:shadow-xl transform hover:-translate-y-1'
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <span>{mode === 'create' ? "Create Product" : "Save Changes"}</span>
                    )}
                </button>
            </div>
        </form>
    );
}
