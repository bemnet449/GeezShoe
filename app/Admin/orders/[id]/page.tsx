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

    return (
        <div className="p-8">
            <Link
                href="/Admin/orders"
                className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-6 font-bold text-sm"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                </svg>
                Back to Orders
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-stone-900 mb-1">Order #{order.id}</h1>
                                <p className="text-stone-500 font-medium">Placed on {new Date(order.order_date).toLocaleString()}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${order.order_status === 'sold' ? 'bg-green-100 text-green-700' :
                                order.order_status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                    'bg-stone-100 text-stone-700'
                                }`}>
                                {order.order_status}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-stone-900 border-b pb-4 border-stone-100">Order Items</h2>
                            <div className="w-full">
                                {order.product_names.map((name, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-stone-50 last:border-0">
                                        <div>
                                            <p className="font-bold text-stone-900">{name}</p>
                                            <p className="text-sm text-stone-500">ID: {order.product_ids[i]}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-stone-900">${order.unit_prices[i]} × {order.quantities[i]}</p>
                                            <p className="text-sm text-amber-600 font-black">${order.total_prices[i].toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-4 bg-stone-50 p-6 rounded-2xl">
                                <span className="text-lg font-black text-stone-900">Total Amount</span>
                                <span className="text-3xl font-black text-amber-600">${totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                        <h2 className="text-xl font-bold text-stone-900 mb-6">Order Description</h2>
                        <p className="text-stone-600 leading-relaxed italic">
                            {order.order_description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                        <h2 className="text-xl font-bold text-stone-900 mb-6">Customer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Name</p>
                                <p className="font-bold text-stone-900">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Email</p>
                                <p className="font-bold text-stone-900">{order.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Phone</p>
                                <p className="font-bold text-stone-900">{order.customer_Phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Location</p>
                                <p className="font-bold text-stone-900">
                                    {order.orderplace ? "📍 Addis Ababa" : "✈️ Outside Addis Ababa"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Coupon Code</p>
                                <p className={`font-black tracking-widest ${order.coupon_code ? "text-amber-600" : "text-stone-300"}`}>
                                    {order.coupon_code || "NONE"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                        <h2 className="text-xl font-bold text-stone-900 mb-6">Actions</h2>
                        <div className="space-y-4">
                            <button
                                onClick={handleMarkAsSold}
                                disabled={actionLoading}
                                className="w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20 disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Mark as Sold"}
                            </button>

                            <button
                                onClick={handleCancelOrder}
                                disabled={actionLoading}
                                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 border-2 border-red-50 transition-all disabled:opacity-50"
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
