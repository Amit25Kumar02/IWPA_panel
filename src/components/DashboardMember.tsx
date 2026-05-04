"use client";

import { useState, useEffect } from "react";
import {
    FileText, CalendarDays, Users, Bell,
    ArrowUpRight, AlertCircle, Download, MapPin,
} from "lucide-react";
import api from "../utils/api";
import { imgUrl } from "../utils/imgUrl";
import { CardListSkeleton } from "./ui/Shimmer";

interface Notice {
    _id: string;
    title: string;
    category: string;
    council?: string;
    date?: string;
    fileUrl?: string;
    fileName?: string;
}

interface Event {
    _id?: string;
    id?: string;
    title: string;
    date: string;
    location: string;
    badge?: string;
    image?: string;
}

export default function DashboardMember() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [noticesLoading, setNoticesLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        api.get("/api/v1/notices/get-notices")
            .then(({ data }) => {
                const list: Notice[] = Array.isArray(data) ? data : (data?.data ?? data?.notices ?? []);
                setNotices(list.slice(0, 3));
            })
            .catch(() => setNotices([]))
            .finally(() => setNoticesLoading(false));

        api.get("/api/v1/events/get-events")
            .then(({ data }) => {
                const list: Event[] = Array.isArray(data) ? data : (data?.data ?? data?.events ?? []);
                setEvents(list.slice(0, 3));
            })
            .catch(() => setEvents([]))
            .finally(() => setEventsLoading(false));
    }, []);

    return (
        <div className="p-6 space-y-6 bg-[#F9FAFB] min-h-screen">

            {/* Banner */}
            <div className="rounded-xl px-6 py-6 min-h-38.75 bg-linear-to-b from-[#0B3C5D] to-[#1F7A4D] text-white flex flex-col gap-2 justify-center shadow-sm">
                <h2 className="text-[28px] font-bold">Welcome back, Member User!</h2>
                <p className="text-[17px]">Indian Wind Power Association - Member Engagement Portal</p>
                <p className="text-[13px] opacity-90">Stay updated with the latest policies, events, and industry developments</p>
                {/* {(() => {
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    return user.membershipId ? (
                        <p className="text-[13px] font-mono opacity-80">Member ID: {user.membershipId}</p>
                    ) : null;
                })()} */}
            </div>

            {/* Stats */}
            <h2 className="text-[19px] font-semibold text-[#242424]">Subscription Payment History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Stat title="My Subscriptions" value="₹12,000" growth="Year" icon={<FileText />} color="#1F7A4D" bg="#D0FAE5" />
                <Stat title="Payment Due" value="₹10,000" growth="This month" icon={<AlertCircle />} color="#F59E0B" bg="#FEF3C7" />
                <Stat title="Last Paid" value="01 April 2025" growth="Paid" icon={<CalendarDays />} color="#2563EB" bg="#DBEAFE" />
                <Stat title="Date of Expiry" value="31 March 2027" growth="4 months left" icon={<Users />} color="#9333EA" bg="#F3E8FF" />
            </div>

            {/* Notices + Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Notices */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 text-[17px] font-semibold text-[#101828]">
                            <div className="p-2 bg-[#E7F7EE] rounded-lg">
                                <Bell className="w-4 h-4 text-[#1F7A4D]" />
                            </div>
                            Latest Notice Uploads
                        </h3>
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('navigate', { detail: 'noticeBoardmember' }));
                            }}
                            className="text-[13px] font-medium text-[#242424] flex items-center gap-1 cursor-pointer">
                            View All <ArrowUpRight size={16} />
                        </button>
                    </div>

                    {noticesLoading ? (
                        <CardListSkeleton rows={3} />
                    ) : notices.length === 0 ? (
                        <p className="text-sm text-[#6A7282] py-6 text-center">No notices available.</p>
                    ) : notices.map(n => (
                        <div key={n._id} className="flex justify-between items-center py-4 border-t border-[#E5E7EB]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-[#101828]">{n.title}</h3>
                                </div>
                                <div className="flex gap-2 mt-1 text-[13px]">
                                    <span className="px-2 py-0.5 bg-[#F3F4F6] text-[11px] text-[#4A5565] rounded">
                                        {n.category}
                                    </span>
                                    {n.council && (
                                        <span className="text-[#4A5565]">
                                            {n.council}{n.date ? ` · ${new Date(n.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {n.fileUrl ? (
                                <a
                                    href={imgUrl(n.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[13px] font-medium text-[#1F7A4D] hover:underline cursor-pointer shrink-0"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </a>
                            ) : (
                                <span className="text-[13px] text-[#9CA3AF]">No file</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Events */}
                <div className="bg-white rounded-xl border border-[#E5E7EB]">
                    <h3 className="flex items-center gap-2 text-[17px] font-semibold p-5.5 pb-4">
                        <div className="p-2 bg-[#DBEAFE] rounded-lg">
                            <CalendarDays className="w-4 h-4 text-[#1447E6]" />
                        </div>
                        Upcoming Events
                    </h3>

                    {eventsLoading ? (
                        <CardListSkeleton rows={3} />
                    ) : events.length === 0 ? (
                        <p className="text-sm text-[#6A7282] px-6 py-6 text-center">No upcoming events.</p>
                    ) : events.map(e => {
                        const badgeStyle = e.badge === "Partnered"
                            ? "bg-[#DBEAFE] text-[#1447E6]"
                            : "bg-[#E7F7EE] text-[#1F7A4D]";
                        return (
                            <div key={e._id ?? e.id} className="border-t border-[#E5E7EB] px-5.5 py-3">
                                <p className="text-[15px] text-[#101828] font-medium leading-snug">{e.title}</p>
                                <p className="text-[13px] text-[#4A5565] mt-0.5 flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" /> {e.date}
                                </p>
                                <p className="text-[13px] text-[#4A5565] flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {e.location}
                                </p>
                                {e.badge && (
                                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${badgeStyle}`}>
                                        {e.badge}
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('navigate', { detail: 'eventsmember' }));
                        }}
                        className="text-[13px] font-medium text-[#1F7A4D] flex justify-center p-4 items-center border-t border-[#E5E7EB] w-full mt-1 cursor-pointer">
                        View All Events
                    </button>
                </div>

            </div>

            {/* Sponsored */}
            <div className="rounded-xl border border-[#E5E7EB] bg-gradient-to-b from-[#F9FAFB] to-[#ECFDF5] py-10 text-center">
                <p className="text-[11px] text-[#6A7282]">SPONSORED CONTENT</p>
                <h3 className="text-[19px] font-semibold text-[#242424] mt-2">Partner with Leading Wind Energy Solutions</h3>
                <p className="text-[15px] text-[#6A7282] mt-1">Explore industry-leading O&M services and equipment suppliers</p>
                <button className="mt-4 bg-[#1F7A4D] text-white px-5 py-2 rounded-lg text-[15px] flex items-center gap-1 mx-auto">
                    Explore Company Profiles <ArrowUpRight size={16} />
                </button>
            </div>

        </div>
    );
}

function Stat({ title, value, growth, icon, color, bg }: any) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex justify-between">
            <div>
                <p className="text-[13px] text-[#6A7282]">{title}</p>
                <h3 className="text-[26px] font-bold mt-1">{value}</h3>
                <p className="text-[13px] mt-2 flex items-center gap-1" style={{ color }}>
                    <ArrowUpRight size={14} /> {growth}
                </p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bg, color }}>
                {icon}
            </div>
        </div>
    );
}
