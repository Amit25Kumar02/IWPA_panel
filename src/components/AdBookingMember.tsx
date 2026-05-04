import { useState, useEffect } from "react";
import { Plus, X, Loader2, Building2, Newspaper, Globe, Eye, CheckCircle, Clock } from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { TableRowsSkeleton } from "./ui/Shimmer";

type TabType = "magazine" | "webbanner" | "companyprofile";

interface Booking {
    _id: string;
    adId?: string;
    company: string;
    adType: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: "Active" | "Expired" | "Pending" | "Approved" | "Forwarded";
    notes?: string;
    // Company profile specific
    website?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    createdAt: string;
}

interface FormState {
    company: string;
    startDate: string;
    endDate: string;
    amount: string;
    notes: string;
    // Company profile extras
    website: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
}

const EMPTY_FORM: FormState = {
    company: "", startDate: "", endDate: "", amount: "",
    notes: "", website: "", description: "", contactEmail: "", contactPhone: "",
};

const AD_TYPE_MAP: Record<TabType, string> = {
    magazine: "WindPro Magazine Ad",
    webbanner: "IWPA Website Banner",
    companyprofile: "Featured Company Profile",
};

const statusStyle = (s: string) =>
    s === "Active" || s === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
        s === "Pending" ? "bg-[#fef3c7] text-[#f59e0b]" :
            s === "Forwarded" ? "bg-[#dbeafe] text-[#155DFC]" :
                "bg-[#fee2e2] text-[#dc2626]";

const COUNTRY_CODES = [
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+1", flag: "🇺🇸", name: "USA" },
    { code: "+44", flag: "🇬🇧", name: "UK" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+65", flag: "🇸🇬", name: "Singapore" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+86", flag: "🇨🇳", name: "China" },
];

const TABS: { id: TabType; label: string; icon: React.ElementType; desc: string; price: string }[] = [
    { id: "magazine", label: "Magazine Ad", icon: Newspaper, desc: "WindPro Magazine — reaches 5,000+ industry professionals", price: "₹25,000/issue" },
    { id: "webbanner", label: "Web Banner", icon: Globe, desc: "IWPA Website banner — homepage & section placements", price: "₹20,000/month" },
    { id: "companyprofile", label: "Company Profiles", icon: Building2, desc: "Featured company listing in the IWPA member portal", price: "₹15,000/year" },
];

