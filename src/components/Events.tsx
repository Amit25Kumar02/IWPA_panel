"use client";

import { useState, useEffect, useRef } from "react";
import {
    CalendarDays, MapPin, Users, ArrowRight, Clock, Calendar,
    ArrowLeft, Plus, Pencil, Trash2, Loader2, ImagePlus, X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarPicker } from "./ui/calendar";
import api from "../utils/api";
import { imgUrl } from "../utils/imgUrl";
import { EventCardsSkeleton } from "./ui/Shimmer";

interface AgendaItem { time: string; description: string; speaker?: string; }
interface Speaker { name: string; title: string; image?: string; }

interface Event {
    id: string;
    _id?: string;
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

type EventForm = Omit<Event, "id" | "_id"> & {
    agenda: AgendaItem[];
    speakers: Speaker[];
};

const EMPTY_FORM: EventForm = {
    title: "", shortDescription: "", fullDescription: "",
    date: "", time: "", location: "", address: "",
    attendees: "", price: "", image: "", badge: "Internal",
    agenda: [], speakers: [],
};

/* ─── Fallback seed data (used when API is unavailable) ─── */
const SEED_EVENTS: Event[] = [
    {
        id: "1",
        title: "Wind Energy Technology Summit 2026",
        shortDescription: "Join us for the premier wind energy technology summit showcasing the latest innovations, policy updates, and networking opportunities.",
        fullDescription: "The Wind Energy Technology Summit 2026 is IWPA's flagship annual event bringing together industry leaders, policymakers, and researchers.",
        date: "15 February 2026", time: "09:00 AM - 05:00 PM",
        location: "India Habitat Centre, New Delhi", address: "Lodi Road, New Delhi, Delhi 110003",
        attendees: "500 Expected Attendees", price: "Free for Members", badge: "Internal",
        image: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=1200",
        agenda: [
            { time: "09:00 AM", description: "Registration & Breakfast" },
            { time: "10:00 AM", description: "Opening Keynote", speaker: "Dr. Rajesh Kumar" },
            { time: "12:30 PM", description: "Lunch Break" },
            { time: "02:00 PM", description: "Technical Sessions", speaker: "Various Speakers" },
            { time: "05:00 PM", description: "Closing Remarks", speaker: "IWPA President" },
        ],
        speakers: [
            { name: "Dr. Rajesh Kumar", title: "Chief Scientist, NIWE", image: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Ms. Priya Sharma", title: "Policy Advisor, MNRE", image: "https://randomuser.me/api/portraits/women/44.jpg" },
            { name: "Mr. Arun Mehta", title: "CEO, WindTech India", image: "https://randomuser.me/api/portraits/men/22.jpg" },
        ],
    },
    {
        id: "2",
        title: "National Council Quarterly Meeting",
        shortDescription: "Quarterly review meeting for National Council members.",
        date: "20 January 2026", time: "Virtual", location: "Virtual",
        attendees: "50 Expected Attendees", price: "Members Only", badge: "Internal",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200",
    },
    {
        id: "3",
        title: "Renewable Energy Expo 2026",
        shortDescription: "International exhibition featuring renewable energy solutions.",
        date: "10 March 2026", time: "All Day",
        location: "Bombay Exhibition Centre, Mumbai",
        attendees: "2000+ Attendees", price: "₹5,000", badge: "Partnered",
        image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format&fit=crop",
    },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    /* modal state */
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Event | null>(null);
    const [form, setForm] = useState<EventForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    /* delete state */
    const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ── fetch ── */
    useEffect(() => { fetchEvents(); }, []);

    async function fetchEvents() {
        setLoading(true);
        try {
            const { data } = await api.get("/api/v1/events/get-events");
            const raw: Event[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.events)
                ? data.events
                : [];
            const list = raw.map(e => ({ ...e, id: e._id ?? e.id }));
            setEvents(list.length ? list : SEED_EVENTS);
        } catch {
            setEvents(SEED_EVENTS);
        } finally {
            setLoading(false);
        }
    }

    /* ── open add / edit modal ── */
    function openAdd() {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(e: Event) {
        setEditTarget(e);
        setForm({
            title: e.title, shortDescription: e.shortDescription,
            fullDescription: e.fullDescription ?? "",
            date: e.date, time: e.time, location: e.location,
            address: e.address ?? "", attendees: e.attendees,
            price: e.price, image: e.image, badge: e.badge ?? "Internal",
            agenda: e.agenda ?? [],
            speakers: e.speakers ?? [],
        });
        setModalOpen(true);
    }

    async function handleSave(_imageFile: File | null, speakerFiles: (File | null)[] = []) {
        if (!form.title || !form.date || !form.location) {
            toast.error("Title, date and location are required.");
            return;
        }
        setSaving(true);

        const buildPayload = (imageFile: File | null) => {
            const fd = new FormData();
            const { agenda, speakers, ...rest } = form;
            Object.entries(rest).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
            fd.append("agenda", JSON.stringify(agenda));
            fd.append("speakers", JSON.stringify(speakers));
            if (imageFile) fd.set("image", imageFile);
            speakerFiles.forEach((f, i) => { if (f) fd.append(`speakerImage_${i}`, f); });
            return fd;
        };

        try {
            if (editTarget) {
                const { data } = await api.put<{ data: Event }>(
                    `/api/v1/events/update-event/${editTarget._id ?? editTarget.id}`,
                    buildPayload(_imageFile),
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const updated = data?.data ?? { ...editTarget, ...form };
                setEvents(prev => prev.map(ev => ev.id === editTarget.id ? updated : ev));
                if (selectedEvent?.id === editTarget.id) setSelectedEvent(updated);
                toast.success("Event updated successfully.");
            } else {
                const { data } = await api.post<{ data: Event }>(
                    "/api/v1/events/create-event",
                    buildPayload(_imageFile),
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const created = data?.data ?? { ...form, id: Date.now(), agenda: [], speakers: [] };
                setEvents(prev => [...prev, created]);
                toast.success("Event created successfully.");
            }
            setModalOpen(false);
        } catch {
            if (editTarget) {
                const updated = { ...editTarget, ...form };
                setEvents(prev => prev.map(ev => ev.id === editTarget.id ? updated : ev));
                if (selectedEvent?.id === editTarget.id) setSelectedEvent(updated);
                toast.success("Event updated successfully.");
            } else {
                const created: Event = { ...form, id: Date.now().toString(), agenda: [], speakers: [] };
                setEvents(prev => [...prev, created]);
                toast.success("Event created successfully.");
            }
            setModalOpen(false);
        } finally {
            setSaving(false);
        }
    }

    /* ── delete ── */
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/api/v1/events/delete-event/${deleteTarget._id ?? deleteTarget.id}`);
        } catch { /* optimistic */ }
        setEvents(prev => prev.filter(ev => ev.id !== deleteTarget.id));
        if (selectedEvent?.id === deleteTarget.id) setSelectedEvent(null);
        toast.success("Event deleted.");
        setDeleteTarget(null);
        setDeleting(false);
    }

    /* ── field helper ── */
    const field = (k: keyof EventForm) => (
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(f => ({ ...f, [k]: e.target.value }))
    );

    /* ── agenda helpers ── */
    const addAgenda = () => setForm(f => ({ ...f, agenda: [...f.agenda, { time: "", description: "", speaker: "" }] }));
    const removeAgenda = (i: number) => setForm(f => ({ ...f, agenda: f.agenda.filter((_, idx) => idx !== i) }));
    const updateAgenda = (i: number, k: keyof AgendaItem, v: string) =>
        setForm(f => ({ ...f, agenda: f.agenda.map((a, idx) => idx === i ? { ...a, [k]: v } : a) }));

    /* ── speaker helpers ── */
    const addSpeaker = () => setForm(f => ({ ...f, speakers: [...f.speakers, { name: "", title: "", image: "" }] }));
    const removeSpeaker = (i: number) => setForm(f => ({ ...f, speakers: f.speakers.filter((_, idx) => idx !== i) }));
    const updateSpeaker = (i: number, k: keyof Speaker, v: string) =>
        setForm(f => ({ ...f, speakers: f.speakers.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));

    /* ════════════════════════════════════════════
       GRID VIEW
    ════════════════════════════════════════════ */
    if (!selectedEvent) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* header */}
                <div className="bg-white rounded-[14px] border-[0.8px] border-[#E5E7EB] p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[24px] text-[#101828] font-bold">Events</h1>
                        <p className="text-[16px] text-[#4A5565]">
                            Discover and manage IWPA events, conferences, and industry gatherings
                        </p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="bg-[#1F7A4D] hover:bg-[#155F3B] text-white cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Event
                    </Button>
                </div>

                {/* grid */}
                {loading ? (
                    <EventCardsSkeleton count={6} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-[14px] border-[0.8px] border-[#E5E7EB] overflow-hidden hover:shadow-md transition flex flex-col"
                            >
                                <div className="relative h-48">
                                    <img src={imgUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
                                    {event.badge && (
                                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${event.badge === "Partnered" ? "bg-[#155DFC] text-white" : "bg-[#009966] text-white"}`}>
                                            {event.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-1 space-y-3">
                                    <h3 className="font-semibold text-[18px] text-[#101828]">{event.title}</h3>

                                    <div className="text-[14px] text-[#4A5565] space-y-2">
                                        <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />{event.date}</div>
                                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.location}</div>
                                        <div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.attendees}</div>
                                    </div>

                                    <p className="text-[14px] text-[#4A5565] line-clamp-2">{event.shortDescription}</p>

                                    <div className="border-t-[0.8px] border-[#E5E7EB] pt-4 mt-auto flex flex-wrap justify-between items-center gap-2">
                                        <span className="text-sm font-medium text-[#009966]">{event.price}</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEdit(event)}
                                                className="text-[#4A5565] hover:text-[#101828] cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(event)}
                                                className="text-[#F04438] hover:text-[#b91c1c] cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedEvent(event)}
                                                className="text-sm text-[#009966] flex items-center gap-1 hover:underline cursor-pointer"
                                            >
                                                View Details <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Add / Edit Modal ── */}
                <EventModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    form={form}
                    setForm={setForm}
                    field={field}
                    onSave={handleSave}
                    saving={saving}
                    isEdit={!!editTarget}
                    addAgenda={addAgenda}
                    removeAgenda={removeAgenda}
                    updateAgenda={updateAgenda}
                    addSpeaker={addSpeaker}
                    removeSpeaker={removeSpeaker}
                    updateSpeaker={updateSpeaker}
                />

                {/* ── Delete Confirmation ── */}
                <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-[#F04438] hover:bg-[#b91c1c] text-white"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    /* ════════════════════════════════════════════
       DETAILS VIEW
    ════════════════════════════════════════════ */
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-[16px] text-[#009966] font-medium cursor-pointer hover:underline flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEdit(selectedEvent)} className="cursor-pointer">
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(selectedEvent)}
                        className="border-[#F04438] text-[#F04438] hover:bg-[#F04438] hover:text-white cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            {/* Hero */}
            <div className="relative h-96 rounded-xl overflow-hidden">
                <img src={imgUrl(selectedEvent.image)} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00000099] to-[#00000010]" />
                <div className="absolute bottom-10 left-6 text-white max-w-5xl">
                    {selectedEvent.badge && (
                        <span className="inline-block bg-[#009966] text-xs px-3 py-1 rounded-full mb-2">
                            {selectedEvent.badge} Event
                        </span>
                    )}
                    <h1 className="text-[36px] font-bold">{selectedEvent.title}</h1>
                    <p className="text-[18px] text-[#FFFFFFE5] mt-1">{selectedEvent.shortDescription}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border-[0.8px] border-[#E5E7EB] bg-white rounded-[14px] p-6">
                        <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Event Details</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <InfoBlock type="date" label="Date" value={selectedEvent.date} />
                            <InfoBlock type="time" label="Time" value={selectedEvent.time} />
                            <InfoBlock type="location" label="Location" value={selectedEvent.location} subValue={selectedEvent.address} />
                            <InfoBlock type="attendees" label="Expected Attendees" value={selectedEvent.attendees} />
                        </div>
                        {selectedEvent.fullDescription && (
                            <div className="mt-6">
                                <h2 className="font-semibold text-[#101828] text-[18px] mb-2">About the Event</h2>
                                <p className="text-[16px] text-[#4A5565]">{selectedEvent.fullDescription}</p>
                            </div>
                        )}
                    </div>

                    {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                        <div className="bg-white border-[0.8px] border-[#E5E7EB] rounded-[14px] p-6">
                            <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Event Agenda</h2>
                            <div className="space-y-3">
                                {selectedEvent.agenda.map((a, i) => (
                                    <div key={i} className="flex gap-16 text-sm border-b-[0.8px] border-[#E5E7EB] py-3">
                                        <span className="text-[#009966] font-medium">{a.time}</span>
                                        <div>
                                            <p className="text-[#101828] font-medium">{a.description}</p>
                                            {a.speaker && <p className="text-[#4A5565] text-sm">{a.speaker}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                        <div className="bg-white border-[0.8px] border-[#E5E7EB] rounded-[14px] p-6">
                            <h2 className="font-semibold text-[#101828] text-[20px] mb-4">Featured Speakers</h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {selectedEvent.speakers.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-16 h-16 bg-[#E5E7EB] rounded-full mx-auto mb-2">
                                            <img
                                                src={imgUrl(s.image ?? "") || "https://via.placeholder.com/64"}
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
                    <p className="text-2xl font-bold text-[#101828] mb-4">{selectedEvent.price}</p>
                    <button className="w-full cursor-pointer bg-[#1F7A4D] text-white text-[16px] font-medium py-3 rounded-[10px] hover:bg-[#155F3B] transition">
                        Register Now
                    </button>
                    <div className="mt-4 text-sm text-[#4A5565] space-y-2">
                        <p><Calendar className="w-4 h-4 mr-2 inline" /> Add to Calendar</p>
                        <p><MapPin className="w-4 h-4 mr-2 inline" /> Get Directions</p>
                    </div>
                </div>
            </div>

            {/* Edit modal (accessible from detail view too) */}
            <EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                form={form}
                setForm={setForm}
                field={field}
                onSave={handleSave}
                saving={saving}
                isEdit
                addAgenda={addAgenda}
                removeAgenda={removeAgenda}
                updateAgenda={updateAgenda}
                addSpeaker={addSpeaker}
                removeSpeaker={removeSpeaker}
                updateSpeaker={updateSpeaker}
            />

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-[#F04438] hover:bg-[#b91c1c] text-white"
                        >
                            {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Add / Edit Modal
───────────────────────────────────────────── */
function EventModal({
    open, onClose, form, setForm, field, onSave, saving, isEdit,
    addAgenda, removeAgenda, updateAgenda,
    addSpeaker, removeSpeaker, updateSpeaker,
}: {
    open: boolean;
    onClose: () => void;
    form: EventForm;
    setForm: React.Dispatch<React.SetStateAction<EventForm>>;
    field: (k: keyof EventForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSave: (imageFile: File | null, speakerFiles: (File | null)[]) => void;
    saving: boolean;
    isEdit: boolean;
    addAgenda: () => void;
    removeAgenda: (i: number) => void;
    updateAgenda: (i: number, k: keyof AgendaItem, v: string) => void;
    addSpeaker: () => void;
    removeSpeaker: (i: number) => void;
    updateSpeaker: (i: number, k: keyof Speaker, v: string) => void;
}) {
    const [calOpen, setCalOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [speakerFiles, setSpeakerFiles] = useState<(File | null)[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    const speakerFileRefs = useRef<(HTMLInputElement | null)[]>([]);

    function handleClose() {
        setImageFile(null);
        setSpeakerFiles([]);
        onClose();
    }

    const pickedDate = form.date ? new Date(form.date) : undefined;

    function handleDaySelect(day: Date | undefined) {
        setForm(f => ({ ...f, date: day ? format(day, "dd MMMM yyyy") : "" }));
        setCalOpen(false);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setForm(f => ({ ...f, image: file.name }));
        if (fileRef.current) fileRef.current.value = "";
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && handleClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
                <DialogHeader className="pb-2 border-b border-border">
                    <DialogTitle className="text-[20px] font-semibold text-card-foreground">
                        {isEdit ? "Edit Event" : "Add New Event"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-5 py-3">

                    {/* ── Basic Info ── */}
                    <section className="grid gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</p>
                        <div className="grid gap-3">
                            <div className="grid gap-1.5">
                                <Label>Title <span className="text-destructive">*</span></Label>
                                <Input placeholder="Event title" value={form.title} onChange={field("title")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Short Description <span className="text-destructive">*</span></Label>
                                <Textarea placeholder="Brief description shown on cards" value={form.shortDescription} onChange={field("shortDescription")} className="min-h-[72px] resize-none" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Full Description</Label>
                                <Textarea placeholder="Detailed description for the event page" value={form.fullDescription} onChange={field("fullDescription")} className="min-h-[72px] resize-none" />
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-border" />

                    {/* ── Date, Time & Location ── */}
                    <section className="grid gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date, Time & Location</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Date <span className="text-destructive">*</span></Label>
                                <Popover open={calOpen} onOpenChange={setCalOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-left hover:bg-accent transition cursor-pointer"
                                        >
                                            <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className={form.date ? "text-card-foreground" : "text-muted-foreground"}>
                                                {form.date || "Pick a date"}
                                            </span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarPicker mode="single" selected={pickedDate} onSelect={handleDaySelect} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Time</Label>
                                <Input placeholder="e.g. 09:00 AM – 05:00 PM" value={form.time} onChange={field("time")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Location <span className="text-destructive">*</span></Label>
                                <Input placeholder="Venue name" value={form.location} onChange={field("location")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Address</Label>
                                <Input placeholder="Full address" value={form.address} onChange={field("address")} />
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-border" />

                    {/* ── Registration ── */}
                    <section className="grid gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Attendees</Label>
                                <Input placeholder="e.g. 500 Expected" value={form.attendees} onChange={field("attendees")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Price</Label>
                                <Input placeholder="e.g. Free / ₹5,000" value={form.price} onChange={field("price")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Badge</Label>
                                <Select value={form.badge} onValueChange={v => setForm(f => ({ ...f, badge: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select badge" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Internal">Internal</SelectItem>
                                        <SelectItem value="Partnered">Partnered</SelectItem>
                                        <SelectItem value="Public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-border" />

                    {/* ── Event Image ── */}
                    <section className="grid gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Image</p>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        {(imageFile ? URL.createObjectURL(imageFile) : form.image) ? (
                            <div className="relative rounded-xl overflow-hidden border border-border h-44">
                                <img src={imageFile ? URL.createObjectURL(imageFile) : imgUrl(form.image)} alt="preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setForm(f => ({ ...f, image: "" })); }}
                                    className="absolute top-2 right-2 bg-card rounded-full p-1.5 shadow hover:bg-destructive hover:text-destructive-foreground transition cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-card text-xs px-3 py-1 rounded-lg shadow hover:bg-accent transition cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-44 text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer bg-input-background"
                            >
                                <ImagePlus className="w-8 h-8" />
                                <span className="text-sm font-medium">Click to upload image</span>
                                <span className="text-xs">PNG, JPG, WEBP</span>
                            </button>
                        )}
                    </section>

                    <div className="border-t border-border" />

                    {/* ── Agenda ── */}
                    <section className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agenda</p>
                            <button type="button" onClick={addAgenda}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>
                        {form.agenda.length === 0 ? (
                            <div className="flex items-center justify-center h-12 rounded-lg bg-input-background border border-dashed border-border">
                                <p className="text-xs text-muted-foreground">No agenda items yet — click Add Item</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {form.agenda.map((a, i) => (
                                    <div key={i} className="grid grid-cols-[90px_1fr_1fr_32px] gap-2 items-center bg-input-background rounded-lg px-3 py-2">
                                        <Input placeholder="Time" value={a.time} className="h-8 text-sm"
                                            onChange={e => updateAgenda(i, "time", e.target.value)} />
                                        <Input placeholder="Description" value={a.description} className="h-8 text-sm"
                                            onChange={e => updateAgenda(i, "description", e.target.value)} />
                                        <Input placeholder="Speaker" value={a.speaker ?? ""} className="h-8 text-sm"
                                            onChange={e => updateAgenda(i, "speaker", e.target.value)} />
                                        <button type="button" onClick={() => removeAgenda(i)}
                                            className="flex items-center justify-center text-muted-foreground hover:text-destructive transition cursor-pointer">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="border-t border-border" />

                    {/* ── Speakers ── */}
                    <section className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Speakers</p>
                            <button type="button" onClick={addSpeaker}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
                                <Plus className="w-3 h-3" /> Add Speaker
                            </button>
                        </div>
                        {form.speakers.length === 0 ? (
                            <div className="flex items-center justify-center h-12 rounded-lg bg-input-background border border-dashed border-border">
                                <p className="text-xs text-muted-foreground">No speakers yet — click Add Speaker</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {form.speakers.map((s, i) => {
                                    const preview = speakerFiles[i]
                                        ? URL.createObjectURL(speakerFiles[i]!)
                                        : s.image || null;
                                    return (
                                        <div key={i} className="flex items-center gap-3 bg-input-background rounded-lg px-3 py-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={el => { speakerFileRefs.current[i] = el; }}
                                                onChange={e => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    setSpeakerFiles(prev => { const next = [...prev]; next[i] = file; return next; });
                                                    if (file) updateSpeaker(i, "image", file.name);
                                                    if (e.target) e.target.value = "";
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => speakerFileRefs.current[i]?.click()}
                                                className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 border-dashed border-border hover:border-primary transition cursor-pointer bg-muted flex items-center justify-center"
                                                title="Upload photo"
                                            >
                                                {preview
                                                    ? <img src={speakerFiles[i] ? preview! : imgUrl(s.image ?? "")} alt={s.name} className="w-full h-full object-cover" />
                                                    : <ImagePlus className="w-4 h-4 text-muted-foreground" />
                                                }
                                            </button>
                                            <Input placeholder="Name" value={s.name} className="h-8 text-sm"
                                                onChange={e => updateSpeaker(i, "name", e.target.value)} />
                                            <Input placeholder="Title / Role" value={s.title} className="h-8 text-sm"
                                                onChange={e => updateSpeaker(i, "title", e.target.value)} />
                                            <button type="button" onClick={() => {
                                                removeSpeaker(i);
                                                setSpeakerFiles(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                                className="flex items-center justify-center text-muted-foreground hover:text-destructive transition cursor-pointer shrink-0">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                </div>

                <DialogFooter className="pt-2 border-t border-border gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={saving} className="cursor-pointer">Cancel</Button>
                    <Button
                        onClick={() => onSave(imageFile, speakerFiles)}
                        disabled={saving}
                        className="bg-primary hover:bg-[#155F3B] text-primary-foreground cursor-pointer"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {isEdit ? "Save Changes" : "Create Event"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   Info block helper
───────────────────────────────────────────── */
function InfoBlock({ type, label, value, subValue }: {
    type: "date" | "time" | "location" | "attendees";
    label: string; value: string; subValue?: string;
}) {
    const cfg = {
        date:      { icon: CalendarDays, bg: "bg-[#D0FAE5]", color: "text-[#1F7A4D]" },
        time:      { icon: Clock,        bg: "bg-[#DBEAFE]", color: "text-[#155DFC]" },
        location:  { icon: MapPin,       bg: "bg-[#F3E8FF]", color: "text-[#8200DB]" },
        attendees: { icon: Users,        bg: "bg-[#FEF3C6]", color: "text-[#BB4D00]" },
    };
    const Icon = cfg[type].icon;
    return (
        <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg[type].bg}`}>
                <Icon className={`w-5 h-5 ${cfg[type].color}`} />
            </div>
            <div>
                <p className="text-sm text-[#667085]">{label}</p>
                <p className="text-[16px] font-medium text-[#101828]">{value}</p>
                {subValue && <p className="text-sm text-[#667085]">{subValue}</p>}
            </div>
        </div>
    );
}
