"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, Mail, Phone, MapPin,
  UserPlus, Building, Trash2, X, User, Briefcase, FileText,
} from "lucide-react";
import AddNewMember from "./AddNewMember";
import { TableRowsSkeleton, StatCardsSkeleton } from "./ui/Shimmer";
import api from "../utils/api";
import { generateMembershipId } from "../utils/membershipId";
import { toast } from "react-toastify";

interface Member {
  _id: string;
  membershipId?: string;
  memberCategory?: string;
  srNo?: number;
  name?: string;
  companyName: string;
  state?: string;
  group?: string;
  membershipType?: string;
  installedCapacityMW?: number;
  membershipNumber?: string;
  gstNumber?: string;
  gstNo?: string;
  category?: string;
  dateOfEnrolment?: string;
  certificateValidTill?: string;
  expiryDate?: string;
  wfLocation?: string;
  make?: string;
  connectedSubstation?: string;
  htscNo?: string;
  commissioningDate?: string[];
  subscriptionWaivedOff?: boolean;
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
  remarks?: string;
  contact?: {
    person1?: string;
    designation1?: string;
    person2?: string;
    designation2?: string;
    phone1?: string;
    phone2?: string;
    mobile1?: string;
    mobile2?: string;
    fax?: string;
    email1?: string;
    email2?: string;
  };
  address?: string;
  addressDetails?: {
    address1?: string;
    address2?: string;
    address3?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  capacity?: {
    andhraPradesh?: number;
    gujarat?: number;
    karnataka?: number;
    kerala?: number;
    maharashtra?: number;
    madhyaPradesh?: number;
    rajasthan?: number;
    tamilNadu?: number;
    total?: number;
    unitsGenerated?: string;
  };
  officePhone?: string;
  repName?: string;
  repDesignation?: string;
  repOfficePhone?: string;
  repMobile?: string;
  repEmail?: string;
  addRepName?: string;
  addRepDesignation?: string;
  addRepOfficePhone?: string;
  addRepMobile?: string;
  addRepEmail?: string;
  businessDescription?: string;
  chairmanMD?: string;
  groupCompany?: string;
  type?: string;
  status?: string;
  windDetails?: {
    location: string;
    noOfWindMills: string;
    ratedCapacity: string;
    totalMW: string;
    make: string;
    connectedSubstation: string;
  }[];
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
      <span className="text-xs font-medium text-[#6a7282] w-36 shrink-0 pt-0.5">{label}</span>
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

export default function MemberDatabase() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"GENERATING_INDIVIDUAL" | "GENERATING_GROUP" | "NON_GENERATING">("GENERATING_INDIVIDUAL");
  const [stateFilter, setStateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/members/get-members");
      const sorted = (Array.isArray(res.data?.data) ? res.data.data : [])
        .sort((a: Member, b: Member) => (a.srNo ?? 0) - (b.srNo ?? 0));
      // auto-generate membershipId: MEM-{enrolmentYear}-{srNo padded}
      const withIds = sorted.map((m: Member) => {
        if (m.membershipId) return m;
        const year = m.dateOfEnrolment ? new Date(m.dateOfEnrolment).getFullYear() : new Date().getFullYear();
        const seq = m.srNo != null ? String(m.srNo).padStart(3, "0") : "000";
        return { ...m, membershipId: `MEM-${year}-${seq}` };
      });
      setMembers(withIds);
    } catch {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/members/delete-member/${deleteId}`);
      setMembers((prev) => prev.filter((m) => m._id !== deleteId));
      toast.success("Member deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  // reset to page 1 whenever filters change
  const handleFilterChange = (setter: (v: any) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const getMemberStatus = (m: Member) => {
    if (m.status === "Active" || m.status === "Expired" || m.status === "Pending Renewal") return m.status;
    const expiry = m.certificateValidTill || m.expiryDate;
    if (!expiry) return "Active";
    const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "Expired";
    if (diff <= 90) return "Pending Renewal";
    return "Active";
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.repName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || getMemberStatus(member) === statusFilter;
    const matchesType = typeFilter === "all" || member.memberCategory === typeFilter;
    const matchesState = stateFilter === "all" || member.state === stateFilter;
    const matchesTab = member.memberCategory === activeTab;
    return matchesSearch && matchesStatus && matchesType && matchesState && matchesTab;
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

  const stats = [
    { label: "Total Members", value: members.length, color: "#1F7A4D", bgColor: "#d0fae5" },
    { label: "Active Members", value: members.filter(m => getMemberStatus(m) === "Active").length, color: "#155DFC", bgColor: "#dbeafe" },
    { label: "Pending Renewal", value: members.filter(m => getMemberStatus(m) === "Pending Renewal").length, color: "#f59e0b", bgColor: "#fef3c7" },
    { label: "Expired", value: members.filter(m => getMemberStatus(m) === "Expired").length, color: "#dc2626", bgColor: "#fee2e2" },
  ];

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#242424]">Member Database</h1>
            <p className="text-[#6a7282] mt-1">Central repository of all IWPA members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            Add New Member
          </button>
        </div>

        {/* Stats */}
        {loading ? <StatCardsSkeleton count={4} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6a7282]">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.bgColor }}>
                    <Building className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#e5e7eb]">
          {([
            { key: "GENERATING_INDIVIDUAL", label: "Generating Individual" },
            { key: "GENERATING_GROUP", label: "Generating Group" },
            { key: "NON_GENERATING", label: "Non Generating" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${activeTab === tab.key
                  ? "border-[#1F7A4D] text-[#1F7A4D]"
                  : "border-transparent text-[#6a7282] hover:text-[#242424]"
                }`}
            >
              {tab.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.key ? "bg-[#d0fae5] text-[#1F7A4D]" : "bg-[#f3f4f6] text-[#6a7282]"
                }`}>
                {members.filter(m => m.memberCategory === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
            <input
              type="text"
              placeholder="Search members by name, ID, or contact person..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="relative sm:w-52">
            <select
              value={typeFilter}
              onChange={handleFilterChange(setTypeFilter)}
              className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
            >
              <option value="all">All Categories</option>
              {/* <option value="GENERATING_INDIVIDUAL">Generating Individual</option>
              <option value="GENERATING_GROUP">Generating Group</option>
              <option value="NON_GENERATING">Non Generating</option> */}
              <option value="generator">Generator</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="relative sm:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
            <select
              value={stateFilter}
              onChange={handleFilterChange(setStateFilter)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
            >
              <option value="all">All States</option>
              {[...new Set(members.map(m => m.state).filter(Boolean))].sort().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="grid grid-cols-1 gap-10">
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-x-auto">
            {loading ? (
              <TableRowsSkeleton rows={5} cols={8} />
            ) : (
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Sr. No.</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Member ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Company Name</th>
                    {/* <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Category</th> */}
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Membership Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Capacity (MW)</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Contact Person</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">State</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Enrolment Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Expiry Date</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-[#242424]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={12} className="px-6 py-10 text-center text-[#6a7282] text-sm">No members found</td></tr>
                  ) : (
                    pagedMembers.map((member) => {
                      const statusStyle = getStatusStyle(getMemberStatus(member));
                      return (
                        <tr key={member._id} className="hover:bg-[#f9fafb] transition-colors">
                          <td className="px-6 py-4 text-sm text-[#6a7282]">{member.srNo ?? "-"}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-[#242424] font-medium">{member.membershipNumber || "-"}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-[#242424]">{member.companyName}</div>
                              <div className="flex items-center gap-4 text-xs text-[#6a7282] mt-1">
                                {member.repEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.repEmail}</span>}
                                {member.repMobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.repMobile}</span>}
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f3f4f6] text-[#6a7282]">
                              {member.memberCategory || member.category || "-"}
                            </span>
                          </td> */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#dbeafe] text-[#155DFC]">
                              {member.membershipType || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#242424]">
                            {member.installedCapacityMW != null ? member.installedCapacityMW : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#242424]">{member.repName || member.contact?.person1 || "-"}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#6a7282]">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{member.state || "-"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6a7282]">
                            {member.dateOfEnrolment ? new Date(member.dateOfEnrolment).toLocaleDateString("en-GB") : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                              {getMemberStatus(member)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6a7282]">
                            {member.certificateValidTill ? new Date(member.certificateValidTill).toLocaleDateString("en-GB") : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setViewMember(member)} className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteId(member._id)} className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#6a7282]">
            Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-[#6a7282]">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-9 h-9 text-sm rounded-lg border cursor-pointer ${currentPage === page
                      ? "bg-[#1F7A4D] text-white border-[#1F7A4D]"
                      : "border-[#e5e7eb] text-[#242424] hover:bg-[#f9fafb]"
                    }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#242424] mb-1">Delete Member</h3>
                <p className="text-sm text-[#6a7282] mb-4">Are you sure you want to delete this member? This action cannot be undone.</p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={deleting}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg hover:bg-red-600 text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddNewMember onClose={() => { setShowAddModal(false); fetchMembers(); }} />
      )}

      {/* View Member Modal */}
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
                {viewMember.membershipId && (
                  <p className="text-xs text-[#6a7282] mt-1 font-mono">{viewMember.membershipId}</p>
                )}
              </div>
              <button onClick={() => setViewMember(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-1 max-h-[70vh] overflow-y-auto">

              {/* Basic Info */}
              <SectionTitle icon={Building} title="Basic Information" />
              <div className="space-y-1.5">
                <InfoRow label="Sr. No." value={viewMember.srNo?.toString()} />
                <InfoRow label="Membership ID" value={viewMember.membershipId} />
                <InfoRow label="Membership Number" value={viewMember.membershipNumber} />
                <InfoRow label="Company Name" value={viewMember.companyName || viewMember.name} />
                <InfoRow label="Group" value={viewMember.group || viewMember.groupCompany} />
                <InfoRow label="Member Category" value={viewMember.memberCategory} />
                <InfoRow label="Category" value={viewMember.category} />
                <InfoRow label="Membership Type" value={viewMember.membershipType} />
                <InfoRow label="Installed Capacity (MW)" value={viewMember.installedCapacityMW?.toString()} />
                <InfoRow label="State" value={viewMember.state} />
                <InfoRow label="GST No." value={viewMember.gstNo || viewMember.gstNumber} />
                <InfoRow label="Status" value={viewMember.status} />
              </div>

              {/* Membership Details */}
              <SectionTitle icon={FileText} title="Membership Details" />
              <div className="space-y-1.5">
                <InfoRow label="Date of Enrolment" value={viewMember.dateOfEnrolment ? new Date(viewMember.dateOfEnrolment).toLocaleDateString("en-GB") : undefined} />
                <InfoRow label="Certificate Valid Till" value={viewMember.certificateValidTill ? new Date(viewMember.certificateValidTill).toLocaleDateString("en-GB") : undefined} />
                <InfoRow label="Expiry Date" value={viewMember.expiryDate ? new Date(viewMember.expiryDate).toLocaleDateString("en-GB") : undefined} />
                <InfoRow label="WF Location" value={viewMember.wfLocation} />
                <InfoRow label="Make" value={viewMember.make} />
                <InfoRow label="Connected Substation" value={viewMember.connectedSubstation} />
                <InfoRow label="HTSC No." value={viewMember.htscNo} />
                <InfoRow label="Commissioning Date(s)" value={viewMember.commissioningDate?.map(d => new Date(d).toLocaleDateString("en-GB")).join(", ")} />
                <InfoRow label="Subscription Waived Off" value={viewMember.subscriptionWaivedOff != null ? (viewMember.subscriptionWaivedOff ? "Yes" : "No") : undefined} />
                <InfoRow label="Remarks" value={viewMember.remarks} />
              </div>

              {/* Address */}
              <SectionTitle icon={MapPin} title="Address" />
              <div className="space-y-1.5">
                {typeof viewMember.address === "string" && <InfoRow label="Address" value={viewMember.address} />}
                <InfoRow label="Address 1" value={viewMember.addressDetails?.address1} />
                <InfoRow label="Address 2" value={viewMember.addressDetails?.address2} />
                <InfoRow label="Address 3" value={viewMember.addressDetails?.address3} />
                <InfoRow label="City" value={viewMember.addressDetails?.city} />
                <InfoRow label="State" value={viewMember.addressDetails?.state} />
                <InfoRow label="Pincode" value={viewMember.addressDetails?.pincode} />
                <InfoRow label="Office Phone" value={viewMember.officePhone} />
              </div>

              {/* Contact */}
              <SectionTitle icon={User} title="Contact Persons" />
              <div className="space-y-1.5">
                <InfoRow label="Contact Person 1" value={viewMember.contact?.person1 || viewMember.repName} />
                <InfoRow label="Designation 1" value={viewMember.contact?.designation1 || viewMember.repDesignation} />
                <InfoRow label="Phone 1" value={viewMember.contact?.phone1 || viewMember.repOfficePhone} />
                <InfoRow label="Mobile 1" value={viewMember.contact?.mobile1 || viewMember.repMobile} />
                <InfoRow label="Email 1" value={viewMember.contact?.email1 || viewMember.repEmail} />
                <InfoRow label="Contact Person 2" value={viewMember.contact?.person2 || viewMember.addRepName} />
                <InfoRow label="Designation 2" value={viewMember.contact?.designation2 || viewMember.addRepDesignation} />
                <InfoRow label="Phone 2" value={viewMember.contact?.phone2 || viewMember.addRepOfficePhone} />
                <InfoRow label="Mobile 2" value={viewMember.contact?.mobile2 || viewMember.addRepMobile} />
                <InfoRow label="Email 2" value={viewMember.contact?.email2 || viewMember.addRepEmail} />
                <InfoRow label="Fax" value={viewMember.contact?.fax} />
              </div>

              {/* Capacity */}
              {viewMember.capacity && (
                <>
                  <SectionTitle icon={Briefcase} title="State-wise Installed Capacity" />
                  <div className="space-y-1.5">
                    <InfoRow label="Andhra Pradesh" value={viewMember.capacity.andhraPradesh?.toString()} />
                    <InfoRow label="Gujarat" value={viewMember.capacity.gujarat?.toString()} />
                    <InfoRow label="Karnataka" value={viewMember.capacity.karnataka?.toString()} />
                    <InfoRow label="Kerala" value={viewMember.capacity.kerala?.toString()} />
                    <InfoRow label="Maharashtra" value={viewMember.capacity.maharashtra?.toString()} />
                    <InfoRow label="Madhya Pradesh" value={viewMember.capacity.madhyaPradesh?.toString()} />
                    <InfoRow label="Rajasthan" value={viewMember.capacity.rajasthan?.toString()} />
                    <InfoRow label="Tamil Nadu" value={viewMember.capacity.tamilNadu?.toString()} />
                    <InfoRow label="Total" value={viewMember.capacity.total?.toString()} />
                    <InfoRow label="Units Generated" value={viewMember.capacity.unitsGenerated} />
                  </div>
                </>
              )}

              {/* Billing */}
              {viewMember.billing && (
                <>
                  <SectionTitle icon={FileText} title="Billing" />
                  <div className="space-y-1.5">
                    <InfoRow label="Admission Fee" value={viewMember.billing.admissionFee?.toString()} />
                    <InfoRow label="Subscription (Current)" value={viewMember.billing.subscriptionCurrent?.toString()} />
                    <InfoRow label="Subscription Arrears" value={viewMember.billing.subscriptionArrears?.toString()} />
                    <InfoRow label="Excess Adjusted" value={viewMember.billing.excessAdjusted?.toString()} />
                    <InfoRow label="Total" value={viewMember.billing.total?.toString()} />
                    <InfoRow label="CGST (9%)" value={viewMember.billing.cgst?.toString()} />
                    <InfoRow label="SGST (9%)" value={viewMember.billing.sgst?.toString()} />
                    <InfoRow label="IGST (18%)" value={viewMember.billing.igst?.toString()} />
                    <InfoRow label="Net Receivable" value={viewMember.billing.netReceivable?.toString()} />
                    <InfoRow label="Invoice No." value={viewMember.billing.invoiceNo} />
                    <InfoRow label="Invoice Date" value={viewMember.billing.invoiceDate ? new Date(viewMember.billing.invoiceDate).toLocaleDateString("en-GB") : undefined} />
                  </div>
                </>
              )}

              {/* Payment */}
              {viewMember.payment && (
                <>
                  <SectionTitle icon={FileText} title="Payment" />
                  <div className="space-y-1.5">
                    <InfoRow label="Receipt No." value={viewMember.payment.receiptNo} />
                    <InfoRow label="Receipt Date" value={viewMember.payment.receiptDate ? new Date(viewMember.payment.receiptDate).toLocaleDateString("en-GB") : undefined} />
                    <InfoRow label="C/D No." value={viewMember.payment.cdNo} />
                    <InfoRow label="C/D Date" value={viewMember.payment.cdDate ? new Date(viewMember.payment.cdDate).toLocaleDateString("en-GB") : undefined} />
                    <InfoRow label="Total Received" value={viewMember.payment.totalReceived?.toString()} />
                    <InfoRow label="Admission Fee Received" value={viewMember.payment.admissionFeeReceived?.toString()} />
                    <InfoRow label="Subscription Received" value={viewMember.payment.subscriptionReceived?.toString()} />
                    <InfoRow label="Arrears Received" value={viewMember.payment.arrearsReceived?.toString()} />
                    <InfoRow label="Excess Received" value={viewMember.payment.excessReceived?.toString()} />
                    <InfoRow label="CGST Received" value={viewMember.payment.cgstReceived?.toString()} />
                    <InfoRow label="SGST Received" value={viewMember.payment.sgstReceived?.toString()} />
                    <InfoRow label="IGST Received" value={viewMember.payment.igstReceived?.toString()} />
                    <InfoRow label="GST Arrears Received" value={viewMember.payment.gstArrearsReceived?.toString()} />
                    <InfoRow label="GST Excess Received" value={viewMember.payment.gstExcessReceived?.toString()} />
                    <InfoRow label="TDS Deducted" value={viewMember.payment.tdsDeducted?.toString()} />
                    <InfoRow label="Difference" value={viewMember.payment.difference?.toString()} />
                  </div>
                </>
              )}

              {/* Additional Info */}
              {(viewMember.businessDescription || viewMember.chairmanMD) && (
                <>
                  <SectionTitle icon={Briefcase} title="Additional Information" />
                  <div className="space-y-1.5">
                    <InfoRow label="Business Description" value={viewMember.businessDescription} />
                    <InfoRow label="Chairman / MD" value={viewMember.chairmanMD} />
                  </div>
                </>
              )}

              {/* Wind Details */}
              {viewMember.windDetails && viewMember.windDetails.length > 0 && (
                <>
                  <SectionTitle icon={FileText} title="Wind Electric Generator Details" />
                  <div className="border border-[#e5e7eb] rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                        <tr>
                          {["Location", "No. of Mills", "Rated Capacity", "Total MW", "Make", "Substation"].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-xs font-medium text-[#6a7282] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb]">
                        {viewMember.windDetails.map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.location || "-"}</td>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.noOfWindMills || "-"}</td>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.ratedCapacity || "-"}</td>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.totalMW || "-"}</td>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.make || "-"}</td>
                            <td className="px-3 py-2 text-xs text-[#242424]">{row.connectedSubstation || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl">
              <button
                onClick={() => setViewMember(null)}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors text-sm font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
