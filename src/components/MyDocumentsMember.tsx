"use client";

import { useState, useEffect } from "react";
import {
  FileText, Calendar, Eye, Download, Filter,
  Layers, Trash2, X, Loader2, Plus, Upload,
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { generateDocumentNumber } from "../utils/membershipId";

interface Document {
  _id: string;
  type: string;
  documentNumber: string;
  description: string;
  date: string;
  amount: string;
  category: string;
  membershipId: string;
  version?: number;
  fileUrls?: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const handleDownload = async (fileUrl?: string, fileName?: string) => {
  if (!fileUrl) return;
  const url = `${BASE_URL}${fileUrl}`;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName ?? fileUrl.split("/").pop() ?? "document";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export default function MyDocumentsMember() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Documents");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; documentId: string | null; documentName: string }>
    ({ show: false, documentId: null, documentName: "" });
  const [deleting, setDeleting] = useState(false);
  const [downloadPicker, setDownloadPicker] = useState<{ doc: Document } | null>(null);
  const [selectedDownloads, setSelectedDownloads] = useState<Set<number>>(new Set());

  const EMPTY_FORM = { type: "", documentNumber: "", description: "", date: "", amount: "", category: "Invoice" };
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addFiles, setAddFiles] = useState<File[]>([]);

  const openAddModal = () => {
    const autoDocNum = generateDocumentNumber(documents.map(d => d.documentNumber));
    setAddForm({ ...EMPTY_FORM, documentNumber: autoDocNum });
    setAddFiles([]);
    setAddModal(true);
  };
  const [saving, setSaving] = useState(false);

  const triggerDownload = (doc: Document) => {
    if ((doc.fileUrls?.length ?? 0) > 1) { setDownloadPicker({ doc }); setSelectedDownloads(new Set()); }
    else if (doc.fileUrls?.[0]) { handleDownload(doc.fileUrls[0], doc.documentNumber); }
  };

  const handleDownloadSelected = async (doc: Document) => {
    const urls = doc.fileUrls ?? [];
    const indices = selectedDownloads.size === 0 ? [...urls.keys()] : [...selectedDownloads];
    for (const i of indices) await handleDownload(urls[i], `${doc.documentNumber}-file${i + 1}`);
    setDownloadPicker(null);
  };

  const currentUserId: string = (() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "{}")._id ?? ""; }
    catch { return ""; }
  })();

  useEffect(() => {
    if (currentUserId) fetchDocuments();
  }, []); // eslint-disable-line

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/v1/member/documents/get-documents-by-user/${currentUserId}`);
      const list = Array.isArray(data) ? data : (data?.data ?? data?.documents ?? data?.result ?? []);
      setDocuments(list);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date) return;
    if (!addFiles.length) { toast.error("Please select at least one file"); return; }
    if (!currentUserId) { toast.error("User ID not found. Please log in again."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ ...addForm, userId: currentUserId, version: 1 }).forEach(([k, v]) => fd.append(k, String(v)));
      addFiles.forEach(f => fd.append("files", f));
      const { data } = await api.post("/api/v1/member/documents/create-document", fd);
      const created = data?.data ?? data?.document ?? data;
      setDocuments(prev => [...prev, created]);
      toast.success("Document added successfully");
      setAddModal(false);
      setAddForm(EMPTY_FORM);
      setAddFiles([]);
    } catch {
      toast.error("Failed to add document");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.documentId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/member/documents/delete-document/${deleteConfirmation.documentId}?userId=${currentUserId}`);
      setDocuments(prev => prev.filter(d => d._id !== deleteConfirmation.documentId));
      toast.success("Document deleted successfully");
      setDeleteConfirmation({ show: false, documentId: null, documentName: "" });
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const filterOptions = ["All Documents", "Invoice", "Tax Invoice", "Receipt", "Certificates"];

  const filteredDocuments = filter === "All Documents"
    ? documents
    : documents.filter(doc => doc.category === filter);

  const stats = [
    { label: "Total Documents", value: documents.length, color: "#1F7A4D", bg: "#D1FAE5" },
    { label: "Invoices", value: documents.filter(d => d.category === "Invoice").length, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Receipts", value: documents.filter(d => d.category === "Receipt").length, color: "#1F7A4D", bg: "#D1FAE5" },
    { label: "Certificates", value: documents.filter(d => d.category === "Certificates").length, color: "#F59E0B", bg: "#FEF3C7" },
  ];

  const tagColor = (category: string) => {
    switch (category) {
      case "Invoice": return "bg-[#E0E7FF] text-[#6366F1]";
      case "Tax Invoice": return "bg-[#DBEAFE] text-[#2563EB]";
      case "Certificates": return "bg-[#FEF3C7] text-[#F59E0B]";
      case "Receipt": return "bg-[#D1FAE5] text-[#1F7A4D]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-[22.75px] font-bold text-[#242424]">Documents</h1>
        <p className="text-[15.17px] text-[#6A7282]">Access your invoices, receipts, and membership certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-5 flex justify-between">
            <div>
              <p className="text-[13.27px] text-[#6A7282]">{s.label}</p>
              <p className="text-[28.44px] font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
            <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <FileText size={22} style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div className="flex items-center gap-3 relative">
        <button onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="flex items-center gap-2 border-[0.76px] border-[#E5E7EB] px-4 py-2 rounded-lg text-sm text-[#242424] hover:bg-[#F9FAFB]">
          <Filter size={16} /> {filter}
        </button>
        <button onClick={openAddModal}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium text-sm shrink-0">
          <Plus className="w-4 h-4" /> Add Document
        </button>
        {showFilterMenu && (
          <div className="absolute top-full mt-2 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 min-w-50">
            {filterOptions.map((option) => (
              <button key={option} onClick={() => { setFilter(option); setShowFilterMenu(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] first:rounded-t-lg last:rounded-b-lg ${filter === option ? "bg-[#ECFDF5] text-[#1F7A4D] font-medium" : "text-[#242424]"}`}>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F7A4D] mx-auto" />
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6A7282]">No documents found</td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <span className={`text-[11.38px] px-2.5 py-1 rounded-md ${tagColor(doc.category)}`}>{doc.type}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[13.27px] text-[#242424]">{doc.membershipId}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const count = doc.fileUrls?.length ?? 0;
                        return count > 1 ? (
                          <span className="flex items-center gap-1 text-xs bg-[#ECFDF5] text-[#1F7A4D] px-2.5 py-1 rounded-md w-fit">
                            <Layers size={14} /> {count} Documents
                          </span>
                        ) : (
                          <span className="text-[#6A7282] text-sm">1 Document</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[13.27px] text-[#242424]">{doc.documentNumber}</p>
                      <p className="text-xs text-[#6A7282]">{doc.description}</p>
                    </td>
                    <td className="px-6 py-4 text-[13.27px] text-[#6A7282]">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(doc.date).toDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewDoc(doc)} className="p-2 rounded-md hover:bg-[#ECFDF5] text-[#1F7A4D] cursor-pointer" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => triggerDownload(doc)}
                          disabled={!doc.fileUrls?.length}
                          className="p-2 rounded-md hover:bg-[#ECFDF5] text-[#1F7A4D] disabled:opacity-40 cursor-pointer" title="Download">
                          <Download size={16} />
                        </button>
                        {doc.membershipId === currentUserId && (
                          <button onClick={() => setDeleteConfirmation({ show: true, documentId: doc._id, documentName: doc.documentNumber })}
                            className="p-2 rounded-md hover:bg-red-50 text-[#FB2C36] cursor-pointer" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-linear-to-b from-[#ECFDF5] to-[#FFFFFF] border border-[#A7F3D0] rounded-xl p-6 flex gap-4">
        <div className="w-12 h-12 bg-[#1F7A4D] rounded-lg flex items-center justify-center shrink-0">
          <FileText className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#242424]">Automated Document Generation</h3>
          <p className="text-sm text-[#6A7282] mt-1 max-w-3xl">
            All documents including invoices, tax invoices, receipts, and membership certificates are automatically generated and stored securely. You can view and download them anytime from this portal.
          </p>
        </div>
      </div>

      <p className="text-sm text-[#6A7282]">Showing {filteredDocuments.length} of {documents.length} documents</p>

      {/* Add Document Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#242424]">Add Document</h3>
              <button onClick={() => { setAddModal(false); setAddForm(EMPTY_FORM); setAddFiles([]); }}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Document Type <span className="text-[#FB2C36]">*</span></label>
                  <input type="text" value={addForm.type} onChange={e => setAddForm({ ...addForm, type: e.target.value })}
                    placeholder="e.g. Tax Invoice"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Document Number <span className="text-[#FB2C36]">*</span></label>
                  <input type="text" value={addForm.documentNumber} onChange={e => setAddForm({ ...addForm, documentNumber: e.target.value })}
                    placeholder="e.g. DOC-2026-001"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Category</label>
                  <select value={addForm.category} onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] bg-white">
                    <option value="Invoice">Invoice</option>
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Receipt">Receipt</option>
                    <option value="Certificates">Certificates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Date <span className="text-[#FB2C36]">*</span></label>
                  <input type="date" value={addForm.date} onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                    onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Amount</label>
                <input type="text" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: e.target.value })}
                  placeholder="e.g. ₹1,50,000"
                  className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Description</label>
                <input type="text" value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Brief description of the document"
                  className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Files <span className="text-[#FB2C36]">*</span></label>
                <input type="file" multiple onChange={e => setAddFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#ecfdf5] file:text-[#1F7A4D] cursor-pointer" />
                {addFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {addFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs text-[#6a7282]">
                        <FileText className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                        <span className="truncate">{f.name}</span>
                        <button onClick={() => setAddFiles(prev => prev.filter((_, j) => j !== i))} className="ml-auto cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setAddModal(false); setAddForm(EMPTY_FORM); setAddFiles([]); }}
                className="flex-1 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddDocument}
                disabled={saving || !addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date || !addFiles.length}
                className="flex-1 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Add Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#242424]">Document Details</h3>
              <button onClick={() => setViewDoc(null)} className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>
            <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#e5e7eb]">
                  {([
                    ["Document Number", viewDoc.documentNumber],
                    ["Type", viewDoc.type],
                    ["Category", viewDoc.category],
                    ["Membership ID", viewDoc.membershipId],
                    ["Date", new Date(viewDoc.date).toDateString()],
                    ["Amount", viewDoc.amount || "-"],
                    ["Version", viewDoc.version ?? 1],
                    ["Description", viewDoc.description || "-"],
                  ] as [string, string | number][]).map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-4 py-3 font-medium text-[#6a7282] bg-[#f9fafb] w-40">{label}</td>
                      <td className="px-4 py-3 text-[#242424]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {viewDoc.fileUrls && viewDoc.fileUrls.length > 0 && (
              <div className="mt-5 space-y-2">
                {viewDoc.fileUrls.map((url, i) => (
                  <div key={i} className="flex gap-3">
                    <a href={`${BASE_URL}${url}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 inline-flex items-center justify-center gap-2 border border-[#1F7A4D] text-[#1F7A4D] rounded-lg text-sm font-medium hover:bg-[#ecfdf5] transition-colors cursor-pointer">
                      <Eye className="w-4 h-4" /> View {viewDoc.fileUrls!.length > 1 ? `Document ${i + 1}` : "Document"}
                    </a>
                    <button onClick={() => handleDownload(url, `${viewDoc.documentNumber}-${i + 1}`)}
                      className="flex-1 py-2 inline-flex items-center justify-center gap-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Picker Modal */}
      {downloadPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-[#242424]">Select Files to Download</h3>
              <button onClick={() => setDownloadPicker(null)} className="p-1.5 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-[#6a7282]" />
              </button>
            </div>
            <p className="text-xs text-[#6a7282] mb-3">{downloadPicker.doc.documentNumber} — {downloadPicker.doc.fileUrls?.length} files</p>

            <label className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] cursor-pointer">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                selectedDownloads.size === downloadPicker.doc.fileUrls?.length ? "bg-[#1F7A4D] border-[#1F7A4D]" : "bg-white border-[#d1d5db]"
              }`}>
                {selectedDownloads.size === downloadPicker.doc.fileUrls?.length && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only"
                checked={selectedDownloads.size === downloadPicker.doc.fileUrls?.length}
                onChange={(e) => setSelectedDownloads(e.target.checked
                  ? new Set(downloadPicker.doc.fileUrls?.map((_, i) => i))
                  : new Set()
                )} />
              <span className="text-sm font-medium text-[#242424]">Select All</span>
            </label>

            <div className="space-y-2 mb-4">
              {downloadPicker.doc.fileUrls?.map((url, i) => (
                <label key={i} className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDownloads.has(i) ? "bg-[#ecfdf5] border-[#1F7A4D]" : "border-[#e5e7eb] hover:bg-[#f9fafb]"
                }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedDownloads.has(i) ? "bg-[#1F7A4D] border-[#1F7A4D]" : "bg-white border-[#d1d5db]"
                  }`}>
                    {selectedDownloads.has(i) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" className="sr-only"
                    checked={selectedDownloads.has(i)}
                    onChange={(e) => setSelectedDownloads(prev => {
                      const next = new Set(prev);
                      e.target.checked ? next.add(i) : next.delete(i);
                      return next;
                    })} />
                  <div className="w-8 h-8 bg-[#d0fae5] rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#1F7A4D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#242424] truncate">{url.split("/").pop()}</p>
                    <p className="text-xs text-[#6a7282]">Document {i + 1}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setDownloadPicker(null)}
                className="flex-1 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer hover:bg-[#f9fafb]">
                Cancel
              </button>
              <button
                onClick={() => handleDownloadSelected(downloadPicker.doc)}
                disabled={selectedDownloads.size === 0}
                className="flex-1 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#176939] disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {selectedDownloads.size === 0 ? "Select files" : `Download ${selectedDownloads.size === downloadPicker.doc.fileUrls?.length ? "All" : selectedDownloads.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#242424] mb-2">Delete Document</h3>
                <p className="text-sm text-[#6a7282] mb-4">
                  Are you sure you want to delete <strong>{deleteConfirmation.documentName}</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setDeleteConfirmation({ show: false, documentId: null, documentName: "" })}
                    disabled={deleting}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} disabled={deleting}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
