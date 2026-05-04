"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Clock, CheckCircle, AlertCircle,
    ArrowLeft, Send, Paperclip, X, Loader2, ChevronDown,
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
    id: string;
    subject: string;
    category: string;
    status: "Open" | "In Progress" | "Resolved";
    created: string;
    updated: string;
    messages: number;
}

interface TicketDetail {
    ticketId: string;
    subject: string;
    category: string;
    status: "Open" | "In Progress" | "Resolved";
    description: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

const statusStyle = (s: string) =>
    s === "Resolved" ? "bg-[#d0fae5] text-[#1F7A4D]" :
    s === "In Progress" ? "bg-[#fef3c7] text-[#f59e0b]" :
    "bg-[#dbeafe] text-[#155DFC]";

const statusIcon = (s: string) =>
    s === "Resolved" ? <CheckCircle className="w-4 h-4" /> :
    s === "In Progress" ? <Clock className="w-4 h-4" /> :
    <AlertCircle className="w-4 h-4" />;

const STATUSES = ["Open", "In Progress", "Resolved"] as const;

export default function HelpDesk() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");

    // reply (admin)
    const [replyText, setReplyText] = useState("");
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [replying, setReplying] = useState(false);
    const replyFileRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // status update
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => { fetchTickets(); }, []);
    useEffect(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, [selectedTicket?.messages.length]);

    // real-time: new ticket from any member
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
            const { data } = await api.get("/api/v1/tickets/get-tickets");
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }

    async function openTicket(id: string) {
        setDetailLoading(true);
        try {
            const { data } = await api.get(`/api/v1/tickets/get-ticket/${id}`);
            setSelectedTicket(data);
            setReplyText("");
            setReplyFiles([]);
        } catch { /* ignore */ }
        finally { setDetailLoading(false); }
    }

    async function handleReply() {
        if (!replyText.trim() || !selectedTicket) return;
        setReplying(true);
        const fd = new FormData();
        fd.append("text", replyText);
        fd.append("sender", "admin");
        replyFiles.forEach(f => fd.append("files", f));
        try {
            await api.post(
                `/api/v1/tickets/add-message/${selectedTicket.ticketId}`,
                fd,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            // UI update handled by socket "new-message" event
            setReplyText("");
            setReplyFiles([]);
        } catch { /* ignore */ }
        finally { setReplying(false); }
    }

    async function handleStatusChange(status: string) {
        if (!selectedTicket) return;
        setUpdatingStatus(true);
        try {
            await api.patch(`/api/v1/tickets/update-status/${selectedTicket.ticketId}`, { status });
            // UI update handled by socket "status-changed" event
        } catch { /* ignore */ }
        finally { setUpdatingStatus(false); }
    }

    const filtered = filterStatus === "All" ? tickets : tickets.filter(t => t.status === filterStatus);

    /* ── CONVERSATION VIEW ── */
    if (selectedTicket) {
        return (
            <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto p-4 gap-3">

                {/* Top bar */}
                <div className="flex items-center justify-between bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 shrink-0 flex-wrap gap-3">
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
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(selectedTicket.status)}`}>
                            {statusIcon(selectedTicket.status)} {selectedTicket.status}
                        </span>
                        {/* Status changer */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6a7282]">Change:</span>
                            <div className="relative">
                                <select value={selectedTicket.status} onChange={e => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus}
                                    className="appearance-none border border-[#e5e7eb] rounded-lg px-3 py-1.5 pr-7 text-xs outline-none focus:border-[#1F7A4D] bg-white cursor-pointer disabled:opacity-50">
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="w-3 h-3 text-[#6a7282] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F7A4D]" />}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-white border border-[#e5e7eb] rounded-xl px-4 py-4 space-y-4 min-h-0">
                    {selectedTicket.messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-[#6a7282]">No messages yet.</p>
                        </div>
                    )}
                    {selectedTicket.messages.map(m => {
                        const isAdmin = m.sender === "admin";
                        return (
                            <div key={m._id} className={`flex items-end gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${isAdmin ? "bg-[#1F7A4D]" : "bg-[#6a7282]"}`}>
                                    {isAdmin ? "IW" : "ME"}
                                </div>
                                <div className={`max-w-[70%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                                    <p className="text-[10px] text-[#9ca3af] px-1">{isAdmin ? "IWPA Support" : "Member"}</p>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isAdmin ? "bg-[#1F7A4D] text-white rounded-br-sm" : "bg-[#f3f4f6] text-[#242424] rounded-bl-sm"
                                    }`}>
                                        <p>{m.text}</p>
                                        {m.attachments?.length > 0 && (
                                            <div className="mt-2 flex flex-col gap-1">
                                                {m.attachments.map((f, i) => (
                                                    <a key={i} href={imgUrl(f, "ticket")} target="_blank" rel="noreferrer"
                                                        className={`text-xs flex items-center gap-1 underline ${isAdmin ? "text-white/80" : "text-[#1F7A4D]"}`}>
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
                        <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                            placeholder="Reply as IWPA Support… (Enter to send)"
                            className="flex-1 border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1F7A4D] resize-none" />
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
            </div>
        );
    }

    /* ── LIST VIEW ── */
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#242424]">Ask IWPA – Help Desk</h1>
                    <p className="text-[#6a7282] mt-1">Manage and respond to member support tickets</p>
                </div>
                {/* Status filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    {["All", ...STATUSES].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${filterStatus === s ? "bg-[#1F7A4D] text-white border-[#1F7A4D]" : "border-[#e5e7eb] text-[#6a7282] hover:border-[#1F7A4D]"}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ticket List */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-auto">
                <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
                    <span className="font-semibold">Support Tickets</span>
                    <span className="text-xs text-[#6a7282]">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                {loading ? (
                    <CardListSkeleton rows={6} />
                ) : filtered.length === 0 ? (
                    <div className="px-6 py-12 text-center text-[#6a7282] text-sm">No tickets found.</div>
                ) : filtered.map(t => (
                    <div key={t.id} className="p-6 border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <div className="flex justify-between gap-4 mb-2 flex-wrap">
                            <div>
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-[#242424]">{t.subject}</h3>
                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle(t.status)}`}>
                                        {statusIcon(t.status)} {t.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#6a7282] flex-wrap">
                                    <span className="bg-[#f3f4f6] px-2 py-1 rounded text-xs font-mono">{t.id}</span>
                                    <span className="bg-[#f3f4f6] px-2 py-1 rounded text-xs">{t.category}</span>
                                    <span>Created: {new Date(t.created).toDateString()}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{t.messages} messages</span>
                                </div>
                            </div>
                            <div className="text-xs text-[#6a7282] flex items-center gap-1 shrink-0">
                                <Clock className="w-4 h-4" />Last updated: {new Date(t.updated).toDateString()}
                            </div>
                        </div>
                        <button onClick={() => openTicket(t.id)}
                            className="text-sm text-[#1F7A4D] font-medium hover:underline flex items-center gap-1 cursor-pointer">
                            {detailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>View Conversation <ArrowLeft className="w-4 h-4 rotate-180" /></>}
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                <InfoCard icon={<MessageSquare className="w-6 h-6 text-[#1F7A4D]" />} bg="bg-[#d0fae5]" text="text-[#1F7A4D]"
                    title="Total Tickets" value={String(tickets.length)} desc="All time" />
                <InfoCard icon={<AlertCircle className="w-6 h-6 text-[#155DFC]" />} bg="bg-[#dbeafe]" text="text-[#155DFC]"
                    title="Open Tickets" value={String(tickets.filter(t => t.status === "Open").length)} desc="Awaiting response" />
                <InfoCard icon={<CheckCircle className="w-6 h-6 text-[#1F7A4D]" />} bg="bg-[#d0fae5]" text="text-[#1F7A4D]"
                    title="Resolved" value={String(tickets.filter(t => t.status === "Resolved").length)} desc="Successfully closed" />
            </div>
        </div>
    );
}

function InfoCard({ icon, bg, title, value, desc, text }: { icon: React.ReactNode; bg: string; title: string; value: string; desc: string; text: string; }) {
    return (
        <div className="bg-[#FFFFFF] border-[0.76px] border-[#e5e7eb] rounded-lg p-6">
            <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="font-semibold text-[#242424] mb-1">{title}</h3>
            <p className={`text-xl font-bold ${text}`}>{value}</p>
            <p className="text-sm text-[#6a7282]">{desc}</p>
        </div>
    );
}
