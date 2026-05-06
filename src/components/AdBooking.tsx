import { useState, useEffect } from "react";
import { Megaphone, Eye, DollarSign, TrendingUp, MousePointerClick, X, Trash2, Loader2, Building2, Newspaper, Globe, Send, CheckCircle, Info } from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";
import { toast } from "react-toastify";
import { TableRowsSkeleton, StatCardsSkeleton } from "./ui/Shimmer";

type AdminTab = "all" | "magazine" | "webbanner" | "companyprofile";

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ElementType; adType?: string }[] = [
    { id: "all", label: "All Bookings", icon: Megaphone },
    { id: "magazine", label: "Magazine Ads", icon: Newspaper, adType: "WindPro Magazine Ad" },
    { id: "webbanner", label: "Web Banners", icon: Globe, adType: "IWPA Website Banner" },
    { id: "companyprofile", label: "Company Profiles", icon: Building2, adType: "Featured Company Profile" },
];

interface Ad {
    _id: string;
    adId?: string;
    company: string;
    adType: string;
    startDate: string;
    endDate: string;
    duration?: string;
    amount: number;
    impressions: number;
    clicks: number;
    status: "Active" | "Expired" | "Pending" | "Approved" | "Forwarded" | "Rejected";
    notes?: string;
    website?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    createdAt: string;
}