export default function AdBookingMember() {
    const [activeTab, setActiveTab] = useState<TabType>("magazine");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [saving, setSaving] = useState(false);
    const [viewItem, setViewItem] = useState<Booking | null>(null);

    const [countryCode, setCountryCode] = useState("+91");

    // get logged-in member info
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const memberCompany: string = currentUser.companyName || currentUser.name || "";
    const memberEmail: string = currentUser.email || "";

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/ad-bookings/get-all");
            setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const filtered = bookings.filter(b => b.adType === AD_TYPE_MAP[activeTab]);

    const validate = () => {
        const e: Partial<FormState> = {};
        if (!form.company.trim()) e.company = "Required";
        if (activeTab !== "companyprofile") {
            if (!form.startDate) e.startDate = "Required";
            if (!form.endDate) e.endDate = "Required";
            if (!form.amount || isNaN(Number(form.amount))) e.amount = "Valid amount required";
        }
        if (activeTab === "companyprofile") {
            if (!form.description.trim()) e.description = "Required";
            if (!form.contactEmail.trim()) e.contactEmail = "Required";
            if (form.contactPhone && form.contactPhone.length !== 10) e.contactPhone = "Enter a valid 10-digit number";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                company: form.company.trim(),
                adType: AD_TYPE_MAP[activeTab],
                notes: form.notes.trim(),
                status: "Pending",
            };
            if (activeTab !== "companyprofile") {
                payload.startDate = form.startDate;
                payload.endDate = form.endDate;
                payload.amount = Number(form.amount);
            } else {
                payload.startDate = new Date().toISOString().split("T")[0];
                payload.endDate = new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];
                payload.amount = 15000;
                payload.website = form.website.trim();
                payload.description = form.description.trim();
                payload.contactEmail = form.contactEmail.trim() || memberEmail;
                payload.contactPhone = form.contactPhone ? `${countryCode}${form.contactPhone}` : "";
            }
            const res = await api.post("/api/v1/ad-bookings/create", payload);
            setBookings(prev => [res.data.data, ...prev]);
            toast.success(
                activeTab === "companyprofile"
                    ? "Company profile submitted successfully"
                    : "Booking submitted — admin will review shortly"
            );
            setOpen(false);
            setForm(EMPTY_FORM);
            setErrors({});
        } catch {
            toast.error("Submission failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const f = (field: keyof FormState, val: string) => {
        setForm(p => ({ ...p, [field]: val }));
        setErrors(p => ({ ...p, [field]: "" }));
    };

    const currentTab = TABS.find(t => t.id === activeTab)!;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Ad Bookings</h1>
                    <p className="text-sm text-[#6a7282]">Book advertisements and submit your company profile</p>
                </div>
                <button
                    onClick={() => { setForm({ ...EMPTY_FORM, company: memberCompany }); setOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] text-sm font-medium cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    {activeTab === "companyprofile" ? "Submit Company Profile" : "Book Advertisement"}
                </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 bg-[#f3f4f6] p-1 rounded-lg w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id ? "bg-white text-[#1F7A4D] shadow-sm" : "text-[#6a7282] hover:text-[#242424]"}`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Info card */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#d0fae5] rounded-lg flex items-center justify-center shrink-0">
                    <currentTab.icon className="w-5 h-5 text-[#1F7A4D]" />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-[#242424]">{currentTab.label}</p>
                    <p className="text-sm text-[#6a7282]">{currentTab.desc}</p>
                </div>
                <p className="text-lg font-bold text-[#1F7A4D] shrink-0">{currentTab.price}</p>
            </div>

            {/* Workflow note */}
            {activeTab !== "companyprofile" && (
                <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg px-4 py-3 text-sm text-[#92400e] flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        {activeTab === "magazine"
                            ? "Your magazine ad submission will be reviewed by admin and forwarded to the designer/printer."
                            : "Your web banner will be reviewed by admin and placed on the IWPA website."}
                    </span>
                </div>
            )}
            {activeTab === "companyprofile" && (
                <div className="bg-[#d0fae5] border border-[#6ee7b7] rounded-lg px-4 py-3 text-sm text-[#065f46] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Once approved by admin, your company profile will appear in the <strong>COMPANY PROFILES</strong> tab visible to all members.</span>
                </div>
            )}

            {/* Table */}
            <div className="grid grid-cols-1 gap-10">
                <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-x-auto">
                    {loading ? (
                        <TableRowsSkeleton rows={4} cols={activeTab === "companyprofile" ? 5 : 6} />
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                                <tr>
                                    {(activeTab === "companyprofile"
                                        ? ["Company", "Website", "Contact", "Status", "Actions"]
                                        : ["Ad ID", "Company", "Duration", "Amount", "Status", "Actions"]
                                    ).map(h => (
                                        <th key={h} className={`px-6 py-4 text-sm font-medium text-[#242424] ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === "companyprofile" ? 5 : 6} className="px-6 py-10 text-center text-[#6a7282] text-sm">
                                            No {currentTab.label.toLowerCase()} bookings yet
                                        </td>
                                    </tr>
                                ) : filtered.map(b => (
                                    <tr key={b._id} className="hover:bg-[#f9fafb]">
                                        {activeTab === "companyprofile" ? (
                                            <>
                                                <td className="px-6 py-4 font-medium text-[#242424]">{b.company}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282]">{b.website || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a7282]">{b.contactEmail || "—"}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-mono text-sm text-[#242424]">{b.adId || "—"}</td>
                                                <td className="px-6 py-4 font-medium text-[#242424]">{b.company}</td>
                                                <td className="px-6 py-4 text-xs text-[#6a7282]">
                                                    {new Date(b.startDate).toLocaleDateString("en-GB")} → {new Date(b.endDate).toLocaleDateString("en-GB")}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-[#242424]">₹{b.amount.toLocaleString("en-IN")}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${b.status === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
                                                    b.status === "Rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                                                        "bg-[#fef3c7] text-[#f59e0b]"
                                                }`}>
                                                {b.status === "Approved" ? "Approved" :
                                                    b.status === "Rejected" ? "Rejected" :
                                                        "Pending Review"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setViewItem(b)} className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] cursor-pointer">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col mx-3 mb-3 sm:mx-0 sm:mb-0">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
                            <h2 className="text-lg font-bold text-[#242424]">
                                {activeTab === "companyprofile" ? "Submit Company Profile" : `Book ${currentTab.label}`}
                            </h2>
                            <button onClick={() => { setOpen(false); setForm(EMPTY_FORM); setErrors({}); }} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-medium text-[#242424] mb-1.5">Company Name <span className="text-[#FB2C36]">*</span></label>
                                <input type="text" autoComplete="off" value={form.company} onChange={e => f("company", e.target.value)}
                                    placeholder="Enter company name"
                                    className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.company ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                {errors.company && <p className="text-xs text-[#FB2C36] mt-1">{errors.company}</p>}
                            </div>

                            {activeTab === "companyprofile" ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[#242424] mb-1.5">Company Description <span className="text-[#FB2C36]">*</span></label>
                                        <textarea value={form.description} onChange={e => f("description", e.target.value)}
                                            rows={3} placeholder="Brief description of your company..."
                                            className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm resize-none ${errors.description ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                        {errors.description && <p className="text-xs text-[#FB2C36] mt-1">{errors.description}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#242424] mb-1.5">Website</label>
                                        <input type="url" value={form.website} onChange={e => f("website", e.target.value)}
                                            placeholder="https://yourcompany.com"
                                            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-[#242424] mb-1.5">Contact Email <span className="text-[#FB2C36]">*</span></label>
                                            <input type="email" value={form.contactEmail} onChange={e => f("contactEmail", e.target.value)}
                                                placeholder="contact@company.com"
                                                className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.contactEmail ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                            {errors.contactEmail && <p className="text-xs text-[#FB2C36] mt-1">{errors.contactEmail}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#242424] mb-1.5">Contact Phone</label>
                                            <div className={`flex border rounded-lg overflow-hidden ${errors.contactPhone ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}>
                                                <select
                                                    value={countryCode}
                                                    onChange={e => setCountryCode(e.target.value)}
                                                    className="px-2 py-2.5 bg-[#f9fafb] border-r border-[#e5e7eb] outline-none text-sm cursor-pointer shrink-0"
                                                >
                                                    {COUNTRY_CODES.map(c => (
                                                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="tel"
                                                    value={form.contactPhone}
                                                    onChange={e => {
                                                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                        f("contactPhone", digits);
                                                    }}
                                                    placeholder="10-digit number"
                                                    maxLength={10}
                                                    className="flex-1 px-3 py-2.5 outline-none text-sm min-w-0"
                                                />
                                            </div>
                                            {form.contactPhone && form.contactPhone.length < 10 && (
                                                <p className="text-xs text-[#f59e0b] mt-1">Enter 10-digit number</p>
                                            )}
                                            {errors.contactPhone && <p className="text-xs text-[#FB2C36] mt-1">{errors.contactPhone}</p>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-[#242424] mb-1.5">Start Date <span className="text-[#FB2C36]">*</span></label>
                                            <input type="date" value={form.startDate} onChange={e => f("startDate", e.target.value)}
                                                onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                                                className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer ${errors.startDate ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                            {errors.startDate && <p className="text-xs text-[#FB2C36] mt-1">{errors.startDate}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#242424] mb-1.5">End Date <span className="text-[#FB2C36]">*</span></label>
                                            <input type="date" value={form.endDate} onChange={e => f("endDate", e.target.value)}
                                                onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                                                className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer ${errors.endDate ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                            {errors.endDate && <p className="text-xs text-[#FB2C36] mt-1">{errors.endDate}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#242424] mb-1.5">Amount (₹) <span className="text-[#FB2C36]">*</span></label>
                                        <input type="number" value={form.amount} onChange={e => f("amount", e.target.value)}
                                            placeholder="e.g. 25000"
                                            className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.amount ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                                        {errors.amount && <p className="text-xs text-[#FB2C36] mt-1">{errors.amount}</p>}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#242424] mb-1.5">Notes</label>
                                <textarea value={form.notes} onChange={e => f("notes", e.target.value)}
                                    rows={2} placeholder="Optional notes or requirements..."
                                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm resize-none" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl shrink-0">
                            <button onClick={() => { setOpen(false); setForm(EMPTY_FORM); setErrors({}); }}
                                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white text-sm font-medium cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] text-sm font-medium cursor-pointer disabled:opacity-60 inline-flex items-center gap-2">
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? "Submitting..." : activeTab === "companyprofile" ? "Submit Profile" : "Submit Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
                        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e7eb]">
                            <div>
                                <h2 className="text-base font-bold text-[#242424]">{viewItem.company}</h2>
                                <p className="text-xs text-[#6a7282] mt-0.5">{viewItem.adType}</p>
                            </div>
                            <button onClick={() => setViewItem(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-2">
                            {([
                                ["Status", <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${viewItem.status === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
                                        viewItem.status === "Rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                                            "bg-[#fef3c7] text-[#f59e0b]"
                                    }`}>
                                    {viewItem.status === "Approved" ? "Approved" :
                                        viewItem.status === "Rejected" ? "Rejected" :
                                            "Pending Review"}
                                </span>],
                                ...(viewItem.adType !== "Featured Company Profile"
                                    ? [["Duration", `${new Date(viewItem.startDate).toLocaleDateString("en-GB")} → ${new Date(viewItem.endDate).toLocaleDateString("en-GB")}`],
                                    ["Amount", `₹${viewItem.amount.toLocaleString("en-IN")}`]]
                                    : [["Website", viewItem.website || "—"],
                                    ["Contact Email", viewItem.contactEmail || "—"],
                                    ["Contact Phone", viewItem.contactPhone || "—"],
                                    ["Description", viewItem.description || "—"]]),
                                ["Notes", viewItem.notes || "—"],
                            ] as [string, any][]).map(([label, value]) => (
                                <div key={label} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                                    <span className="text-xs font-medium text-[#6a7282] w-28 shrink-0 pt-0.5">{label}</span>
                                    <span className="text-sm text-[#242424]">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl">
                            <button onClick={() => setViewItem(null)}
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
