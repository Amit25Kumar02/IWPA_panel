import { useState, useEffect } from "react";
import { DollarSign, Eye, Download, Plus, X, Loader2, Trash2, Search, Filter } from "lucide-react";
import { StatCardsSkeleton, TableRowsSkeleton } from "./ui/Shimmer";
import api from "../utils/api";
import { toast } from "react-toastify";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "");

const TXN_TYPES = ["Membership", "Advertisement", "Event", "Other"] as const;
const STATUSES = ["Paid", "Pending", "Cancelled"] as const;
const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "this-year", label: "This Year" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-month", label: "This Month" },
  { value: "last-year", label: "Last Year" },
];

interface Transaction {
  _id: string;
  transactionId: string;
  company: string;
  type: string;
  amount: number;
  date: string;
  invoiceNo: string;
  status: string;
  notes?: string;
}

interface Stats {
  totalRevenueYTD: number;
  thisMonthRevenue: number;
  pendingAmount: number;
  totalTransactions: number;
}

interface FormState {
  company: string;
  type: string;
  amount: string;
  date: string;
  status: string;
  notes: string;
}

const EMPTY: FormState = { company: "", type: "Membership", amount: "", date: new Date().toISOString().split("T")[0], status: "Pending", notes: "" };

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusStyle = (s: string) => {
  if (s === "Paid") return { bg: "#d0fae5", text: "#1F7A4D" };
  if (s === "Cancelled") return { bg: "#fee2e2", text: "#FB2C36" };
  return { bg: "#fef3c7", text: "#f59e0b" };
};

