"use client";

import { useState } from "react";
import {
  FileText,
  Calendar,
  Eye,
  Download,
  Edit,
  Filter,
  Layers,
  FileCheck
} from "lucide-react";

export default function MyDocumentsMember() {
  const [filter, setFilter] = useState("All Documents");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const documents = [
    {
      type: "Proforma Invoice",
      membershipId: "MEM-2026-001",
      count: 2,
      number: "PI-2026-001-V2",
      desc: "Proforma Invoice FY 2026-27 (Revised)",
      date: "1/15/2026",
    },
    {
      type: "Tax Invoice",
      membershipId: "MEM-2026-001",
      count: 2,
      number: "TAX-2026-001-V2",
      desc: "Tax Invoice with GST Details (Amended)",
      date: "1/16/2026",
    },
    {
      type: "Membership Certificate",
      membershipId: "MEM-2026-001",
      count: 1,
      number: "CERT-2026-001",
      desc: "IWPA Membership Certificate 2026-27",
      date: "1/17/2026",
    },
    {
      type: "Receipt",
      membershipId: "MEM-2026-001",
      count: 3,
      number: "REC-2026-001-V3",
      desc: "Payment Receipt (Final)",
      date: "1/18/2026",
    },
  ];

  const stats = [
    { label: "Total Documents", value: 6, color: "#1F7A4D", bg: "#D1FAE5", icon: FileText },
    { label: "Invoices", value: 2, color: "#2563EB", bg: "#DBEAFE", icon: FileText },
    { label: "Receipts", value: 2, color: "#1F7A4D", bg: "#D1FAE5", icon: FileText },
    { label: "Certificates", value: 1, color: "#F59E0B", bg: "#FEF3C7", icon: FileText },
  ];

  const tagColor = (type: string) => {
    switch (type) {
      case "Proforma Invoice":
        return "bg-[#E0E7FF] text-[#6366F1]";
      case "Tax Invoice":
        return "bg-[#DBEAFE] text-[#2563EB]";
      case "Membership Certificate":
        return "bg-[#FEF3C7] text-[#F59E0B]";
      case "Receipt":
        return "bg-[#D1FAE5] text-[#1F7A4D]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filterOptions = ["All Documents", "Proforma Invoice", "Tax Invoice", "Membership Certificate", "Receipt"];

  const filteredDocuments = filter === "All Documents"
    ? documents
    : documents.filter(doc => doc.type === filter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22.75px] font-bold text-[#242424]">My Documents</h1>
        <p className="text-[15.17px] text-[#6A7282]">
          Access your invoices, receipts, and membership certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-5 flex justify-between">
              <div>
                <p className="text-[13.27px] text-[#6A7282]">{s.label}</p>
                <p className="text-[28.44px] font-bold mt-1" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>

              <div
                className="w-11.25 h-11.25 rounded-lg flex items-center justify-center"
                style={{ background: s.bg }}
              >
                <Icon size={22} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex relative">
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="flex items-center gap-2 border-[0.76px] border-[#E5E7EB] px-4 py-2 rounded-lg text-sm text-[#242424] hover:bg-[#F9FAFB]">
          <Filter size={16} />
          {filter}
        </button>

        {showFilterMenu && (
          <div className="absolute top-full mt-2 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 min-w-50">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setFilter(option);
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] first:rounded-t-lg last:rounded-b-lg ${filter === option ? "bg-[#ECFDF5] text-[#1F7A4D] font-medium" : "text-[#242424]"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl overflow-auto">

          <table className="w-full text-sm">

            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr className="text-[#242424] text-[13.27px] font-medium">
                <th className="px-6 py-3 text-left">Document Type</th>
                <th className="px-6 py-3 text-left">Membership ID</th>
                <th className="px-6 py-3 text-left">Count</th>
                <th className="px-6 py-3 text-left">Latest Document</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {filteredDocuments.map((doc, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB]">

                  <td className="px-6 py-4">
                    <span className={`text-[11.38px] px-2.5 py-1 w-full rounded-md ${tagColor(doc.type)}`}>
                      {doc.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-[13.27px] text-[#242424]">
                    {doc.membershipId}
                  </td>

                  <td className="px-6 py-4">

                    {doc.count > 1 ? (
                      <span className="flex items-center gap-1 text-xs bg-[#ECFDF5] text-[#1F7A4D] px-2.5 py-1 rounded-md w-fit">
                        <Layers size={14} />
                        {doc.count} Documents
                      </span>
                    ) : (
                      <span className="text-[#6A7282] text-sm">
                        1 Document
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium text-[13.27px] text-[#242424]">{doc.number}</p>
                    <p className="text-xs text-[#6A7282]">{doc.desc}</p>
                  </td>

                  <td className="px-6 py-4 text-[13.27px] text-[#6A7282]">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {doc.date}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      <button className="p-2 rounded-md hover:bg-[#ECFDF5] text-[#1F7A4D]">
                        <Eye size={16} />
                      </button>

                      <button className="p-2 rounded-md hover:bg-[#ECFDF5] text-[#1F7A4D]">
                        <Download size={16} />
                      </button>

                      <button className="p-2 rounded-md hover:bg-[#ECFDF5] text-[#1F7A4D]">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>

        </div>
      </div>

      {/* Info Box */}

      <div className="bg-linear-to-b from-[#ECFDF5] to-[#FFFFFF] border border-[#A7F3D0] rounded-xl p-6 flex gap-4">

        <div className="w-12 h-12 bg-[#1F7A4D] rounded-lg flex items-center justify-center">
          <FileText className="text-white" />
        </div>

        <div>
          <h3 className="font-semibold text-[#242424]">
            Automated Document Generation
          </h3>

          <p className="text-sm text-[#6A7282] mt-1 max-w-3xl">
            All documents including invoices, tax invoices, receipts, and membership
            certificates are automatically generated and stored securely.
            You can view and download them anytime from this portal.
          </p>
        </div>

      </div>

      <p className="text-sm text-[#6A7282]">
        Showing {filteredDocuments.length} of {documents.length} documents
      </p>

    </div>
  );
}