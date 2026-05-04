import { useState, useEffect } from "react";
import { Building2, Globe, Mail, Phone, Search, X, CheckCircle, Loader2, Clock } from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";
import { toast } from "react-toastify";
import { TableRowsSkeleton } from "./ui/Shimmer";

interface CompanyProfile {
    _id: string;
    adId?: string;
    adType: string;
    company: string;
    website?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

type Tab = "approved" | "pending";

export default function CompanyProfiles({ userType = "admin" }: { userType?: "admin" | "member" }) {
    const isMember = userType === "member";
    const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("pending");
    const [viewProfile, setViewProfile] = useState<CompanyProfile | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // ── initial fetch ──
    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/ad-bookings/get-all");
            const all = Array.isArray(res.data?.data) ? res.data.data : [];
            setProfiles(all.filter((b: any) => b.adType === "Featured Company Profile"));
        } catch {
            toast.error("Failed to load company profiles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();

        // ── real-time: new submission from member ──
        const onNew = (booking: CompanyProfile) => {
            if (booking.adType !== "Featured Company Profile") return;
            setProfiles(prev => {
                if (prev.find(p => p._id === booking._id)) return prev;
                return [booking, ...prev];
            });
            setActiveTab("pending");
            toast.info(`New company profile submitted: ${booking.company}`);
        };

        // ── real-time: status updated ──
        const onUpdated = (booking: CompanyProfile) => {
            if (booking.adType !== "Featured Company Profile") return;
            setProfiles(prev => prev.map(p => p._id === booking._id ? { ...p, ...booking } : p));
            setViewProfile(prev => prev && prev._id === booking._id ? { ...prev, ...booking } : prev);
        };

        socket.on("ad-booking:new", onNew);
        socket.on("ad-booking:updated", onUpdated);

        return () => {
            socket.off("ad-booking:new", onNew);
            socket.off("ad-booking:updated", onUpdated);
        };
    }, []);