export default function Accounting() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTxn, setViewTxn] = useState<Transaction | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchStats = () => api.get("/api/v1/accounting/stats").then((r) => setStats(r.data.data)).catch(() => {});

  const fetchTransactions = () => {
    setLoading(true);
    api.get("/api/v1/accounting/transactions", { params: { type: typeFilter, status: statusFilter, period: periodFilter, search } })
      .then((r) => setTransactions(r.data.data))
      .catch(() => toast.error("Failed to load transactions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchTransactions(); }, [typeFilter, statusFilter, periodFilter, search]);

  const f = (k: keyof FormState, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const handleCreate = async () => {
    const e: Partial<FormState> = {};
    if (!form.company.trim()) e.company = "Required";
    if (!form.amount || isNaN(Number(form.amount))) e.amount = "Valid amount required";
    if (!form.date) e.date = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const r = await api.post("/api/v1/accounting/create", form);
      setTransactions((p) => [r.data.data, ...p]);
      toast.success("Transaction created");
      setShowModal(false); setForm(EMPTY); setErrors({});
      fetchStats();
    } catch { toast.error("Failed to create transaction"); }
    finally { setSaving(false); }
  };

  const handleStatusToggle = async (txn: Transaction) => {
    const next = txn.status === "Pending" ? "Paid" : txn.status === "Paid" ? "Cancelled" : "Pending";
    try {
      const r = await api.patch(`/api/v1/accounting/update/${txn._id}`, { status: next });
      setTransactions((p) => p.map((t) => t._id === txn._id ? r.data.data : t));
      fetchStats();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/accounting/delete/${deleteId}`);
      setTransactions((p) => p.filter((t) => t._id !== deleteId));
      toast.success("Deleted"); setDeleteId(null);
      fetchStats();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleDownloadInvoice = async (txn: Transaction) => {
    setDownloading(txn._id);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/accounting/invoice/${txn._id}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${txn.invoiceNo}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error("Failed to download invoice"); }
    finally { setDownloading(null); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/accounting/export/pdf?type=${typeFilter}&status=${statusFilter}&period=${periodFilter}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "transactions.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error("Failed to export"); }
    finally { setExporting(false); }
  };

  const statCards = stats ? [
    { label: "Total Revenue (YTD)", value: fmt(stats.totalRevenueYTD), color: "#1F7A4D", bg: "#d0fae5" },
    { label: "This Month", value: fmt(stats.thisMonthRevenue), color: "#155DFC", bg: "#dbeafe" },
    { label: "Pending Payments", value: fmt(stats.pendingAmount), color: "#f59e0b", bg: "#fef3c7" },
    { label: "Total Transactions", value: stats.totalTransactions.toLocaleString(), color: "#a855f7", bg: "#f3e8ff" },
  ] : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Accounting</h1>
          <p className="text-[#6a7282] mt-1">Membership-related financial records and transaction history</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] text-sm font-medium cursor-pointer shrink-0">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#6a7282]">{s.label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <DollarSign className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StatCardsSkeleton count={4} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, transaction ID or invoice..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm appearance-none">
            <option value="all">All Types</option>
            {TXN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
          <option value="all">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-4 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button onClick={handleExportPDF} disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] rounded-lg text-sm cursor-pointer hover:bg-[#f9fafb] disabled:opacity-60 shrink-0">
          <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "Export"}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
          <div className="overflow-x-auto">
            {loading ? (
              <TableRowsSkeleton rows={5} cols={8} />
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6a7282]">No transactions found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    {["Transaction ID", "Company", "Type", "Amount", "Date", "Invoice No", "Status", "Actions"].map((h) => (
                      <th key={h} className={`px-6 py-4 text-left text-sm font-medium ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {transactions.map((t) => {
                    const st = statusStyle(t.status);
                    return (
                      <tr key={t._id} className="hover:bg-[#f9fafb]">
                        <td className="px-6 py-4 font-mono text-sm">{t.transactionId}</td>
                        <td className="px-6 py-4 font-medium">{t.company}</td>
                        <td className="px-6 py-4 text-sm text-[#6a7282]">{t.type}</td>
                        <td className="px-6 py-4 font-semibold">{fmt(t.amount)}</td>
                        <td className="px-6 py-4 text-sm text-[#6a7282]">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-mono text-xs text-[#6a7282]">{t.invoiceNo}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleStatusToggle(t)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                            style={{ backgroundColor: st.bg, color: st.text }}>
                            {t.status}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setViewTxn(t)}
                              className="p-2 rounded-lg hover:bg-[#ecfdf5] text-[#1F7A4D] cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDownloadInvoice(t)} disabled={downloading === t._id}
                              className="p-2 rounded-lg hover:bg-[#ecfdf5] text-[#1F7A4D] cursor-pointer disabled:opacity-50">
                              {downloading === t._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setDeleteId(t._id)}
                              className="p-2 rounded-lg hover:bg-[#fee2e2] text-[#FB2C36] cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col mx-3 mb-3 sm:mx-0 sm:mb-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
              <h2 className="text-lg font-bold text-[#242424]">Add Transaction</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY); setErrors({}); }}
                className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">Company <span className="text-[#FB2C36]">*</span></label>
                <input value={form.company} onChange={(e) => f("company", e.target.value)} placeholder="Company name"
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.company ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                {errors.company && <p className="text-xs text-[#FB2C36] mt-1">{errors.company}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => f("type", e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
                    {TXN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => f("status", e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Amount (₹) <span className="text-[#FB2C36]">*</span></label>
                  <input type="number" value={form.amount} onChange={(e) => f("amount", e.target.value)} placeholder="0"
                    className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.amount ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                  {errors.amount && <p className="text-xs text-[#FB2C36] mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Date <span className="text-[#FB2C36]">*</span></label>
                  <input type="date" value={form.date} onChange={(e) => f("date", e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.date ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                  {errors.date && <p className="text-xs text-[#FB2C36] mt-1">{errors.date}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)} rows={2} placeholder="Optional"
                  className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl shrink-0">
              <button onClick={() => { setShowModal(false); setForm(EMPTY); setErrors({}); }}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer hover:bg-white">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#176939] disabled:opacity-60 inline-flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTxn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-lg font-bold text-[#242424]">Transaction Details</h2>
              <button onClick={() => setViewTxn(null)} className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                ["Transaction ID", viewTxn.transactionId],
                ["Invoice No", viewTxn.invoiceNo],
                ["Company", viewTxn.company],
                ["Type", viewTxn.type],
                ["Amount", fmt(viewTxn.amount)],
                ["Date", new Date(viewTxn.date).toLocaleDateString()],
                ["Status", viewTxn.status],
                ...(viewTxn.notes ? [["Notes", viewTxn.notes]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-sm text-[#6a7282]">{label}</span>
                  <span className="text-sm font-medium text-[#242424] text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb]">
              <button onClick={() => { handleDownloadInvoice(viewTxn); setViewTxn(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#176939]">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#242424] mb-1">Delete Transaction</h3>
                <p className="text-sm text-[#6a7282] mb-4">This action cannot be undone.</p>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setDeleteId(null)} disabled={deleting}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {deleting ? "Deleting..." : "Delete"}
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
