"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ShopNavbar from "@/components/ShopNavbar";
import {
    placeOrder,
    getCart,
    getCartTotal,
    removeFromCart,
    updateCartItemQuantity,
    type CartItem,
} from "@/utils/placeOrder";

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        description: "",
        isInAddis: true,
        coupon_code: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        // Load cart on mount
        setCart(getCart());
    }, []);

    const handleRemoveItem = (id: string, size?: number) => {
        removeFromCart(id, size);
        setCart(getCart());
    };

    const handleUpdateQuantity = (id: string, qty: number, size?: number) => {
        const limitedQty = Math.min(Math.max(1, qty), 15);
        updateCartItemQuantity(id, limitedQty, size);
        setCart(getCart());
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (cart.length === 0) {
            setErrors({ general: "Your cart is empty" });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await placeOrder(formData);
            setOrderSuccess(true);

            // Redirect to success page or home after 2 seconds
            setTimeout(() => {
                router.push("/clients/shop");
            }, 3000);
        } catch (error) {
            console.error("Order placement error:", error);
            setErrors({
                general: error instanceof Error ? error.message : "Failed to place order. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const total = getCartTotal();

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-stone-900 mb-4">Order Placed Successfully!</h2>
                    <p className="text-stone-600 text-lg mb-2">Thank you for your order, {formData.name}!</p>
                    <p className="text-stone-500">We'll contact you at {formData.email} shortly.</p>
                    <p className="text-sm text-stone-400 mt-6">Redirecting to shop...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <ShopNavbar />

            <div className="pt-32 pb-24 container mx-auto px-6">
                <h1 className="text-5xl font-black text-stone-900 mb-12 uppercase tracking-tight">Checkout</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-4">Your cart is empty</h2>
                        <button
                            onClick={() => router.push("/clients/shop")}
                            className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Cart Items */}
                        <div>
                            <h2 className="text-2xl font-black text-stone-900 mb-6 uppercase tracking-tight">Your Order</h2>
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div
                                        key={`${item.id}-${item.size}-${index}`}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100 flex gap-6"
                                    >
                                        {item.image && (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-stone-900 text-lg mb-1">{item.name}</h3>
                                            {item.size && (
                                                <p className="text-sm text-stone-500 mb-2">Size: EU {item.size}</p>
                                            )}
                                            <p className="text-amber-600 font-black text-xl">${item.price}</p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => handleRemoveItem(item.id, item.size)}
                                                className="text-stone-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <div className="flex items-center border-2 border-stone-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.qty - 1, item.size)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="w-10 h-8 flex items-center justify-center font-bold text-sm">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.qty + 1, item.size)}
                                                    disabled={item.qty >= 15}
                                                    className={`w-8 h-8 flex items-center justify-center transition-colors ${item.qty >= 15 ? "text-stone-300 cursor-not-allowed" : "hover:bg-stone-50"}`}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-stone-900 font-bold mt-2">${(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border-2 border-amber-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-stone-900 uppercase tracking-wide">Total</span>
                                    <span className="text-3xl font-black text-amber-600">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div>
                            <h2 className="text-2xl font-black text-stone-900 mb-6 uppercase tracking-tight">
                                Customer Information
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.general && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm font-bold">
                                        {errors.general}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.name ? "border-red-300 bg-red-50 focus:ring-red-500/10" : "border-stone-200 bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10"
                                            } focus:outline-none font-bold text-stone-900 group shadow-sm hover:border-stone-300`}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-600 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.email ? "border-red-300 bg-red-50 focus:ring-red-500/10" : "border-stone-200 bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10"
                                            } focus:outline-none font-bold text-stone-900 group shadow-sm hover:border-stone-300`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-red-600 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.phone ? "border-red-300 bg-red-50 focus:ring-red-500/10" : "border-stone-200 bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10"
                                            } focus:outline-none font-bold text-stone-900 group shadow-sm hover:border-stone-300`}
                                        placeholder="+251 912 345 678"
                                    />
                                    {errors.phone && <p className="text-red-600 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-2">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 focus:outline-none font-bold text-stone-900 shadow-sm hover:border-stone-300 resize-none transition-all"
                                        rows={3}
                                        placeholder="Any special requests or delivery instructions..."
                                    />
                                </div>

                                {/* Coupon Code Section */}
                                <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6 transition-all duration-300">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={showCouponInput}
                                                onChange={(e) => {
                                                    setShowCouponInput(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setFormData(prev => ({ ...prev, coupon_code: "" }));
                                                    }
                                                }}
                                                className="w-5 h-5 rounded border-2 border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-600 focus:ring-offset-0 cursor-pointer accent-amber-600 transition-all"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-stone-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                                                I have a coupon code
                                            </span>
                                        </div>
                                    </label>

                                    {showCouponInput && (
                                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.coupon_code}
                                                    onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 focus:outline-none font-bold text-stone-900 shadow-sm hover:border-stone-300 text-sm transition-all"
                                                    placeholder="ENTER CODE (E.G. WELCOME10)"
                                                />
                                                <div className="absolute inset-y-0 right-4 flex items-center">
                                                    <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {formData.coupon_code && (
                                                <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1 uppercase tracking-tight italic">
                                                    Coupon code will be validated upon order processing
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Location */}
                                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-stone-700 mb-4">
                                        Delivery Location
                                    </h3>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.isInAddis}
                                                onChange={(e) => setFormData({ ...formData, isInAddis: e.target.checked })}
                                                className="w-5 h-5 rounded border-2 border-amber-600 text-amber-600 focus:ring-2 focus:ring-amber-600 focus:ring-offset-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                                                Delivery within Addis Ababa
                                            </span>
                                            <p className="text-xs text-stone-600 mt-1">
                                                {formData.isInAddis
                                                    ? "✓ Your order will be delivered within Addis Ababa"
                                                    : "✗ Delivery outside Addis Ababa (additional charges may apply)"}
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${loading
                                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        "Place Order"
                                    )}
                                </button>

                                <p className="text-xs text-stone-500 text-center">
                                    By placing this order, you agree to our terms and conditions.
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
