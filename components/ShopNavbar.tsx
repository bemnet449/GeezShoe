"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCartItemCount } from "@/utils/placeOrder";

export default function ShopNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        // Update cart count on mount and when localStorage changes
        const updateCartCount = () => {
            setCartCount(getCartItemCount());
        };

        updateCartCount();

        // Listen for storage events (when cart is updated in other tabs)
        window.addEventListener("storage", updateCartCount);

        // Custom event for same-tab updates
        const handleCartUpdate = () => updateCartCount();
        window.addEventListener("cartUpdated", handleCartUpdate);

        // Poll for updates (fallback for same-tab changes)
        const interval = setInterval(updateCartCount, 1000);

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", handleCartUpdate);
            clearInterval(interval);
        };
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100" : "bg-transparent"
                }`}
        >
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="group flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-tighter text-stone-900 group-hover:text-amber-600 transition-colors">
                        Geez<span className="text-amber-600 group-hover:text-stone-900 transition-colors">Shoe</span>
                    </span>
                </Link>

                <div className="flex items-center space-x-6">
                    <Link href="/clients/shop" className="text-sm font-bold uppercase tracking-widest text-stone-600 hover:text-amber-600 transition-colors">
                        Shop
                    </Link>
                    <button
                        onClick={() => router.push("/clients/checkout")}
                        className="relative group p-2"
                    >
                        <svg
                            className="w-6 h-6 text-stone-900 group-hover:text-amber-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
