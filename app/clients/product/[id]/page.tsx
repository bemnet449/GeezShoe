"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Product {
    id: number;
    Name: string;
    real_price: number;
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
        <div className="pt-32 pb-24 min-h-screen bg-stone-50">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Images Gallery */}
                    <div className="space-y-6">
                        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white border border-stone-100 shadow-xl shadow-stone-200/50">
                            {product.image_urls?.[activeImage] ? (
                                <Image
                                    src={product.image_urls[activeImage]}
                                    alt={product.Name}
                                    fill
                                    className="object-cover animate-in fade-in zoom-in-95 duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                    No Image
                                </div>
                            )}
                            {product.discount && (
                                <div className="absolute top-8 left-8 bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full z-10 shadow-lg">
                                    SALE
                                </div>
                            )}
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
                            <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-amber-600 mb-4">Premium Footwear</h2>
                            <h1 className="text-5xl font-black text-stone-900 mb-4 tracking-tight leading-tight uppercase">{product.Name}</h1>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="text-3xl font-black text-stone-900 italic">
                                    ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                </div>
                                {product.discount && (
                                    <div className="text-xl text-stone-400 line-through font-bold">
                                        ${product.real_price}
                                    </div>
                                )}
                            </div>
                            <p className="text-stone-500 leading-relaxed text-lg max-w-xl">
                                Hand-crafted with meticulous attention to detail using the finest Ethiopian leather. This pair offers unparalleled comfort and style that transcends seasons.
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
                        <div className="mb-10 flex items-center space-x-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">Quantity</h3>
                            <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors border-r border-stone-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                </button>
                                <span className="w-12 h-12 flex items-center justify-center font-bold text-stone-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.item_number, quantity + 1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors border-l border-stone-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                                {product.item_number} pieces left
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button
                                disabled={product.item_number <= 0 || !selectedSize}
                                className={`flex-1 flex items-center justify-center space-x-3 py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${product.item_number > 0 && selectedSize
                                        ? "bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20"
                                        : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <span>Add To Cart</span>
                            </button>
                            <button className="w-16 h-16 rounded-2xl border-2 border-stone-900 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
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
