'use client';

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from "next/navigation";
import Link from "next/link";

const AdminDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        outOfStockItems: 0
    });
    const [userName, setUserName] = useState('Admin');

    useEffect(() => {
        checkUserAndFetchStats();
    }, []);

    const checkUserAndFetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/Admin/Login");
            return;
        }

        // Set name from metadata or email
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
        setUserName(name);

        try {
            // Fetch Orders count
            const { data: orders, error: ordersError } = await supabase
                .from('order')
                .select('id');

            // Fetch Products for count and out of stock check
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('item_number');

            if (ordersError || productsError) throw new Error("Failed to fetch dashboard data");

            const outOfStock = products?.filter(p => p.item_number === 0).length || 0;

            setStats({
                totalOrders: orders?.length || 0,
                pendingOrders: orders?.length || 0, // Since we delete processed orders, remaining are pending
                totalProducts: products?.length || 0,
                outOfStockItems: outOfStock
            });

        } catch (error) {
            console.error("Dashboard stats error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header / Welcome */}
            <header className="mb-8 md:mb-12">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="h-1 w-12 bg-amber-600 rounded-full"></div>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">Overview Panel</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">
                    Welcome back, <span className="text-amber-600 capitalize">{userName}</span>.
                </h1>
                <p className="text-stone-500 font-medium text-base md:text-lg">
                    Here is what's happening with GEEZ SHOE today.
                </p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                {[
                    { label: "Active Orders", value: stats.totalOrders, icon: "📦", color: "from-stone-900 to-stone-800" },
                    { label: "Products Catalog", value: stats.totalProducts, icon: "👟", color: "from-stone-500 to-stone-400" },
                    { label: "Out of Stock", value: stats.outOfStockItems, icon: "⚠️", color: stats.outOfStockItems > 0 ? "from-red-600 to-red-500" : "from-emerald-600 to-emerald-500" },
                ].map((stat, i) => (
                    <div key={i} className="relative group overflow-hidden bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-stone-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-amber-50 transition-colors duration-500 flex items-center justify-center p-6 text-xl md:text-2xl">
                            {stat.icon}
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-2">{stat.label}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-stone-900">{stat.value}</h3>
                        <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${stat.color} mt-4`}></div>
                    </div>
                ))}
            </div>

            {/* Main Actions Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Orders Card */}
                <Link href="/Admin/orders" className="lg:col-span-2 group relative overflow-hidden bg-stone-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-stone-900/20 hover:-translate-y-1 transition-all duration-500">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-8 md:mb-12">
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                <svg className="w-6 h-6 md:w-8 md:h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Queue Status</span>
                                <span className="px-3 py-1 bg-amber-500 text-stone-900 rounded-full text-[10px] md:text-xs font-black uppercase">
                                    {stats.totalOrders} Pending
                                </span>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Manage Orders</h2>
                        <p className="text-white/60 font-medium text-base md:text-lg max-w-md mb-8">
                            Keep the business moving. Review new customer requests, process payments, and update shipments.
                        </p>
                        <div className="mt-auto flex items-center text-amber-500 font-black uppercase tracking-widest text-xs md:text-sm group-hover:translate-x-2 transition-transform">
                            Open Order Desk
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full -mr-48 -mt-48 blur-[80px]"></div>
                </Link>

                {/* Inventory Card */}
                <Link href="/Admin/products" className="group bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-stone-100 hover:border-amber-600/20 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="h-full flex flex-col">
                        <div className="p-4 bg-amber-50 rounded-2xl w-fit mb-8 md:mb-12 group-hover:bg-amber-600 transition-colors duration-500">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-4">Inventory</h2>
                        <p className="text-stone-500 font-medium mb-8">
                            Curate your collection. Add new styles, adjust pricing, or manage stock levels for your products.
                        </p>
                        <div className="mt-auto pt-8 border-t border-stone-50 flex items-center justify-between">
                            <span className="text-xs md:text-sm font-black text-stone-900">{stats.totalProducts} Total Items</span>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Mini Footer */}
            <footer className="mt-12 md:mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-black tracking-widest text-stone-400 gap-4">
                <span>GEEZ SHOE ADMIN v2.5</span>
                <span className="italic text-center md:text-right">System Status: Optimal</span>
            </footer>
        </div>
    );
};

export default AdminDashboard;
