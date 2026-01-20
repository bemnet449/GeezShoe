'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminPage = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page
        router.push("/Admin/Login");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
    );
};

export default AdminPage;