const statusStyle = (s: string) =>
    s === "Active" || s === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
        s === "Pending" ? "bg-[#fef3c7] text-[#f59e0b]" :
            s === "Forwarded" ? "bg-[#dbeafe] text-[#155DFC]" :
                s === "Rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                    "bg-[#fee2e2] text-[#dc2626]";

export default function AdBooking() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewAd, setViewAd] = useState<Ad | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/v1/ad-bookings/get-all");
                setAds(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch {
                toast.error("Failed to fetch ad bookings");
            } finally {
                setLoading(false);
            }
        })();

        // ── real-time: new booking submitted by member ──
        const onNew = (booking: Ad) => {
            setAds(prev => {
                if (prev.find(a => a._id === booking._id)) return prev;
                // apply same pending logic as getAdBookings
                const b = { ...booking, status: "Pending" as const };
                toast.info(`New ${booking.adType} submitted by ${booking.company}`);
                return [b, ...prev];
            });
        };

        // ── real-time: status updated (from another admin session) ──
        const onUpdated = (booking: Ad) => {
            setAds(prev => prev.map(a => a._id === booking._id ? { ...a, ...booking } : a));
            setViewAd(prev => prev?._id === booking._id ? { ...prev, ...booking } : prev);
        };

        // ── real-time: booking deleted ──
        const onDeleted = ({ _id }: { _id: string }) => {
            setAds(prev => prev.filter(a => a._id !== _id));
            setViewAd(prev => prev?._id === _id ? null : prev);
        };

        socket.on("ad-booking:new", onNew);
        socket.on("ad-booking:updated", onUpdated);
        socket.on("ad-booking:deleted", onDeleted);

        return () => {
            socket.off("ad-booking:new", onNew);
            socket.off("ad-booking:updated", onUpdated);
            socket.off("ad-booking:deleted", onDeleted);
        };
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/api/v1/ad-bookings/delete/${deleteId}`);
            setAds(prev => prev.filter(a => a._id !== deleteId));
            toast.success("Ad booking deleted");
            setDeleteId(null);
        } catch {
            toast.error("Failed to delete ad booking");
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: "Forwarded" | "Approved" | "Rejected") => {
        setUpdatingId(id);
        const ad = ads.find(a => a._id === id);
        // For magazine/web banner: Approve auto-forwards
        const finalStatus: "Forwarded" | "Approved" | "Rejected" =
            status === "Approved" && (ad?.adType === "WindPro Magazine Ad" || ad?.adType === "IWPA Website Banner")
                ? "Forwarded"
                : status;
        try {
            await api.patch(`/api/v1/ad-bookings/update-status/${id}`, { status: finalStatus });
            setAds(prev => prev.map(a => a._id === id ? { ...a, status: finalStatus } : a));
            setViewAd(prev => prev?._id === id ? { ...prev, status: finalStatus } : prev);
            if (finalStatus === "Forwarded") {
                toast.success(
                    ad?.adType === "WindPro Magazine Ad"
                        ? "Approved & forwarded to designer/printer"
                        : "Approved & banner placed on website"
                );
            } else if (finalStatus === "Approved") {
                toast.success("Company profile approved and published");
            } else {
                toast.success("Booking rejected");
            }
        } catch {
            toast.error("Status update failed");
        } finally {
            setUpdatingId(null);
        }
    };

    const now = new Date();
    const activeCount = ads.filter(a => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        return now >= start && now <= end;
    }).length;
    const totalRevenue = ads.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
    const pendingCount = ads.filter(a => a.status === "Pending").length;

    const tabAds = activeTab === "all" ? ads : ads.filter(a => {
        const tab = ADMIN_TABS.find(t => t.id === activeTab);
        return tab?.adType ? a.adType === tab.adType : true;
    });

    const stats = [
        { label: "Total Bookings", value: ads.length.toString(), icon: Megaphone, color: "#1F7A4D", bg: "#d0fae5" },
        { label: "Active Ads", value: activeCount.toString(), icon: TrendingUp, color: "#155DFC", bg: "#dbeafe" },
        { label: "Total Impressions", value: totalImpressions > 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : totalImpressions.toString(), icon: MousePointerClick, color: "#a855f7", bg: "#f3e8ff" },
        { label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "#f59e0b", bg: "#fef3c7" },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Ad Booking</h1>
                    <p className="text-sm text-[#6a7282]">Review and manage advertisement submissions from the member portal</p>
                </div>
                {pendingCount > 0 && (
                    <span className="px-3 py-1.5 bg-[#fef3c7] text-[#92400e] text-xs font-medium rounded-lg">
                        {pendingCount} pending review
                    </span>
                )}
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 px-4 py-3 bg-[#dbeafe] border border-[#bfdbfe] rounded-lg">
                <Info className="w-4 h-4 text-[#155DFC] shrink-0 mt-0.5" />
                <p className="text-sm text-[#1e40af]">
                    Ad bookings (Magazine Ads, Web Banners, Company Profiles) are submitted by members through the member portal. This page is for admin review and action only.
                </p>
            </div>

            {/* Stats */}
            {loading ? <StatCardsSkeleton count={4} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg p-6">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-[#6a7282]">{s.label}</p>
                                        <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                                        <Icon className="w-6 h-6" style={{ color: s.color }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-[#f3f4f6] p-1 rounded-lg w-fit flex-wrap">
                {ADMIN_TABS.map(tab => {
                    const Icon = tab.icon;
                    const count = tab.id === "all" ? ads.length : ads.filter(a => a.adType === tab.adType).length;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id ? "bg-white text-[#1F7A4D] shadow-sm" : "text-[#6a7282] hover:text-[#242424]"}`}>
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[#d0fae5] text-[#1F7A4D]" : "bg-[#e5e7eb] text-[#6a7282]"}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="grid grid-cols-1 gap-10">
                <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-x-auto">
                    {loading ? (
                        <TableRowsSkeleton rows={5} cols={activeTab === "companyprofile" ? 6 : 8} />
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                                <tr>
                                    {(activeTab === "companyprofile"
                                        ? ["Company", "Website", "Contact", "Description", "Status", "Actions"]
                                        : ["Ad ID", "Company", "Ad Type", "Duration", "Amount", "Performance", "Status", "Actions"]
                                    ).map(h => (
                                        <th key={h} className={`px-6 py-4 text-sm font-medium text-[#242424] ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb]">
                                {tabAds.length === 0 ? (
                                    <tr><td colSpan={activeTab === "companyprofile" ? 6 : 8} className="px-6 py-10 text-center text-[#6a7282] text-sm">No bookings found</td></tr>
                                ) : tabAds.map(ad => (
                                    <tr key={ad._id} className="hover:bg-[#f9fafb]">
                                        {activeTab === "companyprofile" ? (
                                            <>
                                                <td className="px-6 py-4 font-medium text-[#242424]">{ad.company}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282]">{ad.website || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282]">{ad.contactEmail || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282] max-w-xs truncate">{ad.description || "—"}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-mono text-sm font-medium text-[#242424]">{ad.adId || "—"}</td>
                                                <td className="px-6 py-4 font-medium text-[#242424]">{ad.company}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282]">{ad.adType}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-[#242424]">{ad.duration || "—"}</div>
                                                    <div className="text-xs text-[#6a7282]">{new Date(ad.startDate).toLocaleDateString("en-GB")} → {new Date(ad.endDate).toLocaleDateString("en-GB")}</div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-[#242424]">₹{ad.amount.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4 text-xs text-[#6a7282]">
                                                    <div>{ad.impressions.toLocaleString()} impressions</div>
                                                    <div>{ad.clicks.toLocaleString()} clicks</div>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle(ad.status)}`}>{ad.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Approve + Reject for ALL pending types */}
                                                {ad.status === "Pending" && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(ad._id, "Approved")}
                                                            disabled={updatingId === ad._id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F7A4D] text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 hover:bg-[#176939]">
                                                            {updatingId === ad._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                            {/* Approve */}
                                                        </button>
                                                        <button onClick={() => handleStatusUpdate(ad._id, "Rejected")}
                                                            disabled={updatingId === ad._id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FB2C36] text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 hover:bg-[#d91f28]">
                                                            <X className="w-3.5 h-3.5" />
                                                            {/* Reject */}
                                                        </button>
                                                        {/* Extra Forward button for magazine/web banner */}
                                                        {(ad.adType === "WindPro Magazine Ad" || ad.adType === "IWPA Website Banner") && (
                                                            <button onClick={() => handleStatusUpdate(ad._id, "Forwarded")}
                                                                disabled={updatingId === ad._id}
                                                                title={ad.adType === "WindPro Magazine Ad" ? "Forward to designer/printer" : "Place on website"}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#155DFC] text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 hover:bg-[#1249cc]">
                                                                {updatingId === ad._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                                {/* Forward */}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                <button onClick={() => setViewAd(ad)} className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] cursor-pointer">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteId(ad._id)} className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] cursor-pointer">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Admin Workflow Guide */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
                <h2 className="text-lg font-semibold text-[#242424] mb-4">Admin Workflow</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                        { icon: Newspaper, title: "Magazine Ad", desc: "Review → Approve/Reject or Forward to designer/printer", color: "#f59e0b", bg: "#fef3c7" },
                        { icon: Globe, title: "Web Banner", desc: "Review → Approve/Reject or Place banner on IWPA website", color: "#155DFC", bg: "#dbeafe" },
                        { icon: Building2, title: "Company Profile", desc: "Review → Approve to publish or Reject submission", color: "#1F7A4D", bg: "#d0fae5" },
                    ].map(opt => {
                        const Icon = opt.icon;
                        return (
                            <div key={opt.title} className="border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: opt.bg }}>
                                    <Icon className="w-4 h-4" style={{ color: opt.color }} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-[#242424] mb-1">{opt.title}</h3>
                                    <p className="text-sm text-[#6a7282]">{opt.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* View Modal */}
            {viewAd && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-[#242424]">{viewAd.company}</h2>
                                <p className="text-xs text-[#6a7282] mt-0.5">{viewAd.adType}</p>
                            </div>
                            <button onClick={() => setViewAd(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-2 overflow-y-auto flex-1">
                            {([
                                ["Ad ID", viewAd.adId || "—"],
                                ["Status", <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${statusStyle(viewAd.status)}`}>{viewAd.status}</span>],
                                ["Ad Type", viewAd.adType],
                                ...(viewAd.adType === "Featured Company Profile"
                                    ? [["Website", viewAd.website || "—"],
                                    ["Contact Email", viewAd.contactEmail || "—"],
                                    ["Contact Phone", viewAd.contactPhone || "—"],
                                    ["Description", viewAd.description || "—"]]
                                    : [["Duration", viewAd.duration || "—"],
                                    ["Start Date", new Date(viewAd.startDate).toLocaleDateString("en-GB")],
                                    ["End Date", new Date(viewAd.endDate).toLocaleDateString("en-GB")],
                                    ["Amount", `₹${viewAd.amount.toLocaleString("en-IN")}`],
                                    ["Impressions", viewAd.impressions.toLocaleString()],
                                    ["Clicks", viewAd.clicks.toLocaleString()]]),
                                ["Notes", viewAd.notes || "—"],
                            ] as [string, any][]).map(([label, value]) => (
                                <div key={label} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                                    <span className="text-xs font-medium text-[#6a7282] w-28 shrink-0 pt-0.5">{label}</span>
                                    <span className="text-sm text-[#242424] break-all">{value}</span>
                                </div>
                            ))}
                        </div>
                        {/* Approve / Reject / Forward actions inside modal */}
                        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-2xl sm:rounded-b-xl shrink-0 gap-2 flex-wrap">
                            <div className="flex gap-2 flex-wrap">
                                {viewAd.status === "Pending" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(viewAd._id, "Approved")}
                                            disabled={updatingId === viewAd._id}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-[#176939]">
                                            {updatingId === viewAd._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(viewAd._id, "Rejected")}
                                            disabled={updatingId === viewAd._id}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FB2C36] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-[#d91f28]">
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                        {(viewAd.adType === "WindPro Magazine Ad" || viewAd.adType === "IWPA Website Banner") && (
                                            <button
                                                onClick={() => handleStatusUpdate(viewAd._id, "Forwarded")}
                                                disabled={updatingId === viewAd._id}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#155DFC] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-[#1249cc]">
                                                {updatingId === viewAd._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {viewAd.adType === "WindPro Magazine Ad" ? "Forward to Designer" : "Place on Website"}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <button onClick={() => setViewAd(null)}
                                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white text-sm font-medium cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-[#FB2C36]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-[#242424] mb-1">Delete Ad Booking</h3>
                                <p className="text-sm text-[#6a7282] mb-4">Are you sure? This action cannot be undone.</p>
                                <div className="flex items-center gap-3 justify-end">
                                    <button onClick={() => setDeleteId(null)} disabled={deleting}
                                        className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                                        Cancel
                                    </button>
                                    <button onClick={handleDelete} disabled={deleting}
                                        className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
