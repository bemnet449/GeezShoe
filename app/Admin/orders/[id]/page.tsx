"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { showToast } from "@/components/Toast";

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_Phone: string;
    order_description: string;
    order_date: string;
    product_ids: string[];
    product_names: string[];
    product_sizes: string[];
    quantities: number[];
    unit_prices: number[];
    total_prices: number[];
    order_status: string;
    orderplace: boolean;
    coupon_code: string | null;
}

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    async function fetchOrder() {
        setLoading(true);
        const { data, error } = await supabase
            .from("Order")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
            showToast("Failed to fetch order details", "error");
        } else {
            setOrder(data);
        }
        setLoading(false);
    }

    async function handleMarkAsSold() {
        if (!order) return;

        setActionLoading(true);
        try {
            // 1. Decrease stock for each product
            for (let i = 0; i < order.product_ids.length; i++) {
                const productId = order.product_ids[i];
                const quantity = order.quantities[i];

                // Fetch current stock
                const { data: productData, error: fetchError } = await supabase
                    .from("Products")
                    .select("item_number")
                    .eq("id", productId)
                    .single();

                if (fetchError) {
                    console.error(`Error fetching stock for product ${productId}:`, fetchError);
                    continue;
                }

                // Update stock
                const newStock = Math.max(0, productData.item_number - (quantity || 1));
                const { error: stockError } = await supabase
                    .from("Products")
                    .update({
                        item_number: newStock,
                        is_active: newStock > 0
                    })
                    .eq("id", productId);

                if (stockError) {
                    console.error(`Error updating stock for product ${productId}:`, stockError);
                }
            }

            // 2. Delete the order record
            const { error: deleteError } = await supabase
                .from("Order")
                .delete()
                .eq("id", order.id);

            if (deleteError) throw deleteError;

            showToast("Order marked as sold and stock updated", "success");
            router.push("/Admin/orders");
        } catch (error) {
            console.error("Error marking as sold:", error);
            showToast("Failed to process order", "error");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancelOrder() {
        if (!order) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("Order")
                .delete()
                .eq("id", order.id);

            if (error) {
                showToast("Failed to cancel order", "error");
            } else {
                showToast("Order cancelled and removed", "success");
                router.push("/Admin/orders");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            showToast("An error occurred", "error");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!order) return <div className="p-8 text-center text-stone-500 font-bold">Order not found</div>;

    const totalAmount = order.total_prices.reduce((a, b) => a + b, 0).toFixed(2);

    // Grouping items by product name while keeping size-specific data
    const groupedItems = () => {
        const grouped: Record<string, any[]> = {};
        order.product_names.forEach((name, i) => {
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push({
                index: i,
                size: order.product_sizes ? order.product_sizes[i] : "N/A",
                qty: order.quantities[i],
                unitPrice: order.unit_prices[i],
                totalPrice: order.total_prices[i]
            });
        });
        return grouped;
    };

    return (
        <div className="p-4 md:p-8">
            <Link
                href="/Admin/orders"
                className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-6 font-bold text-sm"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                </svg>
                Back to Orders
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">Order #{order.id}</h1>
                                <p className="text-stone-500 text-sm md:text-base font-medium">Placed on {new Date(order.order_date).toLocaleString()}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold capitalize ${order.order_status === 'sold' ? 'bg-green-100 text-green-700' :
                                order.order_status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                    'bg-stone-100 text-stone-700'
                                }`}>
                                {order.order_status}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-lg md:text-xl font-bold text-stone-900 border-b pb-4 border-stone-100 uppercase tracking-widest text-xs">Order Items</h2>
                            <div className="space-y-6">
                                {Object.entries(groupedItems()).map(([productName, variants]) => (
                                    <div key={productName} className="bg-stone-50 rounded-2xl p-4 md:p-6 border border-stone-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-black text-stone-900 uppercase tracking-tight text-base md:text-lg leading-tight">{productName}</h3>
                                            <span className="bg-stone-200 text-stone-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                {variants.length} Entry{variants.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {variants.map((variant, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-amber-100 text-amber-700 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs border border-amber-200 shadow-sm">
                                                            {variant.size}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Size Selection</p>
                                                            <p className="text-sm font-bold text-stone-900">Shoe Size: {variant.size}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Quantity & Price</p>
                                                        <p className="text-xs font-bold text-stone-900">Qty {variant.qty} × ${variant.unitPrice.toFixed(2)}</p>
                                                        <p className="text-sm font-black text-amber-600">${variant.totalPrice.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-4 bg-stone-900 p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-900/10">
                                <span className="text-base md:text-lg font-black text-white uppercase tracking-widest">Grand Total</span>
                                <span className="text-2xl md:text-4xl font-black text-amber-500 tracking-tighter italic">${totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Order Description</h2>
                        <p className="text-sm md:text-base text-stone-600 leading-relaxed italic">
                            {order.order_description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Customer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Name</p>
                                <p className="font-bold text-stone-900">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Email</p>
                                <p className="font-bold text-stone-900 truncate" title={order.customer_email}>{order.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Phone</p>
                                <p className="font-bold text-stone-900">{order.customer_Phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Location</p>
                                <p className="font-bold text-stone-900 text-sm">
                                    {order.orderplace ? "📍 Addis Ababa" : "✈️ Outside Addis Ababa"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Coupon Code</p>
                                <p className={`font-black tracking-widest text-sm ${order.coupon_code ? "text-amber-600" : "text-stone-300"}`}>
                                    {order.coupon_code || "NONE"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Actions</h2>
                        <div className="space-y-3 md:space-y-4">
                            <button
                                onClick={handleMarkAsSold}
                                disabled={actionLoading}
                                className="w-full py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-lg bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20 disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Mark as Sold"}
                            </button>

                            <button
                                onClick={handleCancelOrder}
                                disabled={actionLoading}
                                className="w-full py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-xs md:text-sm text-red-600 hover:bg-red-50 border-2 border-red-50 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Cancel Order"}
                            </button>
                        </div>
                        <p className="text-[10px] text-stone-400 text-center mt-6 uppercase font-black tracking-widest leading-relaxed">
                            These actions will remove the order record from the system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
