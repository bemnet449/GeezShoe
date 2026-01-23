"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import ProductForm from "@/components/ProductForm";

export default function AddProductPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/Admin/products");
    };

    return (
        <div className="w-full">
            <main className="p-8">
                <header className="mb-8 flex items-center space-x-4">
                    <Link href="/Admin/products" className="p-2 bg-white rounded-lg shadow-sm border border-stone-200 text-stone-600 hover:text-amber-700 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Add New Product</h1>
                        <p className="text-stone-500">Create a new entry in your footwear catalog</p>
                    </div>
                </header>

                <div className="max-w-4xl">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm mr-4">
                            <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900 mb-1">Getting Started</p>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Please ensure all required fields marked with * are completed. Exactly 2 high-quality images are required for each product to ensure a premium shopping experience.
                            </p>
                        </div>
                    </div>

                    <ProductForm mode="create" onSuccess={handleSuccess} />
                </div>
            </main>
        </div>
    );
}
