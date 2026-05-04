"use client";

import { useState, useEffect } from "react";
import { TableRowsSkeleton } from "./ui/Shimmer";
import {
  FileText, Download, Eye, Calendar, Filter,
  Trash2, Upload, X, Edit, Plus, Layers, Loader2, Search,
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { generateDocumentNumber, generateMembershipId } from "../utils/membershipId";

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
const fileHref = (fileUrl?: string) => fileUrl ? `${BASE_URL}${fileUrl}` : null;

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

const EMPTY_FORM = { type: "", documentNumber: "", description: "", date: "", amount: "", category: "Invoice", membershipId: "" };

const toFormData = (form: typeof EMPTY_FORM, files: File[], version = 1) => {
  const fd = new FormData();
  Object.entries({ ...form, version }).forEach(([k, v]) => fd.append(k, String(v)));
  files.forEach(f => fd.append("files", f));
  return fd;
};

export default function MyDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; documentId: string | null; documentName: string }>
    ({ show: false, documentId: null, documentName: "" });
  const [deleting, setDeleting] = useState(false);

  const [documentDrawer, setDocumentDrawer] = useState<{ show: boolean; membershipId: string; category: string; documents: Document[] }>
    ({ show: false, membershipId: "", category: "", documents: [] });

  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addFiles, setAddFiles] = useState<File[]>([]);

  const openAddModal = async () => {
    const autoDocNum = generateDocumentNumber(documents.map(d => d.documentNumber));
    let autoMembershipId = "";
    try {
      const { data } = await api.get("/api/v1/members/get-members");
      const members = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      autoMembershipId = generateMembershipId(members.map((m: any) => m.membershipId).filter(Boolean));
    } catch { /* leave empty */ }
    setAddForm({ ...EMPTY_FORM, documentNumber: autoDocNum, membershipId: autoMembershipId });
    setAddFiles([]);
    setAddModal(true);
  };
  const [saving, setSaving] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Document | null>(null);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [updating, setUpdating] = useState(false);
  const [downloadPicker, setDownloadPicker] = useState<{ doc: Document } | null>(null);
  const [selectedDownloads, setSelectedDownloads] = useState<Set<number>>(new Set());

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

  // GET
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/admin/documents/get-documents");
      const list = Array.isArray(data) ? data : (data?.data ?? data?.documents ?? data?.result ?? []);
      setDocuments(list);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleAddDocument = async () => {
    if (!addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date) return;
    if (!addFiles.length) { toast.error("Please select at least one file"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/api/v1/admin/documents/create-document", toFormData(addForm, addFiles), {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  // UPDATE
  const handleUpdateDocument = async () => {
    if (!editForm) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (k !== "_id" && k !== "fileUrls" && v !== undefined) fd.append(k, String(v));
      });
      editFiles.forEach(f => fd.append("files", f));
      const { data } = await api.put(
        `/api/v1/admin/documents/update-document/${editForm._id}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updated = data?.data ?? data?.document ?? data;
      setDocuments(prev => prev.map(d => d._id === updated._id ? updated : d));
      toast.success("Document updated successfully");
      setEditModal(false);
      setEditForm(null);
      setEditFiles([]);
    } catch {
      toast.error("Failed to update document");
    } finally {
      setUpdating(false);
    }
  };

  // DELETE
  const confirmDelete = async () => {
    if (!deleteConfirmation.documentId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/documents/delete-document/${deleteConfirmation.documentId}`);
      setDocuments(prev => prev.filter(d => d._id !== deleteConfirmation.documentId));
      toast.success("Document deleted successfully");
      setDeleteConfirmation({ show: false, documentId: null, documentName: "" });
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      doc.type.toLowerCase().includes(q) ||
      doc.documentNumber.toLowerCase().includes(q) ||
      doc.membershipId.toLowerCase().includes(q) ||
      doc.description?.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const key = `${doc.membershipId}-${doc.category}`;
    acc[key] = acc[key] || [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Invoice": return { bg: "#e0e7ff", text: "#6366f1" };
      case "Receipt": return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Tax Invoice": return { bg: "#dbeafe", text: "#155DFC" };
      case "Certificates": return { bg: "#fef3c7", text: "#f59e0b" };
      default: return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const openEditModal = (doc: Document) => {
    const normalized = doc.date ? new Date(doc.date).toISOString().split("T")[0] : "";
    setEditForm({ ...doc, date: normalized });
    setEditFiles([]);
    setEditModal(true);
  };
  const openViewModal = (doc: Document) => setViewDoc(doc);
  const openDocumentDrawer = (membershipId: string, category: string) => {
    const docs = documents.filter(d => d.membershipId === membershipId && d.category === category);
    setDocumentDrawer({ show: true, membershipId, category, documents: docs });
  };

  const formFields = (form: typeof EMPTY_FORM, setForm: (f: typeof EMPTY_FORM) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Document Type <span className="text-[#FB2C36]">*</span></label>
          <input type="text" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            placeholder="e.g. Tax Invoice"
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Document Number <span className="text-[#FB2C36]">*</span></label>
          <input type="text" value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })}
            placeholder="e.g. TAX-2026-007"
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] bg-white">
            <option value="Invoice">Invoice</option>
            <option value="Tax Invoice">Tax Invoice</option>
            <option value="Receipt">Receipt</option>
            <option value="Certificates">Certificates</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Membership ID</label>
          <input type="text" value={form.membershipId} onChange={e => setForm({ ...form, membershipId: e.target.value })}
            placeholder="e.g. MEM-2026-001"
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Date <span className="text-[#FB2C36]">*</span></label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            onClick={e => (e.target as HTMLInputElement).showPicker?.()}
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Amount</label>
          <input type="text" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. ₹1,50,000"
            className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#242424] mb-1">Description</label>
        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the document"
          className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Documents</h1>
        <p className="text-[#6a7282] mt-1">Access your invoices, receipts, and membership certificates</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by type, number, membership ID…"
            className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none text-sm focus:border-[#1F7A4D] bg-white">
            <option value="all">All Categories</option>
            <option value="Invoice">Invoices</option>
            <option value="Tax Invoice">Tax Invoices</option>
            <option value="Receipt">Receipts</option>
            <option value="Certificates">Certificates</option>
          </select>
        </div>
        <button onClick={openAddModal}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer shrink-0">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Document Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Membership ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Count</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Latest Document</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#242424]">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#242424]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {loading ? (
                  <TableRowsSkeleton rows={5} cols={6} />
                ) : Object.keys(groupedDocuments).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6a7282]">No documents found</td>
                  </tr>
                ) : (
                  Object.entries(groupedDocuments).map(([key, docs]) => {
                    const categoryColor = getCategoryColor(docs[0].category);
                    const latestDoc = docs[docs.length - 1];
                    return (
                      <tr key={key} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}>
                            {docs[0].type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-[#242424] font-medium">{docs[0].membershipId}</span>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const totalFiles = docs.reduce((sum, d) => sum + (d.fileUrls?.length ?? 0), 0);
                            return totalFiles > 1 ? (
                              <button onClick={() => openDocumentDrawer(docs[0].membershipId, docs[0].category)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#ecfdf5] text-[#1F7A4D] hover:bg-[#d0fae5] transition-colors">
                                <Layers className="w-3.5 h-3.5" />{totalFiles} Documents
                              </button>
                            ) : (
                              <span className="text-sm text-[#6a7282]">1 Document</span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-[#242424] font-medium block">{latestDoc.documentNumber}</span>
                          <span className="text-xs text-[#6a7282]">{latestDoc.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(latestDoc.date).toDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openViewModal(latestDoc)}
                              className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => triggerDownload(latestDoc)}
                              className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer disabled:opacity-40"
                              disabled={!latestDoc.fileUrls?.length} title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal(latestDoc)}
                              className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmation({ show: true, documentId: latestDoc._id, documentName: latestDoc.documentNumber })}
                              className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#242424]">Document Details</h3>
              <button onClick={() => setViewDoc(null)} className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>
            <div className="space-y-2">
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
                <div key={label} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                  <span className="text-xs font-medium text-[#6a7282] w-32 shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-[#242424] break-all">{value}</span>
                </div>
              ))}
            </div>
            {viewDoc.fileUrls && viewDoc.fileUrls.length > 0 && (
              <div className="mt-5 space-y-2">
                {viewDoc.fileUrls.map((url, i) => (
                  <div key={i} className="flex gap-3">
                    <a href={fileHref(url)!} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 inline-flex items-center justify-center gap-2 border border-[#1F7A4D] text-[#1F7A4D] rounded-lg text-sm font-medium hover:bg-[#ecfdf5] transition-colors cursor-pointer">
                      <Eye className="w-4 h-4" /> View File {viewDoc.fileUrls!.length > 1 ? i + 1 : ""}
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

      {/* Results Count */}
      <div className="text-sm text-[#6a7282]">
        Showing {Object.keys(groupedDocuments).length} document groups ({filteredDocuments.length} total documents)
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
            {formFields(addForm, setAddForm)}
            <div className="mt-4">
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
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setAddModal(false); setAddForm(EMPTY_FORM); setAddFiles([]); }}
                className="flex-1 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddDocument}
                disabled={saving || !addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date || !addFiles.length}
                className="flex-1 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editModal && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#242424]">Edit Document</h3>
              <button onClick={() => { setEditModal(false); setEditForm(null); setEditFiles([]); }}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>
            {formFields(
              editForm,
              (f) => setEditForm(prev => prev ? { ...prev, ...f } : prev)
            )}
            {/* File update */}
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-[#242424]">Replace Files <span className="text-[#6a7282] font-normal">(optional)</span></label>
              {editForm.fileUrls && editForm.fileUrls.length > 0 && !editFiles.length && (
                <div className="space-y-1">
                  {editForm.fileUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#6a7282]">
                      <FileText className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                      <span className="truncate">File {i + 1}</span>
                      <a href={fileHref(url)!} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-[#1F7A4D] hover:underline text-xs shrink-0">View</a>
                    </div>
                  ))}
                </div>
              )}
              {editFiles.length > 0 && (
                <div className="space-y-1">
                  {editFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#ecfdf5] border border-[#bbf7d0] rounded-lg text-sm">
                      <FileText className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                      <span className="truncate text-[#1F7A4D]">{f.name}</span>
                      <button onClick={() => setEditFiles(prev => prev.filter((_, j) => j !== i))} className="ml-auto cursor-pointer shrink-0"><X className="w-4 h-4 text-[#6a7282]" /></button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" multiple onChange={e => setEditFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#ecfdf5] file:text-[#1F7A4D] cursor-pointer" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setEditModal(false); setEditForm(null); setEditFiles([]); }}
                className="flex-1 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleUpdateDocument}
                disabled={updating || !editForm.type.trim() || !editForm.documentNumber.trim() || !editForm.date}
                className="flex-1 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Drawer */}
      {documentDrawer.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end">
          <div className="bg-white w-150 h-[80vh] sm:h-[90vh] sm:rounded-l-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div>
                <h3 className="text-lg font-semibold text-[#242424]">{documentDrawer.category}</h3>
                <p className="text-sm text-[#6a7282] mt-0.5">
                  {documentDrawer.membershipId} • {documentDrawer.documents.length} document(s)
                </p>
              </div>
              <button onClick={() => setDocumentDrawer({ show: false, membershipId: "", category: "", documents: [] })}
                className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {documentDrawer.documents.map((doc) => {
                const categoryColor = getCategoryColor(doc.category);
                return (
                  <div key={doc.id} className="border border-[#e5e7eb] rounded-lg p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}>
                            {doc.type}
                          </span>
                          {doc.version && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f3f4f6] text-[#6a7282]">
                              V{doc.version}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm font-medium text-[#242424]">{doc.documentNumber}</p>
                        <p className="text-xs text-[#6a7282] mt-1">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#e5e7eb]">
                      <div className="flex items-center gap-2 text-xs text-[#6a7282]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(doc.date).toLocaleDateString()}</span>
                        {doc.amount !== "-" && <><span>•</span><span className="font-semibold text-[#242424]">{doc.amount}</span></>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openViewModal(doc)}
                          className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => triggerDownload(doc)}
                          className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors disabled:opacity-40"
                          disabled={!doc.fileUrls?.length} title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => { openEditModal(doc); setDocumentDrawer(prev => ({ ...prev, show: false })); }}
                          className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setDeleteConfirmation({ show: true, documentId: doc._id, documentName: doc.documentNumber }); setDocumentDrawer(prev => ({ ...prev, show: false })); }}
                          className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <button onClick={() => { setDocumentDrawer(prev => ({ ...prev, show: false })); openAddModal(); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium">
                <Upload className="w-4 h-4" /> Upload New Document
              </button>
            </div>
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
            <p className="text-xs text-[#6a7282] mb-3">{downloadPicker.doc.documentNumber} — {downloadPicker.doc.fileUrls?.length} Documents</p>

            {/* Select All */}
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
                    <p className="text-xs text-[#6a7282]">File {i + 1}</p>
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
    </div>
  );
}
