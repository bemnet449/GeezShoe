"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-stone-900 py-12 text-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Minimal Brand Info */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <Link href="/" className="inline-block relative w-32 h-8">
                            <Image
                                src="/LogoBrown.PNG"
                                alt="Geez Shoe"
                                fill
                                sizes="128px"
                                className="object-contain brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-stone-500 text-[10px] uppercase font-black tracking-[0.2em]">
                            Handmade in Addis Ababa — Since 2019
                        </p>
                    </div>

                    {/* Bottom Bar Content */}
                    <div className="flex flex-col items-center md:items-end gap-2 text-[10px] uppercase font-black tracking-widest text-stone-500">
                        <span>© {new Date().getFullYear()} GEEZ SHOE. ALL RIGHTS RESERVED.</span>
                        <div className="flex space-x-4">
                            <span>Premium Leather</span>
                            <span className="text-stone-700">|</span>
                            <span>Ethiopian Craft</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
