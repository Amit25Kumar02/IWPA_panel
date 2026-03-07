"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Building,
  Trash2,
} from "lucide-react";
import AddNewMember from "./AddNewMember";

export default function MemberDatabase() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Static member data
  const members = [
    {
      id: "MEM-2026-001",
      name: "Suzlon Energy Limited",
      type: "Corporate",
      email: "contact@suzlon.com",
      phone: "+91 22 6638 0900",
      state: "Maharashtra",
      status: "Active",
      expiryDate: "2027-03-14",
      contactPerson: "Rajesh Kumar",
    },
    {
      id: "MEM-2026-002",
      name: "ReGen Powertech Pvt Ltd",
      type: "Corporate",
      email: "info@regenpowertech.com",
      phone: "+91 80 4112 5000",
      state: "Karnataka",
      status: "Active",
      expiryDate: "2026-06-19",
      contactPerson: "Anita Sharma",
    },
    {
      id: "MEM-2025-189",
      name: "WindForce Solutions",
      type: "SME",
      email: "contact@windforce.in",
      phone: "+91 44 2856 7890",
      state: "Tamil Nadu",
      status: "Active",
      expiryDate: "2027-01-09",
      contactPerson: "Vikram Patel",
    },
    {
      id: "MEM-2024-456",
      name: "Green Energy Consultants",
      type: "Consultant",
      email: "hello@greenenergy.co.in",
      phone: "+91 79 2659 3456",
      state: "Gujarat",
      status: "Expired",
      expiryDate: "2025-11-04",
      contactPerson: "Priya Desai",
    },
    {
      id: "MEM-2025-678",
      name: "Windtech India Pvt Ltd",
      type: "Corporate",
      email: "admin@windtech.in",
      phone: "+91 20 2567 8901",
      state: "Maharashtra",
      status: "Pending Renewal",
      expiryDate: "2026-02-11",
      contactPerson: "Suresh Reddy",
    },
  ];

  // Filtering logic
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesType = typeFilter === "all" || member.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Status badge styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Expired":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "Pending Renewal":
        return { bg: "#fef3c7", text: "#f59e0b" };
      default:
        return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  // Stats cards with colors and icons
  const stats = [
    { label: "Total Members", value: "1,248", color: "#1F7A4D", bgColor: "#d0fae5" },
    { label: "Active Members", value: "1,156", color: "#155DFC", bgColor: "#dbeafe" },
    { label: "Pending Renewal", value: "42", color: "#f59e0b", bgColor: "#fef3c7" },
    { label: "Expired", value: "50", color: "#dc2626", bgColor: "#fee2e2" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#242424]">Member Database</h1>
            <p className="text-[#6a7282] mt-1">
              Central repository of all IWPA members
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            Add New Member
          </button>
        </div>

        {/* Stats cards with colors and icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-[#e5e7eb] p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6a7282]">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Building className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
            <input
              type="text"
              placeholder="Search members by name, ID, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none"
            />
          </div>

          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg outline-none appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="relative sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
            >
              <option value="all">All Types</option>
              <option value="Corporate">Corporate</option>
              <option value="SME">SME</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Members table */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Member ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Company Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Contact Person
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      State
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                      Expiry Date
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-[#242424]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredMembers.map((member) => {
                    const statusStyle = getStatusStyle(member.status);
                    return (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-[#242424] font-medium">
                            {member.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-[#242424]">
                              {member.name}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#6a7282] mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f3f4f6] text-[#6a7282]">
                            {member.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#242424]">
                          {member.contactPerson}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-[#6a7282]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{member.state}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                            }}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6a7282]">
                          {new Date(member.expiryDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedMember(member);
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                               <button
                                // onClick={() => handleDelete(latestDoc.id, latestDoc.documentNumber)}
                                className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-[#6a7282]">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && <AddNewMember onClose={() => setShowAddModal(false)} />}
      
      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <AddNewMember 
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }} 
          initialData={selectedMember}
        />
      )}
    </>
  );
}

