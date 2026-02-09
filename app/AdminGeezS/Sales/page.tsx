"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface Sale {
    id: number;
    product_id: string;
    product_name: string;
    quantity_sold: number;
    created_at: string;
}

interface ProductInfo {
    exists: boolean;
    imageUrl: string | null;
    name: string;
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [productInfo, setProductInfo] = useState<Record<string, ProductInfo>>({});
    const router = useRouter();

    const fetchProductInfo = useCallback(async (productIds: string[]) => {
        const infoMap: Record<string, ProductInfo> = {};

        for (const productId of productIds) {
            const { data, error } = await supabase
                .from("products")
                .select('id, "Name", image_urls')
                .eq("id", productId)
                .single();

            if (!error && data) {
                infoMap[productId] = {
                    exists: true,
                    imageUrl: data.image_urls?.[0] || null,
                    name: data.Name
                };
            } else {
                infoMap[productId] = {
                    exists: false,
                    imageUrl: null,
                    name: "Unknown Product"
                };
            }
        }

        setProductInfo(infoMap);
    }, []);

    const fetchSales = useCallback(async () => {
        const { data, error } = await supabase
            .from("sales")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setSales(data);
            const uniqueProductIds = [...new Set(data.map(s => s.product_id))];
            await fetchProductInfo(uniqueProductIds);
        }
        setLoading(false);
    }, [fetchProductInfo]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/Admin/Login");
            }
        };

        checkAuth();
        fetchSales();
    }, [fetchSales, router]);

    function handleProductClick(sale: Sale) {
        const info = productInfo[sale.product_id];

        if (!info || !info.exists) {
            showToast("This product is no longer available in the shop", "error");
            return;
        }

        router.push(`/AdminGeezS/products/edit/${sale.product_id}`);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-2">Sales Analytics</h1>
                <p className="text-stone-500 font-medium">Track all sold items and their performance</p>
            </div>

            {sales.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-12 text-center">
                    <p className="text-stone-400 font-bold">No sales recorded yet</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-100 border-b border-stone-200">
                                <tr>
                                    <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-stone-600">Product</th>
                                    <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-stone-600">Qty Sold</th>
                                    <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-stone-600">Date</th>
                                    <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-stone-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale, index) => {
                                    const info = productInfo[sale.product_id];
                                    const isAvailable = info?.exists;

                                    return (
                                        <tr
                                            key={sale.id}
                                            onClick={() => handleProductClick(sale)}
                                            className={`border-t border-stone-100 transition-all ${index < 10
                                                    ? "bg-amber-50 hover:bg-amber-100"
                                                    : "hover:bg-stone-50"
                                                } ${isAvailable ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    {info?.imageUrl ? (
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0">
                                                            <img
                                                                src={info.imageUrl}
                                                                alt={sale.product_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className={`font-bold ${index < 10 ? "text-amber-700" : "text-stone-900"}`}>{sale.product_name}</p>
                                                        <p className="text-xs text-stone-500">ID: {sale.product_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center justify-center font-black text-sm px-3 py-1 rounded-full ${index < 10 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-700"}`}>
                                                    {sale.quantity_sold}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-medium text-stone-700">
                                                    {new Date(sale.created_at).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {new Date(sale.created_at).toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                {isAvailable ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Available
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Removed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
