"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id ? Number(params.id) : undefined;

    const handleSuccess = () => {
        router.push("/AdminGeezS/products");
    };

    if (!productId) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-sm border border-stone-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">Invalid ID</h2>
                    <p className="text-stone-500 mb-8 leading-relaxed">We couldn't find the product you're looking for. It may have been deleted.</p>
                    <Link
                        href="/AdminGeezS/products"
                        className="inline-block w-full bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg"
                    >
                        Return to List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <main className="p-8">
                <header className="mb-8 flex items-center space-x-4">
                    <Link href="/AdminGeezS/products" className="p-2 bg-white rounded-lg shadow-sm border border-stone-200 text-stone-600 hover:text-amber-700 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Edit Product</h1>
                        <p className="text-stone-500">Update details for product ID: {productId}</p>
                    </div>
                </header>

                <div className="max-w-4xl">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm mr-4">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">Image Replacement Logic</p>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Updating product images will permanently remove the previous versions from Supabase Storage. This happens automatically upon successful upload of the 2 new images.
                            </p>
                        </div>
                    </div>

                    <ProductForm mode="edit" productId={productId} onSuccess={handleSuccess} />
                </div>
            </main>
        </div>
    );
}
