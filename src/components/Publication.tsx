import { useEffect, useState } from "react";
import { BookOpen, Download, FileText, Plus, X, Trash2, Loader2 } from "lucide-react";
import { MagazineGridSkeleton, CardListSkeleton } from "./ui/Shimmer";
import api from "../utils/api";
import { toast } from "react-toastify";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "").replace(/\/api.*$/, "").replace(/\/$/, "");

const PUB_TYPES = ["Magazine", "Directory"] as const;
type PubType = typeof PUB_TYPES[number];

interface Publication {
  _id: string;
  title: string;
  type: PubType;
  volume?: string;
  issue?: string;
  year?: string;
  description?: string;
  fileUrl: string;
  coverUrl?: string;
  size?: string;
}

interface FormState {
  title: string; type: PubType; category: string;
  volume: string; issue: string; year: string; description: string;
}

const EMPTY: FormState = {
  title: "", type: "Magazine", category: "", volume: "",
  issue: "", year: new Date().getFullYear().toString(), description: "",
};

export default function Publications() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<FormState & { file: string }>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/api/v1/publications/get-all")
      .then((res) => setPubs(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => toast.error("Failed to fetch publications"))
      .finally(() => setLoading(false));
  }, []);

  const magazines = pubs.filter((p) => p.type === "Magazine");
  const directories = pubs.filter((p) => p.type === "Directory");
  const fileHref = (url: string) => `${BASE_URL}${url}`;

  const downloadFile = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const f = (k: keyof FormState, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const handleCreate = async () => {
    const e: Partial<FormState & { file: string }> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!file) e.file = "File is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file!);
      if (cover) fd.append("cover", cover);
      const res = await api.post("/api/v1/publications/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setPubs((prev) => [res.data.data, ...prev]);
      toast.success("Publication created");
      setShowModal(false); setForm(EMPTY); setFile(null); setCover(null); setErrors({});
    } catch { toast.error("Failed to create publication"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/publications/delete/${deleteId}`);
      setPubs((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success("Deleted"); setDeleteId(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#242424]">Publications</h1>
          <p className="text-xs sm:text-sm text-[#6a7282] mt-0.5">Manage WindPro Magazine and Member Directory</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] text-sm font-medium cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          {isMobile ? "Add" : "Add Publication"}
        </button>
      </div>

      {/* WindPro Magazine */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#d0fae5] flex items-center justify-center">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F7A4D]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#242424]">WindPro Magazine</h2>
            <p className="text-xs sm:text-sm text-[#6a7282]">Latest issues and archives</p>
          </div>
        </div>
        {loading ? <MagazineGridSkeleton count={6} />
          : magazines.length === 0 ? <p className="text-sm text-[#6a7282]">No magazines yet.</p>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {magazines.map((mag) => (
                <div key={mag._id} className="group relative aspect-2/3 rounded-lg overflow-hidden border border-[#e5e7eb] shadow-md">
                  {mag.coverUrl ? (
                    <img src={fileHref(mag.coverUrl)} alt={mag.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#1F7A4D] to-[#176939] flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 text-white">
                    <p className="text-[9px] sm:text-[11.38px] font-medium leading-tight truncate">{mag.title}</p>
                    {(mag.volume || mag.issue) && (
                      <p className="text-[9px] sm:text-[11.38px] text-[#ffffff] font-medium mt-0.5 truncate">
                        {mag.volume ? `Vol ${mag.volume}` : ""}{mag.issue ? ` #${mag.issue}` : ""}
                      </p>
                    )}
                    <button onClick={() => downloadFile(fileHref(mag.fileUrl), `${mag.title}.pdf`)}
                      className="mt-0.5 flex items-center gap-0.5 text-[9px] sm:text-[11.38px] text-[#FFFFFFCC] cursor-pointer hover:text-white truncate">
                      <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /><span>Download PDF</span>
                    </button>
                  </div>
                  <button onClick={() => setDeleteId(mag._id)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/40 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Member Directory */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#155DFC]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#242424]">Member Directory</h2>
            <p className="text-xs sm:text-sm text-[#6a7282]">Complete list of Council Members</p>
          </div>
        </div>
        {loading ? <CardListSkeleton rows={3} />
          : directories.length === 0 ? (
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-[#6a7282]">
              No directories uploaded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {directories.map((dir) => (
                <div key={dir._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#242424]">{dir.title}</p>
                    {dir.year && <p className="text-xs text-[#6a7282] mt-0.5">{dir.year}{dir.size ? ` • ${dir.size}` : ""}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => downloadFile(fileHref(dir.fileUrl), `${dir.title}.pdf`)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#155DFC] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0f4ac7] cursor-pointer">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => setDeleteId(dir._id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-[#FB2C36] cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col mx-3 mb-3 sm:mx-0 sm:mb-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] shrink-0">
              <h2 className="text-lg font-bold text-[#242424]">Add Publication</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY); setFile(null); setCover(null); setErrors({}); }}
                className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">Type <span className="text-[#FB2C36]">*</span></label>
                <div className="flex gap-2">
                  {PUB_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => f("type", t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${form.type === t ? "bg-[#1F7A4D] text-white border-[#1F7A4D]" : "border-[#e5e7eb] text-[#6a7282] hover:border-[#1F7A4D]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">Title <span className="text-[#FB2C36]">*</span></label>
                <input type="text" value={form.title} onChange={(e) => f("title", e.target.value)} placeholder="Enter title"
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm ${errors.title ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`} />
                {errors.title && <p className="text-xs text-[#FB2C36] mt-1">{errors.title}</p>}
              </div>
              {form.type === "Magazine" && (
                <div className="grid grid-cols-3 gap-3">
                  {[["Volume", "volume", "e.g. 2026"], ["Issue", "issue", "e.g. 1"], ["Year", "year", ""]].map(([label, key, ph]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-[#242424] mb-1.5">{label}</label>
                      <input type="text" value={form[key as keyof FormState]} onChange={(e) => f(key as keyof FormState, e.target.value)}
                        placeholder={ph} className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
                    </div>
                  ))}
                </div>
              )}
              {form.type === "Directory" && (
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Year</label>
                  <input type="text" value={form.year} onChange={(e) => f("year", e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
                  rows={2} placeholder="Optional" className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">File (PDF) <span className="text-[#FB2C36]">*</span></label>
                <label className={`flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#f9fafb] ${errors.file ? "border-[#FB2C36]" : "border-[#e5e7eb]"}`}>
                  <p className="text-sm text-[#6a7282] px-4 truncate">{file ? file.name : "Click to upload PDF / DOC"}</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={(e) => { setFile(e.target.files?.[0] ?? null); setErrors((p) => ({ ...p, file: "" })); }} />
                </label>
                {errors.file && <p className="text-xs text-[#FB2C36] mt-1">{errors.file}</p>}
              </div>
              {form.type === "Magazine" && (
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1.5">Cover Image <span className="text-[#6a7282] font-normal">(optional)</span></label>
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb]">
                    <p className="text-sm text-[#6a7282] px-4 truncate">{cover ? cover.name : "Click to upload cover image"}</p>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-xl shrink-0">
              <button onClick={() => { setShowModal(false); setForm(EMPTY); setFile(null); setCover(null); setErrors({}); }}
                className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer hover:bg-white">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#176939] disabled:opacity-60 inline-flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Uploading..." : "Add Publication"}
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
                <h3 className="text-base font-semibold text-[#242424] mb-1">Delete Publication</h3>
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