    // ── approve / reject ──
    const handleStatus = async (id: string, status: "Approved" | "Rejected") => {
        setUpdatingId(id);
        try {
            await api.patch(`/api/v1/ad-bookings/update-status/${id}`, { status });
            setProfiles(prev => prev.map(p => p._id === id ? { ...p, status } : p));
            setViewProfile(prev => prev?._id === id ? { ...prev, status } : prev);
            toast.success(status === "Approved" ? "Profile approved and published" : "Profile rejected");
            if (status === "Approved") setActiveTab("approved");
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const approved = profiles.filter(p => p.status === "Approved");
    const pending  = profiles.filter(p => p.status === "Pending");

    // member sees only approved profiles, no tabs
    const displayProfiles = isMember
        ? approved.filter(p =>
            search === "" ||
            p.company.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
          )
        : (activeTab === "approved" ? approved : pending).filter(p =>
            search === "" ||
            p.company.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
          );

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Company Profiles</h1>
                    <p className="text-sm text-[#6a7282]">Review and manage featured company profiles submitted by members</p>
                </div>
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search companies..."
                        className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
                </div>
            </div>

            {/* Stats — admin only */}
            {!isMember && (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 flex items-center gap-4">
                    <div className="w-11 h-11 bg-[#d0fae5] rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#1F7A4D]" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[#1F7A4D]">{approved.length}</p>
                        <p className="text-sm text-[#6a7282]">Published Profiles</p>
                    </div>
                </div>
                <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 flex items-center gap-4">
                    <div className="w-11 h-11 bg-[#fef3c7] rounded-lg flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[#f59e0b]">{pending.length}</p>
                        <p className="text-sm text-[#6a7282]">Pending Review</p>
                    </div>
                </div>
            </div>
            )}

            {/* Tabs — admin only */}
            {!isMember && (
            <div className="flex gap-1 bg-[#f3f4f6] p-1 rounded-lg w-fit">
                {([
                    { id: "pending",  label: "Pending Review", count: pending.length,  activeColor: "text-[#f59e0b]", activeBadge: "bg-[#fef3c7] text-[#f59e0b]" },
                    { id: "approved", label: "Published",      count: approved.length, activeColor: "text-[#1F7A4D]", activeBadge: "bg-[#d0fae5] text-[#1F7A4D]" },
                ] as const).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id ? `bg-white ${tab.activeColor} shadow-sm` : "text-[#6a7282] hover:text-[#242424]"}`}>
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? tab.activeBadge : "bg-[#e5e7eb] text-[#6a7282]"}`}>{tab.count}</span>
                    </button>
                ))}
            </div>
            )}

            {/* Grid */}
            {loading ? (
                <TableRowsSkeleton rows={4} cols={1} />
            ) : displayProfiles.length === 0 ? (
                <div className="bg-white border border-[#e5e7eb] rounded-lg p-10 text-center">
                    <Building2 className="w-12 h-12 text-[#6a7282] mx-auto mb-3 opacity-30" />
                    <p className="text-[#6a7282] text-sm">
                        {search ? "No companies match your search" : isMember ? "No published profiles yet" : activeTab === "pending" ? "No profiles pending review" : "No published profiles yet"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProfiles.map(profile => (
                        <div key={profile._id}
                            className="bg-white border border-[#e5e7eb] rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setViewProfile(profile)}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-[#d0fae5] rounded-lg flex items-center justify-center shrink-0">
                                    <Building2 className="w-6 h-6 text-[#1F7A4D]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#242424] text-base truncate">{profile.company}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                        profile.status === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
                                        profile.status === "Rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                                        "bg-[#fef3c7] text-[#f59e0b]"
                                    }`}>
                                        {profile.status === "Approved" ? "Published" : profile.status === "Rejected" ? "Rejected" : "Pending Review"}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-[#6a7282] mb-3 line-clamp-2">
                                {profile.description || "No description available"}
                            </p>

                            <div className="space-y-1.5 pt-3 border-t border-[#e5e7eb]">
                                {profile.website && (
                                    <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{profile.website}</span>
                                    </div>
                                )}
                                {profile.contactEmail && (
                                    <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                                        <Mail className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{profile.contactEmail}</span>
                                    </div>
                                )}
                                {profile.contactPhone && (
                                    <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                                        <Phone className="w-3.5 h-3.5 shrink-0" />
                                        <span>{profile.contactPhone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Approve / Reject on card — admin only */}
                            {!isMember && profile.status === "Pending" && (
                                <div className="flex gap-2 mt-4 pt-3 border-t border-[#e5e7eb]" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => handleStatus(profile._id, "Approved")}
                                        disabled={updatingId === profile._id}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1F7A4D] text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 hover:bg-[#176939]">
                                        {updatingId === profile._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                        Approve
                                    </button>
                                    <button onClick={() => handleStatus(profile._id, "Rejected")}
                                        disabled={updatingId === profile._id}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FB2C36] text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 hover:bg-[#d91f28]">
                                        <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewProfile && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#d0fae5] rounded-lg flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-[#1F7A4D]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#242424]">{viewProfile.company}</h2>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        viewProfile.status === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
                                        viewProfile.status === "Rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                                        "bg-[#fef3c7] text-[#f59e0b]"
                                    }`}>
                                        {viewProfile.status === "Approved" ? "Published" : viewProfile.status === "Rejected" ? "Rejected" : "Pending Review"}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setViewProfile(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                            {viewProfile.description && (
                                <div>
                                    <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide mb-1.5">About</p>
                                    <p className="text-sm text-[#242424] leading-relaxed">{viewProfile.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide mb-2">Contact</p>
                                <div className="space-y-2">
                                    {viewProfile.website && (
                                        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                                            <Globe className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                                            <a href={viewProfile.website.startsWith("http") ? viewProfile.website : `https://${viewProfile.website}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="text-sm text-[#155DFC] hover:underline break-all" onClick={e => e.stopPropagation()}>
                                                {viewProfile.website}
                                            </a>
                                        </div>
                                    )}
                                    {viewProfile.contactEmail && (
                                        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                                            <Mail className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                                            <a href={`mailto:${viewProfile.contactEmail}`}
                                                className="text-sm text-[#155DFC] hover:underline break-all" onClick={e => e.stopPropagation()}>
                                                {viewProfile.contactEmail}
                                            </a>
                                        </div>
                                    )}
                                    {viewProfile.contactPhone && (
                                        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                                            <Phone className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                                            <a href={`tel:${viewProfile.contactPhone}`}
                                                className="text-sm text-[#155DFC] hover:underline" onClick={e => e.stopPropagation()}>
                                                {viewProfile.contactPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-2xl sm:rounded-b-xl shrink-0 gap-2 flex-wrap">
                            <div className="flex gap-2">
                                {!isMember && viewProfile.status === "Pending" && (
                                    <>
                                        <button onClick={() => handleStatus(viewProfile._id, "Approved")}
                                            disabled={updatingId === viewProfile._id}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-[#176939]">
                                            {updatingId === viewProfile._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Approve
                                        </button>
                                        <button onClick={() => handleStatus(viewProfile._id, "Rejected")}
                                            disabled={updatingId === viewProfile._id}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FB2C36] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 hover:bg-[#d91f28]">
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setViewProfile(null)}
                                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white text-sm font-medium cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
