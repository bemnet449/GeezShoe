'use client';

import { useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateCredentials = () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }

        // Password validation
        if (password.length < 5) {
            setError("Password must be at least 5 characters long");
            return false;
        }

        return true;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate credentials before attempting login
        if (!validateCredentials()) {
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                // Provide user-friendly error messages
                if (error.message.includes("Invalid login credentials")) {
                    setError("Invalid email or password. Please try again.");
                } else if (error.message.includes("Email not confirmed")) {
                    setError("Please verify your email address before logging in.");
                } else {
                    setError(error.message);
                }
            } else if (data.user) {
                // Successful login - redirect to dashboard
                router.push("/AdminGeezS/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleLogin}
                    className="bg-white p-8 rounded-lg shadow-xl border border-stone-200"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-amber-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 mb-2">Admin Login</h2>
                        <p className="text-stone-600 text-sm">Enter your credentials to access the dashboard</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="mb-5">
                        <label className="block mb-2 font-semibold text-stone-700 text-sm">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition disabled:bg-stone-100 disabled:cursor-not-allowed text-stone-900 bg-white"
                            placeholder="admin@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-stone-700 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition disabled:bg-stone-100 disabled:cursor-not-allowed text-stone-900 bg-white"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                            minLength={5}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-700 to-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-800 hover:to-amber-700 transition-all duration-200 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Login to Dashboard"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-stone-600 text-sm mt-6">
                    GeezShoe Admin Portal © 2026
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
