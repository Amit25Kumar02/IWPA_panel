import { useState, useEffect } from "react";
import { BarChart3, Download, Calendar } from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { StatCardsSkeleton } from "./ui/Shimmer";

const REPORT_TYPES = [
  { value: "membership", label: "Membership Report", desc: "Complete member database with status and details" },
  { value: "subscription", label: "Subscription Status", desc: "Active, expiring, and expired subscriptions" },
  { value: "revenue", label: "Revenue Report", desc: "Advertisement revenue analysis" },
  { value: "state-distribution", label: "State Distribution", desc: "Member count and status by state" },
  { value: "renewal-pending", label: "Renewal Pending", desc: "Members with pending or upcoming renewals" },
];

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "this-year", label: "This Year" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-month", label: "This Month" },
  { value: "last-year", label: "Last Year" },
];

const INDIAN_STATES: string[] = [];

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "");

function colLabel(c: string) {
  return c.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

interface Stats { totalMembers: number; totalAds: number; totalTickets: number; totalEvents: number; totalReports: number; generatedToday: number; expired: number; expiringSoon: number; }
interface ReportData { type: string; columns: string[]; rows: Record<string, string | number>[]; summary?: Record<string, number>; }
interface ReportMeta { date: string; records: number; }

export default function Reporting() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reportType, setReportType] = useState("membership");
  const [stateFilter, setStateFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [reportHistory, setReportHistory] = useState<Record<string, ReportMeta>>({});
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    api.get("/api/v1/reports/stats").then((r) => setStats(r.data.data)).catch(() => {});
    api.get("/api/v1/reports/history").then((r) => setReportHistory(r.data.data)).catch(() => {});
    api.get("/api/v1/reports/states").then((r) => setAvailableStates(r.data.data || [])).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setReportData(null);
    try {
      const r = await api.get("/api/v1/reports/generate", {
        params: { type: reportType, state: stateFilter, period: periodFilter },
      });
      setReportData(r.data);
      await api.post("/api/v1/reports/save", { type: reportType, state: stateFilter, period: periodFilter, recordCount: r.data.rows.length });
      const meta = { date: new Date().toISOString(), records: r.data.rows.length };
      setReportHistory((prev) => ({ ...prev, [reportType]: meta }));
      // refresh stats
      api.get("/api/v1/reports/stats").then((s) => setStats(s.data.data)).catch(() => {});
    } catch { toast.error("Failed to generate report"); }
    finally { setGenerating(false); }
  };

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(format);
    try {
      const url = `${BASE_URL}/api/v1/reports/export/${format}?type=${reportType}&state=${stateFilter}&period=${periodFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${reportType}-report.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error(`Failed to export ${format.toUpperCase()}`); }
    finally { setExporting(null); }
  };

  const statCards = stats ? [
    { label: "Total Reports", value: stats.totalReports, color: "#1F7A4D", bg: "#d0fae5" },
    { label: "Generated Today", value: stats.generatedToday, color: "#155DFC", bg: "#dbeafe" },
    { label: "Scheduled Reports", value: stats.expiringSoon, color: "#a855f7", bg: "#f3e8ff" },
    { label: "Total Records", value: stats.totalMembers >= 1000 ? (stats.totalMembers / 1000).toFixed(1) + "K" : stats.totalMembers, color: "#f59e0b", bg: "#fef3c7" },
  ] : [];

  const statusBadge = (val: string) => {
    const v = String(val);
    if (v === "Active") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#d0fae5] text-[#1F7A4D]">{v}</span>;
    if (v === "Expired") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#fee2e2] text-[#FB2C36]">{v}</span>;
    if (v === "Expiring Soon") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef3c7] text-[#f59e0b]">{v}</span>;
    if (v === "Pending") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f3e8ff] text-[#a855f7]">{v}</span>;
    return <span>{v}</span>;
  };

  const statusCols = new Set(["status", "subscriptionStatus", "renewalStatus"]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-[22.75px] font-bold text-[#242424]">Reporting</h1>
        <p className="text-[15.17px] text-[#6a7282] mt-0.5">Generate membership and subscription reports with filters and export options</p>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-[#6a7282]">{s.label}</p>
                  <p className="text-[28.44px] font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                  <BarChart3 className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <StatCardsSkeleton count={4} />}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 sm:p-6">
        <h2 className="text-[17.06px] font-semibold text-[#242424] mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[13.27px] font-medium text-[#242424] block mb-1.5">Report Type</label>
            <select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData(null); }}
              className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
              {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#242424] block mb-1.5">State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
              <option value="all">All States</option>
              {availableStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#242424] block mb-1.5">Period</label>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-[15.17px] font-medium cursor-pointer hover:bg-[#176939] disabled:opacity-60">
            <BarChart3 className="w-4 h-4" />
            {generating ? "Generating..." : "Generate Report"}
          </button>
          <button onClick={() => handleExport("excel")} disabled={exporting === "excel"}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] rounded-lg text-[15.17px] font-medium cursor-pointer hover:bg-[#f9fafb] disabled:opacity-60">
            <Download className="w-4 h-4" />
            {exporting === "excel" ? "Exporting..." : "Export Excel"}
          </button>
          <button onClick={() => handleExport("pdf")} disabled={exporting === "pdf"}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] rounded-lg text-[15.17px] font-medium cursor-pointer hover:bg-[#f9fafb] disabled:opacity-60">
            <Download className="w-4 h-4 " />
            {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-[17.06px] font-semibold text-[#242424]">Available Reports</h2>
        </div>
        <div className="divide-y divide-[#e5e7eb]">
          {REPORT_TYPES.map((r) => (
            <div key={r.value} className="p-6 hover:bg-[#f9fafb]">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[17.06px] text-[#242424]">{r.label}</h3>
                  <p className="text-[13.27px] text-[#6a7282] mt-1">{r.desc}</p>
                  <div className="flex items-center gap-4 text-[13.27px] text-[#6a7282] mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {reportHistory[r.value]
                        ? <>Last generated: {new Date(reportHistory[r.value].date).toDateString()}</>
                        : "Not generated yet"}
                    </div>
                    {reportHistory[r.value] && <><span>•</span><span>{reportHistory[r.value].records} records</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setReportType(r.value); setTimeout(handleGenerate, 0); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm cursor-pointer hover:bg-[#176939]">
                    <BarChart3 className="w-4 h-4" /> Generate
                  </button>
                  <button
                    onClick={() => { setReportType(r.value); setTimeout(() => handleExport("excel"), 0); }}
                    className="p-2 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb]">
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
