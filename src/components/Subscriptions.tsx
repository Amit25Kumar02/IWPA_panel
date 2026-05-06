"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, RefreshCw,
  Calendar, CreditCard, RefreshCcw, X, Building,
  FileText, User, MapPin,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Member {
  _id: string;
  membershipId?: string;
  membershipNumber?: string;
  srNo?: number;
  name?: string;
  companyName: string;
  memberCategory?: string;
  category?: string;
  membershipType?: string;
  installedCapacityMW?: number;
  state?: string;
  group?: string;
  groupCompany?: string;
  gstNo?: string;
  gstNumber?: string;
  status?: string;
  dateOfEnrolment?: string;
  certificateValidTill?: string;
  expiryDate?: string;
  wfLocation?: string;
  make?: string;
  connectedSubstation?: string;
  htscNo?: string;
  subscriptionWaivedOff?: boolean;
  remarks?: string;
  officePhone?: string;
  repName?: string;
  repDesignation?: string;
  repMobile?: string;
  repEmail?: string;
  contact?: {
    person1?: string; designation1?: string;
    person2?: string; designation2?: string;
    phone1?: string; phone2?: string;
    mobile1?: string; mobile2?: string;
    email1?: string; email2?: string;
  };
  addressDetails?: {
    address1?: string; address2?: string; address3?: string;
    city?: string; state?: string; pincode?: string;
  };
  billing?: {
    admissionFee?: number;
    subscriptionCurrent?: number;
    subscriptionArrears?: number;
    excessAdjusted?: number;
    total?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    netReceivable?: number;
    invoiceNo?: string;
    invoiceDate?: string;
  };
  payment?: {
    receiptNo?: string;
    receiptDate?: string;
    cdNo?: string;
    cdDate?: string;
    totalReceived?: number;
    admissionFeeReceived?: number;
    subscriptionReceived?: number;
    arrearsReceived?: number;
    excessReceived?: number;
    cgstReceived?: number;
    sgstReceived?: number;
    igstReceived?: number;
    gstArrearsReceived?: number;
    gstExcessReceived?: number;
    tdsDeducted?: number;
    difference?: number;
  };
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
      <span className="text-xs font-medium text-[#6a7282] w-40 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#242424] break-all">{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <Icon className="w-4 h-4 text-[#1F7A4D]" />
      <h4 className="text-sm font-semibold text-[#242424]">{title}</h4>
    </div>
  );
}

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/v1/members/get-members");
        setMembers(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        toast.error("Failed to fetch subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getMembershipStatus = (m: Member) => {
    if (m.status === "Active" || m.status === "Expired" || m.status === "Pending Renewal") return m.status;
    const expiry = m.certificateValidTill || m.expiryDate;
    if (!expiry) return "Active";
    const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "Expired";
    if (diff <= 90) return "Pending Renewal";
    return "Active";
  };

  const getPaymentStatus = (m: Member) => {
    if (m.payment?.receiptNo?.trim()) return "Paid";
    if ((m.payment?.totalReceived ?? 0) > 0) return "Paid";
    return "Pending";
  };

  const expiringIn90 = members.filter(m => {
    if (!m.expiryDate) return false;
    const diff = (new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 90;
  }).length;

  const stats = [
    { label: "Active Subscriptions", value: members.filter(m => getPaymentStatus(m) === "Paid").length, color: "#1F7A4D", bg: "#d0fae5" },
    { label: "Expiring Soon (90 days)", value: expiringIn90, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Pending Renewals", value: members.filter(m => getPaymentStatus(m) === "Pending").length, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Total Revenue (This Year)", value: `₹${members.reduce((sum, m) => sum + (m.payment?.totalReceived ?? 0), 0).toLocaleString("en-IN")}`, color: "#155DFC", bg: "#dbeafe" },
  ];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.membershipId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.billing?.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || getMembershipStatus(m) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const pagedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "Active": return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Expired": return { bg: "#fee2e2", text: "#dc2626" };
      case "Pending Renewal": return { bg: "#fef3c7", text: "#f59e0b" };
      default: return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const getPaymentStyle = (status: string) => {
    switch (status) {
      case "Paid": return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Pending": return { bg: "#fef3c7", text: "#f59e0b" };
      default: return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB") : undefined;
  const fmtNum = (n?: number) => n != null ? `₹${n.toLocaleString("en-IN")}` : undefined;

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Subscriptions</h1>
          <p className="text-[#6a7282] mt-1">Membership subscription lifecycle and renewal tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#ffffff] rounded-lg border-[0.76px] border-[#e5e7eb] p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-[#6a7282]">{s.label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <CreditCard className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by company name, membership ID or invoice no..."
              className="w-full pl-10 pr-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg outline-none"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg appearance-none outline-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg cursor-pointer">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-[#ffffff] border-[0.76px] border-[#e5e7eb] rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b-[0.76px] border-[#e5e7eb]">
                <tr>
                  {["Subscription ID", "Company Name", "Net Receivable", "Validity", "Status", "Payment", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-sm text-[#242424] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-[#6a7282] text-sm">Loading...</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-[#6a7282] text-sm">No subscriptions found</td></tr>
                ) : (
                  pagedMembers.map((m) => {
                    const payStatus = getPaymentStatus(m);
                    const statusStyle = getStatusStyle(getMembershipStatus(m));
                    const payStyle = getPaymentStyle(payStatus);
                    return (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-[#242424] text-sm">{m.billing?.invoiceNo || "-"}</td>
                        <td className="px-6 py-4 text-[15px] text-[#242424] font-medium">{m.companyName}</td>
                        <td className="px-6 py-4 text-[#242424] text-[15px] font-semibold">
                          {m.billing?.netReceivable != null ? `₹${m.billing.netReceivable.toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6A7282]">
                          {m.dateOfEnrolment ? new Date(m.dateOfEnrolment).toLocaleDateString("en-GB") : "-"}
                          {" – "}
                          {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("en-GB") : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs rounded" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                            {getMembershipStatus(m)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs rounded" style={{ backgroundColor: payStyle.bg, color: payStyle.text }}>
                            {payStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          <button onClick={() => setViewMember(m)} className="p-2 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-[#f3f4f6] rounded text-[#1F7A4D] cursor-pointer">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#6A7282]">
            Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} subscriptions
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Previous</button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-[#6a7282]">…</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page as number)}
                  className={`w-9 h-9 text-sm rounded-lg border cursor-pointer ${currentPage === page ? "bg-[#1F7A4D] text-white border-[#1F7A4D]" : "border-[#e5e7eb] text-[#242424] hover:bg-[#f9fafb]"}`}>
                  {page}
                </button>
              )
            )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Next</button>
          </div>
        </div>

        {/* Renewal Reminder */}
        <div className="bg-linear-to-b from-[#FEF3C7] to-[#FFFFFF] border-[0.76px] border-[#FCD34D] rounded-lg p-6 flex gap-4">
          <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#ffffff]" />
          </div>
          <div>
            <h3 className="font-semibold text-[17px] text-[#242424]">Send reminders</h3>
            <p className="text-sm text-[#6A7282] mt-1">
              {expiringIn90} subscriptions are expiring in the next 90 days. Send automated renewal reminders to members.
            </p>
            <button className="mt-3 px-4 py-2 bg-[#F59E0B] text-[#ffffff] text-sm rounded-lg cursor-pointer flex items-center gap-2 justify-center">
              <RefreshCcw className="w-4 h-4" /> Send Renewal Reminders
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewMember && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl my-4">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#242424]">{viewMember.companyName}</h2>
                  {viewMember.status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getStatusStyle(viewMember.status).bg, color: getStatusStyle(viewMember.status).text }}>
                      {viewMember.status}
                    </span>
                  )}
                </div>
                {viewMember.billing?.invoiceNo && (
                  <p className="text-xs text-[#6a7282] mt-1 font-mono">{viewMember.billing.invoiceNo}</p>
                )}
              </div>
              <button onClick={() => setViewMember(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-1 max-h-[70vh] overflow-y-auto">

              {/* Member Info */}
              <SectionTitle icon={Building} title="Member Information" />
              <div className="space-y-1.5">
                <InfoRow label="Membership ID" value={viewMember.membershipId} />
                <InfoRow label="Membership Number" value={viewMember.membershipNumber} />
                <InfoRow label="Company Name" value={viewMember.companyName || viewMember.name} />
                <InfoRow label="Member Category" value={viewMember.memberCategory} />
                <InfoRow label="Membership Type" value={viewMember.membershipType} />
                <InfoRow label="Installed Capacity (MW)" value={viewMember.installedCapacityMW?.toString()} />
                <InfoRow label="State" value={viewMember.state} />
                <InfoRow label="GST No." value={viewMember.gstNo || viewMember.gstNumber} />
                <InfoRow label="Status" value={viewMember.status} />
              </div>

              {/* Subscription Details */}
              <SectionTitle icon={FileText} title="Subscription Details" />
              <div className="space-y-1.5">
                <InfoRow label="Date of Enrolment" value={fmt(viewMember.dateOfEnrolment)} />
                <InfoRow label="Certificate Valid Till" value={fmt(viewMember.certificateValidTill)} />
                <InfoRow label="Expiry Date" value={fmt(viewMember.expiryDate)} />
                <InfoRow label="Subscription Waived Off" value={viewMember.subscriptionWaivedOff != null ? (viewMember.subscriptionWaivedOff ? "Yes" : "No") : undefined} />
                <InfoRow label="Remarks" value={viewMember.remarks} />
              </div>

              {/* Billing */}
              <SectionTitle icon={CreditCard} title="Billing" />
              <div className="space-y-1.5">
                <InfoRow label="Invoice No." value={viewMember.billing?.invoiceNo} />
                <InfoRow label="Invoice Date" value={fmt(viewMember.billing?.invoiceDate)} />
                <InfoRow label="Admission Fee" value={fmtNum(viewMember.billing?.admissionFee)} />
                <InfoRow label="Subscription (Current)" value={fmtNum(viewMember.billing?.subscriptionCurrent)} />
                <InfoRow label="Subscription Arrears" value={fmtNum(viewMember.billing?.subscriptionArrears)} />
                <InfoRow label="Excess Adjusted" value={fmtNum(viewMember.billing?.excessAdjusted)} />
                <InfoRow label="Total" value={fmtNum(viewMember.billing?.total)} />
                <InfoRow label="CGST (9%)" value={fmtNum(viewMember.billing?.cgst)} />
                <InfoRow label="SGST (9%)" value={fmtNum(viewMember.billing?.sgst)} />
                <InfoRow label="IGST (18%)" value={fmtNum(viewMember.billing?.igst)} />
                <InfoRow label="Net Receivable" value={fmtNum(viewMember.billing?.netReceivable)} />
              </div>

              {/* Payment */}
              <SectionTitle icon={FileText} title="Payment" />
              <div className="space-y-1.5">
                <InfoRow label="Receipt No." value={viewMember.payment?.receiptNo} />
                <InfoRow label="Receipt Date" value={fmt(viewMember.payment?.receiptDate)} />
                <InfoRow label="C/D No." value={viewMember.payment?.cdNo} />
                <InfoRow label="C/D Date" value={fmt(viewMember.payment?.cdDate)} />
                <InfoRow label="Total Received" value={fmtNum(viewMember.payment?.totalReceived)} />
                <InfoRow label="Admission Fee Received" value={fmtNum(viewMember.payment?.admissionFeeReceived)} />
                <InfoRow label="Subscription Received" value={fmtNum(viewMember.payment?.subscriptionReceived)} />
                <InfoRow label="Arrears Received" value={fmtNum(viewMember.payment?.arrearsReceived)} />
                <InfoRow label="Excess Received" value={fmtNum(viewMember.payment?.excessReceived)} />
                <InfoRow label="CGST Received" value={fmtNum(viewMember.payment?.cgstReceived)} />
                <InfoRow label="SGST Received" value={fmtNum(viewMember.payment?.sgstReceived)} />
                <InfoRow label="IGST Received" value={fmtNum(viewMember.payment?.igstReceived)} />
                <InfoRow label="GST Arrears Received" value={fmtNum(viewMember.payment?.gstArrearsReceived)} />
                <InfoRow label="GST Excess Received" value={fmtNum(viewMember.payment?.gstExcessReceived)} />
                <InfoRow label="TDS Deducted" value={fmtNum(viewMember.payment?.tdsDeducted)} />
                <InfoRow label="Difference" value={fmtNum(viewMember.payment?.difference)} />
                <InfoRow label="Payment Status" value={getPaymentStatus(viewMember)} />
              </div>

              {/* Contact */}
              <SectionTitle icon={User} title="Contact" />
              <div className="space-y-1.5">
                <InfoRow label="Contact Person 1" value={viewMember.contact?.person1 || viewMember.repName} />
                <InfoRow label="Designation 1" value={viewMember.contact?.designation1 || viewMember.repDesignation} />
                <InfoRow label="Mobile 1" value={viewMember.contact?.mobile1 || viewMember.repMobile} />
                <InfoRow label="Email 1" value={viewMember.contact?.email1 || viewMember.repEmail} />
                <InfoRow label="Contact Person 2" value={viewMember.contact?.person2} />
                <InfoRow label="Designation 2" value={viewMember.contact?.designation2} />
                <InfoRow label="Mobile 2" value={viewMember.contact?.mobile2} />
                <InfoRow label="Email 2" value={viewMember.contact?.email2} />
                <InfoRow label="Office Phone" value={viewMember.officePhone || viewMember.contact?.phone1} />
              </div>

              {/* Address */}
              <SectionTitle icon={MapPin} title="Address" />
              <div className="space-y-1.5">
                <InfoRow label="Address 1" value={viewMember.addressDetails?.address1} />
                <InfoRow label="Address 2" value={viewMember.addressDetails?.address2} />
                <InfoRow label="Address 3" value={viewMember.addressDetails?.address3} />
                <InfoRow label="City" value={viewMember.addressDetails?.city} />
                <InfoRow label="State" value={viewMember.addressDetails?.state} />
                <InfoRow label="Pincode" value={viewMember.addressDetails?.pincode} />
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl">
              <button onClick={() => setViewMember(null)}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors text-sm font-medium cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
