import * as XLSX from "xlsx";

import { useState, useEffect } from "react";
import { FileEdit, Eye, Download, Calendar, X, Search, ClipboardList, User, CalendarDays, Megaphone, Copy } from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { StatCardsSkeleton } from "./ui/Shimmer";

interface Member {
  _id: string;
  membershipId?: string;
  companyName: string;
  category?: string;
  repName?: string;
  repEmail?: string;
  repMobile?: string;
  state?: string;
  status?: string;
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  attendees?: string;
  price?: string;
  badge?: string;
  updatedAt: string;
}

interface AdBooking {
  _id: string;
  adId?: string;
  company: string;
  adType: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  createdAt: string;
}

type ModalType = "members" | "events" | "adbookings" | null;

const FORMS = [
  {
    id: "members",
    name: "Membership Registration Form",
    type: "Registration",
    description: "New member registration and onboarding form for IWPA membership",
    typeColor: { bg: "#d0fae5", text: "#1F7A4D" },
    icon: User,
  },
  {
    id: "events",
    name: "Event Registration Form",
    type: "Event",
    description: "Register for IWPA events, conferences, and industry gatherings",
    typeColor: { bg: "#fef3c7", text: "#f59e0b" },
    icon: CalendarDays,
  },
  {
    id: "adbookings",
    name: "Ad Booking Request Form",
    type: "Commercial",
    description: "Request for advertisement booking in the IWPA member portal",
    typeColor: { bg: "#fee2e2", text: "#dc2626" },
    icon: Megaphone,
  },
];

