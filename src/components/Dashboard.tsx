"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CalendarDays,
  Users,
  Bell,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import AdminCalendar from "./ActionCalendar";
import api from "../utils/api";

export default function Dashboard() {
  const [members, setMembers] = useState<any[]>([]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userType = localStorage.getItem("userType") || "admin";
  const displayName = storedUser.name || storedUser.companyName || "Admin User";
  const roleCategory = storedUser.roleCategory || "";
  const portalLabel = userType === "role" && roleCategory
    ? roleCategory.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) + " Portal"
    : "IWPA Admin Portal";

  useEffect(() => {
    api.get("/api/v1/members/get-members")
      .then(res => setMembers(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {});
  }, []);

  const getPaymentStatus = (m: any) => {
    const received = m.payment?.totalReceived ?? 0;
    const due = m.billing?.netReceivable ?? 0;
    if (due === 0 && received === 0) return "Pending";
    return received >= due ? "Paid" : "Pending";
  };

  const totalMembers = members.length;
  const paidMembers = members.filter(m => getPaymentStatus(m) === "Paid").length;
  const dueMembers = members.filter(m => getPaymentStatus(m) === "Pending").length;
  const totalCollection = members.reduce((sum, m) => sum + (m.payment?.totalReceived ?? 0), 0);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#009966] to-[#009689] min-h-32 rounded-xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        <h2 className="text-xl sm:text-2xl lg:text-[28.44px] font-bold text-[#ffffff]">
          Welcome back, {displayName}!
        </h2>
        <p className="text-sm sm:text-base lg:text-[17px] text-[#D0FAE5] mt-1">
          {portalLabel} — Stay updated with the latest policies, events, and industry insights from IWPA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Members" value={totalMembers} growth="+12%" icon={<Users />} color="purple" bg="purple" />
        <Stat title="Paid Members" value={paidMembers} growth="+12%" icon={<Users />} color="green" bg="green" />
        <Stat title="Members with due" value={dueMembers} growth="+2%" icon={<AlertCircle />} color="amber" bg="amber" />
        <Stat title="Total subscription collection" value={`₹${totalCollection.toLocaleString("en-IN")}`} growth="+5%" icon={<CalendarDays />} color="blue" bg="blue" />
      </div>

      {/* Admin Calendar */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-[#ffffff] rounded-xl border-[1.35px] border-[#CCCCCC] p-6 overflow-x-auto">
          <AdminCalendar />
        </div>
      </div>

      {/* Sponsored */}
      {/* <div className="rounded-xl min-h-[200px] sm:min-h-[227px] bg-linear-to-r from-[#155DFC] to-[#0092B8] p-4 sm:p-6 text-[#ffffff] flex flex-col justify-center">
        <span className="text-xs bg-[#FFFFFF33] px-2 py-1 rounded-full font-medium w-fit">
          SPONSORED
        </span>
        <h3 className="mt-3 text-lg sm:text-xl lg:text-[22.5px] font-bold">
          Wind Turbine Maintenance Services
        </h3>
        <p className="text-sm sm:text-[15px] text-[#DBEAFE] max-w-xl mt-1">
          Expert maintenance and O&M services for wind farms across India
        </p>
        <button className="mt-4 bg-[#FFFFFF] text-[#155DFC] px-4 py-2 rounded-lg text-sm sm:text-[15px] font-medium w-fit cursor-pointer">
          Learn More
        </button>
      </div> */}

      {/* Bottom Actions */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Action icon={<Bell />} label="Notice Board" bg="bg-[#D0FAE5] dark:bg-[#1F7A4D]/20" color="text-[#1F7A4D]" />
        <Action icon={<CalendarDays />} label="Events" bg="bg-[#DBEAFE] dark:bg-[#1447E6]/20" color="text-[#1447E6]" />
        <Action icon={<FileText />} label="Publications" bg="bg-[#F3E8FF] dark:bg-[#8200DB]/20" color="text-[#8200DB]" />
        <Action icon={<Users />} label="Company Profiles" bg="bg-[#D0FAE5] dark:bg-[#1F7A4D]/20" color="text-[#1F7A4D]" />
        <Action icon={<AlertCircle />} label="Ask IWPA" bg="bg-[#FEF3C6] dark:bg-[#BB4D00]/20" color="text-[#BB4D00]" />
        <Action icon={<BarChart3 />} label="Reports" bg="bg-[#DBEAFE] dark:bg-[#1447E6]/20" color="text-[#1447E6]" />
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Stat({ title, value, growth, icon, color, bg }: any) {
  const colors: any = {
    green: "text-[#1F7A4D]",
    amber: "text-[#BB4D00]",
    blue: "text-[#1447E6]",
    purple: "text-[#8200DB]",
  };
  const bgs: any = {
    green: "bg-[#D0FAE5] dark:bg-[#1F7A4D]/20",
    amber: "bg-[#FEF3C6] dark:bg-[#BB4D00]/20",
    blue: "bg-[#DBEAFE] dark:bg-[#1447E6]/20",
    purple: "bg-[#F3E8FF] dark:bg-[#8200DB]/20",
  };

  return (
    <div className="bg-card border-[0.76px] border-[#E5E7EB] rounded-xl p-4 sm:p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg w-fit ${bgs[bg]} ${colors[color]}`}>
          {icon}
        </div>
        <p className={`text-[13.27px] flex items-center gap-1 font-medium text-[#1F7A4D] whitespace-nowrap`}>{growth} <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#1F7A4D]" /></p>
      </div>
      <div>
        <h2 className="text-[28.44px]  font-bold text-[#101828]">{value}</h2>
        <p className="text-[13.27px] text-[#4A5565]">{title}</p>
      </div>

    </div>
  );
}

function Action({ icon, label, bg, color }: any) {
  return (
    <div className="bg-card border-[0.76px] border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow cursor-pointer transition-shadow">
      <div className={`p-2 ${bg} rounded-lg ${color}`}>{icon}</div>
      <p className="text-[13.27px] font-medium text-center text-[#101828] leading-tight">{label}</p>
    </div>
  );
}