"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Slide in
        setTimeout(() => setIsVisible(true), 10);

        // Slide out before removing
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
    }[type];

    const icon = {
        success: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    }[type];

    return (
        <div
            className={`fixed top-24 right-6 z-[100] transition-all duration-300 ease-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
                }`}
        >
            <div
                className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-md`}
            >
                <div className="flex-shrink-0">{icon}</div>
                <p className="font-bold text-sm flex-1">{message}</p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// Toast container component to manage multiple toasts
interface ToastMessage {
    id: number;
    message: string;
    type: "success" | "error" | "info";
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handleShowToast = (event: CustomEvent) => {
            const { message, type = "success" } = event.detail;
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type }]);
        };

        window.addEventListener("showToast" as any, handleShowToast);
        return () => window.removeEventListener("showToast" as any, handleShowToast);
    }, []);

    return (
        <>
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ top: `${6 + index * 5.5}rem` }}
                    className="fixed right-6 z-[100]"
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    />
                </div>
            ))}
        </>
    );
}

// Helper function to show toast from anywhere
export function showToast(message: string, type: "success" | "error" | "info" = "success") {
    const event = new CustomEvent("showToast", {
        detail: { message, type },
    });
    window.dispatchEvent(event);
}
