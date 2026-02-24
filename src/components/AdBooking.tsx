import { useState } from 'react';
import {
    Megaphone,
    Plus,
    Eye,
    DollarSign,
    TrendingUp,
    MousePointerClick,
    X,
} from 'lucide-react';

export default function AdBooking() {
    const [open, setOpen] = useState(false);

    const stats = [
        { label: 'Active Campaigns', value: '12', icon: Megaphone, color: '#1F7A4D', bg: '#d0fae5' },
        { label: 'Total Revenue', value: '₹8.5L', icon: DollarSign, color: '#155DFC', bg: '#dbeafe' },
        { label: 'Total Impressions', value: '456K', icon: TrendingUp, color: '#a855f7', bg: '#f3e8ff' },
        { label: 'Total Clicks', value: '23.4K', icon: MousePointerClick, color: '#f59e0b', bg: '#fef3c7' },
    ];

    const ads = [
        {
            id: 'AD-2026-001',
            company: 'Suzlon Energy Limited',
            type: 'Banner - Homepage',
            duration: '3 Months',
            date: '1/1/2026 - 3/31/2026',
            amount: '₹75,000',
            impressions: '45,678',
            clicks: '2,345',
            status: 'Active',
        },
        {
            id: 'AD-2026-002',
            company: 'ReGen Powertech',
            type: 'Featured Company Profile',
            duration: '6 Months',
            date: '1/15/2026 - 7/14/2026',
            amount: '₹1,20,000',
            impressions: '23,456',
            clicks: '1,234',
            status: 'Active',
        },
        {
            id: 'AD-2025-189',
            company: 'WindTech Solutions',
            type: 'Sponsored Content',
            duration: '1 Month',
            date: '12/1/2025 - 12/31/2025',
            amount: '₹45,000',
            impressions: '67,890',
            clicks: '3,456',
            status: 'Expired',
        },
    ];

    const statusStyle = (s: string) =>
        s === 'Active'
            ? 'bg-[#d0fae5] text-[#1F7A4D]'
            : 'bg-[#fee2e2] text-[#dc2626]';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Ad Booking</h1>
                    <p className="text-sm text-[#6a7282]">
                        Manage digital advertisements and company profile promotions
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New Advertisement
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg p-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-[#6a7282]">{s.label}</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>
                                        {s.value}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className='grid grid-cols-1 gap-10'>
                <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                            <tr>
                                {['Ad ID', 'Company', 'Ad Type', 'Duration', 'Amount', 'Performance', 'Status', 'Actions'].map(h => (
                                    <th key={h} className={`px-6 py-4 text-sm font-medium ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb]">
                            {ads.map(ad => (
                                <tr key={ad.id} className="hover:bg-[#f9fafb]">
                                    <td className="px-6 py-4 font-mono text-sm">{ad.id}</td>
                                    <td className="px-6 py-4 font-medium">{ad.company}</td>
                                    <td className="px-6 py-4 text-sm text-[#6a7282]">{ad.type}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium">{ad.duration}</div>
                                        <div className="text-xs text-[#6a7282]">{ad.date}</div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{ad.amount}</td>
                                    <td className="px-6 py-4 text-xs text-[#6a7282]">
                                        <div>{ad.impressions} impressions</div>
                                        <div>{ad.clicks} clicks</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle(ad.status)}`}>
                                            {ad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] cursor-pointer">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advertisement Options */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
                <h2 className="text-lg font-semibold text-[#242424] mb-4">
                    Advertisement Options
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Option 1 */}
                    <div className="border border-[#e5e7eb] rounded-lg p-4 hover:border-[#1F7A4D] transition-colors">
                        <h3 className="font-medium text-[#242424] mb-1">
                            WindPro Magazine Ad
                        </h3>
                        <p className="text-sm text-[#6a7282] mb-3">
                            Homepage and section banners
                        </p>
                        <p className="text-xl font-bold text-[#1F7A4D]">
                            ₹25K/month
                        </p>
                    </div>

                    {/* Option 2 */}
                    <div className="border border-[#e5e7eb] rounded-lg p-4 hover:border-[#1F7A4D] transition-colors">
                        <h3 className="font-medium text-[#242424] mb-1">
                            Featured Company Profiles
                        </h3>
                        <p className="text-sm text-[#6a7282] mb-3">
                            Priority company listings
                        </p>
                        <p className="text-xl font-bold text-[#1F7A4D]">
                            ₹20K/month
                        </p>
                    </div>

                    {/* Option 3 */}
                    <div className="border border-[#e5e7eb] rounded-lg p-4 hover:border-[#1F7A4D] transition-colors">
                        <h3 className="font-medium text-[#242424] mb-1">
                            IWPA Website Banners
                        </h3>
                        <p className="text-sm text-[#6a7282] mb-3">
                            Articles and announcements
                        </p>
                        <p className="text-xl font-bold text-[#1F7A4D]">
                            ₹45K/article
                        </p>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">New Advertisement</h2>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Company Name" />
                            <select className="w-full border rounded-lg px-3 py-2">
                                <option>Banner - Homepage</option>
                                <option>Featured Company Profile</option>
                                <option>Sponsored Content</option>
                            </select>
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Duration (e.g. 3 Months)" />
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Amount (₹)" />
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 border rounded-lg cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] cursor-pointer">
                                Create Advertisement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}