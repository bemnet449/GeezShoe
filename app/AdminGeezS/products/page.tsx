"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRODUCTS_PER_PAGE = 8; // Number of products per page

interface Product {
    id: number;
    Name: string;
    item_number: number;
    real_price: number;
    discount: boolean;
    discount_price: number | null;
    image_urls: string[];
    sizes_available: number[];
    is_active: boolean;
    created_at: string;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [gridLoading, setGridLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: number | null; imageUrls: string[]; productName: string }>({
        isOpen: false,
        productId: null,
        imageUrls: [],
        productName: ""
    });
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkAuth();
        loadProducts(null, true);
    }, []);

    // Debounce search (same behavior as Shop page)
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);

        return () => clearTimeout(t);
    }, [searchQuery]);

    // Reset pagination state when debouncedSearch or filterActive changes
    useEffect(() => {
        setProducts([]);
        setCursor(null);
        setHasMore(true);
        loadProducts(null, true);
    }, [debouncedSearch, filterActive]);

    // Guard IntersectionObserver execution to prevent duplicate fetches
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadProducts(cursor, false);
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
    }, [hasMore, loading, loadingMore, cursor]);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/AdminGeezS/Login");
        }
    };

    async function loadProducts(cursorValue: string | null, isInitial: boolean) {
        if (isInitial) {
            setGridLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let query = supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(PRODUCTS_PER_PAGE);

            if (debouncedSearch) {
                const isNumber = !isNaN(Number(debouncedSearch));

                query = isNumber
                    ? query.or(
                        `Name.ilike.%${debouncedSearch}%,item_number.eq.${Number(debouncedSearch)}`
                    )
                    : query.ilike("Name", `%${debouncedSearch}%`);
            }

            if (filterActive === "active") {
                query = query.eq("is_active", true);
            }

            if (filterActive === "inactive") {
                query = query.eq("is_active", false);
            }

            if (cursorValue) {
                query = query.lt("created_at", cursorValue);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching products:", error);
            } else {
                if (isInitial) {
                    setProducts(data || []);
                } else {
                    setProducts((prev) => [...prev, ...(data || [])]);
                }

                if (data && data.length > 0) {
                    setCursor(data[data.length - 1].created_at);
                }

                if (!data || data.length < PRODUCTS_PER_PAGE) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            if (isInitial) {
                setGridLoading(false);
                setLoading(false); // Update global loading for initial page load
            } else {
                setLoadingMore(false);
            }
        }
    }

    const toggleProductStatus = async (id: number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            loadProducts(cursor, false);
        } catch (err) {
            console.error("Failed to update product status:", err);
        }
    };

    const performDelete = async () => {
        if (!deleteModal.productId) return;

        setLoading(true);

        try {
            // 1. Delete images from storage
            if (deleteModal.imageUrls && deleteModal.imageUrls.length > 0) {
                for (const url of deleteModal.imageUrls) {
                    try {
                        // Extract path after "public/" in URL
                        const match = url.match(/storage\/v1\/object\/public\/product-images\/(.+)/);
                        if (match && match[1]) {
                            const filePath = match[1];
                            const { error: storageError } = await supabase.storage
                                .from("product-images")
                                .remove([filePath]);

                            if (storageError) {
                                console.warn("Failed to delete image:", filePath, storageError.message);
                            } else {
                                console.log("Deleted image:", filePath);
                            }
                        } else {
                            console.warn("Could not parse file path from URL:", url);
                        }
                    } catch (err) {
                        console.error("Error deleting image:", url, err);
                    }
                }
            }

            // 2. Delete product from database
            const { error: dbError, data: deletedData } = await supabase
                .from("products")
                .delete()
                .eq("id", deleteModal.productId)
                .select();

            if (dbError) throw dbError;

            // 3. Reset modal and reload products
            setDeleteModal({ isOpen: false, productId: null, imageUrls: [], productName: "" });
            setProducts([]);
            setCursor(null);
            setHasMore(true);
            await loadProducts(null, true);

        } catch (err: any) {
            console.error("Delete failed:", err);
            alert("Delete failed: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="w-full relative">
            {/* Custom Delete Modal Overlay */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-2">Delete Product?</h3>
                            <p className="text-stone-500 mb-8 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-stone-800">"{deleteModal.productName}"</span>?
                                This will permanently remove the data and all associated images.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performDelete}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : "Yes, Delete It"}
                                </button>
                            </div>
                        </div>
                        <div className="bg-stone-50 p-4 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">This action cannot be undone</p>
                        </div>
                    </div>
                </div>
            )}

            <main className="p-4 md:p-8">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Product Management</h1>
                        <p className="text-sm text-stone-500">Manage your store's inventory and catalog</p>
                    </div>
                    <Link
                        href="/AdminGeezS/products/add"
                        className="w-full sm:w-auto bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </Link>
                </header>

                <div className="container mx-auto">
                    {/* Filters & Search */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 md:p-6 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Search */}
                            <div className="flex-1 w-full lg:max-w-md">
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 font-medium outline-none transition-all text-stone-900 bg-stone-50"
                                    />
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex p-1 bg-stone-100 rounded-xl overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setFilterActive("all")}
                                    className={`flex-1 min-w-[80px] px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterActive === "all"
                                        ? "bg-white text-amber-700 shadow-sm"
                                        : "text-stone-500 hover:text-stone-700"
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterActive("active")}
                                    className={`flex-1 min-w-[100px] px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterActive === "active"
                                        ? "bg-white text-green-700 shadow-sm"
                                        : "text-stone-500 hover:text-stone-700"
                                        }`}
                                >
                                    In Stock
                                </button>
                                <button
                                    onClick={() => setFilterActive("inactive")}
                                    className={`flex-1 min-w-[110px] px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterActive === "inactive"
                                        ? "bg-white text-red-700 shadow-sm"
                                        : "text-stone-500 hover:text-stone-700"
                                        }`}
                                >
                                    Out of Stock
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="relative">
                        {gridLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl min-h-[400px]">
                                <svg className="animate-spin h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        )}

                        {products.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-20 text-center">
                                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-stone-800">No products found</h3>
                                <p className="text-stone-500 mt-2">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-amber-100 border border-stone-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            {/* Image Container */}
                                            <Link
                                                href={`/AdminGeezS/products/edit/${product.id}`}
                                                className="relative h-64 bg-stone-100 overflow-hidden block"
                                            >
                                                {product.image_urls && product.image_urls[0] ? (
                                                    <img
                                                        src={product.image_urls[0]}
                                                        alt={product.Name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-16 h-16 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Status Tag */}
                                                <div className="absolute top-4 right-4">
                                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border ${product.is_active
                                                        ? "bg-green-500/90 text-white border-green-400"
                                                        : "bg-red-500/90 text-white border-red-400"
                                                        }`}>
                                                        {product.is_active ? "IN STOCK" : "OUT OF STOCK"}
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-xl text-stone-900 truncate pr-2">
                                                            {product.Name}
                                                        </h3>
                                                        <div className="flex items-center mt-1 space-x-2">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-500 rounded uppercase tracking-wider">
                                                                Qty: {product.item_number}
                                                            </span>
                                                            {product.discount && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-600 rounded uppercase tracking-wider">
                                                                    Discount Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-amber-900">
                                                            <span className="font-bold text-base text-amber-800/60 mr-0.5">ብር</span>{(product.discount && product.discount_price ? product.discount_price : product.real_price).toLocaleString()}
                                                        </div>
                                                        {product.discount && (
                                                            <div className="text-xs text-stone-400 line-through font-bold">
                                                                <span className="font-normal text-[10px]">ብር</span>{product.real_price.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                                                    <div className="flex -space-x-1">
                                                        {product.sizes_available?.slice(0, 3).map(s => (
                                                            <div key={s} className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                                                                {s}
                                                            </div>
                                                        ))}
                                                        {product.sizes_available?.length > 3 && (
                                                            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                                                +{product.sizes_available.length - 3}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card navigation
                                                            setDeleteModal({
                                                                isOpen: true,
                                                                productId: product.id,
                                                                imageUrls: product.image_urls,
                                                                productName: product.Name
                                                            });
                                                        }}
                                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group/del"
                                                    >
                                                        <svg className="w-6 h-6 transform group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {loadingMore && (
                                    <div className="flex items-center justify-center py-4">
                                        <svg className="animate-spin h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                )}

                                <div ref={observerTarget} className="h-10" />

                                {!hasMore && products.length > 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-stone-500 font-medium">You've reached the end of the product list</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <footer className="mt-20 p-8 text-center text-stone-400 text-xs font-medium border-t border-stone-100">
                GEEZ SHOE ADMIN • INVENTORY MANAGEMENT SYSTEM v2.0
            </footer>
        </div>
    );
}
