"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/Admin/Login";

    return (
        <div className="min-h-screen bg-stone-50">
            {!isLoginPage && <Sidebar />}
            <div className={isLoginPage ? "w-full min-h-screen" : "pl-64 w-full min-h-screen"}>
                {children}
            </div>
        </div>
    );
}
