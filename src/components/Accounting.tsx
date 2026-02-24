"use client";

import { DollarSign, Eye, Download } from "lucide-react";

export default function Accounting() {
  const stats = [
    {
      label: "Total Revenue (YTD)",
      value: "₹12.5 Cr",
      color: "#1F7A4D",
      bg: "#d0fae5",
    },
    {
      label: "This Month",
      value: "₹2.8 Cr",
      color: "#155DFC",
      bg: "#dbeafe",
    },
    {
      label: "Pending Payments",
      value: "₹45 L",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      label: "Total Transactions",
      value: "1,248",
      color: "#a855f7",
      bg: "#f3e8ff",
    },
  ];

  const transactions = [
    {
      id: "TXN-2026-001",
      company: "Suzlon Energy",
      type: "Membership",
      amount: "₹1,50,000",
      date: "2026-01-16",
      invoice: "INV-2026-001",
      status: "Paid",
    },
    {
      id: "TXN-2026-002",
      company: "ReGen Powertech",
      type: "Membership",
      amount: "₹1,50,000",
      date: "2026-01-18",
      invoice: "INV-2026-002",
      status: "Paid",
    },
    {
      id: "TXN-2026-003",
      company: "WindTech Solutions",
      type: "Advertisement",
      amount: "₹75,000",
      date: "2026-01-20",
      invoice: "INV-2026-003",
      status: "Paid",
    },
    {
      id: "TXN-2026-004",
      company: "Green Energy Ltd",
      type: "Membership",
      amount: "₹75,000",
      date: "2026-01-22",
      invoice: "INV-2026-004",
      status: "Pending",
    },
  ];

  const statusStyle = (status: string) =>
    status === "Paid"
      ? { bg: "#d0fae5", text: "#1F7A4D" }
      : { bg: "#fef3c7", text: "#f59e0b" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Accounting</h1>
        <p className="text-[#6a7282] mt-1">
          Membership-related financial records and transaction history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-[#e5e7eb] p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#6a7282]">{s.label}</p>
                <p
                  className="text-3xl font-bold mt-2"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: s.bg }}
              >
                <DollarSign className="w-6 h-6" style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Invoice No</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e7eb]">
                {transactions.map((t) => {
                  const st = statusStyle(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-[#f9fafb]">
                      <td className="px-6 py-4 font-mono text-sm">{t.id}</td>
                      <td className="px-6 py-4 font-medium">{t.company}</td>
                      <td className="px-6 py-4 text-sm text-[#6a7282]">{t.type}</td>
                      <td className="px-6 py-4 font-semibold">{t.amount}</td>
                      <td className="px-6 py-4 text-sm text-[#6a7282]">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#6a7282]">
                        {t.invoice}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-[#ecfdf5] text-[#1F7A4D] cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-[#ecfdf5] text-[#1F7A4D] cursor-pointer">
                            <Download className="w-4 h-4" />
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
    </div>
  );
}