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
            <main className="p-4 md:p-8">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Order Management</h1>
                        <p className="text-sm text-stone-500">Track and manage your customer orders</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="w-full sm:w-auto bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                {/* Orders - Mobile List */}
                <div className="md:hidden space-y-4">
                    {orders.length > 0 ? orders.map((order) => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Order #{order.id}</span>
                                    <h3 className="font-bold text-stone-900 text-lg">{order.customer_name}</h3>
                                    <p className="text-xs text-stone-500">{order.customer_email}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-stone-900">${calculateTotal(order.total_prices)}</div>
                                    <div className="text-[10px] text-stone-400 font-bold uppercase">{new Date(order.order_date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <Link
                                href={`/Admin/orders/${order.id}`}
                                className="block w-full text-center bg-stone-50 text-stone-900 py-3 rounded-xl font-bold text-sm hover:bg-stone-100 transition-colors border border-stone-100"
                            >
                                View Order Details
                            </Link>
                        </div>
                    )) : (
                        <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center text-stone-500">
                            No orders found
                        </div>
                    )}
                </div>

                {/* Orders - Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
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
                                            className="text-amber-600 hover:text-amber-700 font-bold text-xs bg-amber-50 px-4 py-2 rounded-lg transition-colors"
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

