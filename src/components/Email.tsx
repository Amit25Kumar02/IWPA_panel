"use client";

import { useState } from "react";
import {
  Send,
  Inbox,
  Star,
  Trash2,
  Search,
  X,
  Paperclip,
} from "lucide-react";

interface EmailItem {
  id: number;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  starred: boolean;
}

export default function Email() {
  const [emails, setEmails] = useState<EmailItem[]>([
    {
      id: 1,
      from: "admin@iwpa.org",
      subject: "Membership Renewal Reminder",
      preview: "Your membership is expiring in 30 days...",
      body:
        "Dear Member,\n\nYour IWPA membership is expiring in 30 days. Please renew to continue uninterrupted access.\n\nRegards,\nIWPA Team",
      time: "10:30 AM",
      unread: true,
      starred: false,
    },
    {
      id: 2,
      from: "noreply@iwpa.org",
      subject: "New Notice Board Update",
      preview: "A new policy document has been uploaded...",
      body:
        "A new policy document has been uploaded. Please review it on the portal.",
      time: "9:15 AM",
      unread: true,
      starred: true,
    },
    {
      id: 3,
      from: "support@iwpa.org",
      subject: "Help Desk Ticket Resolved",
      preview: "Your ticket #TKT-2026-001 has been resolved...",
      body:
        "Your help desk ticket has been resolved successfully.",
      time: "Yesterday",
      unread: false,
      starred: false,
    },
  ]);

  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStar = (id: number) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, starred: !e.starred } : e
      )
    );
  };

  const openEmail = (email: EmailItem) => {
    setSelectedEmail(email);
    setEmails((prev) =>
      prev.map((e) =>
        e.id === email.id ? { ...e, unread: false } : e
      )
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Email</h1>
        <p className="text-[#6a7282] mt-1">
          Official email communication and system notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors mb-4 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Compose
          </button>

          <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#ecfdf5] text-[#1F7A4D]">
              <Inbox className="w-4 h-4" />
              <span className="font-medium">Inbox</span>
              <span className="ml-auto text-xs">2</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f9fafb]">
              <Star className="w-4 h-4" />
              Starred
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f9fafb]">
              <Send className="w-4 h-4" />
              Sent
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f9fafb]">
              <Trash2 className="w-4 h-4" />
              Trash
            </div>
          </nav>
        </div>

        {/* Email List + Reading Pane (same column visually) */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
              <input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Email List */}
          {!selectedEmail && (
            <div className="divide-y divide-[#e5e7eb]">
              {emails
                .filter((email) =>
                  searchQuery === ""
                    ? true
                    : email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmail(email)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-[#f9fafb] ${
                    email.unread ? "bg-[#f9fafb]" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                      className="mt-1"
                    >
                      {email.starred ? (
                        <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                      ) : (
                        <Star className="w-4 h-4 text-[#6a7282]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span
                          className={`text-sm ${
                            email.unread
                              ? "font-medium text-[#242424]"
                              : "text-[#6a7282]"
                          }`}
                        >
                          {email.from}
                        </span>
                        <span className="text-xs text-[#6a7282]">
                          {email.time}
                        </span>
                      </div>

                      <h3
                        className={`text-sm mb-1 ${
                          email.unread
                            ? "font-semibold text-[#242424]"
                            : "text-[#6a7282]"
                        }`}
                      >
                        {email.subject}
                      </h3>

                      <p className="text-xs text-[#6a7282] truncate">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reading Pane */}
          {selectedEmail && (
            <div className="p-6">
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-sm text-[#1F7A4D] mb-4 cursor-pointer"
              >
                ← Back to inbox
              </button>

              <h2 className="text-lg font-semibold text-[#242424] mb-1">
                {selectedEmail.subject}
              </h2>
              <p className="text-sm text-[#6a7282] mb-4">
                From: {selectedEmail.from}
              </p>
              <pre className="text-sm text-[#242424] whitespace-pre-wrap">
                {selectedEmail.body}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              placeholder="To"
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              placeholder="Subject"
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Message..."
              rows={5}
              className="w-full mb-4 px-3 py-2 border rounded-lg"
            />

            <div className="flex justify-between">
              <button className="p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer">
                <Paperclip className="w-5 h-5 text-[#6a7282]" />
              </button>
              <button className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] cursor-pointer">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}