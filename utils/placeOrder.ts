"use client";

import { supabase } from "@/lib/supabaseClient";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    size?: number;
    image?: string;
    is_preorder?: boolean;
    original_price?: number;
}

export interface OrderFormData {
    name: string;
    email: string;
    phone: string;
    description?: string;
    isInAddis: boolean;
    coupon_code?: string;
    delivery_location: string;
}

/**
 * Places an order by reading cart from localStorage,
 * transforming it to match Supabase Order table schema,
 * and inserting into the database.
 * 
 * @param formData - Customer information
 * @returns Promise that resolves on success or throws on error
 */
export async function placeOrder(formData: OrderFormData): Promise<void> {
    // 1. Read cart from localStorage
    const cartRaw = localStorage.getItem("cart");

    if (!cartRaw) {
        throw new Error("Cart is empty");
    }

    let cart: CartItem[];
    try {
        const parsed = JSON.parse(cartRaw);
        cart = Array.isArray(parsed) ? parsed : parsed.cart || [];
    } catch {
        throw new Error("Invalid cart data");
    }

    if (!cart.length) {
        throw new Error("Cart is empty");
    }

    // 2. Validate form data
    if (!formData.name?.trim()) {
        throw new Error("Customer name is required");
    }
    if (!formData.phone?.trim()) {
        throw new Error("Customer phone is required");
    }
    if (!formData.delivery_location?.trim()) {
        throw new Error("Delivery location is required");
    }

    // Removed email validation to make it optional
    if (formData.email?.trim()) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error("Invalid email format");
        }
    }

    // Sanitize email if provided
    const sanitizedEmail = formData.email?.trim().toLowerCase() || null;

    // 3. Transform cart items into arrays matching Supabase schema
    const product_ids = cart.map((item) => String(item.id));
    const product_names = cart.map((item) => item.name);
    const product_sizes = cart.map((item) => item.size ? String(item.size) : "N/A");
    const quantities = cart.map((item) => item.qty);
    const unit_prices = cart.map((item) => item.price);
    const total_prices = cart.map((item) => item.price * item.qty);
    const order_is_preorder = cart.some(item => item.is_preorder);

    // 4. Insert order into Supabase
    const { error } = await supabase.from("order").insert({
        customer_name: formData.name.trim(),
        customer_email: sanitizedEmail, // Allow null for optional email
        customer_Phone: formData.phone.trim(),
        order_description: formData.description?.trim() || "",
        order_date: new Date().toISOString(),
        product_ids,
        product_names,
        product_sizes,
        quantities,
        unit_prices,
        total_prices,
        order_status: "pending",
        orderplace: formData.isInAddis, // true if in Addis, false otherwise
        coupon_code: formData.coupon_code?.trim() || null,
        delivery_location: formData.delivery_location.trim(),
        is_preorder: order_is_preorder,
    });

    if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to place order: ${error.message}`);
    }

    // 5. Clear cart after successful order
    localStorage.removeItem("cart");
}

/**
 * Gets the current cart from localStorage
 */
export function getCart(): CartItem[] {
    const cartRaw = localStorage.getItem("cart");
    if (!cartRaw) return [];

    try {
        const parsed = JSON.parse(cartRaw);
        return Array.isArray(parsed) ? parsed : parsed.cart || [];
    } catch {
        return [];
    }
}

/**
 * Adds an item to the cart in localStorage
 */
export function addToCart(item: CartItem): void {
    const cart = getCart();

    // Check if item already exists (same id and size)
    const existingIndex = cart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.size === item.size
    );

    if (existingIndex !== -1) {
        // Update quantity if item exists
        cart[existingIndex].qty += item.qty;
    } else {
        // Add new item
        cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Removes an item from the cart
 */
export function removeFromCart(id: string, size?: number): void {
    const cart = getCart();
    const filtered = cart.filter(
        (item) => !(item.id === id && item.size === size)
    );
    localStorage.setItem("cart", JSON.stringify(filtered));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Updates the quantity of a cart item
 */
export function updateCartItemQuantity(id: string, qty: number, size?: number): void {
    const cart = getCart();
    const item = cart.find((item) => item.id === id && item.size === size);

    if (item) {
        item.qty = Math.max(1, qty);
        localStorage.setItem("cart", JSON.stringify(cart));
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event("cartUpdated"));
    }
}

/**
 * Clears the entire cart
 */
export function clearCart(): void {
    localStorage.removeItem("cart");
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Calculates the total price of all items in cart
 */
export function getCartTotal(): number {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
}

/**
 * Gets the total number of items in cart
 */
export function getCartItemCount(): number {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.qty, 0);
}
