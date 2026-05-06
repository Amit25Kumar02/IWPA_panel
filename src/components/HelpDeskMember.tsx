"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Plus, Clock, CheckCircle, AlertCircle,
    ArrowRight, ArrowLeft, Send, Paperclip, X, Loader2,
} from "lucide-react";
import api from "../utils/api";
import { imgUrl } from "../utils/imgUrl";
import socket from "../utils/socket";
import { CardListSkeleton } from "./ui/Shimmer";

interface Message {
    _id: string;
    sender: "user" | "admin";
    text: string;
    attachments: string[];
    createdAt: string;
}
interface Ticket {
    id: string; subject: string; category: string;
    status: "Open" | "In Progress" | "Resolved";
    created: string; updated: string; messages: number;
}
interface TicketDetail {
    ticketId: string; subject: string; category: string;
    status: "Open" | "In Progress" | "Resolved";
    messages: Message[]; createdAt: string;
}

const statusStyle = (s: string) =>
    s === "Resolved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
    s === "In Progress" ? "bg-[#fef3c7] text-[#b45309]" :
    "bg-[#dbeafe] text-[#155DFC]";

const statusIcon = (s: string) =>
    s === "Resolved" ? <CheckCircle className="w-3.5 h-3.5" /> :
    s === "In Progress" ? <Clock className="w-3.5 h-3.5" /> :
    <AlertCircle className="w-3.5 h-3.5" />;

