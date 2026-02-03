"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    const { id } = useParams();
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
                .from("Products")
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
                                <Image
                                    src={product.image_urls[activeImage]}
                                    alt={product.Name}
                                    fill
                                    sizes="(max-width: 1280px) 100vw, 1280px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-32 pb-24 container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                            {/* Images Gallery */}
                            <div className="space-y-4 md:space-y-6">
                                <div
                                    className="relative aspect-square overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 cursor-zoom-in group"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {product.image_urls?.[activeImage] ? (
                                        <Image
                                            src={product.image_urls[activeImage]}
                                            alt={product.Name}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover animate-in fade-in zoom-in-95 duration-500 group-hover:scale-105 transition-transform duration-700"
                                            priority
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

                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-4 px-1">
                                    {product.image_urls?.map((url, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === index ? "border-amber-600 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:border-amber-200"
                                                }`}
                                        >
                                            <Image src={url} alt={`${product.Name} ${index}`} fill sizes="(max-width: 768px) 15vw, 10vw" className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex flex-col">
                                <div className="mb-6 md:mb-8">
                                    <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                                        <h2 className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.3em] md:tracking-[0.5em] text-amber-600">Premium Footwear</h2>
                                        {product.discount && (
                                            <span className="bg-amber-100 text-amber-900 text-[8px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest">
                                                On Sale
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-stone-900 mb-3 md:mb-4 tracking-tight leading-tight uppercase">{product.Name}</h1>
                                    <div className="flex items-center space-x-4 md:space-x-6 mb-4 md:mb-6">
                                        <div className="text-3xl md:text-4xl font-black text-stone-900 italic">
                                            ${isPreorder
                                                ? ((product.discount && product.discount_price ? product.discount_price : product.real_price) * 0.9).toFixed(2)
                                                : (product.discount && product.discount_price ? product.discount_price : product.real_price)
                                            }
                                        </div>
                                        {isPreorder ? (
                                            <div className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                            </div>
                                        ) : product.discount ? (
                                            <div className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                ${product.real_price}
                                            </div>
                                        ) : product.fake_price && Number(product.fake_price) > Number(product.real_price) ? (
                                            <div className="text-xl md:text-2xl text-stone-400 line-through font-bold">
                                                ${product.fake_price}
                                            </div>
                                        ) : null}
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
                                    <div className="mb-8 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-200 shadow-lg shadow-amber-200/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <label className="flex items-center space-x-4 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={isPreorder}
                                                    onChange={(e) => setIsPreorder(e.target.checked)}
                                                    className="w-6 h-6 rounded-lg border-2 border-amber-600 text-amber-600 focus:ring-amber-600 focus:ring-offset-0 cursor-pointer transition-all duration-300"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm md:text-base font-black text-stone-900 group-hover:text-amber-700 transition-colors uppercase tracking-tight">
                                                        Pre-Order (Get 10% Off)
                                                    </span>
                                                    <span className="bg-amber-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Save 10%</span>
                                                </div>
                                                <p className="text-xs text-stone-500 mt-1 font-medium">This item is currently out of stock. Pre-order now and get an exclusive discount!</p>
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
                                            addToCart({
                                                id: String(product.id),
                                                name: product.Name,
                                                price: isPreorder ? basePrice * 0.9 : basePrice,
                                                qty: quantity,
                                                size: selectedSize,
                                                image: product.image_urls?.[0] || "",
                                                is_preorder: isPreorder,
                                                original_price: basePrice,
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
                                            addToCart({
                                                id: String(product.id),
                                                name: product.Name,
                                                price: isPreorder ? basePrice * 0.9 : basePrice,
                                                qty: quantity,
                                                size: selectedSize,
                                                image: product.image_urls?.[0] || "",
                                                is_preorder: isPreorder,
                                                original_price: basePrice,
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
