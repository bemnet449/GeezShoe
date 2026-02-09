"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/AdminGeezS/Login");
    };

    const navItems = [
        {
            name: "Dashboard",
            path: "/AdminGeezS/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: "Products List",
            path: "/AdminGeezS/products",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
        },
        {
            name: "Add Product",
            path: "/AdminGeezS/products/add",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            name: "Orders",
            path: "/AdminGeezS/orders",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            name: "Sales",
            path: "/AdminGeezS/Sales",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v2m0 8v2m-7-6h14"
                    />
                </svg>
            ),
        },

        {
            name: "Customers",
            path: "/AdminGeezS/Customers",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H2v-2a4 4 0 014-4h7m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
        },
        {
            name: "Company Info",
            path: "/AdminGeezS/company-info",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },

    ];

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            ></div>

            <aside
                className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-stone-200 shadow-xl lg:shadow-sm z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-stone-800 leading-tight">GeezShoe</h2>
                            <p className="text-xs text-stone-500 font-medium">Admin Portal</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => onClose?.()}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${pathname === item.path
                                ? "bg-amber-600 text-white shadow-md shadow-amber-200"
                                : "text-stone-600 hover:bg-amber-50 hover:text-amber-700"
                                }`}
                        >
                            <span className={`${pathname === item.path ? "text-white" : "text-stone-400 group-hover:text-amber-600"}`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-stone-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group font-semibold text-sm"
                    >
                        <span className="text-stone-400 group-hover:text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
