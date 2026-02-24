"use client";

import {
  FileText,
  Scale,
  CalendarDays,
  Users,
  Bell,
  Download,
  ArrowUpRight,
  Building2,
  MessageCircleQuestion,
  BarChart3,
  TrendingUp,
  Users2,
  User2Icon,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#009966] to-[#009689] min-h-[128px] rounded-xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#ffffff]">
          Welcome back, <span className="font-bold">Admin User!</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-[17px] text-[#D0FAE5] mt-1">
          Stay updated with the latest policies, events, and industry insights from IWPA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Active Policies" value="24" growth="+3%" icon={<FileText />} color="green" bg="green" />
        <Stat title="Ongoing Legal Matters" value="8" growth="+2%" icon={<Scale />} color="amber" bg="amber" />
        <Stat title="Upcoming Events" value="12" growth="+5%" icon={<CalendarDays />} color="blue" bg="blue" />
        <Stat title="New Members" value="156" growth="+12%" icon={<Users />} color="purple" bg="purple" />
      </div>

      {/* Notices + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Latest Notices */}
        <div className="lg:col-span-2 bg-card rounded-xl border-[0.76px] border-border p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-base sm:text-[17px] text-card-foreground flex items-center gap-2">
              <div className="p-2 bg-[#E7F7EE] dark:bg-[#1F7A4D]/20 rounded-lg">
                <Bell className="w-4.5 h-4.5 text-[#1F7A4D]" />
              </div>
              Latest Notice Uploads
            </h3>
            <span className="text-xs sm:text-sm text-foreground flex items-center gap-1 cursor-pointer">
              View All <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {[
            "New Wind Energy Policy Guidelines Released",
            "Quarterly Meeting Schedule Announced",
            "Maharashtra State Wind Energy Guidelines",
            "Policy Guidelines Released",
            "Meeting Quarterly Schedule Announced",
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 py-4 sm:py-5.5 border-t-[0.76px] border-border last:border-none"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">{item}</p>
                <p className="text-xs sm:text-[13px] text-muted-foreground">
                  National Council · Jan 2026
                </p>
              </div>
              <button className="text-xs sm:text-[13px] font-medium text-foreground cursor-pointer self-start sm:self-auto">
                 Download
              </button>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <h3 className="font-semibold text-base sm:text-[17px] mb-4 flex items-center gap-2 text-card-foreground">
            <div className="p-2 bg-[#DBEAFE] dark:bg-[#1447E6]/20 rounded-lg">
              <CalendarDays className="w-4.5 h-4.5 text-[#1447E6]" />
            </div>
            Upcoming Events
          </h3>

          <Event
            title="Wind Energy Technology Summit 2026"
            date="15 February 2026"
            place="New Delhi"
            stats="Internal"
          />
          <Event
            title="National Council Meeting"
            date="20 January 2026"
            place="Virtual"
            stats="Internal"
          />
          <Event
            title="Renewable Energy Expo"
            date="10 March 2026"
            place="Mumbai"
            stats="Partnered"
          />

          <button className="text-blue-600 text-sm mt-4 w-full">
            View All Events
          </button>
        </div>
      </div>

      {/* Sponsored */}
      <div className="rounded-xl min-h-[200px] sm:min-h-[227px] bg-linear-to-r from-[#155DFC] to-[#0092B8] p-4 sm:p-6 text-[#ffffff] flex flex-col justify-center">
        <span className="text-xs bg-[#FFFFFF33] px-2 py-1 rounded-full font-medium w-fit">
          SPONSORED
        </span>
        <h3 className="mt-3 text-lg sm:text-xl lg:text-[22.5px] font-bold">
          Wind Turbine Maintenance Services
        </h3>
        <p className="text-sm sm:text-[15px] text-[#DBEAFE] max-w-xl mt-1">
          Expert maintenance and O&M services for wind farms across India
        </p>
        <button className="mt-4 bg-[#FFFFFF] text-[#155DFC] px-4 py-2 rounded-lg text-sm sm:text-[15px] font-medium w-fit">
          Learn More
        </button>
      </div>

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
    <div className="bg-card border-[0.76px] border-border rounded-xl p-3 sm:p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg w-fit ${bgs[bg]} ${colors[color]}`}>
          {icon}
        </div>
        <p className={`text-[10px] sm:text-xs flex items-center gap-1 font-medium text-[#1F7A4D] whitespace-nowrap`}>{growth} <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#1F7A4D]" /></p>
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">{value}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
      </div>

    </div>
  );
}

function Event({ title, date, place, stats }: any) {
  return (
    <div className="mb-4 border-t border-border pt-3 last:border-none">
      <p className="text-sm font-medium text-card-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">
        {date}
      </p>
      <p className="text-xs text-muted-foreground">
        {place}
      </p>
      <p className="text-xs text-[#1F7A4D] bg-[#E7F7EE] dark:bg-[#1F7A4D]/20 w-fit px-2 py-1 rounded mt-1">
        {stats}
      </p>
    </div>
  );
}

function Action({ icon, label, bg, color }: any) {
  return (
    <div className="bg-card border-[0.76px] border-border rounded-xl p-3 sm:p-4 flex flex-col items-center gap-2 hover:shadow cursor-pointer transition-shadow">
      <div className={`p-2 ${bg} rounded-lg ${color}`}>{icon}</div>
      <p className="text-[10px] sm:text-xs font-medium text-center text-card-foreground leading-tight">{label}</p>
    </div>
  );
}