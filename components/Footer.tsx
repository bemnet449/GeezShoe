"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-stone-900 py-16 text-white overflow-hidden">
            <div className="container mx-auto px-6 relative">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 relative z-10">
                    {/* Brand Section */}
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        <Link href="/" className="inline-block relative w-32 h-10 md:w-40 md:h-12">
                            <Image
                                src="/LogoBrown.PNG"
                                alt="Geez Shoe"
                                fill
                                className="object-contain brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-stone-400 max-w-sm leading-relaxed text-sm md:text-base">
                            Handcrafted with passion in Addis Ababa. We blend traditional Ethiopian leather craftsmanship with modern design to create timeless footwear.
                        </p>
                        <div className="flex items-center space-x-6">
                            {["Instagram", "Twitter", "Facebook"].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="text-stone-500 hover:text-amber-500 transition-colors uppercase text-xs font-bold tracking-widest"
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Shop</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/clients/shop" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    All Collection
                                </Link>
                            </li>
                            <li>
                                <Link href="/clients/shop" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link href="/clients/shop" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    Best Sellers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Company</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/#about" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    Our Story
                                </Link>
                            </li>
                            <li>
                                <Link href="/#contact" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-stone-300 hover:text-white transition-colors text-sm font-medium hover:pl-2 duration-300 block">
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500 font-medium">
                    <p>&copy; {new Date().getFullYear()} Geez Shoe. All rights reserved.</p>
                    <div className="flex items-center space-x-6">
                        <span>Made in Ethiopia</span>
                        <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
                        <span>Global Shipping</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
