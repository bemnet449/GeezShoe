"use client";

import { useEffect, useState, useRef } from "react";
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
    discount_title: string | null;
    image_urls: string[];
    is_active: boolean;
}

const PRODUCTS_PER_PAGE = 8; // Number of products per page

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounced search query
    const [showOnlyDiscounts, setShowOnlyDiscounts] = useState(false);
    const [companyAdImages, setCompanyAdImages] = useState<string[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const adCarouselRef = useRef<HTMLDivElement>(null);
    const adSlideRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const isResettingRef = useRef(false); // Ref to block observer during reset
    const pageRef = useRef(0); // Single source of truth for pagination

    // Fetch company ad images (above collection)
    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from("company_info")
                .select("ad_img")
                .eq("id", 1)
                .maybeSingle();
            if (!data?.ad_img) return;
            let urls: string[] = [];
            if (Array.isArray(data.ad_img)) urls = data.ad_img;
            else if (typeof data.ad_img === "string") {
                try {
                    urls = JSON.parse(data.ad_img);
                } catch {
                    urls = [];
                }
            }
            setCompanyAdImages(Array.isArray(urls) ? urls : []);
        })();
    }, []);

    // Only run auto-advance on phone size
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 639px)");
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
    }, []);

    // Auto-advance company ad carousel (mobile only, 85% width slides)
    useEffect(() => {
        if (!isMobile || companyAdImages.length <= 1 || !adCarouselRef.current || !adSlideRef.current) return;
        const el = adCarouselRef.current;
        const interval = setInterval(() => {
            const next = (currentAdIndex + 1) % companyAdImages.length;
            setCurrentAdIndex(next);
            const slideWidth = adSlideRef.current?.getBoundingClientRect().width ?? 0;
            const gap = 16; // gap-4
            el.scrollTo({ left: next * (slideWidth + gap), behavior: "smooth" });
        }, 4500);
        return () => clearInterval(interval);
    }, [isMobile, companyAdImages.length, currentAdIndex]);

    // Debounce search query
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Load initial products
    useEffect(() => {
        loadProducts(0, true);
    }, [debouncedSearch, showOnlyDiscounts]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !loading &&
                    !loadingMore &&
                    !isResettingRef.current // Block observer during reset
                ) {
                    loadProducts(pageRef.current + 1, false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadingMore]);

    async function loadProducts(pageNum: number, isInitial: boolean) {
        if (isInitial) {
            setLoading(true);
            setProducts([]); // Clear products on new search
            setHasMore(true); // Reset hasMore for new search
            isResettingRef.current = true; // Block observer during reset
        } else {
            setLoadingMore(true);
        }

        try {
            const start = pageNum * PRODUCTS_PER_PAGE;
            const end = start + PRODUCTS_PER_PAGE - 1;

            let query = supabase
                .from("products")
                .select("id, Name, description, real_price, fake_price, discount, discount_price, discount_title, image_urls, is_active")
                .order("created_at", { ascending: false });

            // Apply search filter
            if (debouncedSearch.trim()) {
                query = query.or(
                    `Name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`
                );
            }

            // Apply discount filter
            if (showOnlyDiscounts) {
                query = query.eq("discount", true);
            }

            // Apply pagination
            query = query.range(start, end);

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching products:", error);
            } else {
                if (isInitial) {
                    pageRef.current = 0; // Reset pageRef on new search
                    setProducts(data || []);
                } else {
                    pageRef.current += 1; // Increment pageRef on successful load
                    setProducts((prev) => [...prev, ...(data || [])]);
                }

                // Check if there are more products
                if (!data || data.length < PRODUCTS_PER_PAGE) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            if (isInitial) {
                setLoading(false);
                isResettingRef.current = false; // Release observer block
            } else {
                setLoadingMore(false);
            }
        }
    }

    // Skeleton card component
    const SkeletonCard = () => (
        <div className="animate-pulse">
            <div className="aspect-square bg-stone-200 rounded-2xl md:rounded-3xl mb-4"></div>
            <div className="h-4 bg-stone-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50">
            <ShopNavbar />
            {/* Company ad images */}
            {companyAdImages.length > 0 && (
                <div className="pt-28 pb-8">
                    {/* Mobile only: 85% width slides, horizontal scroll, auto-advance */}
                    <div className="sm:hidden w-full overflow-hidden">
                        <div
                            ref={adCarouselRef}
                            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide snap-x snap-mandatory pb-2 px-6 md:px-8"
                            onScroll={() => {
                                const el = adCarouselRef.current;
                                const slide = adSlideRef.current;
                                if (!el || !slide || companyAdImages.length <= 1) return;
                                const slideWidth = slide.getBoundingClientRect().width;
                                const gap = 16;
                                const index = Math.round(el.scrollLeft / (slideWidth + gap));
                                setCurrentAdIndex(Math.min(Math.max(0, index), companyAdImages.length - 1));
                            }}
                        >
                            {companyAdImages.map((url, i) => (
                                <div
                                    key={i}
                                    ref={i === 0 ? adSlideRef : undefined}
                                    className="relative flex-shrink-0 w-[85vw] max-w-[85vw] aspect-[21/9] snap-start snap-always rounded-2xl overflow-hidden bg-stone-200 shadow-md"
                                >
                                    <img
                                        src={url}
                                        alt={`Promo ${i + 1}`}
                                        className="w-full h-full object-contain"
                                        loading={i === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>
                        {companyAdImages.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {companyAdImages.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        aria-label={`Go to slide ${i + 1}`}
                                        onClick={() => {
                                            const slideWidth = adSlideRef.current?.getBoundingClientRect().width ?? 0;
                                            setCurrentAdIndex(i);
                                            adCarouselRef.current?.scrollTo({ left: i * (slideWidth + 16), behavior: "smooth" });
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentAdIndex ? "w-6 bg-amber-600" : "w-2 bg-stone-300 hover:bg-stone-400"}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop: grid, no auto-scroll */}
                    <div className="hidden sm:block container mx-auto px-8 md:px-12 lg:px-16">
                        <div className={`grid gap-4 md:gap-6 ${companyAdImages.length === 1 ? "grid-cols-1 max-w-4xl mx-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
                            {companyAdImages.map((url, i) => (
                                <div key={i} className="relative aspect-[21/9] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-stone-200 shadow-md">
                                    <img
                                        src={url}
                                        alt={`Promo ${i + 1}`}
                                        className="w-full h-full object-contain"
                                        loading={i === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className={`pb-24 container mx-auto px-6 ${companyAdImages.length > 0 ? "pt-12" : "pt-32"}`}>
                {/* Header & Search */}
                <div className="mb-10 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-3 md:mb-4 tracking-tight">THE COLLECTION</h1>
                        <p className="text-sm md:text-base text-stone-500">
                            Discover our full range of handcrafted leather footwear. Each pair is built to last and designed to impress.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => setShowOnlyDiscounts(!showOnlyDiscounts)}
                            className={`whitespace-nowrap w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${showOnlyDiscounts
                                ? "bg-amber-600 text-white shadow-amber-200"
                                : "bg-white text-stone-600 border border-stone-200 hover:border-amber-600 hover:text-amber-600"
                                }`}
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {showOnlyDiscounts ? "Showing Offers/ቅናሽ" : "Show Offers/ቅናሽ"}
                        </button>

                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-sm text-stone-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
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
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/clients/product/${product.id}`}
                                    className="group flex flex-col bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-stone-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-stone-200 group-hover:shadow-inner transition-all duration-500">
                                        {product.image_urls?.[0] ? (
                                            <img
                                                src={product.image_urls[0]}
                                                alt={product.Name}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                                    </div>

                                    <div className="p-3 md:p-5 flex flex-col flex-1">
                                        <div className="flex flex-col mb-3 md:mb-4">
                                            <h3 className="text-sm md:text-xl font-black text-stone-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight leading-tight break-words">
                                                {product.Name}
                                            </h3>
                                            <div className="flex flex-wrap items-baseline gap-2 mt-1">
                                                {/* Crossed-out: original price when discounted, or fake/MSRP when fake_price exists */}
                                                {(product.discount && product.discount_price != null) && (
                                                    <span className="text-[10px] md:text-sm text-stone-400 line-through font-bold">
                                                        <span className="font-normal text-[8px] md:text-xs">ብር</span> {product.real_price.toLocaleString()}
                                                    </span>
                                                )}
                                                {(!product.discount && product.fake_price != null && Number(product.fake_price) > Number(product.real_price)) && (
                                                    <span className="text-[10px] md:text-sm text-stone-400 line-through font-bold">
                                                        <span className="font-normal text-[8px] md:text-xs">ብር</span> {product.fake_price?.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="text-sm md:text-lg font-black text-stone-900 leading-none">
                                                    <span className="font-bold text-xs md:text-sm text-stone-500 mr-0.5">ብር</span>{(product.discount && product.discount_price != null ? product.discount_price : product.real_price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 md:pt-4 border-t border-stone-100 flex flex-col items-center gap-2 md:gap-3">
                                            <div className="w-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] py-2.5 md:py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-stone-200 text-center bg-stone-900 group-hover:bg-amber-600">
                                                Buy Now
                                            </div>

                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Loading more indicator with skeleton cards */}
                        {loadingMore && (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-12">
                                {[1, 2, 3, 4].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        )}

                        {/* Intersection observer target */}
                        <div ref={observerTarget} className="h-10" />

                        {/* End of products message */}
                        {!hasMore && products.length > 0 && (
                            <div className="text-center py-12">
                                <p className="text-stone-400 font-medium text-sm">You&apos;ve reached the end of our collection</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
