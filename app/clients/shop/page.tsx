"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ShopNavbar from "@/components/ShopNavbar";

interface Product {
    id: number;
    Name: string;
    description: string;
    real_price: number;
    fake_price: number | null;
    discount: boolean;
    discount_price: number | null;
    image_urls: string[];
    is_active: boolean;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOnlyDiscounts, setShowOnlyDiscounts] = useState(false);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("Products")
                    .select("id, Name, description, real_price, fake_price, discount, discount_price, image_urls, is_active")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching products:", error);
                } else {
                    console.log("Fetched products:", data);
                    setProducts(data || []);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = (product.Name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDiscount = showOnlyDiscounts ? product.discount : true;
            return matchesSearch && matchesDiscount;
        });
    }, [products, searchQuery, showOnlyDiscounts]);

    return (
        <div className="min-h-screen bg-stone-50">
            <ShopNavbar />

            <div className="pt-32 pb-24 container mx-auto px-6">
                {/* Header & Search */}
                <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-5xl font-black text-stone-900 mb-4 tracking-tight">THE COLLECTION</h1>
                        <p className="text-stone-500">
                            Discover our full range of handcrafted leather footwear. Each pair is built to last and designed to impress.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <button
                            onClick={() => setShowOnlyDiscounts(!showOnlyDiscounts)}
                            className={`whitespace-nowrap px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${showOnlyDiscounts
                                ? "bg-amber-600 text-white shadow-amber-200"
                                : "bg-white text-stone-600 border border-stone-200 hover:border-amber-600 hover:text-amber-600"
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {showOnlyDiscounts ? "Showing Offers" : "Show Offers"}
                        </button>

                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-stone-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-stone-200 rounded-3xl mb-4"></div>
                                <div className="h-4 bg-stone-200 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-[3rem] bg-white/50">
                        <h2 className="text-2xl font-bold text-stone-400 mb-2">No products found.</h2>
                        <p className="text-stone-500 mb-6">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setShowOnlyDiscounts(false);
                            }}
                            className="text-amber-600 font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/clients/product/${product.id}`}
                                className="group flex flex-col bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-stone-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                            >
                                <div className="relative aspect-square overflow-hidden bg-stone-200 group-hover:shadow-inner transition-all duration-500">
                                    {product.image_urls?.[0] ? (
                                        <Image
                                            src={product.image_urls[0]}
                                            alt={product.Name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 uppercase text-[10px] font-bold tracking-widest">
                                            No Image
                                        </div>
                                    )}
                                    {product.discount && (
                                        <div className="absolute top-4 left-4 bg-amber-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-lg uppercase tracking-wider">
                                            Offer
                                        </div>
                                    )}
                                    {!product.is_active && (
                                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                            <span className="bg-white/10 text-white border border-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <h3 className="text-xl font-black text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 uppercase tracking-tight leading-tight">
                                            {product.Name}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-stone-900 leading-none">
                                                ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                            </span>
                                            {/* Crossed-out price logic */}
                                            {product.discount ? (
                                                <span className="text-xs text-stone-400 line-through font-bold mt-1">
                                                    ${product.real_price}
                                                </span>
                                            ) : product.fake_price && Number(product.fake_price) > Number(product.real_price) ? (
                                                <span className="text-xs text-stone-400 line-through font-bold mt-1">
                                                    ${product.fake_price}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col items-center gap-3">
                                        <div className={`w-[80%] text-white text-[10px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-stone-200 text-center ${product.is_active ? 'bg-stone-900 group-hover:bg-amber-600' : 'bg-stone-400'}`}>
                                            {product.is_active ? 'Buy Now' : 'Out of Stock'}
                                        </div>
                                        <span className="text-[9px] uppercase font-black text-stone-400 tracking-[0.3em] opacity-50 group-hover:opacity-100 group-hover:text-amber-600 transition-all">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
