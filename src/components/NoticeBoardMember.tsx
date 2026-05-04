"use client";

import { useState, useEffect } from "react";
import { Download, Eye, Search, Filter, Smartphone, X } from "lucide-react";
import { TableRowsSkeleton } from "./ui/Shimmer";
import api from "../utils/api";

interface Notice {
  _id: string;
  title: string;
  category: string;
  date: string;
  size: string;
  isNew: boolean;
  fileUrl?: string;
  region: string;
}

export default function NoticeBoardMember() {
  const tabs = [
    "National Council",
    "AP & Telangana",
    "Gujarat",
    "Maharashtra",
    "Karnataka",
    "Northern Region",
    "Rajasthan",
    "Tamil Nadu",
  ];

  const [activeTab, setActiveTab] = useState("National Council");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [noticesByTab, setNoticesByTab] = useState<Record<string, Notice[]>>({});
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);

  const notices = Array.isArray(noticesByTab[activeTab]) ? noticesByTab[activeTab] : [];

  const categories = ["all", "Policy", "Legal", "Regulation", "Announcement"];

  const categoryStyle = (cat: string) => {
    switch (cat) {
      case "Policy": return "bg-[#D0FAE5] text-[#1F7A4D]";
      case "Legal": return "bg-[#FEF3C7] text-[#F59E0B]";
      case "Regulation": return "bg-[#DBEAFE] text-[#155DFC]";
      case "Announcement": return "bg-[#F3E8FF] text-[#A855F7]";
      default: return "bg-[#e5e7eb] text-[#6a7282]";
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || n.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const fetchNotices = async (tab: string) => {
    setLoadingTab(tab);
    try {
      const res = await api.get("/api/v1/notices/get-notices", { params: { region: tab } });
      const list: Notice[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setNoticesByTab((prev) => ({ ...prev, [tab]: list }));
    } catch {
      // keep existing data on error
    } finally {
      setLoadingTab(null);
    }
  };

  useEffect(() => { fetchNotices(activeTab); }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchNotices(tab);
  };

  const handleDownload = async (notice: Notice) => {
    const url = notice.fileUrl;
    if (!url) return;
    const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;
    const fileName = url.split("/").pop() || notice.title;
    try {
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Notice Board</h1>
        <p className="text-[#6a7282] mt-1">Access official notices and announcements</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 gap-10">
        <div className="border-b border-[#e5e7eb] overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 text-[15.17px] font-medium relative cursor-pointer ${
                  activeTab === tab ? "text-[#1F7A4D]" : "text-[#8B94A6] hover:text-[#242424]"
                }`}
              >
                {tab}
                {activeTab === tab && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#1F7A4D]" />}
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
            className="w-full pl-10 pr-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg outline-none transition-colors"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-[0.76px] border-[#e5e7eb] rounded-lg outline-none transition-colors appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {loadingTab === activeTab ? (
                  <TableRowsSkeleton rows={5} cols={5} />
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#6a7282] text-sm">No notices found</td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr key={notice._id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#242424]">{notice.title}</span>
                          {notice.isNew && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#D0FAE5] text-[#1F7A4D]">
                              <Smartphone className="w-3 h-3" />New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${categoryStyle(notice.category)}`}>
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6a7282]">{notice.date}</td>
                      <td className="px-6 py-4 text-sm text-[#6a7282]">{notice.size}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewNotice(notice)}
                            className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(notice)}
                            disabled={!notice.fileUrl}
                            className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-sm text-[#6a7282]">
        Showing {filteredNotices.length} of {notices.length} notices
      </div>

      {/* View Notice Modal */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#242424] leading-snug">{viewNotice.title}</h2>
                  {viewNotice.isNew && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#D0FAE5] text-[#1F7A4D] shrink-0">
                      <Smartphone className="w-3 h-3" />New
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6a7282] mt-1">{activeTab}</p>
              </div>
              <button onClick={() => setViewNotice(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-lg p-3">
                  <p className="text-xs text-[#6a7282] mb-1">Category</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${categoryStyle(viewNotice.category)}`}>
                    {viewNotice.category}
                  </span>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3">
                  <p className="text-xs text-[#6a7282] mb-1">Date</p>
                  <p className="text-sm font-medium text-[#242424]">{viewNotice.date}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3">
                  <p className="text-xs text-[#6a7282] mb-1">File Size</p>
                  <p className="text-sm font-medium text-[#242424]">{viewNotice.size}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3">
                  <p className="text-xs text-[#6a7282] mb-1">Status</p>
                  <p className="text-sm font-medium text-[#242424]">{viewNotice.isNew ? "New" : "Published"}</p>
                </div>
              </div>

              {viewNotice.fileUrl ? (
                <div className="flex items-center justify-between px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-[#D0FAE5] rounded-lg flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4 text-[#1F7A4D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#242424] truncate">
                        {viewNotice.fileUrl.split("/").pop()}
                      </p>
                      <p className="text-xs text-[#6a7282]">{viewNotice.size}</p>
                    </div>
                  </div>
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL ?? ""}${viewNotice.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#1F7A4D] hover:underline cursor-pointer shrink-0 ml-3"
                  >
                    Open
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center h-14 border-2 border-dashed border-[#e5e7eb] rounded-lg">
                  <p className="text-sm text-[#6a7282]">No file attached</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl">
              <button
                onClick={() => setViewNotice(null)}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors text-sm font-medium cursor-pointer"
              >
                Close
              </button>
              {viewNotice.fileUrl && (
                <button
                  onClick={() => handleDownload(viewNotice)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
