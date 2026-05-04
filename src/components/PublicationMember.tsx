import { useEffect, useState } from "react";
import { BookOpen, Download, FileText } from "lucide-react";
import { MagazineGridSkeleton, CardListSkeleton } from "./ui/Shimmer";
import api from "../utils/api";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "").replace(/\/api.*$/, "").replace(/\/$/, "");

interface Publication {
  _id: string;
  title: string;
  type: "Magazine" | "Document" | "Directory";
  category?: string;
  volume?: string;
  issue?: string;
  year?: string;
  description?: string;
  fileUrl: string;
  coverUrl?: string;
  size?: string;
}

export default function PublicationsMember() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/api/v1/publications/get-all")
      .then((res) => setPubs(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {})
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#242424]">Publications</h1>
        <p className="text-xs sm:text-sm text-[#6a7282]">
          Access WindPro Magazine, Member Directory, and Official Documents
        </p>
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

        {loading ? (
          <MagazineGridSkeleton count={6} />
        ) : magazines.length === 0 ? (
          <p className="text-sm text-[#6a7282]">No magazines available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {magazines.map((mag) => (
              <div key={mag._id} className="relative aspect-2/3 rounded-lg overflow-hidden border border-[#e5e7eb] shadow-md">
                {mag.coverUrl ? (
                  <img src={fileHref(mag.coverUrl)} alt={mag.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-[#1F7A4D] to-[#176939] flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 text-[#ffffff]">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Directory */}
      {(loading || directories.length > 0) && (
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

          {loading ? (
            <CardListSkeleton rows={3} />
          ) : directories.length === 0 ? (
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-[#6a7282]">
              The member directory contains company names and basic information for all IWPA members.
              Individual contact details are not included for privacy reasons.
            </div>
          ) : (
            <div className="space-y-2">
              {directories.map((dir) => (
                <div key={dir._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#242424]">{dir.title}</p>
                    {dir.year && <p className="text-xs text-[#6a7282] mt-0.5">{dir.year} {dir.size ? `• ${dir.size}` : ""}</p>}
                  </div>
                  <button onClick={() => downloadFile(fileHref(dir.fileUrl), `${dir.title}.pdf`)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#155DFC] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0f4ac7] cursor-pointer shrink-0">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