export default function FormPortal() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [adBookings, setAdBookings] = useState<AdBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [mRes, eRes, aRes] = await Promise.all([
          api.get("/api/v1/members/get-members"),
          api.get("/api/v1/events/get-events"),
          api.get("/api/v1/ad-bookings/get-all"),
        ]);
        setMembers(Array.isArray(mRes.data?.data) ? mRes.data.data : Array.isArray(mRes.data) ? mRes.data : []);
        setEvents(Array.isArray(eRes.data?.data) ? eRes.data.data : Array.isArray(eRes.data) ? eRes.data : []);
        setAdBookings(Array.isArray(aRes.data?.data) ? aRes.data.data : Array.isArray(aRes.data) ? aRes.data : []);
      } catch {
        toast.error("Failed to fetch form data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getCount = (id: string) => {
    if (id === "members") return members.length;
    if (id === "events") return events.length;
    if (id === "adbookings") return adBookings.length;
    return 0;
  };

  const getLastUpdated = (id: string) => {
    if (id === "members") return members[0]?.createdAt;
    if (id === "events") return events[0]?.updatedAt;
    if (id === "adbookings") return adBookings[0]?.createdAt;
    return null;
  };

  const totalSubmissions = members.length + events.length + adBookings.length;

  const now = new Date();
  const thisMonth = (d: string) => { const dt = new Date(d); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); };
  const thisMonthCount =
    members.filter(m => thisMonth(m.createdAt)).length +
    events.filter(e => thisMonth(e.updatedAt)).length +
    adBookings.filter(a => thisMonth(a.createdAt)).length;

  const stats = [
    { label: "Total Forms",       value: 3,                color: "#1F7A4D", bgColor: "#d0fae5" },
    { label: "Active Forms",      value: 3,                color: "#155DFC", bgColor: "#dbeafe" },
    { label: "Total Submissions", value: totalSubmissions, color: "#a855f7", bgColor: "#f3e8ff" },
    { label: "This Month",        value: thisMonthCount,   color: "#f59e0b", bgColor: "#fef3c7" },
  ];

  // ── filtered submissions for modal ──
  const filteredMembers = members.filter(m =>
    subSearch === "" ||
    [m.companyName, m.repName, m.repEmail, m.state, m.membershipId]
      .some(v => v?.toLowerCase().includes(subSearch.toLowerCase()))
  );

  const filteredEvents = events.filter(e =>
    subSearch === "" ||
    [e.title, e.location, e.date, e.badge]
      .some(v => v?.toLowerCase().includes(subSearch.toLowerCase()))
  );

  const filteredAds = adBookings.filter(a =>
    subSearch === "" ||
    [a.company, a.adType, a.status, a.adId]
      .some(v => v?.toLowerCase().includes(subSearch.toLowerCase()))
  );

  const exportExcel = (data: Record<string, string>[], filename: string) => {
    if (!data.length) { toast.info("No data to export"); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success("Excel file downloaded");
  };

  const getModalData = () => {
    if (activeModal === "members") return filteredMembers.map(m => ({
      "Membership ID": m.membershipId ?? "",
      "Company":       m.companyName,
      "Category":      m.category ?? "",
      "Rep Name":      m.repName ?? "",
      "Rep Email":     m.repEmail ?? "",
      "Mobile":        m.repMobile ?? "",
      "State":         m.state ?? "",
      "Status":        m.status ?? "",
      "Joined":        new Date(m.createdAt).toLocaleDateString("en-GB"),
    }));
    if (activeModal === "events") return filteredEvents.map(e => ({
      "Title":        e.title,
      "Date":         e.date,
      "Location":     e.location,
      "Attendees":    e.attendees ?? "",
      "Price":        e.price ?? "",
      "Badge":        e.badge ?? "",
      "Last Updated": new Date(e.updatedAt).toLocaleDateString("en-GB"),
    }));
    if (activeModal === "adbookings") return filteredAds.map(a => ({
      "Ad ID":      a.adId ?? "",
      "Company":    a.company,
      "Ad Type":    a.adType,
      "Start Date": new Date(a.startDate).toLocaleDateString("en-GB"),
      "End Date":   new Date(a.endDate).toLocaleDateString("en-GB"),
      "Amount":     `₹${a.amount.toLocaleString("en-IN")}`,
      "Status":     a.status,
      "Submitted":  new Date(a.createdAt).toLocaleDateString("en-GB"),
    }));
    return [];
  };

  const downloadExcel = (id: string) => {
    let data: Record<string, string>[] = [];
    if (id === "members") {
      if (!members.length) { toast.info("No data to download"); return; }
      data = members.map(m => ({
        "Membership ID": m.membershipId ?? "",
        "Company":       m.companyName,
        "Category":      m.category ?? "",
        "Rep Name":      m.repName ?? "",
        "Rep Email":     m.repEmail ?? "",
        "Mobile":        m.repMobile ?? "",
        "State":         m.state ?? "",
        "Status":        m.status ?? "",
        "Joined":        new Date(m.createdAt).toLocaleDateString("en-GB"),
      }));
    } else if (id === "events") {
      if (!events.length) { toast.info("No data to download"); return; }
      data = events.map(e => ({
        "Title":        e.title,
        "Date":         e.date,
        "Location":     e.location,
        "Attendees":    e.attendees ?? "",
        "Price":        e.price ?? "",
        "Badge":        e.badge ?? "",
        "Last Updated": new Date(e.updatedAt).toLocaleDateString("en-GB"),
      }));
    } else if (id === "adbookings") {
      if (!adBookings.length) { toast.info("No data to download"); return; }
      data = adBookings.map(a => ({
        "Ad ID":      a.adId ?? "",
        "Company":    a.company,
        "Ad Type":    a.adType,
        "Start Date": new Date(a.startDate).toLocaleDateString("en-GB"),
        "End Date":   new Date(a.endDate).toLocaleDateString("en-GB"),
        "Amount":     `₹${a.amount.toLocaleString("en-IN")}`,
        "Status":     a.status,
        "Submitted":  new Date(a.createdAt).toLocaleDateString("en-GB"),
      }));
    }
    exportExcel(data, `${id}-submissions`);
  };

  const copyLink = (id: string) => {
    const form = FORMS.find(f => f.id === id);
    navigator.clipboard.writeText(`${window.location.origin}/forms/${id}`);
    toast.success(`Link copied for "${form?.name}"`);
  };

  const closeModal = () => { setActiveModal(null); setSubSearch(""); };

  const modalTitle = FORMS.find(f => f.id === activeModal)?.name ?? "";
  const modalCount = activeModal ? getCount(activeModal) : 0;
  const modalDesc = FORMS.find(f => f.id === activeModal)?.description ?? "";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Form Portal</h1>
          <p className="text-[#6a7282] mt-1">
            Manage member registration, event registration, and ad booking request forms
          </p>
        </div>
      </div>

      {/* Stats */}
      {loading ? <StatCardsSkeleton count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6a7282]">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.bgColor }}>
                  <FileEdit className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-[#e5e7eb] p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-[#e5e7eb] rounded w-2/3" />
              <div className="h-4 bg-[#e5e7eb] rounded w-full" />
              <div className="h-20 bg-[#f9fafb] rounded-lg" />
              <div className="h-9 bg-[#e5e7eb] rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FORMS.map(form => {
            const count = getCount(form.id);
            const lastUpdated = getLastUpdated(form.id);
            return (
              <div key={form.id} className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#242424]">{form.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ backgroundColor: form.typeColor.bg, color: form.typeColor.text }}>
                        {form.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#d0fae5] text-[#1F7A4D]">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-[#6a7282]">{form.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#f9fafb] rounded-lg">
                  <div>
                    <p className="text-xs text-[#6a7282]">Total Submissions</p>
                    <p className="text-2xl font-bold text-[#1F7A4D] mt-1">{count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6a7282]">Last Submitted</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-[#6a7282]" />
                      <p className="text-sm text-[#242424]">
                        {lastUpdated ? new Date(lastUpdated).toLocaleDateString("en-GB") : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveModal(form.id as ModalType); setSubSearch(""); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white cursor-pointer rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> View Submissions
                  </button>
                  <button
                    onClick={() => copyLink(form.id)}
                    title="Copy form link"
                    className="p-2 border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadExcel(form.id)}
                    title="Download Excel"
                    className="p-2 border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Templates */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h2 className="text-lg font-semibold text-[#242424] mb-4">Form Templates</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: "Registration Template", desc: "New member onboarding",   color: "#1F7A4D", bg: "#d0fae5" },
            { label: "Event Template",         desc: "Event registration",      color: "#f59e0b", bg: "#fef3c7" },
            { label: "Custom Template",        desc: "Build from scratch",      color: "#155DFC", bg: "#dbeafe" },
          ].map(t => (
            <div key={t.label} className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-6 text-center hover:border-[#1F7A4D] hover:bg-[#ecfdf5] transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: t.bg }}>
                <FileEdit className="w-5 h-5" style={{ color: t.color }} />
              </div>
              <h3 className="font-medium text-[#242424] mb-1">{t.label}</h3>
              <p className="text-xs text-[#6a7282]">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl my-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ClipboardList className="w-5 h-5 text-[#1F7A4D]" />
                  <h2 className="text-lg font-bold text-[#242424]">{modalTitle}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d0fae5] text-[#1F7A4D]">
                    {modalCount} submissions
                  </span>
                </div>
                <p className="text-xs text-[#6a7282] mt-1">{modalDesc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => exportExcel(getModalData(), `${activeModal}-submissions`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] text-sm font-medium cursor-pointer">
                  <Download className="w-4 h-4" /> Export Excel
                </button>
                <button onClick={closeModal} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-[#e5e7eb]">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
                <input type="text" placeholder="Search submissions..."
                  value={subSearch} onChange={e => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              {activeModal === "members" && (
                <table className="w-full">
                  <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] sticky top-0">
                    <tr>
                      {["Membership ID", "Company", "Category", "Rep Name", "Rep Email", "Mobile", "State", "Joined"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-medium text-[#6a7282] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredMembers.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-[#6a7282] text-sm">No results found</td></tr>
                    ) : filteredMembers.map(m => (
                      <tr key={m._id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-3 text-xs font-mono text-[#6a7282]">{m.membershipId ?? "—"}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#242424]">{m.companyName}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{m.category ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#242424]">{m.repName ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{m.repEmail ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{m.repMobile ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{m.state ?? "—"}</td>
                        <td className="px-6 py-3 text-xs text-[#6a7282] whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString("en-GB")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeModal === "events" && (
                <table className="w-full">
                  <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] sticky top-0">
                    <tr>
                      {["Title", "Date", "Location", "Attendees", "Price", "Badge", "Last Updated"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-medium text-[#6a7282] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredEvents.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-[#6a7282] text-sm">No results found</td></tr>
                    ) : filteredEvents.map(e => (
                      <tr key={e._id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-[#242424] max-w-[200px] truncate">{e.title}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282] whitespace-nowrap">{e.date}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{e.location}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{e.attendees ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{e.price ?? "—"}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{e.badge ?? "—"}</td>
                        <td className="px-6 py-3 text-xs text-[#6a7282] whitespace-nowrap">{new Date(e.updatedAt).toLocaleDateString("en-GB")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeModal === "adbookings" && (
                <table className="w-full">
                  <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] sticky top-0">
                    <tr>
                      {["Ad ID", "Company", "Ad Type", "Start Date", "End Date", "Amount", "Status", "Submitted"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-medium text-[#6a7282] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredAds.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-[#6a7282] text-sm">No results found</td></tr>
                    ) : filteredAds.map(a => (
                      <tr key={a._id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-3 text-xs font-mono text-[#6a7282]">{a.adId ?? "—"}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#242424]">{a.company}</td>
                        <td className="px-6 py-3 text-sm text-[#6a7282]">{a.adType}</td>
                        <td className="px-6 py-3 text-xs text-[#6a7282] whitespace-nowrap">{new Date(a.startDate).toLocaleDateString("en-GB")}</td>
                        <td className="px-6 py-3 text-xs text-[#6a7282] whitespace-nowrap">{new Date(a.endDate).toLocaleDateString("en-GB")}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#242424]">₹{a.amount.toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            a.status === "Active" || a.status === "Approved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
                            a.status === "Pending" ? "bg-[#fef3c7] text-[#f59e0b]" :
                            a.status === "Forwarded" ? "bg-[#dbeafe] text-[#155DFC]" :
                            "bg-[#fee2e2] text-[#dc2626]"
                          }`}>{a.status}</span>
                        </td>
                        <td className="px-6 py-3 text-xs text-[#6a7282] whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString("en-GB")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl">
              <p className="text-sm text-[#6a7282]">
                Showing {
                  activeModal === "members" ? filteredMembers.length :
                  activeModal === "events" ? filteredEvents.length :
                  filteredAds.length
                } of {modalCount} submissions
              </p>
              <button onClick={closeModal}
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
