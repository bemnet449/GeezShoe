"use client";



export default function OrdersPage() {
    const orders = [
        { id: "#GS-8492", customer: "Abebe Kebede", date: "Jan 22, 2026", total: "$124.50", status: "Processing", statusColor: "bg-blue-100 text-blue-700" },
        { id: "#GS-8491", customer: "Liya Tadesse", date: "Jan 21, 2026", total: "$89.99", status: "Shipped", statusColor: "bg-amber-100 text-amber-700" },
        { id: "#GS-8490", customer: "Samuel Yohannes", date: "Jan 20, 2026", total: "$210.00", status: "Delivered", statusColor: "bg-green-100 text-green-700" },
        { id: "#GS-8489", customer: "Hanna Belay", date: "Jan 19, 2026", total: "$145.00", status: "Returned", statusColor: "bg-red-100 text-red-700" },
        { id: "#GS-8488", customer: "Dawit Girma", date: "Jan 18, 2026", total: "$95.00", status: "Delivered", statusColor: "bg-green-100 text-green-700" },
    ];

    return (
        <div className="w-full">
            <main className="p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Order Management</h1>
                        <p className="text-stone-500">Track and manage your customer orders</p>
                    </div>
                    <button className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md">
                        Export Report
                    </button>
                </header>

                {/* Filters */}
                <div className="flex space-x-4 mb-8">
                    {["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"].map((filter, i) => (
                        <button
                            key={i}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === 0 ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-900"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Order Date</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.map((order, i) => (
                                <tr key={i} className="text-sm hover:bg-stone-50 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-stone-900">{order.id}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-semibold text-stone-800">{order.customer}</p>
                                        <p className="text-xs text-stone-500">test.customer@gmail.com</p>
                                    </td>
                                    <td className="px-6 py-5 text-stone-600">{order.date}</td>
                                    <td className="px-6 py-5 font-bold text-stone-900">{order.total}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${order.statusColor}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-amber-600 hover:text-amber-700 font-bold text-xs">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                        <p className="text-xs text-stone-500 font-medium">Showing 5 of 156 orders</p>
                        <div className="flex space-x-2">
                            <button className="p-2 rounded-lg bg-white border border-stone-200 text-stone-400 disabled:opacity-50" disabled>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
