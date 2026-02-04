"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return <p className="p-6">Loading customers…</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-black mb-6 text-center text-stone-900">
                Customers
            </h1>

            <table className="w-full border-collapse border border-stone-200 shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-left">
                    <tr>
                        <th className="p-4 text-stone-700 font-bold">Name</th>
                        <th className="p-4 text-stone-700 font-bold">Email</th>
                        <th className="p-4 text-stone-700 font-bold">Phone</th>
                        <th className="p-4 text-stone-700 font-bold">Items Bought</th>
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
    );
}
