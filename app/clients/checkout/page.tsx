"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import {
    placeOrder,
    getCart,
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
        delivery_location: "",
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

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        if (!formData.delivery_location.trim()) {
            newErrors.delivery_location = "Delivery location is required";
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

            // Redirect to success page or home after 3 seconds
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

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.original_price || item.price) * item.qty, 0);
    const totalSavings = subtotal - total;

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
        <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300">
            <ShopNavbar />

            <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 max-w-full overflow-x-hidden">
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
                            className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Cart Items Column */}
                        <div>
                            <h2 className="text-2xl font-black text-stone-900 mb-6 uppercase tracking-tight">Your Order</h2>
                            <div className="space-y-4 md:space-y-6">
                                {cart.map((item, index) => (
                                    <div
                                        key={`${item.id}-${item.size}-${index}`}
                                        className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-stone-100 w-full max-w-full overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row sm:gap-6 gap-4"
                                    >
                                        <div className="flex gap-4 sm:gap-6 min-w-0 flex-1 sm:flex-initial">
                                            {item.image && (
                                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {item.is_preorder && (
                                                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                        <span className="bg-amber-100 text-amber-700 text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border border-amber-200">
                                                            Pre-Order
                                                        </span>
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-stone-900 text-base sm:text-lg mb-2 uppercase tracking-tight leading-tight break-words">{item.name}</h3>
                                                {item.size && (
                                                    <p className="text-xs sm:text-sm text-stone-500 mb-1 sm:mb-2 font-medium">Size: EU {item.size}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-amber-600 font-black text-lg sm:text-xl"><span className="font-bold text-sm sm:text-base text-amber-500/80 mr-0.5">ብር</span>{(item.price * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

                                                    {item.original_price && item.original_price > item.price && (
                                                        <p className="text-stone-400 text-xs sm:text-sm line-through font-bold"><span className="font-normal text-[10px] sm:text-xs">ብር</span>{((item.original_price || 0) * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    )}
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Qty: {item.qty} × <span className="font-bold">ብር</span>{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end sm:justify-between border-t border-stone-100 pt-3 sm:pt-0 sm:border-t-0 gap-3">
                                            <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white order-1 sm:order-2 shadow-sm">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.qty - 1, item.size)}
                                                    className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900 font-bold bg-stone-50"
                                                >
                                                    <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="w-9 sm:w-10 h-9 sm:h-8 flex items-center justify-center font-bold text-sm min-w-[2.25rem] sm:min-w-[2.5rem]">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.qty + 1, item.size)}
                                                    disabled={item.qty >= 15}
                                                    className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center transition-colors font-bold ${item.qty >= 15 ? "text-stone-300 bg-stone-50 cursor-not-allowed" : "text-stone-600 bg-stone-50 hover:text-stone-900 hover:bg-stone-100"}`}
                                                >
                                                    <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id, item.size)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg p-2 transition-all touch-manipulation order-2 sm:order-1"
                                                aria-label="Remove item"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <p className="text-stone-900 font-black text-[10px] uppercase tracking-widest hidden sm:block order-3">{item.is_preorder ? 'Pre-Order Total' : 'Item Total'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary Total */}
                            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border-2 border-amber-100 shadow-xl shadow-amber-600/5 transition-transform hover:scale-[1.01] duration-300">
                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Subtotal/ድምር</span>
                                        <span className="text-lg font-black text-stone-700"><span className="font-bold text-sm text-stone-500 mr-0.5">ብር</span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    {totalSavings > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Discount/ቅናሽ</span>
                                            <span className="text-lg font-black text-emerald-600">- <span className="font-bold text-sm mr-0.5">ብር</span>{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    <div className="border-t-2 border-amber-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-black text-stone-900 uppercase tracking-widest">Total/ጠቅላላ</span>
                                            <span className="text-4xl font-black text-amber-600 tracking-tighter italic"><span className="font-bold text-2xl text-amber-500/80 not-italic mr-1">ብር</span>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Tags in Total Card */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-amber-200">
                                    <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-md">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Free Delivery/ነፃ ዴሊቨሪ</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-sky-500 text-white px-3 py-1.5 rounded-lg shadow-md">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Pay on Delivery/ሲደርስ ይክፈሉ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Form Column */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-100 shadow-stone-200/50">
                            <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-2 uppercase tracking-tight">
                                Customer Information/የማዘዣ ቦታ
                            </h2>
                            <p className="text-sm text-stone-500 mb-6 font-medium">Enter your details for delivery</p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.general && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm font-bold">
                                        {errors.general}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-600 mb-2">
                                        Full Name/ ስም*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${errors.name ? "border-red-300 bg-red-50/50 focus:ring-red-500/10" : "border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:bg-white"
                                            } focus:outline-none font-medium text-stone-900 placeholder:text-stone-400`}
                                        placeholder="e.g. Abebe Kebede"
                                    />
                                    {errors.name && <p className="text-red-600 text-[10px] font-bold mt-1.5">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-600 mb-2">
                                        Email Address / ኢ-ሜል(ካለ)<span className="font-normal text-stone-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none focus:bg-white font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-600 mb-2">
                                        Phone Number /ስልክ*
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${errors.phone ? "border-red-300 bg-red-50/50 focus:ring-red-500/10" : "border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:bg-white"
                                            } focus:outline-none font-medium text-stone-900 placeholder:text-stone-400`}
                                        placeholder="+251 9XX XXX XXX"
                                    />
                                    {errors.phone && <p className="text-red-600 text-[10px] font-bold mt-1.5">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-stone-600 mb-2">
                                        Order Notes /ተጨማሪ ዝርዝር<span className="font-normal text-stone-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none focus:bg-white font-medium text-stone-900 placeholder:text-stone-400 resize-none transition-all duration-200"
                                        rows={3}
                                        placeholder="Special requests, landmarks, or delivery instructions..."
                                    />
                                </div>

                                {/* Delivery Section */}
                                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-2 border-amber-100 rounded-2xl p-6 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-800 mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Delivery Address / ዴሊቨሪ አድራሻ
                                    </h3>
                                    <label className="flex items-start gap-4 cursor-pointer group select-none">
                                        <div className="relative flex-shrink-0 mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.isInAddis}
                                                onChange={(e) => setFormData({ ...formData, isInAddis: e.target.checked })}
                                                className="peer sr-only"
                                            />
                                            <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 group-hover:border-amber-500 ${formData.isInAddis ? 'bg-amber-600 border-amber-600' : 'bg-white border-amber-200'}`}>
                                                {formData.isInAddis && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-black text-stone-900 group-hover:text-amber-700 transition-colors block">
                                                Delivery within Addis Ababa /አዲስ አበባ ዉስጥ
                                            </span>
                                            
                                            {!formData.isInAddis && (
                                                <p className="mt-2 text-sm md:text-base text-red-600 font-bold">
                                                Outside of Addis contains postal delivery fee.
                                              </p>
                                              
                                            )}
                                        </div>
                                    </label>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-2">
                                            Delivery Location / ዴሊቨሪ ቦታ*
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.delivery_location}
                                            onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                                            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${errors.delivery_location ? "border-red-300 bg-red-50/50 focus:ring-red-500/10" : "border-amber-100 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                                                } focus:outline-none font-medium text-stone-900 placeholder:text-stone-400`}
                                            placeholder="e.g. Bole Road, near Edna Mall, Building 22"
                                        />
                                        {errors.delivery_location && <p className="text-red-600 text-[10px] font-bold mt-1.5">{errors.delivery_location}</p>}
                                    </div>
                                </div>

                                {/* Coupon Section Last */}
                                <div className="bg-stone-50/80 border-2 border-stone-200 rounded-2xl p-6 transition-all duration-300">
                                    <label className="flex items-center gap-4 cursor-pointer group select-none">
                                        <div className="relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={showCouponInput}
                                                onChange={(e) => {
                                                    setShowCouponInput(e.target.checked);
                                                    if (!e.target.checked) setFormData(prev => ({ ...prev, coupon_code: "" }));
                                                }}
                                                className="peer sr-only"
                                            />
                                            <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${showCouponInput ? 'bg-amber-600 border-amber-600' : 'bg-white border-stone-300 group-hover:border-stone-400'}`}>
                                                {showCouponInput && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-stone-900 group-hover:text-amber-600 transition-colors">
                                            I have a coupon code / ኩፖን ኮድ አለኝ
                                        </span>
                                    </label>

                                    {showCouponInput && (
                                        <div className="mt-5 animate-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                value={formData.coupon_code}
                                                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none font-bold text-stone-900 text-sm tracking-widest uppercase transition-all placeholder:text-stone-400"
                                                placeholder="Enter coupon code"
                                            />
                                            {formData.coupon_code && (
                                                <p className="text-xs text-amber-600 font-bold mt-2">Code will be validated when processing your order</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-sm md:text-base transition-all duration-300 ${loading
                                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.99]"
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
                                            Confirming...
                                        </span>
                                    ) : (
                                        "Place Order /ይዘዙ"
                                    )}
                                </button>

                                <p className="text-[10px] text-stone-400 text-center font-bold uppercase tracking-widest leading-tight">
                                    By proceeding, you agree to our <span className="text-amber-600">Purchase Terms</span>
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
