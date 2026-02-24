"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const subscriptions = [
    {
      id: "SUB-2026-001",
      memberId: "MEM-2026-001",
      companyName: "Suzlon Energy Limited",
      plan: "Corporate Annual",
      amount: "₹1,50,000",
      startDate: "2026-03-15",
      endDate: "2027-03-14",
      status: "Active",
      paymentStatus: "Paid",
      renewalDue: 365,
    },
    {
      id: "SUB-2026-002",
      memberId: "MEM-2026-002",
      companyName: "ReGen Powertech Pvt Ltd",
      plan: "Corporate Annual",
      amount: "₹1,50,000",
      startDate: "2025-06-20",
      endDate: "2026-06-19",
      status: "Expiring Soon",
      paymentStatus: "Paid",
      renewalDue: 135,
    },
    {
      id: "SUB-2025-189",
      memberId: "MEM-2025-189",
      companyName: "WindForce Solutions",
      plan: "SME Annual",
      amount: "₹75,000",
      startDate: "2026-01-10",
      endDate: "2027-01-09",
      status: "Active",
      paymentStatus: "Paid",
      renewalDue: 339,
    },
    {
      id: "SUB-2024-456",
      memberId: "MEM-2024-456",
      companyName: "Green Energy Consultants",
      plan: "Consultant Annual",
      amount: "₹50,000",
      startDate: "2024-11-05",
      endDate: "2025-11-04",
      status: "Expired",
      paymentStatus: "Pending",
      renewalDue: -92,
    },
    {
      id: "SUB-2025-678",
      memberId: "MEM-2025-678",
      companyName: "Windtech India Pvt Ltd",
      plan: "Corporate Annual",
      amount: "₹1,50,000",
      startDate: "2025-02-12",
      endDate: "2026-02-11",
      status: "Pending Renewal",
      paymentStatus: "Pending",
      renewalDue: 7,
    },
  ];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.memberId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Expired":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "Expiring Soon":
      case "Pending Renewal":
        return { bg: "#fef3c7", text: "#f59e0b" };
      default:
        return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const getPaymentStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Pending":
        return { bg: "#fef3c7", text: "#f59e0b" };
      default:
        return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const stats = [
    { label: "Active Subscriptions", value: "1,156", color: "#1F7A4D", bg: "#d0fae5" },
    { label: "Expiring Soon (90 days)", value: "42", color: "#f59e0b", bg: "#fef3c7" },
    { label: "Pending Renewals", value: "28", color: "#f59e0b", bg: "#fef3c7" },
    { label: "Total Revenue (This Year)", value: "₹12.5 Cr", color: "#155DFC", bg: "#dbeafe" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Subscriptions</h1>
        <p className="text-[#6a7282] mt-1">
          Membership subscription lifecycle and renewal tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-[#6a7282]">{s.label}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: s.bg }}
              >
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, member ID, or subscription ID..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>

        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg appearance-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Pending Renewal">Pending Renewal</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full ">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Subscription ID",
                  "Company Name",
                  "Plan",
                  "Amount",
                  "Validity",
                  "Status",
                  "Payment",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredSubscriptions.map((s) => {
                const status = getStatusStyle(s.status);
                const pay = getPaymentStyle(s.paymentStatus);

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">
                      {s.id}
                      <div className="text-xs text-gray-500">
                        Member: {s.memberId}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{s.companyName}</td>
                    <td className="px-6 py-4 text-xs bg-gray-100 rounded">
                      {s.plan}
                    </td>
                    <td className="px-6 py-4 font-semibold">{s.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(s.startDate).toLocaleDateString()} –{" "}
                      {new Date(s.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs rounded"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs rounded"
                        style={{ backgroundColor: pay.bg, color: pay.text }}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button className="p-2 hover:bg-green-50 rounded text-green-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-green-50 rounded text-green-700">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Reminder */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 flex gap-4">
        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Renewal Reminders</h3>
          <p className="text-sm text-gray-600 mt-1">
            {
              filteredSubscriptions.filter(
                (s) => s.renewalDue > 0 && s.renewalDue <= 90
              ).length
            }{" "}
            subscriptions are expiring in the next 90 days.
          </p>
          <button className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg">
            Send Renewal Reminders
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </div>
    </div>
  );
}