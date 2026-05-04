const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "").replace(/\/api.*$/, "").replace(/\/$/, "");

export function imgUrl(src: string, type: "upload" | "avatar" | "ticket" = "upload"): string {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/")) return `${BASE_URL}${src}`;
    const folder = type === "avatar" ? "uploads/avatars" : type === "ticket" ? "uploads/tickets" : "uploads";
    return `${BASE_URL}/${folder}/${src}`;
}
