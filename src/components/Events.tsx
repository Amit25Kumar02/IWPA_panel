"use client";

import { useState } from "react";
import {
    CalendarDays,
    MapPin,
    Users,
    ArrowRight,
    Clock,
    Calendar,
    LocateFixedIcon,
    ArrowLeft,
} from "lucide-react";

interface AgendaItem {
    time: string;
    description: string;
    speaker?: string;
}

interface Speaker {
    name: string;
    title: string;
    image?: string;
}

interface Event {
    id: number;
    title: string;
    shortDescription: string;
    fullDescription?: string;
    date: string;
    time: string;
    location: string;
    address?: string;
    attendees: string;
    price: string;
    image: string;
    badge?: string;
    agenda?: AgendaItem[];
    speakers?: Speaker[];
}

export default function EventsPage() {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const events: Event[] = [
        {
            id: 1,
            title: "Wind Energy Technology Summit 2026",
            shortDescription: "Join us for the premier wind energy technology summit showcasing the latest innovations, policy updates, and networking opportunities in the renewable energy sector.",
            fullDescription:
                "The Wind Energy Technology Summit 2026 is IWPA’s flagship annual event bringing together industry leaders, policymakers, and researchers.",
            date: "15 February 2026",
            time: "09:00 AM - 05:00 PM",
            location: "India Habitat Centre, New Delhi",
            address: "Lodi Road, New Delhi, Delhi 110003",
            attendees: "500 Expected Attendees",
            price: "Free for Members",
            badge: "Internal",
            image:
                "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=1200",
            agenda: [
                { time: "09:00 AM", description: "Registration & Breakfast" },
                { time: "10:00 AM", description: "Opening Keynote – Dr. Rajesh Kumar", speaker: "Dr. Rajesh Kumar" },
                { time: "11:00 AM", description: "Panel Discussion: Policy Frameworks", speaker: "Industry Leaders" },
                { time: "12:30 PM", description: "Lunch Break" },
                { time: "02:00 PM", description: "Technical Sessions", speaker: "Various Speakers" },
                { time: "04:00 PM", description: "Networking Session" },
                { time: "05:00 PM", description: "Closing Remarks", speaker: "IWPA President" },
            ],
            speakers: [
                { name: "Dr. Rajesh Kumar", title: "Chief Scientist, NIWE", image: "https://randomuser.me/api/portraits/men/32.jpg" },
                { name: "Ms. Priya Sharma", title: "Policy Advisor, MNRE", image: "https://randomuser.me/api/portraits/women/44.jpg" },
                { name: "Mr. Arun Mehta", title: "CEO, WindTech India", image: "https://randomuser.me/api/portraits/men/22.jpg" },
            ],
        },
        {
            id: 2,
            title: "National Council Quarterly Meeting",
            shortDescription: "Quarterly review meeting for National Council members.",
            date: "20 January 2026",
            time: "Virtual",
            location: "Virtual",
            attendees: "50 Expected Attendees",
            price: "Members Only",
            badge: "Internal",
            image:
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200",
            agenda: [
                { time: "09:00 AM", description: "Registration & Breakfast" },
                { time: "10:00 AM", description: "Opening Keynote – Dr. Rajesh Kumar" },
                { time: "11:00 AM", description: "Panel Discussion: Policy Frameworks" },
                { time: "12:30 PM", description: "Lunch Break" },
                { time: "02:00 PM", description: "Technical Sessions" },
                { time: "04:00 PM", description: "Networking Session" },
                { time: "05:00 PM", description: "Closing Remarks" },
            ],
            speakers: [
                { name: "Dr. Rajesh Kumar", title: "Chief Scientist, NIWE" },
                { name: "Ms. Priya Sharma", title: "Policy Advisor, MNRE" },
                { name: "Mr. Arun Mehta", title: "CEO, WindTech India" },
            ],
        },
        {
            id: 3,
            title: "Renewable Energy Expo 2026",
            shortDescription: "International exhibition featuring renewable energy solutions.",
            date: "10 March 2026",
            time: "All Day",
            location: "Bombay Exhibition Centre, Mumbai",
            attendees: "2000+ Attendees",
            price: "₹5,000",
            badge: "Partnered",
            image:
                "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format&fit=crop",

            agenda: [
                { time: "09:00 AM", description: "Registration & Breakfast" },
                { time: "10:00 AM", description: "Opening Keynote – Dr. Rajesh Kumar" },
                { time: "11:00 AM", description: "Panel Discussion: Policy Frameworks" },
                { time: "12:30 PM", description: "Lunch Break" },
                { time: "02:00 PM", description: "Technical Sessions" },
                { time: "04:00 PM", description: "Networking Session" },
                { time: "05:00 PM", description: "Closing Remarks" },
            ],
            speakers: [
                { name: "Dr. Rajesh Kumar", title: "Chief Scientist, NIWE" },
                { name: "Ms. Priya Sharma", title: "Policy Advisor, MNRE" },
                { name: "Mr. Arun Mehta", title: "CEO, WindTech India" },
            ],
        },
          {
            id: 1,
            title: "Wind Energy Technology Summit 2026",
            shortDescription: "Join us for the premier wind energy technology summit showcasing the latest innovations, policy updates, and networking opportunities in the renewable energy sector.",
            fullDescription:
                "The Wind Energy Technology Summit 2026 is IWPA’s flagship annual event bringing together industry leaders, policymakers, and researchers.",
            date: "15 February 2026",
            time: "09:00 AM - 05:00 PM",
            location: "India Habitat Centre, New Delhi",
            address: "Lodi Road, New Delhi, Delhi 110003",
            attendees: "500 Expected Attendees",
            price: "Free for Members",
            badge: "Internal",
            image:
                "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=1200",
            agenda: [
                { time: "09:00 AM", description: "Registration & Breakfast" },
                { time: "10:00 AM", description: "Opening Keynote – Dr. Rajesh Kumar", speaker: "Dr. Rajesh Kumar" },
                { time: "11:00 AM", description: "Panel Discussion: Policy Frameworks", speaker: "Industry Leaders" },
                { time: "12:30 PM", description: "Lunch Break" },
                { time: "02:00 PM", description: "Technical Sessions", speaker: "Various Speakers" },
                { time: "04:00 PM", description: "Networking Session" },
                { time: "05:00 PM", description: "Closing Remarks", speaker: "IWPA President" },
            ],
            speakers: [
                { name: "Dr. Rajesh Kumar", title: "Chief Scientist, NIWE", image: "https://randomuser.me/api/portraits/men/32.jpg" },
                { name: "Ms. Priya Sharma", title: "Policy Advisor, MNRE", image: "https://randomuser.me/api/portraits/women/44.jpg" },
                { name: "Mr. Arun Mehta", title: "CEO, WindTech India", image: "https://randomuser.me/api/portraits/men/22.jpg" },
            ],
        },
    ];

    /* ---------------- GRID VIEW ---------------- */
    if (!selectedEvent) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="bg-[#FFFFFF] rounded-[14px] border-[0.8px] border-[#E5E7EB] p-6">
                    <h1 className="text-[24px] text-[#101828] font-bold">Events</h1>
                    <p className="text-[16px] text-[#4A5565]">
                        Discover and register for IWPA events, conferences, and industry gatherings
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-[#FFFFFF]  rounded-[14px] border-[0.8px] border-[#E5E7EB] overflow-hidden hover:shadow-md transition"
                        >
                            <div className="relative h-48">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                {event.badge && (
                                    <span
                                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${event.badge === "Partnered"
                                            ? "bg-[#155DFC] text-[#ffffff]"
                                            : "bg-[#009966] text-[#ffffff]"
                                            }`}
                                    >
                                        {event.badge}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-1 space-y-3">
                                <h3 className="font-semibold text-[18px] text-[#101828]">{event.title}</h3>

                                <div className="text-[14px] text-[#4A5565] space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        {event.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {event.attendees}
                                    </div>
                                </div>

                                <p className="text-[14px] text-[#4A5565] line-clamp-2 mb-4">
                                    {event.shortDescription}
                                </p>

                                <div className="border-t-[0.8px] border-[#E5E7EB] py-4 mt-auto ">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <span className="text-sm font-medium text-[#009966]">
                                            {event.price}
                                        </span>
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="text-sm text-[#009966] flex items-center gap-1 hover:underline"
                                        >
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ---------------- DETAILS VIEW ---------------- */
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <button
                onClick={() => setSelectedEvent(null)}
                className="text-[16px] text-[#009966] font-medium cursor-pointer hover:underline flex items-center gap-1"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
            </button>

            {/* Hero */}
            <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                    src={selectedEvent.image}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt=""
                />
                <div className="absolute inset-0 bg-linear-to-r from-[#00000099] to-[#00000010]" />
                <div className="absolute bottom-10 left-6 text-[#ffffff] max-w-5xl">
                    <span className="inline-block bg-[#009966] text-xs px-3 py-1 rounded-full mb-2">
                        {selectedEvent.badge} Event
                    </span>
                    <h1 className="text-[36px] text-[#ffffff] font-bold">{selectedEvent.title}</h1>
                    <p className="text-[18px] text-[#FFFFFFE5] mt-1">
                        {selectedEvent.shortDescription}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border-[0.8px] border-[#E5E7EB] bg-[#ffffff] rounded-[14px] p-6">
                        <div className="mb-10">
                            <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Event Details</h2>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <Info label="Date" value={selectedEvent.date} />
                                <Info label="Time" value={selectedEvent.time} />
                                <Info label="Location" value={selectedEvent.location} />
                                <Info label="Attendees" value={selectedEvent.attendees} />
                            </div>
                        </div>

                        {selectedEvent.fullDescription && (
                            <div >
                                <h2 className="font-semibold text-[#101828] text-[18px] mb-2">About the Event</h2>
                                <p className="text-[16px] text-[#4A5565]">
                                    {selectedEvent.fullDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    {selectedEvent.agenda && (
                        <div className="bg-[#ffffff] border-[0.8px] border-[#E5E7EB] rounded-[14px] p-6">
                            <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Event Agenda</h2>
                            <div className="space-y-3">
                                {selectedEvent.agenda.map((a, i) => (
                                    <div key={i} className="flex gap-16 text-sm border-b-[0.8px] border-[#E5E7EB] py-3 ">
                                        <span className="text-[#009966] text-sm font-medium ">
                                            {a.time}
                                        </span>
                                        <div >
                                            <h3 className="text-[#101828] text-[16px] font-medium">{a.description}</h3>
                                            <p className="text-[#4A5565] text-sm">{a.speaker}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedEvent.speakers && (
                        <div className="bg-[#ffffff] border-[0.8px] border-[#E5E7EB] rounded-[14px] p-6">
                            <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Featured Speakers</h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {selectedEvent.speakers.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-16 h-16 bg-[#E5E7EB] rounded-full mx-auto mb-2">
                                            <img
                                                src={s.image || "https://via.placeholder.com/64"}
                                                alt={s.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                        <p className="text-[16px] font-medium text-[#101828]">{s.name}</p>
                                        <p className="text-xs text-[#4A5565]">{s.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="bg-white border-[0.8px] border-[#E5E7EB] rounded-[14px] p-6 h-fit sticky top-6">
                    <p className="text-sm text-[#4A5565] mb-1">Registration Fee</p>
                    <p className="text-2xl font-bold text-[#101828] mb-4">
                        {selectedEvent.price}
                    </p>
                    <button className="w-full cursor-pointer bg-[#1F7A4D] text-[#ffffff] text-[16px] font-medium py-3 rounded-[10px] hover:bg-[#155F3B] transition">
                        Register Now
                    </button>
                    <div className="mt-4 text-sm text-[#4A5565] space-y-2">
                        <p><Calendar className="w-4 h-4 mr-2 inline" /> Add to Calendar</p>
                        <p><MapPin className="w-4 h-4 mr-2 inline" /> Get Directions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Small UI helper ---------- */
function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="bg-[#D0FAE5]"></div>
            <p className="text-sm text-[#4A5565]">{label}</p>
            <p className="text-[16px] font-medium text-[#101828]">{value}</p>
        </div>
    );
}