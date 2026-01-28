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
    item_number: number;
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

    useEffect(() => {
        async function loadProduct() {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("Products")
                .select("*")
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

    if (loading) {
        return (
            <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-stone-50">
            <ShopNavbar />

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
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            )}

            <div className="pt-32 pb-24 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Images Gallery */}
                    <div className="space-y-6">
                        <div
                            className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 cursor-zoom-in group"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {product.image_urls?.[activeImage] ? (
                                <Image
                                    src={product.image_urls[activeImage]}
                                    alt={product.Name}
                                    fill
                                    className="object-cover animate-in fade-in zoom-in-95 duration-500 group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                    No Image
                                </div>
                            )}

                            {/* Prominent Sale Tag */}
                            {product.discount && (
                                <div className="absolute top-8 left-8 bg-amber-600 text-white text-[10px] font-black px-6 py-2 rounded-full z-10 shadow-lg uppercase tracking-[0.2em] animate-bounce">
                                    Exclusive Offer
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {product.image_urls?.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === index ? "border-amber-600 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:border-amber-200"
                                        }`}
                                >
                                    <Image src={url} alt={`${product.Name} ${index}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-amber-600">Premium Footwear</h2>
                                {product.discount && (
                                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        On Sale
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-black text-stone-900 mb-4 tracking-tight leading-tight uppercase">{product.Name}</h1>
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="text-4xl font-black text-stone-900 italic">
                                    ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                </div>
                                {product.discount ? (
                                    <div className="text-2xl text-stone-400 line-through font-bold">
                                        ${product.real_price}
                                    </div>
                                ) : product.fake_price && Number(product.fake_price) > Number(product.real_price) ? (
                                    <div className="text-2xl text-stone-400 line-through font-bold">
                                        ${product.fake_price}
                                    </div>
                                ) : null}
                            </div>
                            <p className="text-stone-600 leading-relaxed text-lg max-w-xl font-medium">
                                {product.description || "Hand-crafted with meticulous attention to detail using the finest Ethiopian leather. This pair offers unparalleled comfort and style that transcends seasons."}
                            </p>
                        </div>

                        {/* Sizes */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">Select Size (EU)</h3>
                                <button className="text-xs font-bold text-amber-600 hover:underline">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes_available?.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${selectedSize === size
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
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">Quantity</h3>
                                {!selectedSize && (
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider animate-pulse">
                                        Select size first
                                    </span>
                                )}
                            </div>
                            <div className={`inline-flex items-center gap-4 bg-white border-2 rounded-2xl p-2 transition-all duration-300 ${!selectedSize
                                ? 'border-stone-200 opacity-50'
                                : 'border-amber-600 shadow-lg shadow-amber-600/10'
                                }`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedSize && quantity > 1) {
                                            setQuantity(quantity - 1);
                                        }
                                    }}
                                    disabled={!selectedSize || quantity <= 1}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-200 ${!selectedSize || quantity <= 1
                                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                        : 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-110 active:scale-95 cursor-pointer'
                                        }`}
                                >
                                    −
                                </button>

                                <div className="w-16 text-center">
                                    <span className="text-2xl font-black text-stone-900">{quantity}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedSize && quantity < product.item_number) {
                                            setQuantity(quantity + 1);
                                        }
                                    }}
                                    disabled={!selectedSize || quantity >= product.item_number}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-200 ${!selectedSize || quantity >= product.item_number
                                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                        : 'bg-amber-600 text-white hover:bg-amber-700 hover:scale-110 active:scale-95 cursor-pointer'
                                        }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button
                                disabled={product.item_number <= 0 || !selectedSize}
                                onClick={() => {
                                    if (!selectedSize) return;

                                    addToCart({
                                        id: String(product.id),
                                        name: product.Name,
                                        price: product.discount && product.discount_price
                                            ? product.discount_price
                                            : product.real_price,
                                        qty: quantity,
                                        size: selectedSize,
                                        image: product.image_urls?.[0] || "",
                                    });

                                    // Show success toast notification
                                    showToast(`Added ${quantity} ${product.Name} (Size: EU ${selectedSize}) to cart!`, "success");

                                    // Reset selections
                                    setQuantity(1);
                                    setSelectedSize(null);
                                }}
                                className={`flex-[1.5] flex items-center justify-center space-x-3 py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${product.item_number > 0 && selectedSize
                                    ? "bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20"
                                    : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <span>Add To Cart</span>
                            </button>

                            <button
                                disabled={product.item_number <= 0 || !selectedSize}
                                onClick={() => {
                                    if (!selectedSize) return;

                                    // Add to cart first
                                    addToCart({
                                        id: String(product.id),
                                        name: product.Name,
                                        price: product.discount && product.discount_price
                                            ? product.discount_price
                                            : product.real_price,
                                        qty: quantity,
                                        size: selectedSize,
                                        image: product.image_urls?.[0] || "",
                                    });

                                    // Redirect to checkout
                                    router.push("/clients/checkout");
                                }}
                                className={`flex-1 flex items-center justify-center py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${product.item_number > 0 && selectedSize
                                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20"
                                    : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                                    }`}
                            >
                                <span>Buy Now</span>
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-6 pt-10 border-t border-stone-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-900">Ethically Made</h4>
                                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Handmade in Ethiopia</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-900">Premium Quality</h4>
                                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">100% Genuine Leather</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
