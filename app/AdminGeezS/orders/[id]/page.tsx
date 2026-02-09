"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { showToast } from "@/components/Toast";

interface order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_Phone: string;
    delivery_location: string;
    order_description: string;
    order_date: string;
    product_ids: string[];
    product_names: string[];
    product_sizes: string[];
    quantities: number[];
    unit_prices: number[];
    total_prices: number[];
    order_status: string;
    orderplace: boolean;
    coupon_code: string | null;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const router = useRouter();
    const [order, setOrder] = useState<order | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [productImages, setProductImages] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    async function fetchOrder() {
        setLoading(true);
        const { data, error } = await supabase
            .from("order")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
            showToast("Failed to fetch order details", "error");
        } else {
            setOrder(data);
            // Fetch product images
            if (data?.product_ids) {
                fetchProductImages(data.product_ids);
            }
        }
        setLoading(false);
    }

    async function fetchProductImages(productIds: string[]) {
        if (!productIds || productIds.length === 0) return;

        const numericIds = productIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
        console.log("🧪 Product IDs from order (raw):", productIds, "→ numeric:", numericIds);

        const { data, error } = await supabase
            .from("products")
            .select("id, image_urls")
            .in("id", numericIds);

        if (error) {
            console.error("❌ Failed to fetch product images:", error);
            return;
        }

        console.log("🧪 Products fetched from Supabase:", data);

        const imageMap: Record<string, string> = {};

        data?.forEach((product) => {
            let urls: string[] = [];

            if (Array.isArray(product.image_urls)) {
                urls = product.image_urls;
            } else if (typeof product.image_urls === "string") {
                try {
                    urls = JSON.parse(product.image_urls);
                } catch {
                    console.warn("⚠️ Failed to parse image_urls for product:", product.id);
                }
            }

            if (urls.length > 0) {
                imageMap[String(product.id)] = urls[0];
            }
        });

        console.log("✅ Product image map:", imageMap);

        setProductImages(imageMap);
    }

    async function handleMarkAsSold() {
        if (!order) return;

        setActionLoading(true);
        try {
            for (let i = 0; i < order.product_ids.length; i++) {
                const product_id = Number(order.product_ids[i]);
                const product_name = order.product_names[i];
                const quantity = Number(order.quantities[i] ?? 1);

                // Fetch current quantity_sold (if exists)
                const { data: existingSale, error: fetchError } = await supabase
                    .from("sales")
                    .select("quantity_sold")
                    .eq("product_id", product_id)
                    .maybeSingle();

                if (fetchError) throw fetchError;

                const newQuantity =
                    (existingSale?.quantity_sold || 0) + quantity;

                // Atomic upsert
                const { error: upsertError } = await supabase
                    .from("sales")
                    .upsert(
                        {
                            product_id,
                            product_name,
                            quantity_sold: newQuantity,
                        },
                        {
                            onConflict: "product_id", // must match UNIQUE constraint
                        }
                    );

                if (upsertError) throw upsertError;
            }


            /* 2. Upsert CUSTOMER record */

            // Calculate total items in the order
            const totalItemsPurchased = order.quantities.reduce(
                (sum, q) => sum + (q || 1),
                0
            );

            // Normalize phone
            const phone = order.customer_Phone.trim();

            // Fetch existing customer by phone
            const { data: existingCustomer, error: fetchError } = await supabase
                .from("customers")
                .select("total_items_purchased")
                .eq("phone", phone)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows found
                throw fetchError;
            }

            const newTotal =
                (existingCustomer?.total_items_purchased || 0) + totalItemsPurchased;

            // Upsert customer
            const { error: customerError } = await supabase
                .from("customers")
                .upsert(
                    {
                        name: order.customer_name,
                        email: order.customer_email,
                        phone: phone,
                        total_items_purchased: newTotal,
                    },
                    { onConflict: "phone" } // phone must be UNIQUE
                );

            if (customerError) throw customerError;




            // 1. Decrease stock for each product
            for (let i = 0; i < order.product_ids.length; i++) {
                const productId = order.product_ids[i];
                const quantity = order.quantities[i];

                // Fetch current stock
                const { data: productData, error: fetchError } = await supabase
                    .from("products")
                    .select("item_number")
                    .eq("id", productId)
                    .single();

                if (fetchError) {
                    console.error(`Error fetching stock for product ${productId}:`, fetchError);
                    continue;
                }

                // Update stock
                const newStock = Math.max(0, productData.item_number - (quantity || 1));
                const { error: stockError } = await supabase
                    .from("products")
                    .update({
                        item_number: newStock,
                        is_active: newStock > 0
                    })
                    .eq("id", productId);

                if (stockError) {
                    console.error(`Error updating stock for product ${productId}:`, stockError);
                }
            }

            // 2. Delete the order record
            const { error: deleteError } = await supabase
                .from("order")
                .delete()
                .eq("id", order.id);

            if (deleteError) throw deleteError;

            showToast("Order marked as sold and stock updated", "success");
            router.push("/Admin/orders");
        } catch (error) {
            console.error("Error marking as sold:", error);
            showToast("Failed to process order", "error");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancelOrder() {
        if (!order) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("order")
                .delete()
                .eq("id", order.id);

            if (error) {
                showToast("Failed to cancel order", "error");
            } else {
                showToast("Order cancelled and removed", "success");
                router.push("/Admin/orders");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            showToast("An error occurred", "error");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!order) return <div className="p-8 text-center text-stone-500 font-bold">Order not found</div>;

    const totalAmount = order.total_prices.reduce((a, b) => a + b, 0).toFixed(2);

    // Grouping items by product name while keeping size-specific data
    const groupedItems = () => {
        const grouped: Record<string, { index: number; size: string; qty: number; unitPrice: number; totalPrice: number }[]> = {};
        order.product_names.forEach((name, i) => {
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push({
                index: i,
                size: order.product_sizes ? order.product_sizes[i] : "N/A",
                qty: order.quantities[i],
                unitPrice: order.unit_prices[i],
                totalPrice: order.total_prices[i]
            });
        });
        return grouped;
    };

    return (
        <div className="p-4 md:p-8">
            <Link
                href="/AdminGeezS/orders"
                className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-6 font-bold text-sm"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                </svg>
                Back to Orders
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-2 tracking-tight">Order Details</h1>
                                <div className="flex items-center gap-3 text-sm md:text-base">
                                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-stone-600 font-medium">{new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <span className="text-stone-300">•</span>
                                    <p className="text-stone-600 font-medium">{new Date(order.order_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <span className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${order.order_status === 'sold' ? 'bg-green-100 text-green-700 border border-green-200' :
                                order.order_status === 'pending' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}>
                                {order.order_status}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl md:text-2xl font-black text-stone-900 border-b-2 pb-4 border-stone-200 uppercase tracking-tight">Ordered Items</h2>
                            <div className="space-y-6">
                                {Object.entries(groupedItems()).map(([productName, variants]) => (
                                    <div key={productName} className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-6 md:p-8 border-2 border-stone-200 shadow-lg">
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-300">
                                            <h3 className="font-black text-stone-900 uppercase tracking-tight text-xl md:text-2xl leading-tight">{productName}</h3>
                                            <span className="bg-amber-600 text-white text-sm font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-md">
                                                {variants.length} {variants.length > 1 ? 'Variants' : 'Variant'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                                            {variants.map((variant, idx) => {
                                                const productId = order.product_ids[variant.index];
                                                const imageUrl = productImages[productId];

                                                return (
                                                    <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border-2 border-stone-200 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center">
                                                            {/* Product Image - Larger */}
                                                            {imageUrl && (
                                                                <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden border-2 border-stone-200 flex-shrink-0 shadow-sm">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={order.product_names[variant.index]}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Size Badge - Larger */}
                                                            <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-white w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border-2 border-amber-600 shadow-lg flex-shrink-0">
                                                                <span className="text-xs opacity-90">Size</span>
                                                                <span>{variant.size}</span>
                                                            </div>

                                                            {/* Details - Larger Text */}
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black text-stone-400 uppercase tracking-widest leading-none mb-2">Product Details</p>
                                                                <p className="text-lg md:text-xl font-bold text-stone-900 mb-1">Shoe Size: {variant.size}</p>
                                                                <p className="text-sm text-stone-600 font-medium">Quantity: {variant.qty} {variant.qty > 1 ? 'pairs' : 'pair'}</p>
                                                            </div>

                                                            {/* Pricing - Larger and More Prominent */}
                                                            <div className="w-full md:w-auto text-left md:text-right bg-stone-50 p-4 rounded-xl border border-stone-200">
                                                                <p className="text-xs font-black text-stone-400 uppercase tracking-widest leading-none mb-2">Pricing</p>
                                                                <p className="text-base font-bold text-stone-700 mb-1">
                                                                    {variant.qty} × ${variant.unitPrice.toFixed(2)}
                                                                </p>
                                                                <p className="text-2xl md:text-3xl font-black text-amber-600">
                                                                    ${variant.totalPrice.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-6 mt-6 bg-gradient-to-r from-stone-900 to-stone-800 p-8 md:p-10 rounded-3xl shadow-2xl shadow-stone-900/20">
                                <span className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Grand Total</span>
                                <span className="text-2xl md:text-4xl font-black text-amber-500 tracking-tighter italic">${totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Order Description</h2>
                        <p className="text-sm md:text-base text-stone-600 leading-relaxed italic">
                            {order.order_description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Customer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Name</p>
                                <p className="font-bold text-stone-900">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Email</p>
                                <p className="font-bold text-stone-900 truncate" title={order.customer_email}>{order.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Phone</p>
                                <p className="font-bold text-stone-900">{order.customer_Phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Location</p>
                                <p className="font-bold text-stone-900 text-sm">
                                    {order.orderplace ? "📍 Addis Ababa" : "✈️ Outside Addis Ababa"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Delivery Location</p>
                                <p className="font-bold text-stone-900">{order.delivery_location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Coupon Code</p>
                                <p className={`font-black tracking-widest text-sm ${order.coupon_code ? "text-amber-600" : "text-stone-300"}`}>
                                    {order.coupon_code || "NONE"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-6">Actions</h2>
                        <div className="space-y-3 md:space-y-4">
                            <button
                                onClick={handleMarkAsSold}
                                disabled={actionLoading}
                                className="w-full py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-lg bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20 disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Mark as Sold"}
                            </button>

                            <button
                                onClick={handleCancelOrder}
                                disabled={actionLoading}
                                className="w-full py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-xs md:text-sm text-red-600 hover:bg-red-50 border-2 border-red-50 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Cancel Order"}
                            </button>
                        </div>
                        <p className="text-[10px] text-stone-400 text-center mt-6 uppercase font-black tracking-widest leading-relaxed">
                            These actions will remove the order record from the system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
