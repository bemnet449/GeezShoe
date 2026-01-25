"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Product {
    id: number;
    Name: string;
    real_price: number;
    discount: boolean;
    discount_price: number | null;
    image_urls: string[];
    is_active: boolean;
    item_number: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Oxford", "Derby", "Loafers", "Boots"];

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            const { data, error } = await supabase
                .from("Products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching products:", error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        }

        loadProducts();
    }, []);

    return (
        <div className="pt-32 pb-24 min-h-screen bg-stone-50">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-5xl font-black text-stone-900 mb-4 tracking-tight">THE COLLECTION</h1>
                    <p className="text-stone-500 max-w-xl mx-auto">
                        Discover our full range of handcrafted leather footwear. Each pair is built to last and designed to impress.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                                    ? "bg-amber-600 text-white shadow-xl shadow-amber-600/20"
                                    : "bg-white text-stone-600 border border-stone-200 hover:border-amber-600 hover:text-amber-600"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
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
                ) : products.length === 0 ? (
                    <div className="text-center py-24">
                        <h2 className="text-2xl font-bold text-stone-400">No products found in the collection.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/clients/product/${product.id}`}
                                className="group bg-white p-4 rounded-[2rem] border border-stone-100 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100 transition-all duration-500"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] mb-6 bg-stone-50">
                                    {product.image_urls?.[0] ? (
                                        <Image
                                            src={product.image_urls[0]}
                                            alt={product.Name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            No Image
                                        </div>
                                    )}
                                    {product.discount && (
                                        <div className="absolute top-4 left-4 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
                                            SALE
                                        </div>
                                    )}
                                    {product.item_number <= 0 && (
                                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                            <span className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-2">
                                    <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                                        {product.Name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl font-black text-stone-900">
                                                ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                            </span>
                                            {product.discount && (
                                                <span className="text-sm text-stone-400 line-through font-medium">
                                                    ${product.real_price}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">
                                            {product.item_number} Left
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
