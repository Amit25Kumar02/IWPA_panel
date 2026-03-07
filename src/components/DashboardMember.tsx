"use client";

import {
  FileText,
  CalendarDays,
  Users,
  Bell,
  ArrowUpRight,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default function DashboardMember() {
  return (
    <div className="p-6 space-y-6 bg-[#F9FAFB] min-h-screen">

      {/* Banner */}
      <div className="rounded-xl px-6 py-6 min-h-[155.47px] bg-linear-to-b from-[#0B3C5D] to-[#1F7A4D] text-[#ffffff] flex flex-col gap-2 justify-center shadow-sm">
        <h2 className="text-[28.44px] font-bold">
          Welcome back, Member User!
        </h2>

        <p className="text-[17.06px]">
          Indian Wind Power Association - Member Engagement Portal
        </p>

        <p className="text-[13.27px] opacity-90 ">
          Stay updated with the latest policies, events, and industry developments
        </p>
      </div>

      {/* Analytics */}
      <h2 className="text-[18.96px] font-semibold text-[#242424]">
        Analytics Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Stat
          title="Active Policies"
          value="24"
          growth="+3 this month"
          icon={<FileText />}
          color="#1F7A4D"
          bg="#D0FAE5"
        />

        <Stat
          title="Ongoing Legal Matters"
          value="8"
          growth="+2 this month"
          icon={<AlertCircle />}
          color="#F59E0B"
          bg="#FEF3C7"
        />

        <Stat
          title="Upcoming Events"
          value="12"
          growth="+5 this month"
          icon={<CalendarDays />}
          color="#2563EB"
          bg="#DBEAFE"
        />

        <Stat
          title="New Members"
          value="156"
          growth="+12 this month"
          icon={<Users />}
          color="#9333EA"
          bg="#F3E8FF"
        />
      </div>

      {/* Notices + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Notices */}
        <div className="lg:col-span-2 bg-[#ffffff] rounded-xl border-[0.76px] border-[#E5E7EB] p-5">

          <div className="flex justify-between items-center mb-4">

            <h3 className="flex items-center gap-2 text-[17px] font-semibold text-[#101828]">
              <div className="p-2 bg-[#E7F7EE] rounded-lg">
                <Bell className="w-4 h-4 text-[#1F7A4D]" />
              </div>

              Latest Notice Uploads
            </h3>

            <span className="text-[13.27px] font-medium text-[#242424] flex items-center gap-1 cursor-pointer">
              View All <ArrowUpRight size={16}/>
            </span>

          </div>

          <Notice
            title="Maharashtra State Wind Energy Guidelines"
            tag="Regulation"
          />

          <Notice
            title="Policy Guidelines Released"
            tag="Policy"
            badge="NEW"
          />

          <Notice
            title="Meeting Quarterly Schedule Announced"
            tag="Announcement"
            badge="NEW"
          />

        </div>

        {/* Events */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] ">

          <h3 className="flex items-center gap-2 text-[17px] font-semibold mb-4 p-[22.75px]">

            <div className="p-2 bg-[#DBEAFE] rounded-lg">
              <CalendarDays className="w-4 h-4 text-[#1447E6]" />
            </div>

            Upcoming Events

          </h3>

          <Event
            title="National Council Meeting"
            date="20 January 2026"
            place="Virtual"
            status="Internal"
            color="green"
          />

          <Event
            title="Renewable Energy Expo"
            date="10 March 2026"
            place="Mumbai"
            status="Partnered"
            color="blue"
          />

          <button className="text-[13.27px] font-medium text-[#1F7A4D] flex justify-center p-4 items-center border-t-[0.76px] border-[#E5E7EB] w-full mt-3">
            View All Events
          </button>

        </div>

      </div>

      {/* Sponsored */}
      <div className="rounded-xl border-[0.76px] border-[#E5E7EB] bg-linear-to-b from-[#F9FAFB] to-[#ECFDF5] py-10 text-center">

        <p className="text-[11.38px] text-[#6A7282]">SPONSORED CONTENT</p>

        <h3 className="text-[18.96px] font-semibold text-[#242424] mt-2">
          Partner with Leading Wind Energy Solutions
        </h3>

        <p className="text-[15.17px] text-[#6A7282] mt-1">
          Explore industry-leading O&M services and equipment suppliers
        </p>

        <button className="mt-4 bg-[#1F7A4D] text-[#ffffff] px-5 py-2 rounded-lg text-[15.17px] flex items-center gap-1 mx-auto">
          Explore Company Profiles <ArrowUpRight size={16}/>
        </button>

      </div>

      {/* Quick Access */}

      <h2 className="text-[18.96px] font-semibold text-[#242424]">
        Quick Access
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">

        <Action icon={<Bell />} label="Notice Board" bg="#D1FAE5" color="#1F7A4D" />

        <Action icon={<FileText />} label="Publications" bg="#F3E8FF" color="#9333EA" />

        <Action icon={<Users />} label="Company Profiles" bg="#D1FAE5" color="#1F7A4D" />

        <Action icon={<AlertCircle />} label="Ask IWPA" bg="#FEF3C7" color="#F59E0B" />

        <Action icon={<BarChart3 />} label="Reports" bg="#DBEAFE" color="#2563EB" />

      </div>

    </div>
  );
}

/* ---------- Components ---------- */

function Stat({ title, value, growth, icon, color, bg }: any) {
  return (
    <div className="bg-[#ffffff] border-[0.76px] border-[#E5E7EB] rounded-xl p-4 flex justify-between">
      <div>
        <p className="text-[13.27px] text-[#6A7282]">{title}</p>
        <h3 className="text-[28.44px] font-bold mt-1">{value}</h3>
        <p className="text-[13.27px] mt-2 flex items-center gap-1" style={{color}}>
          <ArrowUpRight size={14}/> {growth}
        </p>
      </div>

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{background:bg,color:color}}
      >
        {icon}
      </div>
    </div>
  );
}

