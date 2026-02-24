"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

export default function Reporting() {
  const [reportType, setReportType] = useState("membership");
  const [stateFilter, setStateFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("this-year");

  /* ---------- STATS ---------- */
  const stats = [
    {
      label: "Total Reports",
      value: "15",
      color: "#1F7A4D",
      bg: "#d0fae5",
    },
    {
      label: "Generated Today",
      value: "3",
      color: "#155DFC",
      bg: "#dbeafe",
    },
    {
      label: "Scheduled Reports",
      value: "8",
      color: "#a855f7",
      bg: "#f3e8ff",
    },
    {
      label: "Total Records",
      value: "4.2K",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
  ];

  /* ---------- REPORT LIST ---------- */
  const reports = [
    {
      id: 1,
      name: "Membership Report",
      desc: "Complete member database with status and subscription details",
      date: "2026-02-05",
      records: 1248,
    },
    {
      id: 2,
      name: "Subscription Status Report",
      desc: "Active, expiring, and expired subscriptions",
      date: "2026-02-05",
      records: 1248,
    },
    {
      id: 3,
      name: "Revenue Report",
      desc: "Membership and advertisement revenue analysis",
      date: "2026-02-04",
      records: 892,
    },
    {
      id: 4,
      name: "State-wise Member Distribution",
      desc: "Member count and status by state",
      date: "2026-02-03",
      records: 28,
    },
    {
      id: 5,
      name: "Renewal Pending Report",
      desc: "Members with pending or upcoming renewals",
      date: "2026-02-05",
      records: 42,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Reporting</h1>
        <p className="text-[#6a7282] mt-1">
          Generate membership and subscription reports with filters and export options
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <div className="flex justify-between items-start">
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
                <BarChart3 className="w-6 h-6" style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h2 className="text-lg font-semibold text-[#242424] mb-4">
          Report Filters
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-[#242424] block mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#1F7A4D]"
            >
              <option>Membership Report</option>
              <option>Subscription Status</option>
              <option>Revenue Report</option>
              <option>State Distribution</option>
              <option>Renewal Pending</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#242424] block mb-2">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#1F7A4D]"
            >
              <option>All States</option>
              <option>Maharashtra</option>
              <option>Gujarat</option>
              <option>Tamil Nadu</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#242424] block mb-2">
              Period
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#1F7A4D]"
            >
              <option>This Year</option>
              <option>This Quarter</option>
              <option>This Month</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939]">
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#e5e7eb] rounded-lg">
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#e5e7eb] rounded-lg">
            <Download className="w-5 h-5" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold text-[#242424]">
            Available Reports
          </h2>
        </div>

        <div className="divide-y divide-[#e5e7eb]">
          {reports.map((r) => (
            <div key={r.id} className="p-6 hover:bg-[#f9fafb]">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[#242424]">{r.name}</h3>
                  <p className="text-sm text-[#6a7282] mt-1">{r.desc}</p>
                  <div className="flex items-center gap-4 text-sm text-[#6a7282] mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Last generated: {new Date(r.date).toLocaleDateString()}
                    </div>
                    <span>•</span>
                    <span>{r.records} records</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm">
                    <BarChart3 className="w-4 h-4" />
                    Generate
                  </button>
                  <button className="p-2 border border-[#e5e7eb] rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}