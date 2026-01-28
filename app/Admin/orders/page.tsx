"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_Phone: string;
    order_date: string;
    total_prices: number[];
    order_status: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const { data, error } = await supabase
            .from("Order")
            .select("*")
            .order("order_date", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }

    const calculateTotal = (prices: number[]) => {
        return prices.reduce((a, b) => a + b, 0).toFixed(2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <main className="p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Order Management</h1>
                        <p className="text-stone-500">Track and manage your customer orders</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md"
                    >
                        Refresh
                    </button>
                </header>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Order Date</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="text-sm hover:bg-stone-50 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-stone-900">#{order.id}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-semibold text-stone-800">{order.customer_name}</p>
                                        <p className="text-xs text-stone-500">{order.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-5 text-stone-600">
                                        {new Date(order.order_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 font-bold text-stone-900">
                                        ${calculateTotal(order.total_prices)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Link
                                            href={`/Admin/orders/${order.id}`}
                                            className="text-amber-600 hover:text-amber-700 font-bold text-xs"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-stone-500 font-medium">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

