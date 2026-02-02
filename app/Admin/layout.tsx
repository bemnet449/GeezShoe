"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isLoginPage = pathname === "/Admin/Login";

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
            {!isLoginPage && (
                <>
                    {/* Mobile Header */}
                    <header className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-amber-100 rounded-lg">
                                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <span className="font-bold text-stone-800">GeezShoe Admin</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </header>

                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                </>
            )}
            <div className={`flex-1 w-full min-h-screen ${isLoginPage || !pathname.startsWith('/Admin') ? "" : "lg:pl-64"}`}>
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
