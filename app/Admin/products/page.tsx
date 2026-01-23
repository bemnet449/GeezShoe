"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";


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
    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        checkAuth();
        loadProducts();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/Admin/Login");
        }
    };

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("Products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleProductStatus = async (id: number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("Products")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            loadProducts();
        } catch (err) {
            console.error("Failed to update product status:", err);
        }
    };

    const deleteProduct = async (id: number, imageUrls: string[]) => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            // Delete images from storage
            for (const url of imageUrls) {
                const urlParts = url.split("/product-images/");
                if (urlParts.length === 2) {
                    const filePath = urlParts[1];
                    await supabase.storage.from("product-images").remove([filePath]);
                }
            }

            // Delete product from database
            const { error } = await supabase.from("Products").delete().eq("id", id);
            if (error) throw error;

            loadProducts();
        } catch (err) {
            console.error("Failed to delete product:", err);
            alert("Failed to delete product");
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.item_number.toString().includes(searchQuery);

        const matchesFilter =
            filterActive === "all" ||
            (filterActive === "active" && product.is_active) ||
            (filterActive === "inactive" && !product.is_active);

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-amber-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-stone-700 font-medium">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <main className="p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Product Management</h1>
                        <p className="text-stone-500">Manage your store's inventory and catalog</p>
                    </div>
                    <Link
                        href="/Admin/products/add"
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </Link>
                </header>

                <div className="container mx-auto px-6 py-8">
                    {/* Filters & Search */}
                    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Search */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or item number..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterActive("all")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterActive === "all"
                                        ? "bg-amber-600 text-white shadow-md"
                                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                        }`}
                                >
                                    All ({products.length})
                                </button>
                                <button
                                    onClick={() => setFilterActive("active")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterActive === "active"
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                        }`}
                                >
                                    Active ({products.filter((p) => p.is_active).length})
                                </button>
                                <button
                                    onClick={() => setFilterActive("inactive")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterActive === "inactive"
                                        ? "bg-red-600 text-white shadow-md"
                                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                        }`}
                                >
                                    Inactive ({products.filter((p) => !p.is_active).length})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-12 text-center">
                            <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-stone-600 text-lg font-medium">No products found</p>
                            <p className="text-stone-500 text-sm mt-2">
                                {searchQuery ? "Try adjusting your search" : "Get started by adding your first product"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden hover:shadow-xl transition-shadow duration-200"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 bg-stone-100">
                                        {product.image_urls && product.image_urls[0] ? (
                                            <img
                                                src={product.image_urls[0]}
                                                alt={product.Name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-16 h-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_active
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                                    }`}
                                            >
                                                {product.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        {/* Discount Badge */}
                                        {product.discount && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
                                                    On Sale
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg text-stone-900 mb-1 line-clamp-1">
                                                {product.Name}
                                            </h3>
                                            <p className="text-xs text-stone-500">Stock: {product.item_number}</p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-amber-700">
                                                    ${product.discount && product.discount_price ? product.discount_price : product.real_price}
                                                </span>
                                                {product.discount && product.discount_price && (
                                                    <span className="text-sm text-stone-500 line-through">
                                                        ${product.real_price}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-stone-600 mt-1">
                                                Sizes: {product.sizes_available?.join(", ") || "N/A"}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/Admin/products/edit/${product.id}`}
                                                className="flex-1 bg-amber-100 text-amber-900 px-3 py-2 rounded-lg font-medium hover:bg-amber-200 transition-colors text-center text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => toggleProductStatus(product.id, product.is_active)}
                                                className="flex-1 bg-stone-100 text-stone-700 px-3 py-2 rounded-lg font-medium hover:bg-stone-200 transition-colors text-sm"
                                            >
                                                {product.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id, product.image_urls)}
                                                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
