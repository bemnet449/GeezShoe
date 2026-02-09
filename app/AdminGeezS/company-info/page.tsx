"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CompanyInfoForm from "@/components/CompanyInfoForm";

export default function CompanyInfoPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/AdminGeezS/Login");
                return;
            }
            setAuthChecked(true);
        };
        checkAuth();
    }, [router]);

    if (!authChecked) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl">
            <header className="mb-8 md:mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-1 w-12 bg-amber-600 rounded-full" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">Settings</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight mb-2">
                    Company info
                </h1>
                <p className="text-stone-500 font-medium text-base">
                    Manage contact details, social links, and advertisement images for your store.
                </p>
            </header>
            <div className="space-y-6">
                <CompanyInfoForm />
            </div>
        </div>
    );
}
