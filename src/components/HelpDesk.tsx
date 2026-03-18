"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function HelpDesk() {
  const [showNewTicket, setShowNewTicket] = useState(false);

  const tickets = [
    {
      id: "TKT-2026-001",
      subject: "Membership Renewal Query",
      category: "Membership",
      status: "Open",
      created: "1/7/2026",
      updated: "1/7/2026",
      messages: 3,
    },
    {
      id: "TKT-2026-002",
      subject: "Subscription Payment Issue",
      category: "Subscription",
      status: "In Progress",
      created: "1/5/2026",
      updated: "1/6/2026",
      messages: 5,
    },
    {
      id: "TKT-2025-189",
      subject: "Technical Query on Wind Regulations",
      category: "Industry Query",
      status: "Resolved",
      created: "12/28/2025",
      updated: "1/2/2026",
      messages: 7,
    },
  ];

  const statusStyle = (status: string) => {
    if (status === "Resolved")
      return "bg-[#d0fae5] text-[#1F7A4D]";
    if (status === "In Progress")
      return "bg-[#fef3c7] text-[#f59e0b]";
    return "bg-[#dbeafe] text-[#155DFC]";
  };

  const statusIcon = (status: string) => {
    if (status === "Resolved") return <CheckCircle className="w-4 h-4" />;
    if (status === "In Progress") return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">
            Ask IWPA – Help Desk
          </h1>
          <p className="text-[#6a7282] mt-1">
            Get support for membership, subscription, and industry queries
          </p>
        </div>

        {/* <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button> */}
      </div>

      {/* New Ticket */}
      {showNewTicket && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">
            Create New Support Ticket
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select className="border border-[#e5e7eb] rounded-lg px-3 py-2">
              <option>Select Category</option>
              <option>Membership</option>
              <option>Subscription</option>
              <option>Industry Query</option>
              <option>Technical</option>
            </select>

            <input
              placeholder="Subject"
              className="border border-[#e5e7eb] rounded-lg px-3 py-2"
            />
          </div>

          <textarea
            rows={4}
            placeholder="Describe your issue..."
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 mb-4"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowNewTicket(false)}
              className="px-4 py-2 border border-[#e5e7eb] rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-[#1F7A4D] text-white rounded-lg cursor-pointer">
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* Tickets */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-auto">
          <div className="px-6 py-4 border-b border-[#e5e7eb] font-semibold">
            My Support Tickets
          </div>

          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-6 border-b border-[#e5e7eb] hover:bg-[#f9fafb]"
            >
              <div className="flex justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-[#242424]">
                      {t.subject}
                    </h3>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle(
                        t.status
                      )}`}
                    >
                      {statusIcon(t.status)}
                      {t.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#6a7282]">
                    <span className="bg-[#f3f4f6] px-2 py-1 rounded text-xs font-mono">
                      {t.id}
                    </span>
                    <span className="bg-[#f3f4f6] px-2 py-1 rounded text-xs">
                      {t.category}
                    </span>
                    <span>Created: {t.created}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {t.messages} messages
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#6a7282] flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last updated: {t.updated}
                </div>
              </div>

              <button className="text-sm text-[#1F7A4D] font-medium hover:underline flex items-center gap-1">
                View Conversation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <InfoCard
          icon={<MessageSquare className="w-6 h-6 text-[#1F7A4D]" />}
          bg="bg-[#d0fae5]"
          text="text-[#1F7A4D]"
          title="Average Response Time"
          value="2–4 hours"
          desc="During business hours"
        />
        <InfoCard
          icon={<CheckCircle className="w-6 h-6 text-[#155DFC]" />}
          bg="bg-[#dbeafe]"
          text="text-[#155DFC]"
          title="Resolution Rate"
          value="94%"
          desc="Tickets resolved within 48 hours"
        />
        <InfoCard
          icon={<AlertCircle className="w-6 h-6 text-[#f59e0b]" />}
          bg="bg-[#fef3c7]"
          text="text-[#242424]"
          title="Support Hours"
          value="Mon–Fri, 9 AM – 6 PM"
          desc="IST (Indian Standard Time)"
        />
      </div>
    </div>
  );
}

/* Info Card */
function InfoCard({
  icon,
  bg,
  title,
  value,
  desc,
  text,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="bg-[#FFFFFF] border-[0.76px] border-[#e5e7eb] rounded-lg p-6">
      <div
        className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[#242424] mb-1">{title}</h3>
      <p className={`text-xl font-bold ${text}`}>{value}</p>
      <p className="text-sm text-[#6a7282]">{desc}</p>
    </div>
  );
}