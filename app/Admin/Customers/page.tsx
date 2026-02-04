"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/Admin/Login");
            }
        };

        checkAuth();
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("total_items_purchased", { ascending: false });

        if (!error) setCustomers(data || []);
        setLoading(false);
    }

    if (loading)
        return (
            <p className="p-6 text-center text-stone-600">
                Loading customers…
            </p>
        );

    return (
        <div className="p-6 bg-gradient-to-b from-stone-50 to-stone-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-stone-900 drop-shadow-md">
                Customers
            </h1>

            <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
                <table className="w-full border-collapse border border-stone-200">
                    <thead className="bg-stone-200 text-left">
                        <tr>
                            <th className="p-4 text-stone-700 font-bold">Name</th>
                            <th className="p-4 text-stone-700 font-bold">Email</th>
                            <th className="p-4 text-stone-700 font-bold">Phone</th>
                            <th className="p-4 text-stone-700 font-bold">
                                Items Bought
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c, index) => (
                            <tr
                                key={c.id}
                                className={`border-t ${
                                    index < 10
                                        ? "bg-amber-50 hover:bg-amber-100"
                                        : "hover:bg-stone-50"
                                } transition-all`}
                            >
                                <td
                                    className={`p-4 font-bold ${
                                        index < 10
                                            ? "text-amber-700"
                                            : "text-stone-900"
                                    }`}
                                >
                                    {c.name}
                                </td>
                                <td className="p-4 text-stone-600">{c.email}</td>
                                <td className="p-4 text-stone-600">{c.phone}</td>
                                <td
                                    className={`p-4 font-black ${
                                        index < 10
                                            ? "text-amber-700"
                                            : "text-stone-900"
                                    }`}
                                >
                                    {c.total_items_purchased}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                @media (max-width: 640px) {
                    table {
                        width: 100%;
                        font-size: 0.875rem; /* Reduce font size */
                    }

                    th,
                    td {
                        padding: 0.5rem; /* Reduce padding */
                    }

                    th {
                        font-size: 0.9rem; /* Slightly smaller headers */
                    }

                    tbody tr {
                        border-width: 1px; /* Keep borders thinner */
                    }
                }

                h1 {
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                tbody tr:hover {
                    transform: scale(1.02);
                    transition: transform 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
}
