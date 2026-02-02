"use client";



export default function AnalyticsPage() {
    return (
        <div className="w-full">
            <main className="p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Store Analytics</h1>
                    <p className="text-sm text-stone-500">Performance insights for GeezShoe</p>
                </header>

                {/* Placeholder Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    {[
                        { label: "Total Revenue", value: "$45,231", change: "+12.5%", color: "text-green-600" },
                        { label: "Active Orders", value: "156", change: "+2.3%", color: "text-blue-600" },
                        { label: "Visitors", value: "12.4k", change: "+18.1%", color: "text-amber-600" },
                        { label: "Conv. Rate", value: "3.42%", change: "+0.5%", color: "text-purple-600" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-200">
                            <p className="text-[10px] md:text-sm font-semibold text-stone-500 mb-1 md:mb-2">{stat.label}</p>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-1">
                                <h3 className="text-lg md:text-2xl font-bold text-stone-900">{stat.value}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 ${stat.color} w-fit`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Demo Charts Placeholders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-stone-200 h-64 md:h-80 flex flex-col items-center justify-center text-stone-400 text-center">
                        <svg className="w-10 h-10 md:w-12 md:h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="font-bold text-sm md:text-base">Sales Performance Chart</p>
                        <p className="text-[10px] md:text-xs mt-2 px-4">DEMO CONTENT: Data visualization pending integration</p>
                    </div>
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-stone-200 h-64 md:h-80 flex flex-col items-center justify-center text-stone-400 text-center">
                        <svg className="w-10 h-10 md:w-12 md:h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        <p className="font-bold text-sm md:text-base">Category Breakdown</p>
                        <p className="text-[10px] md:text-xs mt-2 px-4">DEMO CONTENT: Data visualization pending integration</p>
                    </div>
                </div>

                {/* Top Products Table Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <h3 className="font-bold text-stone-900">Most Popular Shoeware</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-stone-50 text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4">Inventory</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Total Sold</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {[
                                    { name: "Vintage Leather Boots", stock: "12", price: "$145.00", sold: "240" },
                                    { name: "Urban Stealth Sneakers", stock: "45", price: "$89.99", sold: "185" },
                                    { name: "Classic Suede Loafers", stock: "8", price: "$110.00", sold: "156" },
                                ].map((item, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="px-6 py-4 font-semibold text-stone-800">{item.name}</td>
                                        <td className="px-6 py-4 text-stone-600 text-xs">{item.stock} in stock</td>
                                        <td className="px-6 py-4 text-stone-800 font-bold">{item.price}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-[10px] font-bold">
                                                {item.sold} units
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
