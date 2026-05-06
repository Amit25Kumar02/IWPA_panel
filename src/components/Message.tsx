"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Bell, Send, Smartphone, IndianRupee, Trash2, CheckCheck } from "lucide-react";
import api from "../utils/api";

interface MessageItem {
  _id: string;
  subject: string;
  body: string;
  senderName: string;
  type: string;
  channels: { inApp: boolean; whatsapp: boolean };
  readBy: string[];
  createdAt: string;
}

interface DueMember {
  memberId: string;
  membershipId: string;
  name: string;
  email: string;
  mobile: string;
  dueAmount: number;
  invoiceNo: string;
}

type MsgType = "system" | "alert" | "notification";

const resolveType = (type: string): MsgType => {
  if (type === "broadcast" || type === "direct") return "system";
  if (type === "payment_due") return "alert";
  return "notification";
};

const getIcon = (type: MsgType) => {
  if (type === "system") return <MessageCircle className="w-5 h-5 text-[#1F7A4D]" />;
  if (type === "alert") return <Bell className="w-5 h-5 text-[#f59e0b]" />;
  return <Bell className="w-5 h-5 text-[#155DFC]" />;
};

const getBg = (type: MsgType) => {
  if (type === "system") return "bg-[#ecfdf5]";
  return "bg-[#ffffff]";
};

