'use client';

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from "next/navigation";
import { Session } from '@supabase/supabase-js';
import Link from "next/link";


const AdminDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();

        if (!user) {
            router.push("/Admin/Login");
        } else {
            setUser(user);
            setSession(session);

            // Fetch user profile from database
            // Try 'profiles' table first, then 'users' table
            let profile = null;

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profileError && profileData) {
                profile = profileData;
            } else {
                // Try 'users' table as fallback
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!userError && userData) {
                    profile = userData;
                }
            }

            setUserProfile(profile);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/Admin/Login");
    };

    const getUserDisplayName = () => {
        if (!user) return 'Admin';

        // First, try to get name from database profile
        if (userProfile) {
            // Check various possible field names in the profile
            if (userProfile.full_name) return userProfile.full_name;
            if (userProfile.name) return userProfile.name;
            if (userProfile.display_name) return userProfile.display_name;
            if (userProfile.first_name && userProfile.last_name) {
                return `${userProfile.first_name} ${userProfile.last_name}`;
            }
            if (userProfile.first_name) return userProfile.first_name;
        }

        // Fallback to user metadata
        if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name;
        }
        if (user.user_metadata?.name) {
            return user.user_metadata.name;
        }
        if (user.user_metadata?.display_name) {
            return user.user_metadata.display_name;
        }

        // Extract name from email (part before @)
        if (user.email) {
            const emailName = user.email.split('@')[0];
            // Capitalize first letter and replace dots/underscores with spaces
            return emailName
                .replace(/[._]/g, ' ')
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        return 'Admin';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-amber-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-stone-700 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex-1 w-full">

                <div className="container mx-auto px-6 py-8">
                    {/* User Information Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-200">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-stone-800 mb-2">
                                    Welcome back, {getUserDisplayName()}!
                                </h2>
                                <p className="text-stone-600">Here's your account information</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full">
                                <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Details */}
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm font-semibold text-amber-900 mb-1">Display Name</p>
                                    <p className="text-stone-800 font-medium">
                                        {getUserDisplayName()}
                                    </p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm font-semibold text-amber-900 mb-1">Email Address</p>
                                    <p className="text-stone-800 font-medium">{user?.email}</p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm font-semibold text-amber-900 mb-1">User ID</p>
                                    <p className="text-stone-800 font-mono text-sm">{user?.id}</p>
                                </div>
                            </div>

                            {/* Session Details */}
                            <div className="space-y-4">
                                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                    <p className="text-sm font-semibold text-stone-900 mb-1">Session Status</p>
                                    <div className="flex items-center">
                                        <span className="flex h-3 w-3 relative mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <p className="text-stone-800 font-medium">
                                            {session ? 'Active' : 'No active session'}
                                        </p>
                                    </div>
                                </div>

                                {session && (
                                    <>
                                        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                            <p className="text-sm font-semibold text-stone-900 mb-1">Last Sign In</p>
                                            <p className="text-stone-800 font-medium text-sm">
                                                {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                                            </p>
                                        </div>

                                        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                            <p className="text-sm font-semibold text-stone-900 mb-1">Access Token Expires</p>
                                            <p className="text-stone-800 font-medium text-sm">
                                                {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'Never'}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                    <p className="text-sm font-semibold text-stone-900 mb-1">Email Verified</p>
                                    <p className="text-stone-800 font-medium">
                                        {user?.email_confirmed_at ? '✓ Verified' : '✗ Not verified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Debug Section - Remove this after confirming the correct field names */}
                    {userProfile && (
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-yellow-300">
                            <div className="flex items-center mb-4">
                                <svg className="w-6 h-6 text-yellow-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-bold text-yellow-900">Debug: Profile Data from Database</h3>
                            </div>
                            <p className="text-sm text-yellow-800 mb-3">
                                This shows the raw data from your Supabase table. Once you confirm the correct field names, you can remove this section.
                            </p>
                            <pre className="bg-white p-4 rounded border border-yellow-300 overflow-x-auto text-xs">
                                {JSON.stringify(userProfile, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Dashboard Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/Admin/products" className="bg-white p-6 rounded-xl shadow-lg border border-amber-200 hover:shadow-xl transition-shadow duration-200 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl text-amber-900">Products</h3>
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-stone-600">Manage your shoe inventory and product catalog</p>
                        </Link>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl text-amber-900">Orders</h3>
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-stone-600">View and manage customer orders and shipments</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl text-amber-900">Users</h3>
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-stone-600">Manage user accounts and permissions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
