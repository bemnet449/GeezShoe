"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ShopNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
                    <button className="relative group p-2">
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
                        <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
