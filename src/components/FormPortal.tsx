"use client";

import { FileEdit, Plus, Eye, Copy, Download, Calendar } from "lucide-react";

interface FormPortalProps {
  user?: any; // kept for compatibility, not used in this component
}

export default function FormPortal({ user }: FormPortalProps) {
  const forms = [
    {
      id: 1,
      name: "Membership Registration Form",
      type: "Registration",
      status: "Active",
      submissions: 156,
      lastUpdated: "2026-01-05",
      description: "New member registration and onboarding form",
    },
    {
      id: 2,
      name: "Membership Renewal Form",
      type: "Renewal",
      status: "Active",
      submissions: 842,
      lastUpdated: "2026-01-03",
      description: "Annual membership renewal form",
    },
    {
      id: 3,
      name: "Company Profile Update Form",
      type: "Update",
      status: "Active",
      submissions: 234,
      lastUpdated: "2025-12-28",
      description: "Update company information and contact details",
    },
    {
      id: 4,
      name: "Event Registration Form",
      type: "Event",
      status: "Active",
      submissions: 567,
      lastUpdated: "2026-01-10",
      description: "Register for IWPA events and conferences",
    },
    {
      id: 5,
      name: "Ad Booking Request Form",
      type: "Commercial",
      status: "Active",
      submissions: 45,
      lastUpdated: "2025-12-15",
      description: "Request for advertisement booking in portal",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Registration":
        return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Renewal":
        return { bg: "#dbeafe", text: "#155DFC" };
      case "Update":
        return { bg: "#f3e8ff", text: "#a855f7" };
      case "Event":
        return { bg: "#fef3c7", text: "#f59e0b" };
      case "Commercial":
        return { bg: "#fee2e2", text: "#dc2626" };
      default:
        return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const stats = [
    {
      label: "Total Forms",
      value: forms.length,
      color: "#1F7A4D",
      bgColor: "#d0fae5",
    },
    {
      label: "Active Forms",
      value: forms.filter((f) => f.status === "Active").length,
      color: "#155DFC",
      bgColor: "#dbeafe",
    },
    {
      label: "Total Submissions",
      value: "1,844",
      color: "#a855f7",
      bgColor: "#f3e8ff",
    },
    {
      label: "This Month",
      value: "189",
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Form Portal</h1>
          <p className="text-[#6a7282] mt-1">
            Manage membership registration, renewal, and data collection forms
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer">
          <Plus className="w-5 h-5" />
          Create New Form
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#ffffff] rounded-lg border border-[#e5e7eb] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6a7282]">
                  {stat.label}
                </p>
                <p
                  className="text-3xl font-bold mt-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor }}
              >
                <FileEdit className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forms.map((form) => {
          const typeColor = getTypeColor(form.type);
          return (
            <div
              key={form.id}
              className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#242424]">
                      {form.name}
                    </h3>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: typeColor.bg,
                        color: typeColor.text,
                      }}
                    >
                      {form.type}
                    </span>
                  </div>
                  <p className="text-sm text-[#6a7282]">{form.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#f9fafb] rounded-lg">
                <div>
                  <p className="text-xs text-[#6a7282]">Total Submissions</p>
                  <p className="text-2xl font-bold text-[#1F7A4D] mt-1">
                    {form.submissions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6a7282]">Last Updated</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6a7282]" />
                    <p className="text-sm text-[#242424]">
                      {new Date(form.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white cursor-pointer rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  View Submissions
                </button>
                <button className="p-2 border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] transition-colors cursor-pointer">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 border border-[#e5e7eb] rounded-lg text-[#242424] hover:bg-[#f9fafb] transition-colors cursor-pointer">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Templates */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h2 className="text-lg font-semibold text-[#242424] mb-4">
          Form Templates
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-6 text-center hover:border-[#1F7A4D] hover:bg-[#ecfdf5] transition-all cursor-pointer">
            <FileEdit className="w-8 h-8 text-[#1F7A4D] mx-auto mb-2" />
            <h3 className="font-medium text-[#242424] mb-1">
              Registration Template
            </h3>
            <p className="text-xs text-[#6a7282]">New member onboarding</p>
          </div>
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-6 text-center hover:border-[#1F7A4D] hover:bg-[#ecfdf5] transition-all cursor-pointer">
            <FileEdit className="w-8 h-8 text-[#1F7A4D] mx-auto mb-2" />
            <h3 className="font-medium text-[#242424] mb-1">
              Renewal Template
            </h3>
            <p className="text-xs text-[#6a7282]">Membership renewal</p>
          </div>
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-6 text-center hover:border-[#1F7A4D] hover:bg-[#ecfdf5] transition-all cursor-pointer">
            <FileEdit className="w-8 h-8 text-[#1F7A4D] mx-auto mb-2" />
            <h3 className="font-medium text-[#242424] mb-1">
              Custom Template
            </h3>
            <p className="text-xs text-[#6a7282]">Build from scratch</p>
          </div>
        </div>
      </div>
    </div>
  );
}