export default function Messages({ userType: userTypeProp }: { userType?: string }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userType = userTypeProp || localStorage.getItem("userType") || "admin";
  const userId = storedUser._id || storedUser.id || "";
  const isAdminLike = userType === "admin" || userType === "role";
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [dues, setDues] = useState<DueMember[]>([]);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [duesWhatsapp, setDuesWhatsapp] = useState(false);
  const [sendingDues, setSendingDues] = useState(false);
  const [activePanel, setActivePanel] = useState<"messages" | "dues" | "settings">("messages");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  // pagination
  const [msgPage, setMsgPage] = useState(1);
  const [duesPage, setDuesPage] = useState(1);
  const PAGE_SIZE = 10;

  const getPageWindow = (current: number, total: number) => {
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, start + 3);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/messages", { params: { userType, userId } });
      setMessages(res.data.data || []);
    } catch { /* ignore */ }
  }, [userType, userId]);

  const fetchDues = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/messages/dues/list");
      setDues(res.data.data || []);
    } catch { /* ignore */ }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/messages/dues/config");
      setFrequency(res.data.data?.frequency || "weekly");
      setWhatsappEnabled(res.data.data?.whatsappEnabled || false);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMessages();
    if (isAdminLike) { fetchDues(); fetchConfig(); }
  }, [fetchMessages, fetchDues, fetchConfig, userType]);

  const msgTotalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const pagedMessages = messages.slice((msgPage - 1) * PAGE_SIZE, msgPage * PAGE_SIZE);

  const duesTotalPages = Math.max(1, Math.ceil(dues.length / PAGE_SIZE));
  const pagedDues = dues.slice((duesPage - 1) * PAGE_SIZE, duesPage * PAGE_SIZE);

  const totalMessages = messages.length;
  const alerts = messages.filter((m) => m.type === "payment_due").length;
  const notifications = messages.filter((m) => ["notice_push", "event_push"].includes(m.type)).length;

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      if (isAdminLike) {
        await api.post("/api/v1/messages/broadcast", {
          subject: subject || "Quick Message",
          body: text,
          recipientType: "all",
          channels: { inApp: true, whatsapp: false },
        });
      } else {
        await api.post("/api/v1/messages/direct", {
          subject: subject || "Query",
          body: text,
          senderType: userType,
          senderId: userId,
          senderName: storedUser.name || storedUser.companyName || "User",
        });
      }
      setText(""); setSubject("");
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await api.patch(`/api/v1/messages/${id}/read`, { userId });
    setMessages((prev) =>
      prev.map((m) => m._id === id ? { ...m, readBy: [...m.readBy, userId] } : m)
    );
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/v1/messages/${id}`);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  const handleSendAllDues = async () => {
    setSendingDues(true);
    try {
      const res = await api.post("/api/v1/messages/dues/send", { memberIds: [], whatsapp: duesWhatsapp });
      alert(`Sent ${res.data.sent} reminder(s).`);
      fetchDues();
    } finally {
      setSendingDues(false);
    }
  };

  const handleSaveConfig = async () => {
    await api.patch("/api/v1/messages/dues/config", { frequency, whatsappEnabled });
    alert("Settings saved.");
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Messages</h1>
          <p className="text-[#6a7282] mt-1">Internal messages and quick alerts</p>
        </div>
        {isAdminLike && (
          <div className="flex gap-2">
            {(["messages", "dues", "settings"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePanel(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer capitalize ${
                  activePanel === p
                    ? "bg-[#1F7A4D] text-white"
                    : "bg-white border border-[#e5e7eb] text-[#6a7282] hover:text-[#242424]"
                }`}
              >
                {p === "dues" ? "Payment Dues" : p === "settings" ? "Settings" : "Messages"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MESSAGES PANEL ── */}
      {activePanel === "messages" && (
        <>
          {/* Stats */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#d0fae5] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#1F7A4D]" />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Total Messages</p>
                <p className="text-2xl font-bold text-[#1F7A4D]">{totalMessages}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fef3c7] rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Alerts</p>
                <p className="text-2xl font-bold text-[#f59e0b]">{alerts}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#dbeafe] rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#155DFC]" />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Notifications</p>
                <p className="text-2xl font-bold text-[#155DFC]">{notifications}</p>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
              <div className="p-4 border-b border-[#e5e7eb]">
                <h2 className="font-semibold text-[#242424]">Recent Messages</h2>
              </div>

              {messages.length === 0 ? (
                <div className="p-8 text-center text-[#6a7282]">No messages yet.</div>
              ) : (
                <div className="divide-y divide-[#e5e7eb]">
                  {pagedMessages.map((msg) => {
                    const t = resolveType(msg.type);
                    const isRead = msg.readBy.includes(userId);
                    return (
                      <div key={msg._id} className={`p-4 flex items-start gap-3 ${getBg(t)} ${!isRead ? "border-l-2 border-[#1F7A4D]" : ""}`}>
                        {getIcon(t)}
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm text-[#242424]">{msg.senderName}</span>
                            <span className="text-xs text-[#6a7282]">{timeAgo(msg.createdAt)}</span>
                          </div>
                          <p className="text-sm font-medium text-[#242424]">{msg.subject}</p>
                          <p className="text-sm text-[#6a7282]">{msg.body}</p>
                          {msg.channels?.whatsapp && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#16a34a] mt-1">
                              <Smartphone className="w-3 h-3" /> WhatsApp
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!isRead && (
                            <button onClick={() => handleMarkRead(msg._id)} title="Mark read" className="p-1.5 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                              <CheckCheck className="w-4 h-4 text-[#1F7A4D]" />
                            </button>
                          )}
                          {isAdminLike && (
                            <button onClick={() => handleDelete(msg._id)} title="Delete" className="p-1.5 hover:bg-[#fef2f2] rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {messages.length > PAGE_SIZE && (
                <div className="p-3 border-t border-[#e5e7eb] flex items-center justify-between">
                  <p className="text-xs text-[#6a7282]">Showing {(msgPage - 1) * PAGE_SIZE + 1}–{Math.min(msgPage * PAGE_SIZE, messages.length)} of {messages.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setMsgPage((p) => Math.max(1, p - 1))} disabled={msgPage === 1} className="px-3 py-1 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">Prev</button>
                    {getPageWindow(msgPage, msgTotalPages).map((n) => (
                      <button key={n} onClick={() => setMsgPage(n)} className={`px-3 py-1 text-sm rounded-lg cursor-pointer ${msgPage === n ? "bg-[#1F7A4D] text-white" : "border border-[#e5e7eb] hover:bg-[#f9fafb]"}`}>{n}</button>
                    ))}
                    <button onClick={() => setMsgPage((p) => Math.min(msgTotalPages, p + 1))} disabled={msgPage === msgTotalPages} className="px-3 py-1 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Message */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
            <h3 className="font-semibold text-[#242424] mb-3">
              {isAdminLike ? "Send Quick Broadcast" : "Send Message to Admin"}
            </h3>
            <div className="flex gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-lg outline-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="px-6 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── PAYMENT DUES PANEL ── */}
      {activePanel === "dues" && isAdminLike && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-[#242424]">Members with Outstanding Dues</h2>
              <p className="text-sm text-[#6a7282] mt-0.5">{dues.length} members pending payment</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={duesWhatsapp} onChange={(e) => setDuesWhatsapp(e.target.checked)} className="accent-[#1F7A4D]" />
                <Smartphone className="w-4 h-4 text-[#16a34a]" /> WhatsApp
              </label>
              <button
                onClick={handleSendAllDues}
                disabled={sendingDues || dues.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition text-sm disabled:opacity-50 cursor-pointer"
              >
                <IndianRupee className="w-4 h-4" />
                {sendingDues ? "Sending…" : "Send All Reminders"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
            {dues.length === 0 ? (
              <div className="p-8 text-center text-[#6a7282]">No outstanding dues found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="p-3 text-left text-[#6a7282] font-medium">Member</th>
                    <th className="p-3 text-left text-[#6a7282] font-medium">Membership ID</th>
                    <th className="p-3 text-left text-[#6a7282] font-medium">Invoice No</th>
                    <th className="p-3 text-left text-[#6a7282] font-medium">Mobile</th>
                    <th className="p-3 text-right text-[#6a7282] font-medium">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {pagedDues.map((d) => (
                    <tr key={d.memberId} className="hover:bg-[#f9fafb]">
                      <td className="p-3">
                        <p className="font-medium text-[#242424]">{d.name || "—"}</p>
                        <p className="text-xs text-[#6a7282]">{d.email || "—"}</p>
                      </td>
                      <td className="p-3 text-[#6a7282]">{d.membershipId || "—"}</td>
                      <td className="p-3 text-[#6a7282]">{d.invoiceNo || "—"}</td>
                      <td className="p-3 text-[#6a7282]">{d.mobile || "—"}</td>
                      <td className="p-3 text-right font-semibold text-[#b45309]">
                        ₹{d.dueAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {dues.length > PAGE_SIZE && (
              <div className="p-3 border-t border-[#e5e7eb] flex items-center justify-between">
                <p className="text-xs text-[#6a7282]">Showing {(duesPage - 1) * PAGE_SIZE + 1}–{Math.min(duesPage * PAGE_SIZE, dues.length)} of {dues.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setDuesPage((p) => Math.max(1, p - 1))} disabled={duesPage === 1} className="px-3 py-1 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">Prev</button>
                  {getPageWindow(duesPage, duesTotalPages).map((n) => (
                    <button key={n} onClick={() => setDuesPage(n)} className={`px-3 py-1 text-sm rounded-lg cursor-pointer ${duesPage === n ? "bg-[#1F7A4D] text-white" : "border border-[#e5e7eb] hover:bg-[#f9fafb]"}`}>{n}</button>
                  ))}
                  <button onClick={() => setDuesPage((p) => Math.min(duesTotalPages, p + 1))} disabled={duesPage === duesTotalPages} className="px-3 py-1 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">Next</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SETTINGS PANEL ── */}
      {activePanel === "settings" && isAdminLike && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 space-y-5 max-w-md">
          <h2 className="font-semibold text-[#242424]">Payment Due Reminder Settings</h2>

          <div>
            <label className="text-sm text-[#6a7282] mb-1 block">Reminder Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as typeof frequency)}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setWhatsappEnabled((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${whatsappEnabled ? "bg-[#1F7A4D]" : "bg-[#d1d5db]"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${whatsappEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-[#242424] flex items-center gap-1">
              <Smartphone className="w-4 h-4 text-[#16a34a]" /> Enable WhatsApp reminders
            </span>
          </label>

          <button
            onClick={handleSaveConfig}
            className="px-6 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition text-sm cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