export default function HelpDeskMember() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const currentUserId: string = (() => {
        try { return JSON.parse(localStorage.getItem("user") ?? "{}")._id ?? ""; }
        catch { return ""; }
    })();

    const [form, setForm] = useState({ subject: "", category: "", description: "" });
    const [formFiles, setFormFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const formFileRef = useRef<HTMLInputElement>(null);

    const [replyText, setReplyText] = useState("");
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [replying, setReplying] = useState(false);
    const replyFileRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchTickets(); }, []);
    useEffect(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, [selectedTicket?.messages.length]);

    // real-time: own ticket appears instantly after creation
    useEffect(() => {
        const onNewTicket = (ticket: Ticket) => setTickets(prev => [ticket, ...prev]);
        const onStatus = ({ ticketId, status }: { ticketId: string; status: Ticket["status"] }) => {
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
            setSelectedTicket(t => t && t.ticketId === ticketId ? { ...t, status } : t);
        };
        const onMessageCount = (ticket: TicketDetail) => {
            setTickets(prev => prev.map(t => t.id === ticket.ticketId ? { ...t, messages: ticket.messages.length } : t));
        };
        socket.on("new-ticket", onNewTicket);
        socket.on("status-changed", onStatus);
        socket.on("new-message", onMessageCount);
        return () => {
            socket.off("new-ticket", onNewTicket);
            socket.off("status-changed", onStatus);
            socket.off("new-message", onMessageCount);
        };
    }, []);

    // socket: join/leave ticket room and listen for new messages
    useEffect(() => {
        if (!selectedTicket) return;
        const id = selectedTicket.ticketId;
        socket.emit("join-ticket", id);

        const onMessage = (ticket: TicketDetail) => {
            setSelectedTicket(ticket);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, messages: ticket.messages.length } : t));
        };

        socket.on("new-message", onMessage);

        return () => {
            socket.emit("leave-ticket", id);
            socket.off("new-message", onMessage);
        };
    }, [selectedTicket?.ticketId]);

    async function fetchTickets() {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/v1/tickets/get-tickets-by-user/${currentUserId}`);
            setTickets(Array.isArray(data) ? data : []);
        } catch { setTickets([]); }
        finally { setLoading(false); }
    }

    async function openTicket(id: string) {
        setDetailLoading(true);
        try {
            const { data } = await api.get(`/api/v1/tickets/get-ticket/${id}`);
            setSelectedTicket(data);
            setReplyText(""); setReplyFiles([]);
        } catch { /* ignore */ }
        finally { setDetailLoading(false); }
    }

    async function handleCreate() {
        if (!form.subject.trim() || !form.category || !form.description.trim()) return;
        setSubmitting(true);
        const fd = new FormData();
        fd.append("subject", form.subject);
        fd.append("category", form.category);
        fd.append("description", form.description);
        fd.append("userId", currentUserId);
        formFiles.forEach(f => fd.append("files", f));
        try {
            await api.post("/api/v1/tickets/create-ticket", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setForm({ subject: "", category: "", description: "" });
            setFormFiles([]); setShowNewTicket(false);
            // ticket list updated via socket "new-ticket" event
        } catch { /* ignore */ }
        finally { setSubmitting(false); }
    }

    async function handleReply() {
        if (!replyText.trim() || !selectedTicket) return;
        setReplying(true);
        const fd = new FormData();
        fd.append("text", replyText);
        fd.append("sender", "user");
        replyFiles.forEach(f => fd.append("files", f));
        try {
            await api.post(
                `/api/v1/tickets/add-message/${selectedTicket.ticketId}`,
                fd, { headers: { "Content-Type": "multipart/form-data" } }
            );
            // UI update handled by socket "new-message" event
            setReplyText("");
            setReplyFiles([]);
        } catch { /* ignore */ }
        finally { setReplying(false); }
    }

    /* ── CONVERSATION VIEW ── */
    if (selectedTicket) return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto p-4 gap-3">

            {/* Top bar */}
            <div className="flex items-center justify-between bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedTicket(null)}
                        className="p-1.5 hover:bg-[#f3f4f6] rounded-lg cursor-pointer transition-colors">
                        <ArrowLeft className="w-4 h-4 text-[#6a7282]" />
                    </button>
                    <div>
                        <p className="font-semibold text-[#242424] text-sm leading-tight">{selectedTicket.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#6a7282] font-mono">{selectedTicket.ticketId}</span>
                            <span className="text-[10px] text-[#6a7282]">·</span>
                            <span className="text-[10px] text-[#6a7282]">{selectedTicket.category}</span>
                        </div>
                    </div>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(selectedTicket.status)}`}>
                    {statusIcon(selectedTicket.status)} {selectedTicket.status}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white border border-[#e5e7eb] rounded-xl px-4 py-4 space-y-4 min-h-0">
                {selectedTicket.messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-[#6a7282]">No messages yet.</p>
                    </div>
                )}
                {selectedTicket.messages.map(m => {
                    const isUser = m.sender === "user";
                    return (
                        <div key={m._id} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Avatar */}
                            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${isUser ? "bg-[#1F7A4D]" : "bg-[#6a7282]"}`}>
                                {isUser ? "ME" : "IW"}
                            </div>
                            {/* Bubble */}
                            <div className={`max-w-[70%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                                <p className="text-[10px] text-[#9ca3af] px-1">{isUser ? "You" : "IWPA Support"}</p>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    isUser
                                        ? "bg-[#1F7A4D] text-white rounded-br-sm"
                                        : "bg-[#f3f4f6] text-[#242424] rounded-bl-sm"
                                }`}>
                                    <p>{m.text}</p>
                                    {m.attachments?.length > 0 && (
                                        <div className="mt-2 flex flex-col gap-1">
                                            {m.attachments.map((f, i) => (
                                                <a key={i} href={imgUrl(f, "ticket")} target="_blank" rel="noreferrer"
                                                    className={`text-xs flex items-center gap-1 underline ${isUser ? "text-white/80" : "text-[#1F7A4D]"}`}>
                                                    <Paperclip className="w-3 h-3 shrink-0" />
                                                    <span className="truncate max-w-[200px]">{f}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-[#9ca3af] px-1">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    {" · "}
                                    {new Date(m.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {selectedTicket.status !== "Resolved" ? (
                <div className="bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 shrink-0 space-y-2">
                    {replyFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {replyFiles.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs bg-[#f3f4f6] px-2 py-1 rounded-lg">
                                    <Paperclip className="w-3 h-3 text-[#6a7282]" /> {f.name}
                                    <button onClick={() => setReplyFiles(p => p.filter((_, idx) => idx !== i))} className="cursor-pointer ml-0.5">
                                        <X className="w-3 h-3 text-[#6a7282]" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-end gap-2">
                        <textarea
                            rows={2}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                            placeholder="Type a message… (Enter to send)"
                            className="flex-1 border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1F7A4D] resize-none"
                        />
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <input ref={replyFileRef} type="file" multiple className="hidden"
                                onChange={e => setReplyFiles(p => [...p, ...Array.from(e.target.files ?? [])])} />
                            <button onClick={() => replyFileRef.current?.click()}
                                className="p-2 border border-[#e5e7eb] rounded-xl hover:bg-[#f3f4f6] cursor-pointer transition-colors">
                                <Paperclip className="w-4 h-4 text-[#6a7282]" />
                            </button>
                            <button onClick={handleReply} disabled={!replyText.trim() || replying}
                                className="p-2 bg-[#1F7A4D] text-white rounded-xl hover:bg-[#176939] disabled:opacity-50 cursor-pointer transition-colors">
                                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-sm text-[#1F7A4D] text-center shrink-0">
                    This ticket has been resolved. <button onClick={() => setSelectedTicket(null)} className="underline cursor-pointer">Go back</button>
                </div>
            )}
        </div>
    );

    /* ── LIST VIEW ── */
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Ask IWPA – Help Desk</h1>
                    <p className="text-[#6a7282] mt-1">Get support for membership, subscription, and industry queries</p>
                </div>
                <button onClick={() => setShowNewTicket(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] cursor-pointer">
                    <Plus className="w-4 h-4" /> New Ticket
                </button>
            </div>

            {showNewTicket && (
                <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
                    <h2 className="font-semibold text-lg mb-4">Create New Support Ticket</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="border border-[#e5e7eb] outline-none rounded-lg px-3 py-2 text-sm focus:border-[#1F7A4D]">
                            <option value="">Select Category</option>
                            <option>Membership</option><option>Subscription</option>
                            <option>Industry Query</option><option>Technical</option>
                        </select>
                        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            placeholder="Subject"
                            className="border border-[#e5e7eb] rounded-lg px-3 py-2 outline-none text-sm focus:border-[#1F7A4D]" />
                    </div>
                    <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Describe your issue..."
                        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 mb-3 outline-none text-sm focus:border-[#1F7A4D] resize-none" />
                    <input ref={formFileRef} type="file" multiple className="hidden"
                        onChange={e => setFormFiles(p => [...p, ...Array.from(e.target.files ?? [])])} />
                    {formFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formFiles.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs bg-[#f3f4f6] px-2 py-1 rounded-lg">
                                    {f.name}
                                    <button onClick={() => setFormFiles(p => p.filter((_, idx) => idx !== i))} className="cursor-pointer"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <button onClick={() => formFileRef.current?.click()}
                            className="flex items-center gap-1 text-sm text-[#6a7282] hover:text-[#242424] cursor-pointer">
                            <Paperclip className="w-4 h-4" /> Attach files
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowNewTicket(false); setFormFiles([]); }}
                                className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleCreate}
                                disabled={submitting || !form.subject.trim() || !form.category || !form.description.trim()}
                                className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm hover:bg-[#176939] disabled:opacity-50 cursor-pointer flex items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e5e7eb] font-semibold">My Support Tickets</div>
                {loading ? (
                    <CardListSkeleton rows={5} />
                ) : tickets.length === 0 ? (
                    <div className="px-6 py-12 text-center text-[#6a7282] text-sm">No tickets yet. Click "New Ticket" to get started.</div>
                ) : tickets.map(t => (
                    <div key={t.id} className="p-6 border-b border-[#e5e7eb] last:border-b-0 hover:bg-[#f9fafb] transition-colors">
                        <div className="flex justify-between gap-4 mb-3 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-[#242424]">{t.subject}</h3>
                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(t.status)}`}>
                                        {statusIcon(t.status)} {t.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#6a7282] flex-wrap">
                                    <span className="bg-[#f3f4f6] px-2 py-0.5 rounded font-mono">{t.id}</span>
                                    <span className="bg-[#f3f4f6] px-2 py-0.5 rounded">{t.category}</span>
                                    <span>Created: {new Date(t.created).toDateString()}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{t.messages} messages</span>
                                </div>
                            </div>
                            <div className="text-xs text-[#6a7282] flex items-center gap-1 shrink-0">
                                <Clock className="w-3.5 h-3.5" />Last updated: {new Date(t.updated).toDateString()}
                            </div>
                        </div>
                        <button onClick={() => openTicket(t.id)}
                            className="text-sm text-[#1F7A4D] font-medium hover:underline flex items-center gap-1 cursor-pointer">
                            {detailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>View Conversation <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                <InfoCard icon={<MessageSquare className="w-6 h-6 text-[#1F7A4D]" />} bg="bg-[#d0fae5]" text="text-[#1F7A4D]" title="Average Response Time" value="2–4 hours" desc="During business hours" />
                <InfoCard icon={<CheckCircle className="w-6 h-6 text-[#155DFC]" />} bg="bg-[#dbeafe]" text="text-[#155DFC]" title="Resolution Rate" value="94%" desc="Tickets resolved within 48 hours" />
                <InfoCard icon={<AlertCircle className="w-6 h-6 text-[#f59e0b]" />} bg="bg-[#fef3c7]" text="text-[#b45309]" title="Support Hours" value="Mon–Fri, 9 AM – 6 PM" desc="IST (Indian Standard Time)" />
            </div>
        </div>
    );
}

function InfoCard({ icon, bg, title, value, desc, text }: { icon: React.ReactNode; bg: string; title: string; value: string; desc: string; text: string }) {
    return (
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="font-semibold text-[#242424] mb-1">{title}</h3>
            <p className={`text-xl font-bold ${text}`}>{value}</p>
            <p className="text-sm text-[#6a7282]">{desc}</p>
        </div>
    );
}
