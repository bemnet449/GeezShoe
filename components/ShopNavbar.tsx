"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCartItemCount } from "@/utils/placeOrder";

export default function ShopNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    // Use a more robust check for client pages
    const isClientPage = pathname ? pathname.toLowerCase().includes("/clients") : false;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10); // More sensitive for mobile
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
            const total = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartCount(total);
        };

        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("storage", updateCartCount);

        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
            window.removeEventListener("storage", updateCartCount);
        };
    }, []);

    // Force solid background on client-side shop/product pages to prevent overlapping text issues
    const shouldShowSolidBg = scrolled || isClientPage;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 py-2 md:py-4 ${shouldShowSolidBg ? "bg-white shadow-md border-b border-stone-100" : "bg-transparent text-white"}
                `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
                <Link href="/" className="group flex items-center shrink-0">
                    <div className="relative w-20 h-7 sm:w-28 sm:h-8 md:w-36 md:h-10">
                        <Image
                            src="/LogoBrown.PNG"
                            alt="Geez Shoe"
                            fill
                            sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, 150px"
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
                    <Link href="/clients/shop" className={`text-[11px] sm:text-sm font-black uppercase tracking-widest transition-colors whitespace-nowrap ${shouldShowSolidBg ? "text-stone-600 hover:text-amber-600" : "text-white hover:text-amber-200"}`}>
                        Shop
                    </Link>
                    <button
                        onClick={() => router.push("/clients/checkout")}
                        className={`relative group p-1.5 sm:p-2 transition-colors ${shouldShowSolidBg ? "text-stone-800" : "text-white"}`}
                    >
                        <svg
                            className="w-6 h-6 group-hover:text-amber-600 transition-colors"
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