function Notice({ title, tag, badge }:any){
  return(
    <div className="flex justify-between items-center py-4 border-t border-[#E5E7EB]">

      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-[#101828]">
            {title}
          </h3>
           {badge && (
            <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#1F7A4D] rounded">
              {badge}
            </span>
          )}
        </div>
        {/* <p className="text-sm font-medium">{title}</p> */}

        <div className="flex gap-2 mt-1 text-[13.27px]">

          <span className="px-2 py-0.5 bg-[#F3F4F6] text-[11.38px] text-[#4A5565] rounded">
            {tag}
          </span>

          <span className="text-[#4A5565]">
            National Council · Jan 2026
          </span>

        </div>

      </div>

      <button className="text-[13.27px] font-medium text-[#242424]">
        Download
      </button>

    </div>
  )
}

function Event({title,date,place,status,color}:any){

  const styles:any={
    green:"bg-[#E7F7EE] text-[#1F7A4D]",
    blue:"bg-[#DBEAFE] text-[#1447E6]"
  }

  return(
    <div className="border-t border-[#E5E7EB] px-[22.75px] py-2.5 mb-3">

      <p className="text-[15px] text-[#101828] font-medium">{title}</p>

      <p className="text-[13.27px] text-[#4A5565]">{date}</p>

      <p className="text-[13.27px] text-[#4A5565]">{place}</p>

      <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${styles[color]}`}>
        {status}
      </span>

    </div>
  )
}

function Action({icon,label,bg,color}:any){
  return(
    <div className="bg-[#ffffff] border-[0.76px] border-[#E5E7EB] rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-sm cursor-pointer">

      <div
        className="p-2 rounded-lg"
        style={{background:bg,color}}
      >
        {icon}
      </div>

      <p className="text-[13.27px] text-[#101828] font-medium text-center">{label}</p>

    </div>
  )
}