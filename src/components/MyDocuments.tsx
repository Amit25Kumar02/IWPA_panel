"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  Trash2,
  Upload,
  X,
  Edit,
  Plus,
  Layers,
} from "lucide-react";

interface Document {
  id: number;
  type: string;
  documentNumber: string;
  description: string;
  date: string;
  amount: string;
  category: string;
  membershipId: string;
  version?: number;
}

export default function MyDocuments() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    documentId: number | null;
    documentName: string;
  }>({ show: false, documentId: null, documentName: "" });
  const [documentDrawer, setDocumentDrawer] = useState<{
    show: boolean;
    membershipId: string;
    category: string;
    documents: Document[];
  }>({ show: false, membershipId: "", category: "", documents: [] });
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      type: "Proforma Invoice",
      documentNumber: "PI-2026-001",
      description: "Proforma Invoice FY 2026-27",
      date: "2026-01-14",
      amount: "₹1,50,000",
      category: "Invoice",
      membershipId: "MEM-2026-001",
      version: 1,
    },
    {
      id: 2,
      type: "Proforma Invoice",
      documentNumber: "PI-2026-001-V2",
      description: "Proforma Invoice FY 2026-27 (Revised)",
      date: "2026-01-15",
      amount: "₹1,50,000",
      category: "Invoice",
      membershipId: "MEM-2026-001",
      version: 2,
    },
    {
      id: 3,
      type: "Tax Invoice",
      documentNumber: "TAX-2026-001",
      description: "Tax Invoice with GST Details",
      date: "2026-01-15",
      amount: "₹1,50,000",
      category: "Tax Invoice",
      membershipId: "MEM-2026-001",
    },
    {
      id: 4,
      type: "Tax Invoice",
      documentNumber: "TAX-2026-001-V2",
      description: "Tax Invoice with GST Details (Amended)",
      date: "2026-01-16",
      amount: "₹1,50,000",
      category: "Tax Invoice",
      membershipId: "MEM-2026-001",
      version: 2,
    },
    {
      id: 5,
      type: "Membership Certificate",
      documentNumber: "CERT-2026-001",
      description: "IWPA Membership Certificate 2026-27",
      date: "2026-01-17",
      amount: "-",
      category: "Certificates",
      membershipId: "MEM-2026-001",
    },
    {
      id: 6,
      type: "Receipt",
      documentNumber: "REC-2026-001",
      description: "Payment Receipt for Annual Membership",
      date: "2026-01-16",
      amount: "₹1,50,000",
      category: "Receipt",
      membershipId: "MEM-2026-001",
    }
  ]);

  const filteredDocuments = documents.filter((doc) => {
    return categoryFilter === "all" || doc.category === categoryFilter;
  });

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const key = `${doc.membershipId}-${doc.category}`;
    acc[key] = acc[key] || [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Invoice":
        return { bg: "#e0e7ff", text: "#6366f1" };
      case "Receipt":
        return { bg: "#d0fae5", text: "#1F7A4D" };
      case "Tax Invoice":
        return { bg: "#dbeafe", text: "#155DFC" };
      case "Certificates":
        return { bg: "#fef3c7", text: "#f59e0b" };
      default:
        return { bg: "#f3f4f6", text: "#6a7282" };
    }
  };

  const documentStats = [
    { label: "Total Documents", value: documents.length, icon: FileText, color: "#1F7A4D", bgColor: "#d0fae5" },
    { label: "Invoices", value: documents.filter(d => d.category === "Invoice").length, icon: FileText, color: "#155DFC", bgColor: "#DBEAFE" },
    { label: "Receipts", value: documents.filter(d => d.category === "Receipt").length, icon: FileText, color: "#1F7A4D", bgColor: "#d0fae5" },
    { label: "Certificates", value: documents.filter(d => d.category === "Certificates").length, icon: FileText, color: "#F59E0B", bgColor: "#FEF3C7" },
  ];

  const handleDelete = (documentId: number, documentName: string) => {
    setDeleteConfirmation({ show: true, documentId, documentName });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.documentId) {
      setDocuments(documents.filter(d => d.id !== deleteConfirmation.documentId));
    }
    setDeleteConfirmation({ show: false, documentId: null, documentName: "" });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, documentId: null, documentName: "" });
  };

  const openDocumentDrawer = (membershipId: string, category: string) => {
    const docs = documents.filter(d => d.membershipId === membershipId && d.category === category);
    setDocumentDrawer({ show: true, membershipId, category, documents: docs });
  };

  const closeDocumentDrawer = () => {
    setDocumentDrawer({ show: false, membershipId: "", category: "", documents: [] });
  };

  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ type: "", documentNumber: "", description: "", date: "", amount: "", category: "Invoice", membershipId: "" });

  const handleAddDocument = () => {
    if (!addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date) return;
    setDocuments(prev => [...prev, { id: Date.now(), ...addForm, version: 1 }]);
    setAddModal(false);
    setAddForm({ type: "", documentNumber: "", description: "", date: "", amount: "", category: "Invoice", membershipId: "" });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">My Documents</h1>
        <p className="text-[#6a7282] mt-1">
          Access your invoices, receipts, and membership certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {documentStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6a7282]">{stat.label}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="relative w-61">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none appearance-none"
          >
            <option value="all">All Documents</option>
            <option value="Proforma Invoice">Proforma Invoices</option>
            <option value="Tax Invoice">Tax Invoices</option>
            <option value="Receipt">Receipts</option>
            <option value="Certificate">Certificates</option>
          </select>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-[#ffffff] rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Document List - Grouped by Category */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-[#ffffff] rounded-lg border border-[#e5e7eb] overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b-[0.76px] border-[#e5e7eb]">
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
                {Object.entries(groupedDocuments).map(([key, docs]) => {
                  const categoryColor = getCategoryColor(docs[0].category);
                  const latestDoc = docs[docs.length - 1];
                  const docCount = docs.length;

                  return (
                    <tr key={key} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: categoryColor.bg,
                            color: categoryColor.text,
                          }}
                        >
                          {docs[0].type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-[#242424] font-medium">
                          {docs[0].membershipId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {docCount > 1 ? (
                            <button
                              onClick={() => openDocumentDrawer(docs[0].membershipId, docs[0].category)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#ecfdf5] text-[#1F7A4D] hover:bg-[#d0fae5] transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>{docCount} Documents</span>
                            </button>
                          ) : (
                            <span className="text-sm text-[#6a7282]">1 Document</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-mono text-sm text-[#242424] font-medium block">
                            {latestDoc.documentNumber}
                          </span>
                          <span className="text-xs text-[#6a7282]">{latestDoc.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(latestDoc.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* {docCount > 1 ? (
                            <button
                              onClick={() => openDocumentDrawer(docs[0].membershipId, docs[0].category)}
                              className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : ( */}
                            <>
                              <button className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-[#ecfdf5] rounded-lg text-[#1F7A4D] transition-colors cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(latestDoc.id, latestDoc.documentNumber)}
                                className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          {/* )} */}
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

      {/* Info Card */}
      {/* <div className="bg-linear-to-br from-[#ecfdf5] to-[#ffffff] rounded-lg border border-[#a4f4cf] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#1F7A4D] rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-[#ffffff]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#242424] mb-2">
              Automated Document Generation
            </h3>
            <p className="text-sm text-[#6a7282]">
              All documents including proforma invoices, tax invoices, receipts, and membership
              certificates are automatically generated and stored securely. You can view, download,
              edit, or manage multiple versions anytime from this portal.
            </p>
          </div>
        </div>
      </div> */}

      {/* Results Count */}
      <div className="text-sm text-[#6a7282]">
        Showing {Object.keys(groupedDocuments).length} document groups (
        {filteredDocuments.length} total documents)
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
                  Are you sure you want to delete document{" "}
                  <strong>{deleteConfirmation.documentName}</strong>? This action will archive the
                  document and it can be recovered by administrators if needed.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg  transition-colors font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#242424]">Add Document</h3>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Document Type <span className="text-[#FB2C36]">*</span></label>
                  <input type="text" value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                    placeholder="e.g. Tax Invoice"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Document Number <span className="text-[#FB2C36]">*</span></label>
                  <input type="text" value={addForm.documentNumber} onChange={e => setAddForm(f => ({ ...f, documentNumber: e.target.value }))}
                    placeholder="e.g. TAX-2026-007"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Category</label>
                  <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] bg-white">
                    <option value="Invoice">Invoice</option>
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Receipt">Receipt</option>
                    <option value="Certificates">Certificates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Membership ID</label>
                  <input type="text" value={addForm.membershipId} onChange={e => setAddForm(f => ({ ...f, membershipId: e.target.value }))}
                    placeholder="e.g. MEM-2026-001"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Date <span className="text-[#FB2C36]">*</span></label>
                  <input type="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Amount</label>
                  <input type="text" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. ₹1,50,000"
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Description</label>
                <input type="text" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the document"
                  className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddDocument} disabled={!addForm.type.trim() || !addForm.documentNumber.trim() || !addForm.date}
                className="flex-1 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Drawer */}
      {documentDrawer.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end">
          <div className="bg-[#ffffff] w-150 h-[80vh] sm:h-[90vh] sm:rounded-l-lg shadow-xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div>
                <h3 className="text-lg font-semibold text-[#242424]">{documentDrawer.category}</h3>
                <p className="text-sm text-[#6a7282] mt-0.5">
                  {documentDrawer.membershipId} • {documentDrawer.documents.length} document(s)
                </p>
              </div>
              <button
                onClick={closeDocumentDrawer}
                className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {documentDrawer.documents.map((doc) => {
                const categoryColor = getCategoryColor(doc.category);
                return (
                  <div
                    key={doc.id}
                    className="border border-[#e5e7eb] rounded-lg p-4 hover:bg-[#f9fafb] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: categoryColor.bg,
                              color: categoryColor.text,
                            }}
                          >
                            {doc.type}
                          </span>
                          {doc.version && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f3f4f6] text-[#6a7282]">
                              V{doc.version}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm font-medium text-[#242424]">
                          {doc.documentNumber}
                        </p>
                        <p className="text-xs text-[#6a7282] mt-1">{doc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#e5e7eb]">
                      <div className="flex items-center gap-2 text-xs text-[#6a7282]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(doc.date).toLocaleDateString()}</span>
                        {doc.amount !== "-" && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-[#242424]">{doc.amount}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-[#ecfdf5] rounded text-[#1F7A4D] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.documentNumber)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <button
                onClick={() => setAddModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}