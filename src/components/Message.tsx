"use client";

import { useState } from "react";
import { MessageCircle, Bell, Send } from "lucide-react";

interface MessageItem {
  id: number;
  from: string;
  message: string;
  time: string;
  type: "system" | "alert" | "notification";
}

export default function Messages() {
  const [text, setText] = useState("");

  const messages: MessageItem[] = [
    {
      id: 1,
      from: "System",
      message: "Welcome to IWPA Member Portal!",
      time: "2 days ago",
      type: "system",
    },
    {
      id: 2,
      from: "Admin Team",
      message: "Your membership certificate is ready for download",
      time: "1 day ago",
      type: "alert",
    },
    {
      id: 3,
      from: "Notification",
      message: "Upcoming event: Wind Energy Summit 2026",
      time: "5 hours ago",
      type: "notification",
    },
  ];

  const getIcon = (type: MessageItem["type"]) => {
    if (type === "system")
      return <MessageCircle className="w-5 h-5 text-[#1F7A4D]" />;
    if (type === "alert")
      return <Bell className="w-5 h-5 text-[#f59e0b]" />;
    return <Bell className="w-5 h-5 text-[#155DFC]" />;
  };

  const getBg = (type: MessageItem["type"]) => {
    if (type === "system") return "bg-[#ecfdf5]";
    if (type === "alert") return "bg-[#ffffff]";
    if (type === "notification") return "bg-[#ffffff]";
    return "bg-[#ffffff]";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Messages</h1>
        <p className="text-[#6a7282] mt-1">
          Internal messages and quick alerts
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 " style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#d0fae5] rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[#1F7A4D]" />
          </div>
          <div>
            <p className="text-sm text-[#6a7282]">Total Messages</p>
            <p className="text-2xl font-bold text-[#1F7A4D]">24</p>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#fef3c7] rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-sm text-[#6a7282]">Alerts</p>
            <p className="text-2xl font-bold text-[#f59e0b]">3</p>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#dbeafe] rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#155DFC]" />
          </div>
          <div>
            <p className="text-sm text-[#6a7282]">Notifications</p>
            <p className="text-2xl font-bold text-[#155DFC]">8</p>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-auto">
          <div className="p-4 border-b border-[#e5e7eb]">
            <h2 className="font-semibold text-[#242424]">Recent Messages</h2>
          </div>

          <div className="divide-y divide-[#e5e7eb]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 flex items-start gap-3 ${getBg(msg.type)}`}
              >
                {getIcon(msg.type)}
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm text-[#242424]">
                      {msg.from}
                    </span>
                    <span className="text-xs text-[#6a7282]">{msg.time}</span>
                  </div>
                  <p className="text-sm text-[#6a7282]">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Message */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
        <h3 className="font-semibold text-[#242424] mb-3">
          Send Quick Message
        </h3>

        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-lg outline-none"
          />
          <button className="px-6 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}