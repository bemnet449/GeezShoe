"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/Admin");

    if (isAdmin) return null;

    return (
        <footer className="bg-stone-900 text-stone-400 py-20 px-6">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-stone-800 pb-20">
                <div className="col-span-1 md:col-span-1">
                    <h2 className="text-white text-2xl font-black tracking-tighter mb-6">
                        GEEZ<span className="text-amber-600">SHOE</span>
                    </h2>
                    <p className="text-sm leading-relaxed mb-8">
                        Elevating your stride with handcrafted perfection. Discover the art of leather footwear designed for the modern individual.
                    </p>
                    <div className="flex space-x-4">
                        {["instagram", "facebook", "twitter"].map((social) => (
                            <a key={social} href="#" className="w-10 h-10 rounded-full border border-stone-800 flex items-center justify-center hover:bg-amber-600 hover:border-amber-600 hover:text-white transition-all">
                                <span className="sr-only">{social}</span>
                                <i className={`fab fa-${social}`}></i>
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6">Shop</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/clients/shop" className="hover:text-white transition-colors">All Collections</Link></li>
                        <li><Link href="/clients/shop?category=casual" className="hover:text-white transition-colors">Casual Shoes</Link></li>
                        <li><Link href="/clients/shop?category=formal" className="hover:text-white transition-colors">Formal Shoes</Link></li>
                        <li><Link href="/clients/shop?category=limited" className="hover:text-white transition-colors">Limited Edition</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6">Support</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="#" className="hover:text-white transition-colors">Size Guide</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6">Subscribe</h3>
                    <p className="text-sm mb-6">Join our mailing list for exclusive offers and new arrivals.</p>
                    <form className="flex">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="bg-stone-800 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-amber-600 outline-none w-full rounded-l-lg"
                        />
                        <button className="bg-amber-600 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-r-lg hover:bg-amber-700 transition-colors">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto mt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                <p>© 2026 GEEZ SHOE. ALL RIGHTS RESERVED.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
