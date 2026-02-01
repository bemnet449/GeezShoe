"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsVisible(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            // Navbar appears only after scrolling down 100px
            setIsVisible(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("/#")) {
            e.preventDefault();
            const id = href.replace("/#", "");
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
                // Update URL hash without jumping
                window.history.pushState(null, "", href);
            }
        }
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/#about" },
        { name: "Contact", href: "/#contact" },
    ];


    return (
        <div
            className={`fixed top-8 left-0 right-0 w-full z-[9999] flex justify-center px-4 transition-all duration-700 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"
                }`}
        >
            <nav
                className="w-auto max-w-[90vw] sm:max-w-none px-4 sm:px-8 py-3 rounded-full flex items-center justify-center space-x-2 sm:space-x-8 md:space-x-12 border bg-white/80 backdrop-blur-md border-stone-200/50 shadow-lg overflow-hidden"
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-300 hover:text-amber-500 whitespace-nowrap text-stone-600"
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
