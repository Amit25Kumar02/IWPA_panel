"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  Search,
  Filter,
  Smartphone,
} from "lucide-react";

export default function NoticeBoard() {
  const [activeTab, setActiveTab] = useState("National Council");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const tabs = [
    "National Council",
    "State Council",
    "AP & Telangana",
    "Gujarat",
    "Maharashtra",
    "Karnataka",
    "Northern Region",
    "Rajasthan",
    "Tamil Nadu",
  ];

  const notices = [
    {
      id: 1,
      title: "Wind Energy Policy Framework 2026-2030",
      category: "Policy",
      date: "1/7/2026",
      size: "2.4 MB",
      isNew: true,
    },
    {
      id: 2,
      title: "Legal Update: Land Acquisition Guidelines",
      category: "Legal",
      date: "1/6/2026",
      size: "1.8 MB",
      isNew: true,
    },
    {
      id: 3,
      title: "Regulatory Changes in Grid Integration",
      category: "Regulation",
      date: "1/5/2026",
      size: "3.1 MB",
      isNew: false,
    },
    {
      id: 4,
      title: "Annual General Meeting Announcement",
      category: "Announcement",
      date: "1/4/2026",
      size: "890 KB",
      isNew: true,
    },
    {
      id: 5,
      title: "Q4 2025 Industry Performance Report",
      category: "Policy",
      date: "1/3/2026",
      size: "4.2 MB",
      isNew: false,
    },
  ];

  const categories = ["all", "Policy", "Legal", "Regulation", "Announcement"];

  const categoryStyle = (cat: string) => {
    switch (cat) {
      case "Policy":
        return "bg-[#D0FAE5] text-[#1F7A4D]";
      case "Legal":
        return "bg-[#FEF3C7] text-[#F59E0B]";
      case "Regulation":
        return "bg-[#DBEAFE] text-[#155DFC]";
      case "Announcement":
        return "bg-[#F3E8FF] text-[#A855F7]";
      default:
        return "bg-[#e5e7eb] text-[#6a7282]";
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Notice Board</h1>
        <p className="text-[#6a7282] mt-1">
          Access official notices and announcements
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 gap-10">
        <div className="border-b border-[#e5e7eb] overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium relative ${activeTab === tab
                  ? "text-[#1F7A4D]"
                  : "text-[#6a7282] hover:text-[#242424]"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#1F7A4D]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#1F7A4D] focus:border-[#1F7A4D] transition-colors"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#1F7A4D] focus:border-[#1F7A4D] transition-colors appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                    Title
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                    Size
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#242424]">
                          {notice.title}
                        </span>
                        {notice.isNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#D0FAE5] text-[#1F7A4D]">
                            <Smartphone className="w-3 h-3" />
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${categoryStyle(
                          notice.category
                        )}`}
                      >
                        {notice.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6a7282]">{notice.date}</td>
                    <td className="px-6 py-4 text-sm text-[#6a7282]">{notice.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Optional: show count */}
      <div className="text-sm text-[#6a7282]">
        Showing {filteredNotices.length} of {notices.length} notices
      </div>
    </div>
  );
}