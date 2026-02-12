"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ShopNavbar from "@/components/ShopNavbar";
import { addToCart } from "@/utils/placeOrder";
import { showToast } from "@/components/Toast";

interface Product {
    id: number;
    Name: string;
    description: string;
    real_price: number;
    fake_price: number | null;
    discount: boolean;
    discount_price: number | null;
    image_urls: string[];
    sizes_available: number[];
    is_active: boolean;
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreorder, setIsPreorder] = useState(false);

    useEffect(() => {
        async function loadProduct() {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("id, Name, description, real_price, fake_price, discount, discount_price, image_urls, sizes_available, is_active")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching product:", error);
                router.push("/clients/shop");
            } else {
                setProduct(data);
            }
            setLoading(false);
        }

        loadProduct();
    }, [id, router]);

    return (
        <div className="min-h-screen bg-stone-50 overflow-x-hidden w-full">
            <ShopNavbar />

            {loading ? (
                <div className="pt-32 pb-24 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
            ) : !product ? null : (
                <>
                    {/* Image Preview Modal */}
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-xl animate-in fade-in duration-300"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <button
                                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="relative w-full max-w-5xl aspect-square mx-6">
                                <img
                                    src={product.image_urls[activeImage]}
                                    alt={product.Name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-stone-900 p-2 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev - 1 + product.image_urls.length) % product.image_urls.length);
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-stone-900 p-2 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev + 1) % product.image_urls.length);
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-32 pb-24 container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                            <div className="space-y-4 md:space-y-6">
                                <div
                                    className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 cursor-zoom-in group"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {product.image_urls?.[activeImage] ? (
                                        <img
                                            src={product.image_urls[activeImage]}
                                            alt={product.Name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-contain md:object-cover animate-in fade-in zoom-in-95 duration-500 group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            No Image
                                        </div>
                                    )}

                                    {/* Prominent Sale Tag */}
                                    {product.discount && (
                                        <div className="absolute top-4 left-4 md:top-8 md:left-8 bg-amber-600 text-white text-[8px] md:text-[10px] font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full z-10 shadow-lg uppercase tracking-[0.1em] md:tracking-[0.2em] animate-bounce">
                                            Exclusive Offer
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-4 px-2 md:px-6">
                                    {product.image_urls?.map((url, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === index ? "border-amber-600 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:border-amber-200"
                                                }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`${product.Name} ${index}`}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex flex-col">
                                <div className="mb-6 md:mb-8">
                                    <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
                                        <h2 className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.3em] md:tracking-[0.5em] text-amber-600">Premium Footwear</h2>
                                        {!product.is_active && (
                                            <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest border border-red-600 shadow-md">
                                                Out of Stock
                                            </span>
                                        )}
                                        {product.discount && (
                                            <span className="bg-amber-100 text-amber-900 text-[8px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest">
                                                On Sale
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-stone-900 mb-3 md:mb-4 tracking-tight leading-tight uppercase">{product.Name}</h1>

                                    {/* trust tags - More Visible Contrast */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="flex items-center gap-2 bg-emerald-500 text-white px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">ነፃ ዴሊቨሪ</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-sky-500 text-white px-3.5 py-2 rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">ሲደርስ ይክፈሉ</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                        {/* Crossed-out: original/discount price when on sale, fake_price when higher, or base price when preorder */}
                                        <div className="flex items-baseline gap-3">
                                            {isPreorder ? (
                                                <span className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                    <span className="font-normal text-base md:text-lg">ብር</span> {(product.discount && product.discount_price != null ? product.discount_price : product.real_price).toLocaleString()}
                                                </span>
                                            ) : (product.discount && product.discount_price != null) ? (
                                                <span className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                    <span className="font-normal text-base md:text-lg">ብር</span> {product.real_price.toLocaleString()}
                                                </span>
                                            ) : (product.fake_price != null && Number(product.fake_price) > Number(product.real_price)) ? (
                                                <span className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                    <span className="font-normal text-base md:text-lg">ብር</span> {product.fake_price?.toLocaleString()}
                                                </span>
                                            ) : null}

                                            <span className="text-3xl md:text-4xl font-black text-stone-900 italic">
                                                <span className="font-bold text-xl md:text-2xl text-stone-500 not-italic mr-1">ብር</span>{isPreorder
                                                    ? ((product.discount && product.discount_price ? product.discount_price : product.real_price) * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                    : (product.discount && product.discount_price ? product.discount_price : product.real_price).toLocaleString()
                                                }
                                            </span>
                                        </div>

                                        {/* Savings Badge */}
                                        {(() => {
                                            const currentPrice = isPreorder
                                                ? ((product.discount && product.discount_price ? product.discount_price : product.real_price) * 0.9)
                                                : (product.discount && product.discount_price ? product.discount_price : product.real_price);

                                            let originalPrice = 0;
                                            if (isPreorder) {
                                                originalPrice = product.discount && product.discount_price != null ? product.discount_price : product.real_price;
                                            } else if (product.discount && product.discount_price != null) {
                                                originalPrice = product.real_price;
                                            } else if (product.fake_price != null && Number(product.fake_price) > Number(product.real_price)) {
                                                originalPrice = product.fake_price;
                                            }

                                            const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0;

                                            if (savings > 0) {
                                                return (
                                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl text-sm md:text-base font-black uppercase tracking-wider shadow-2xl shadow-orange-500/40 border-2 border-orange-400/50 flex items-center gap-2 animate-pulse">
                                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-base md:text-lg">{savings.toLocaleString()} ብር ያተርፋሉ</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <p className="text-stone-600 leading-relaxed text-sm md:text-lg max-w-xl font-medium">
                                        {product.description || "Hand-crafted with meticulous attention to detail using the finest Ethiopian leather."}
                                    </p>
                                </div>

                                {/* Sizes */}
                                <div className="mb-6 md:mb-8">
                                    <div className="flex justify-between items-center mb-3 md:mb-4">
                                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400">Select Size (EU)</h3>
                                        <button className="text-[10px] md:text-xs font-bold text-amber-600 hover:underline">Size Guide</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {product.sizes_available?.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300 border-2 ${selectedSize === size
                                                    ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/30"
                                                    : "bg-white text-stone-600 border-stone-200 hover:border-amber-600"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="mb-8 md:mb-10">
                                    <div className="flex items-center justify-between mb-2 md:mb-3">
                                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400">Quantity</h3>
                                        {!selectedSize && (
                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider animate-pulse">
                                                Select size first
                                            </span>
                                        )}
                                    </div>
                                    <div className={`inline-flex items-center gap-3 md:gap-4 bg-white border-2 rounded-xl md:rounded-2xl p-1.5 md:p-2 transition-all duration-300 ${!selectedSize || (!product.is_active && !isPreorder)
                                        ? 'border-stone-100 opacity-50'
                                        : 'border-stone-900 shadow-lg'
                                        }`}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedSize && quantity > 1) {
                                                    setQuantity(quantity - 1);
                                                }
                                            }}
                                            disabled={!selectedSize || quantity <= 1}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg md:text-xl transition-all duration-200 ${!selectedSize || quantity <= 1
                                                ? 'bg-stone-50 text-stone-200 cursor-not-allowed'
                                                : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer'
                                                }`}
                                        >
                                            −
                                        </button>

                                        <div className="w-12 md:w-16 text-center">
                                            <span className="text-xl md:text-2xl font-black text-stone-900">{quantity}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedSize && quantity < 15) {
                                                    setQuantity(quantity + 1);
                                                }
                                            }}
                                            disabled={!selectedSize || quantity >= 15 || (!product.is_active && !isPreorder)}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg md:text-xl transition-all duration-200 ${!selectedSize || quantity >= 15 || (!product.is_active && !isPreorder)
                                                ? 'bg-stone-50 text-stone-200 cursor-not-allowed'
                                                : 'bg-amber-600 text-white hover:bg-amber-700 cursor-pointer'
                                                }`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Pre-order Option */}
                                {!product.is_active && (
                                    <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/80 shadow-xl shadow-amber-200/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative flex-shrink-0 mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isPreorder}
                                                    onChange={(e) => setIsPreorder(e.target.checked)}
                                                    className="peer sr-only"
                                                />
                                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 group-hover:border-amber-500 ${isPreorder ? 'bg-amber-600 border-amber-600' : 'bg-white border-amber-300'}`}>
                                                    {isPreorder && (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-sm md:text-base font-black text-stone-900 group-hover:text-amber-700 transition-colors uppercase tracking-tight">
                                                        Pre-Order Available/ቀድመዉ ይዘዙ
                                                    </span>
                                                    <span className="inline-flex items-center bg-amber-600 text-white text-[9px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase shadow-sm">
                                                        10% Off
                                                    </span>
                                                </div>
                                                <p className="text-xs md:text-sm text-stone-600 mt-1 font-medium leading-relaxed">This item is currently out of stock. Reserve yours now and get an exclusive discount when it arrives!</p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col gap-3 md:gap-4 mb-10 md:mb-12">
                                    <button
                                        disabled={!selectedSize || (!product.is_active && !isPreorder)}
                                        onClick={() => {
                                            if (!selectedSize) return;
                                            const basePrice = product.discount && product.discount_price ? product.discount_price : product.real_price;

                                            // Calculate original price for savings display
                                            let originalPriceVal = basePrice;
                                            if (isPreorder) {
                                                originalPriceVal = basePrice;
                                            } else if (product.discount && product.discount_price != null) {
                                                originalPriceVal = product.real_price;
                                            } else if (product.fake_price != null && Number(product.fake_price) > Number(product.real_price)) {
                                                originalPriceVal = product.fake_price;
                                            }

                                            addToCart({
                                                id: String(product.id),
                                                name: product.Name,
                                                price: isPreorder ? basePrice * 0.9 : basePrice,
                                                qty: quantity,
                                                size: selectedSize,
                                                image: product.image_urls?.[0] || "",
                                                is_preorder: isPreorder,
                                                original_price: originalPriceVal,
                                            });
                                            showToast(isPreorder ? `Pre-order added to cart!` : `Added to cart!`, "success");
                                            setQuantity(1);
                                            setSelectedSize(null);
                                            setIsPreorder(false);
                                        }}
                                        className={`flex items-center justify-center space-x-3 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${selectedSize && (product.is_active || isPreorder)
                                            ? "bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20"
                                            : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                                            }`}
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        <span className="text-[10px] md:text-sm">Add To Cart</span>
                                    </button>

                                    <button
                                        disabled={!selectedSize || (!product.is_active && !isPreorder)}
                                        onClick={() => {
                                            if (!selectedSize) return;
                                            const basePrice = product.discount && product.discount_price ? product.discount_price : product.real_price;

                                            // Calculate original price for savings display
                                            let originalPriceVal = basePrice;
                                            if (isPreorder) {
                                                originalPriceVal = basePrice;
                                            } else if (product.discount && product.discount_price != null) {
                                                originalPriceVal = product.real_price;
                                            } else if (product.fake_price != null && Number(product.fake_price) > Number(product.real_price)) {
                                                originalPriceVal = product.fake_price;
                                            }

                                            addToCart({
                                                id: String(product.id),
                                                name: product.Name,
                                                price: isPreorder ? basePrice * 0.9 : basePrice,
                                                qty: quantity,
                                                size: selectedSize,
                                                image: product.image_urls?.[0] || "",
                                                is_preorder: isPreorder,
                                                original_price: originalPriceVal,
                                            });
                                            router.push("/clients/checkout");
                                        }}
                                        className={`flex items-center justify-center py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${selectedSize && (product.is_active || isPreorder)
                                            ? "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20"
                                            : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                                            }`}
                                    >
                                        <span className="text-[10px] md:text-sm">Buy Now</span>
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-4 md:gap-6 pt-8 md:pt-10 border-t border-stone-200">
                                    <div className="flex items-center space-x-3 md:space-x-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-stone-900 truncate">Ethically Made</h4>
                                            <p className="text-[7px] md:text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">Ethiopian Leather</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 md:space-x-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-stone-900 truncate">Premium Quality</h4>
                                            <p className="text-[7px] md:text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">Genuine Leather</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
