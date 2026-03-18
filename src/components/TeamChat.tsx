"use client";

import { useState } from "react";
import { Search, Paperclip, Send } from "lucide-react";

export default function TeamChat() {
  const [message, setMessage] = useState("");

  const discussions = [
    {
      id: 1,
      title: "Q1 2026 Policy Review",
      note: "Updated draft shared",
      participants: 12,
      time: "5 min ago",
      unread: 3,
    },
    {
      id: 2,
      title: "Maharashtra Wind Energy Guidelines",
      note: "Meeting scheduled for tomorrow",
      participants: 8,
      time: "2 hours ago",
      unread: 0,
    },
    {
      id: 3,
      title: "National Council Meeting Agenda",
      note: "Agenda items finalized",
      participants: 15,
      time: "1 day ago",
      unread: 1,
    },
  ];

  const messages = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "National Council",
      time: "10:30 AM",
      text: "Has everyone reviewed the policy draft?",
      avatar: "R",
    },
    {
      id: 2,
      name: "Anita Sharma",
      role: "State Council",
      time: "10:35 AM",
      text: "Yes, I have a few suggestions to add.",
      avatar: "A",
    },
    {
      id: 3,
      name: "Vikram Patel",
      role: "National Council",
      time: "10:40 AM",
      text: "Let's discuss in tomorrow's meeting.",
      avatar: "V",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="p-4 sm:p-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[#242424]">Team Chat</h1>
        <p className="text-sm text-[#6a7282] mt-1">
          Internal communication and discussion forum for council members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Panel – Discussions */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden h-[400px] sm:h-auto">
          <div className="p-3 sm:p-4 border-b border-[#e5e7eb]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" />
              <input
                placeholder="Search discussions..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#e5e7eb] rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#e5e7eb] overflow-y-auto max-h-[320px] sm:max-h-none">
            {discussions.map((d) => (
              <div
                key={d.id}
                className="p-3 sm:p-4 hover:bg-[#f9fafb] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-medium text-[#242424]">
                    {d.title}
                  </h3>
                  {d.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#1F7A4D] text-white text-xs flex items-center justify-center">
                      {d.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6a7282] mb-2">{d.note}</p>
                <div className="flex justify-between text-xs text-[#6a7282]">
                  <span>{d.participants} participants</span>
                  <span>{d.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel – Chat */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb] flex flex-col h-[500px] sm:h-[600px]">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-[#e5e7eb]">
            <h2 className="text-sm sm:text-base font-semibold text-[#242424]">
              Q1 2026 Policy Review
            </h2>
            <p className="text-xs text-[#6a7282]">12 participants</p>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center font-semibold text-sm">
                  {m.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#6a7282] mb-1">
                    <span className="font-medium text-[#242424] text-sm">
                      {m.name}
                    </span>
                    <span>{m.role}</span>
                    <span>• {m.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#242424]">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-[#e5e7eb]">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#f9fafb] rounded-lg">
                <Paperclip className="w-5 h-5 text-[#6a7282]" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 sm:px-4 py-2 text-sm border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D]"
              />
              <button className="px-3 sm:px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939]">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}