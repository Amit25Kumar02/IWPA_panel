"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../utils/api";
import socket from "../utils/socket";

type ChatTab = "rooms" | "dms";
type DirectoryFilter = "all" | "headquarters" | "national_council" | "state_council" | "state_coordinator" | "general" | "vendors";

interface ChatRoom {
  _id: string;
  title: string;
  description?: string;
  type?: "room" | "dm" | "group";
  members?: string[];
  memberIds?: string[];
  participantIds?: string[];
  lastMessage?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface Message {
  _id: string;
  roomId: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
}

interface DirectoryPerson {
  id: string;
  name: string;
  email: string;
  role: string;
  roleKey: DirectoryFilter;
  state?: string;
  company?: string;
  source: "role" | "member" | "admin";
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleKey: DirectoryFilter;
  userType: "admin" | "member";
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "").replace(/\/api.*$/, "").replace(/\/$/, "");

const ROLE_FILTERS: { id: DirectoryFilter; label: string }[] = [
  { id: "all", label: "All roles" },
  { id: "headquarters", label: "Office bearers" },
  { id: "national_council", label: "National Council" },
  { id: "state_council", label: "State Council" },
  { id: "state_coordinator", label: "State Coordinators" },
  { id: "general", label: "General Members" },
  { id: "vendors", label: "Vendors" },
];

const roleLabels: Record<DirectoryFilter, string> = {
  all: "All",
  headquarters: "Office Bearer",
  national_council: "National Council",
  state_council: "State Council",
  state_coordinator: "State Coordinator",
  general: "General Member",
  vendors: "Vendor",
};

const isImage = (type?: string) => ["jpg", "jpeg", "png", "gif", "webp"].includes((type || "").toLowerCase());

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IW";

const safeDate = (iso?: string) => {
  const date = iso ? new Date(iso) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizeRoleKey = (value?: string, designation?: string): DirectoryFilter => {
  const raw = `${value || ""} ${designation || ""}`.toLowerCase();
  if (raw.includes("national")) return "national_council";
  if (raw.includes("state coordinator") || raw.includes("coordinator")) return "state_coordinator";
  if (raw.includes("state")) return "state_council";
  if (raw.includes("vendor")) return "vendors";
  if (raw.includes("head") || raw.includes("secretary") || raw.includes("president") || raw.includes("office")) return "headquarters";
  return "general";
};

const getCurrentUser = (): CurrentUser => {
  const userType = (localStorage.getItem("userType") as "admin" | "member") || "admin";
  let stored: any = {};
  try {
    stored = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    stored = {};
  }

  if (userType === "member") {
    return {
      id: stored.membershipId || stored.email || "member",
      name: stored.name || stored.companyName || "Member",
      email: stored.email || "",
      role: "General Member",
      roleKey: "general",
      userType,
    };
  }

  return {
    id: stored.email || "admin",
    name: stored.name || "Admin User",
    email: stored.email || "admin@iwpa.org",
    role: "Admin",
    roleKey: "headquarters",
    userType,
  };
};

export default function TeamChat() {
  const [currentUser] = useState<CurrentUser>(() => getCurrentUser());
  const [tab, setTab] = useState<ChatTab>("rooms");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"group" | "dm">("group");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailPanelOpen, setEmailPanelOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<DirectoryFilter>("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [savingChat, setSavingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.userType === "admin";
  const selectedDirectory = useMemo(
    () => directory.filter((person) => selectedPeople.includes(person.id)),
    [directory, selectedPeople]
  );
  const states = useMemo(
    () => Array.from(new Set(directory.map((p) => p.state).filter(Boolean) as string[])).sort(),
    [directory]
  );

  const filteredPeople = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    return directory.filter((person) => {
      const roleOk = filterRole === "all" || person.roleKey === filterRole;
      const stateOk = stateFilter === "all" || person.state === stateFilter;
      const searchOk =
        !q ||
        person.name.toLowerCase().includes(q) ||
        person.email.toLowerCase().includes(q) ||
        person.role.toLowerCase().includes(q) ||
        person.company?.toLowerCase().includes(q);
      return roleOk && stateOk && searchOk;
    });
  }, [directory, filterRole, peopleSearch, stateFilter]);

  const visibleRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms
      .filter((room) => (tab === "dms" ? room.type === "dm" : room.type !== "dm"))
      .filter((room) => !q || room.title.toLowerCase().includes(q) || room.description?.toLowerCase().includes(q));
  }, [rooms, search, tab]);

  const roomParticipants = useMemo(() => {
    const ids = activeRoom?.memberIds || activeRoom?.participantIds || activeRoom?.members || [];
    return directory.filter((person) => ids.includes(person.id));
  }, [activeRoom, directory]);

  useEffect(() => {
    fetchDirectory();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    setLoadingMessages(true);
    setMessages([]);
    api
      .get(`/api/v1/chat/messages/${activeRoom._id}`)
      .then((res) => setMessages(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoadingMessages(false));

    socket.emit("join-chat", activeRoom._id);
    return () => {
      socket.emit("leave-chat", activeRoom._id);
    };
  }, [activeRoom?._id]);

  useEffect(() => {
    const handler = (msg: Message) => {
      setRooms((prev) =>
        prev.map((room) =>
          room._id === msg.roomId
            ? { ...room, lastMessage: msg.fileName ? `Attachment: ${msg.fileName}` : msg.text, updatedAt: msg.createdAt }
            : room
        )
      );
      if (msg.roomId === activeRoom?._id) setMessages((prev) => [...prev, msg]);
    };

    socket.on("new-message", handler);
    return () => {
      socket.off("new-message", handler);
    };
  }, [activeRoom?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setActiveRoom(visibleRooms[0] ?? null);
  }, [tab, rooms]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get("/api/v1/chat/rooms");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const normalized = list.map((room: ChatRoom) => ({ ...room, type: room.type || "room" }));
      setRooms(normalized);
      // Auto-select first room matching current tab
      setActiveRoom(normalized.find((r: ChatRoom) => (tab === "dms" ? r.type === "dm" : r.type !== "dm")) ?? null);
    } catch {
      toast.error("Failed to load team chats");
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const [membersRes, rolesRes] = await Promise.allSettled([
        api.get("/api/v1/members/get-members"),
        api.get("/api/v1/roles/get-roles"),
      ]);

      const members = membersRes.status === "fulfilled" && Array.isArray(membersRes.value.data?.data) ? membersRes.value.data.data : [];
      const roles = rolesRes.status === "fulfilled" && Array.isArray(rolesRes.value.data?.data) ? rolesRes.value.data.data : [];

      const people: DirectoryPerson[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          roleKey: currentUser.roleKey,
          source: "admin",
        },
        ...roles
          .filter((role: any) => role.email)
          .map((role: any) => {
            const roleKey = normalizeRoleKey(role.category, role.designation || role.title);
            return {
              id: role._id || role.email,
              name: role.title || role.designation || role.email,
              email: role.email,
              role: role.designation || roleLabels[roleKey],
              roleKey,
              state: role.state,
              company: role.companyName,
              source: "role" as const,
            };
          }),
        ...members
          .filter((member: any) => member.repEmail || member.addRepEmail)
          .flatMap((member: any) => {
            const memberRole = normalizeRoleKey(member.memberCategory || member.category || member.type);
            const primary: DirectoryPerson[] = member.repEmail
              ? [{
                  id: member._id || member.membershipId || member.repEmail,
                  name: member.repName || member.companyName || member.repEmail,
                  email: member.repEmail,
                  role: memberRole === "vendors" ? "Vendor" : "General Member",
                  roleKey: memberRole,
                  state: member.state,
                  company: member.companyName,
                  source: "member" as const,
                }]
              : [];
            const additional: DirectoryPerson[] = member.addRepEmail
              ? [{
                  id: `${member._id || member.membershipId || member.addRepEmail}:additional`,
                  name: member.addRepName || member.companyName || member.addRepEmail,
                  email: member.addRepEmail,
                  role: "Additional Representative",
                  roleKey: memberRole,
                  state: member.state,
                  company: member.companyName,
                  source: "member" as const,
                }]
              : [];
            return [...primary, ...additional];
          }),
      ];

      const deduped = Array.from(new Map(people.map((person) => [person.email || person.id, person])).values());
      setDirectory(deduped);
    } catch {
      toast.error("Failed to load chat member directory");
    } finally {
      setLoadingDirectory(false);
    }
  };

  const togglePerson = (id: string) => {
    setSelectedPeople((prev) => (prev.includes(id) ? prev.filter((personId) => personId !== id) : [...prev, id]));
  };

  const selectVisiblePeople = () => {
    setSelectedPeople((prev) => Array.from(new Set([...prev, ...filteredPeople.map((person) => person.id)])));
  };

  const clearComposer = () => {
    setRoomTitle("");
    setRoomDesc("");
    setSelectedPeople([]);
    setPeopleSearch("");
    setFilterRole("all");
    setStateFilter("all");
  };

  const createChat = async () => {
    if (composerMode === "group" && !roomTitle.trim()) return toast.error("Enter a group topic");
    if (selectedDirectory.length === 0) return toast.error("Select at least one person");
    if (composerMode === "dm" && selectedDirectory.length !== 1) return toast.error("Select one person for a direct message");

    setSavingChat(true);
    const payload = {
      title: composerMode === "dm" ? selectedDirectory[0].name : roomTitle.trim(),
      description: composerMode === "dm" ? `Direct message with ${selectedDirectory[0].name}` : roomDesc.trim(),
      type: composerMode,
      createdBy: currentUser,
      members: Array.from(new Set([currentUser.id, ...selectedDirectory.map((person) => person.id)])),
      invites: selectedDirectory.map(({ id, name, email, role, roleKey, state }) => ({ id, name, email, role, roleKey, state })),
    };

    try {
      const res = await api.post("/api/v1/chat/rooms/create", payload);
      const room = { ...res.data?.data, type: payload.type } as ChatRoom;
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room);
      setTab(composerMode === "dm" ? "dms" : "rooms");
      setPickerOpen(false);
      clearComposer();
      toast.success(composerMode === "dm" ? "Direct message started" : "Group created and invites queued");
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setSavingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!activeRoom || (!text.trim() && !attachment)) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("roomId", activeRoom._id);
      formData.append("senderId", currentUser.id);
      formData.append("senderName", currentUser.name);
      formData.append("senderRole", currentUser.role);
      formData.append("text", text.trim());
      if (attachment) formData.append("file", attachment);

      await api.post("/api/v1/chat/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sendEmailBlast = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return toast.error("Enter email subject and message");
    if (selectedDirectory.length === 0) return toast.error("Select email recipients");

    setSendingEmail(true);
    const recipients = selectedDirectory.map((person) => person.email).filter(Boolean);
    try {
      await api.post("/api/v1/chat/email-blast", {
        to: recipients,
        subject: emailSubject.trim(),
        text: emailBody.trim(),
        recipientGroups: {
          role: filterRole,
          state: stateFilter,
        },
      });
      toast.success(`Email notification sent to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`);
      setEmailSubject("");
      setEmailBody("");
      setEmailPanelOpen(false);
    } catch {
      try {
        const formData = new FormData();
        formData.append("to", recipients.join(","));
        formData.append("subject", emailSubject.trim());
        formData.append("text", emailBody.trim());
        await api.post("/api/v1/emails/send", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success(`Email notification sent to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`);
        setEmailSubject("");
        setEmailBody("");
        setEmailPanelOpen(false);
      } catch {
        toast.error("Failed to send email notification");
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteRoom = async () => {
    if (!deleteRoomId) return;
    setDeletingRoom(true);
    try {
      await api.delete(`/api/v1/chat/rooms/${deleteRoomId}`);
      const updated = rooms.filter((room) => room._id !== deleteRoomId);
      setRooms(updated);
      if (activeRoom?._id === deleteRoomId) setActiveRoom(updated[0] || null);
      setDeleteRoomId(null);
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingRoom(false);
    }
  };

  const formatTime = (iso?: string) =>
    safeDate(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const formatRoomTime = (iso?: string) => {
    const diff = Math.floor((Date.now() - safeDate(iso).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const renderAttachment = (msg: Message, isMe: boolean) => {
    if (!msg.fileUrl) return null;
    const fullUrl = `${BASE_URL}${msg.fileUrl}`;
    if (isImage(msg.fileType)) {
      return (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          <img src={fullUrl} alt={msg.fileName} className="max-w-[220px] rounded-lg mt-2 border border-white/20" />
        </a>
      );
    }
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={msg.fileName}
        className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg border text-sm ${
          isMe ? "border-white/30 bg-white/10 text-white" : "border-[#e5e7eb] bg-white text-[#242424]"
        }`}
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="truncate max-w-[180px]">{msg.fileName || "Attachment"}</span>
        <Download className="w-3.5 h-3.5 shrink-0 ml-auto" />
      </a>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Team Chat</h1>
          <p className="text-sm text-[#6a7282] mt-1">Internal communication for council members and IWPA teams</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setComposerMode("dm");
              setPickerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] text-sm font-medium cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" /> New DM
          </button>
          <button
            onClick={() => {
              setComposerMode("group");
              setPickerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Group
          </button>
          {isAdmin && (
            <button
              onClick={() => setEmailPanelOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#155DFC] text-white rounded-lg hover:bg-[#1249c8] text-sm font-medium cursor-pointer"
            >
              <Bell className="w-4 h-4" /> Email Blast
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] flex flex-col h-[600px] min-h-0">
          <div className="p-3 border-b border-[#e5e7eb] space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#f3f4f6] p-1">
              {(["rooms", "dms"] as ChatTab[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                    tab === item ? "bg-white text-[#1F7A4D] shadow-sm" : "text-[#6a7282] hover:text-[#242424]"
                  }`}
                >
                  {item === "rooms" ? <Users className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {item === "rooms" ? "Rooms" : "DMs"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab === "rooms" ? "rooms" : "DMs"}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#e5e7eb]">
            {loadingRooms ? (
              <div className="flex items-center justify-center h-full text-sm text-[#6a7282]">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading chats
              </div>
            ) : visibleRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[#6a7282] px-6 text-center">
                <MessageSquare className="w-9 h-9 opacity-30" />
                <p className="text-sm">No {tab === "rooms" ? "group rooms" : "direct messages"} yet</p>
              </div>
            ) : (
              visibleRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-3 hover:bg-[#f9fafb] transition-colors group cursor-pointer ${
                    activeRoom?._id === room._id ? "bg-[#ecfdf5] border-l-2 border-[#1F7A4D]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      room.type === "dm" ? "bg-[#dbeafe] text-[#155DFC]" : "bg-[#d0fae5] text-[#1F7A4D]"
                    }`}>
                      {room.type === "dm" ? <MessageCircle className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-[#242424] truncate">{room.title}</h3>
                        <span className="ml-auto text-xs text-[#6a7282] shrink-0">{formatRoomTime(room.updatedAt || room.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#6a7282] truncate mt-0.5">
                        {room.lastMessage || room.description || (room.type === "dm" ? "Direct conversation" : "Topic room")}
                      </p>
                    </div>
                    {isAdmin && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteRoomId(room._id);
                        }}
                        className="p-1 hover:bg-red-50 rounded text-[#FB2C36] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb] flex flex-col h-[600px] min-h-0">
          {activeRoom ? (
            <>
              <div className="px-4 py-3 border-b border-[#e5e7eb] shrink-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[#242424] truncate">{activeRoom.title}</h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#6a7282] text-xs">
                      {activeRoom.type === "dm" ? "DM" : "Room"}
                    </span>
                  </div>
                  <p className="text-xs text-[#6a7282] mt-0.5 truncate">
                    {activeRoom.description || `${roomParticipants.length || activeRoom.memberIds?.length || 0} invited member(s)`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setComposerMode(activeRoom.type === "dm" ? "dm" : "group");
                    setPickerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm text-[#242424] hover:bg-[#f9fafb] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Invite
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcfd]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-sm text-[#6a7282]">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading messages
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#6a7282]">
                    <MessageSquare className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Start the discussion with a query, ticket update, or topic note.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId
                      ? msg.senderId === currentUser.id
                      : msg.senderName === currentUser.name;
                    return (
                      <div key={msg._id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="w-9 h-9 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                          {initials(msg.senderName)}
                        </div>
                        <div className={`max-w-[76%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-sm font-medium text-[#242424]">{msg.senderName}</span>
                            <span className="text-xs text-[#6a7282]">{msg.senderRole} • {formatTime(msg.createdAt)}</span>
                          </div>
                          {msg.text && (
                            <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap break-words ${
                              isMe ? "bg-[#1F7A4D] text-white rounded-tr-none" : "bg-white border border-[#e5e7eb] text-[#242424] rounded-tl-none"
                            }`}>
                              {msg.text}
                            </div>
                          )}
                          {renderAttachment(msg, isMe)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {attachment && (
                <div className="px-3 pt-2 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#ecfdf5] border border-[#bbf7d0] rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                    <span className="truncate text-[#1F7A4D] flex-1">{attachment.name}</span>
                    <button
                      onClick={() => {
                        setAttachment(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4 text-[#6a7282]" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-[#e5e7eb] shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer shrink-0"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message or raise a query..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D] resize-none min-h-[42px] max-h-28"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!text.trim() && !attachment)}
                    className="px-4 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] disabled:opacity-50 cursor-pointer inline-flex items-center gap-2 shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#6a7282]">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select or create a chat to begin.</p>
            </div>
          )}
        </div>

      </div>

      {(pickerOpen || emailPanelOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div>
                <h2 className="text-base font-bold text-[#242424]">
                  {emailPanelOpen ? "Email Notification Blast" : composerMode === "dm" ? "Start Direct Message" : "Create Topic Group"}
                </h2>
                <p className="text-xs text-[#6a7282] mt-1">
                  Filter by office bearer role, council category, state, vendor, or general member, then choose one or more people.
                </p>
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setEmailPanelOpen(false);
                  clearComposer();
                }}
                className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-0 overflow-hidden">
              <div className="p-5 min-h-0 overflow-y-auto">
                {!emailPanelOpen && composerMode === "group" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#242424] mb-1.5">Topic / Group Name</label>
                      <input
                        value={roomTitle}
                        onChange={(e) => setRoomTitle(e.target.value)}
                        placeholder="e.g. Policy Review, State Tariff Query"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#242424] mb-1.5">Description</label>
                      <input
                        value={roomDesc}
                        onChange={(e) => setRoomDesc(e.target.value)}
                        placeholder="Optional context for invited members"
                        className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]"
                      />
                    </div>
                  </div>
                )}

                {emailPanelOpen && (
                  <div className="space-y-3 mb-4">
                    <input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#155DFC]"
                    />
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Email message"
                      rows={4}
                      className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#155DFC] resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
                    <input
                      value={peopleSearch}
                      onChange={(e) => setPeopleSearch(e.target.value)}
                      placeholder="Search name, email, company..."
                      className="w-full pl-9 pr-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as DirectoryFilter)} className="w-full pl-9 pr-8 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm appearance-none">
                      {ROLE_FILTERS.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                  </div>
                  <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm">
                    <option value="all">All states</option>
                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <button onClick={selectVisiblePeople} className="px-3 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#242424] hover:bg-[#f9fafb] cursor-pointer whitespace-nowrap">
                    Select visible
                  </button>
                </div>

                <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[#e5e7eb]">
                    {filteredPeople.length === 0 ? (
                      <p className="text-sm text-[#6a7282] text-center py-10">No people match the filters.</p>
                    ) : (
                      filteredPeople.map((person) => {
                        const checked = selectedPeople.includes(person.id);
                        return (
                          <button
                            key={person.id}
                            onClick={() => togglePerson(person.id)}
                            className={`w-full p-3 flex items-center gap-3 text-left hover:bg-[#f9fafb] cursor-pointer ${checked ? "bg-[#ecfdf5]" : ""}`}
                          >
                            <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              checked ? "bg-[#1F7A4D] border-[#1F7A4D] text-white" : "border-[#d1d5db]"
                            }`}>
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span className="w-9 h-9 rounded-full bg-[#f3f4f6] text-[#374151] flex items-center justify-center font-semibold text-xs shrink-0">
                              {initials(person.name)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-[#242424] truncate">{person.name}</span>
                              <span className="block text-xs text-[#6a7282] truncate">{person.role}{person.company ? ` • ${person.company}` : ""}</span>
                            </span>
                            <span className="hidden md:block text-xs text-[#6a7282] min-w-[160px] truncate">{person.email}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#6a7282] text-xs shrink-0">
                              {person.state || roleLabels[person.roleKey]}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="border-l border-[#e5e7eb] bg-[#f9fafb] p-5 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-[#1F7A4D]" />
                  <h3 className="text-sm font-semibold text-[#242424]">Selected</h3>
                  <span className="ml-auto text-xs text-[#6a7282]">{selectedDirectory.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {selectedDirectory.length === 0 ? (
                    <p className="text-sm text-[#6a7282]">No recipients selected.</p>
                  ) : (
                    selectedDirectory.map((person) => (
                      <div key={person.id} className="flex items-start gap-2 p-2 bg-white border border-[#e5e7eb] rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#242424] truncate">{person.name}</p>
                          <p className="text-xs text-[#6a7282] truncate">{person.role}</p>
                        </div>
                        <button onClick={() => togglePerson(person.id)} className="text-[#6a7282] hover:text-[#FB2C36] cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-4 mt-4 border-t border-[#e5e7eb] flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPeople([]);
                      if (!emailPanelOpen) clearComposer();
                    }}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer bg-white hover:bg-[#f9fafb]"
                  >
                    Clear
                  </button>
                  {emailPanelOpen ? (
                    <button
                      onClick={sendEmailBlast}
                      disabled={sendingEmail || selectedDirectory.length === 0 || !emailSubject.trim() || !emailBody.trim()}
                      className="flex-1 px-4 py-2 bg-[#155DFC] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1249c8] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Send Email
                    </button>
                  ) : (
                    <button
                      onClick={createChat}
                      disabled={savingChat || selectedDirectory.length === 0 || (composerMode === "group" && !roomTitle.trim())}
                      className="flex-1 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#176939] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {savingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                      {composerMode === "dm" ? "Start DM" : "Create Group"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteRoomId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#242424] mb-1">Delete Chat</h3>
                <p className="text-sm text-[#6a7282] mb-4">All messages in this chat will be permanently deleted.</p>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setDeleteRoomId(null)} disabled={deletingRoom} className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={deleteRoom} disabled={deletingRoom} className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {deletingRoom && <Loader2 className="w-4 h-4 animate-spin" />}
                    {deletingRoom ? "Deleting..." : "Delete"}
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
