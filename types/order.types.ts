/**
 * Type definitions for the GeezShoe Order Placement System
 */

/**
 * Cart item structure stored in localStorage
 */
export interface CartItem {
    /** Product ID (string) */
    id: string;
    /** Product name */
    name: string;
    /** Unit price (considering discounts) */
    price: number;
    /** Quantity */
    qty: number;
    /** Selected size (EU) */
    size?: number;
    /** Product image URL */
    image?: string;
}

/**
 * Customer information for order placement
 */
export interface OrderFormData {
    /** Customer full name */
    name: string;
    /** Customer email address */
    email: string;
    /** Customer phone number */
    phone: string;
    /** Optional order notes/description */
    description?: string;
}

/**
 * Order structure as stored in Supabase
 */
export interface Order {
    /** Auto-generated order ID */
    id?: number;
    /** Customer full name */
    customer_name: string;
    /** Customer email */
    customer_email: string;
    /** Customer phone number */
    customer_Phone: string;
    /** Order notes/description */
    order_description: string;
    /** Order timestamp */
    order_date: string;
    /** Array of product IDs */
    product_ids: string[];
    /** Array of product names */
    product_names: string[];
    /** Array of quantities */
    quantities: number[];
    /** Array of unit prices */
    unit_prices: number[];
    /** Array of total prices (unit_price × quantity) */
    total_prices: number[];
    /** Order status (e.g., "pending", "processing", "completed") */
    order_status: string;
    /** Whether order has been placed */
    orderplace: boolean;
}

/**
 * Product structure from Supabase
 */
export interface Product {
    /** Product ID */
    id: number;
    /** Product name */
    Name: string;
    /** Product description */
    description: string;
    /** Regular price */
    real_price: number;
    /** Fake/crossed-out price (for marketing) */
    fake_price: number | null;
    /** Whether product is on discount */
    discount: boolean;
    /** Discounted price (if discount is true) */
    discount_price: number | null;
    /** Array of image URLs */
    image_urls: string[];
    /** Available sizes (EU) */
    sizes_available: number[];
    /** Whether product is active/available */
    is_active: boolean;
    /** Stock quantity */
    item_number: number;
}

/**
 * Form validation errors
 */
export interface FormErrors {
    /** Error for name field */
    name?: string;
    /** Error for email field */
    email?: string;
    /** Error for phone field */
    phone?: string;
    /** General error message */
    general?: string;
}

/**
 * Cart summary information
 */
export interface CartSummary {
    /** Total number of items in cart */
    itemCount: number;
    /** Total price of all items */
    totalPrice: number;
    /** Number of unique products */
    uniqueProducts: number;
}
