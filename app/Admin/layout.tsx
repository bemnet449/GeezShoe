"use client";

import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-stone-50">
            <Sidebar />
            <div className="pl-64 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}
