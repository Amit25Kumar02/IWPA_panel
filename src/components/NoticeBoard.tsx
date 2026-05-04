"use client";

import { useState, useEffect } from "react";
import { Download, Eye, Search, Filter, Smartphone, Trash2, Plus, X, Loader2 } from "lucide-react";
import { TableRowsSkeleton } from "./ui/Shimmer";
import { toast } from "react-toastify";
import api from "../utils/api";

const CATEGORIES = ["Policy", "Legal", "Regulation", "Announcement"];

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

interface NoticeForm {
  title: string;
  category: string;
  date: string;
  file: File | null;
  isNew: boolean;
}

const initialData: Record<string, Notice[]> = {};

export default function NoticeBoard() {
  const tabs = ["National Council", "AP & Telangana", "Gujarat", "Maharashtra", "Karnataka", "Northern Region", "Rajasthan", "Tamil Nadu"];

  const [activeTab, setActiveTab] = useState("National Council");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [noticesByTab, setNoticesByTab] = useState<Record<string, Notice[]>>(initialData);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NoticeForm>({ title: "", category: "Policy", date: "", file: null, isNew: true });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null; title: string }>({
    show: false, id: null, title: "",
  });
  const [deleting, setDeleting] = useState(false);

  const notices = Array.isArray(noticesByTab[activeTab]) ? noticesByTab[activeTab] : [];

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

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  const closeModal = () => { setShowModal(false); setFormErrors({}); setForm({ title: "", category: "Policy", date: "", file: null, isNew: true }); };

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

  const handleAddNotice = async () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.file) errors.file = "File is required";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("category", form.category);
    payload.append("date", form.date);
    payload.append("region", activeTab);
    payload.append("isNew", String(form.isNew));
    payload.append("file", form.file!);

    setSubmitting(true);
    try {
      const res = await api.post("/api/v1/notices/create-notice", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created: Notice = res.data.notice ?? res.data.data ?? res.data;
      setNoticesByTab((prev) => ({ ...prev, [activeTab]: [created, ...(prev[activeTab] ?? [])] }));
      toast.success("Notice created successfully");
      closeModal();
    } catch {
      toast.error("Failed to create notice. Please try again.");
      setFormErrors({ title: "Failed to create notice. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (notice: Notice) => setViewNotice(notice);

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

  const handleDelete = async () => {
    if (!deleteConfirmation.id) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/notices/delete-notice/${deleteConfirmation.id}`);
      setNoticesByTab((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((n) => n._id !== deleteConfirmation.id) }));
      toast.success("Notice deleted successfully");
      setDeleteConfirmation({ show: false, id: null, title: "" });
    } catch {
      toast.error("Failed to delete notice.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Notice Board</h1>
          <p className="text-[#6a7282] mt-1">Access official notices and announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Notice
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 gap-10">
        <div className="border-b border-[#e5e7eb] overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 text-[15.17px] font-medium relative cursor-pointer ${activeTab === tab ? "text-[#1F7A4D]" : "text-[#8B94A6] hover:text-[#242424]"}`}
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
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
          >
            {["all", ...CATEGORIES].map((cat) => (
              <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-[#ffffff] border-[0.76px] border-[#e5e7eb] rounded-lg overflow-auto">
          <div className="overflow-x-auto">
            {loadingTab === activeTab ? (
              <TableRowsSkeleton rows={5} cols={5} />
            ) : (
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
                  {filteredNotices.length === 0 ? (
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
                        <td className="px-6 py-4 text-sm text-[#6a7282]">{new Date(notice.date).toDateString()}</td>
                        <td className="px-6 py-4 text-sm text-[#6a7282]">{notice.size}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleView(notice)} disabled={!notice.fileUrl} className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDownload(notice)} disabled={!notice.fileUrl} className="p-2 hover:bg-green-50 rounded-lg text-[#1F7A4D] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                              <Download className="w-5 h-5" />
                            </button>
                            <button onClick={() => setDeleteConfirmation({ show: true, id: notice._id, title: notice.title })} className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-[#6a7282]">
        Showing {filteredNotices.length} of {notices.length} notices
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#242424] mb-2">Delete Notice</h3>
                <p className="text-sm text-[#6a7282] mb-4">
                  Are you sure you want to delete <strong>{deleteConfirmation.title}</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirmation({ show: false, id: null, title: "" })}
                    disabled={deleting}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {/* Meta info */}
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

              {/* File attachment */}
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

      {/* Add Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col mx-3 mb-3 sm:mx-0 sm:mb-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#242424]">Add Notice</h2>
                <p className="text-xs text-[#6a7282] mt-0.5">
                  Adding to: <span className="font-medium text-[#1F7A4D]">{activeTab}</span>
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">
                  Title <span className="text-[#FB2C36]">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.title}
                  onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setFormErrors((p) => ({ ...p, title: "" })); }}
                  placeholder="Enter notice title"
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${formErrors.title ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                />
                {formErrors.title && <p className="text-xs text-[#FB2C36] mt-1">{formErrors.title}</p>}
              </div>

              {/* Category + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">
                    Category <span className="text-[#FB2C36]">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm appearance-none bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">
                    Date <span className="text-[#FB2C36]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setFormErrors((p) => ({ ...p, date: "" })); }}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer ${formErrors.date ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}
                  />
                  {formErrors.date && <p className="text-xs text-[#FB2C36] mt-1">{formErrors.date}</p>}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">
                  File <span className="text-[#FB2C36]">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors ${formErrors.file ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}>
                  {form.file ? (
                    <div className="text-center px-4">
                      <p className="text-sm font-medium text-[#242424] truncate max-w-[260px]">{form.file.name}</p>
                      <p className="text-xs text-[#6a7282] mt-1">{formatSize(form.file.size)}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-[#6a7282]">Click to upload file</p>
                      <p className="text-xs text-[#6a7282] mt-1">PDF, DOC, DOCX, XLS up to 20MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => { setForm((p) => ({ ...p, file: e.target.files?.[0] ?? null })); setFormErrors((p) => ({ ...p, file: "" })); }}
                  />
                </label>
                {formErrors.file && <p className="text-xs text-[#FB2C36] mt-1">{formErrors.file}</p>}
              </div>

              {/* Mark as New */}
              <label className="flex items-center justify-between gap-3 p-3 border border-[#e5e7eb] rounded-lg cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#242424]">Mark as New</p>
                  <p className="text-xs text-[#6a7282] mt-0.5">Shows a "New" badge on the notice</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setForm((p) => ({ ...p, isNew: e.target.checked }))}
                  style={{ accentColor: "#1F7A4D", width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                />
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNotice}
                disabled={submitting}
                className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Uploading..." : "Add Notice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
