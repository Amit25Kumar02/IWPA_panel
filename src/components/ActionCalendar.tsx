"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Clock, CheckCircle2 } from "lucide-react";

interface Action {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  avatars?: { name: string; avatar: string }[];
}

const PEOPLE = [
  { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  { name: "Carol", avatar: "https://i.pravatar.cc/40?img=3" },
  { name: "David", avatar: "https://i.pravatar.cc/40?img=4" },
  { name: "Eva", avatar: "https://i.pravatar.cc/40?img=5" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SLOT_H = 48;

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function AdminCalendar() {
  const today = new Date();
  const [view, setView] = useState<"year" | "month" | "week" | "day">("week");
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
  const HOURS = Array.from({ length: 11 }, (_, i) => String(i + 9).padStart(2, "0"));

  const [actions, setActions] = useState<Action[]>([
    { id: 1, date: toKey(today.getFullYear(), today.getMonth(), today.getDate()), startTime: "09", endTime: "11", title: "Review membership renewals", priority: "high", done: false },
    { id: 2, date: toKey(today.getFullYear(), today.getMonth(), today.getDate() + 2), startTime: "11", endTime: "13", title: "Send payment reminders", priority: "medium", done: false },
  ]);

  const [modal, setModal] = useState<{ open: boolean; date: string }>({ open: false, date: "" });
  const [form, setForm] = useState({ title: "", startTime: "09", endTime: "10", priority: "medium" as Action["priority"], avatars: [] as { name: string; avatar: string }[] });

  const endTimeOptions = (start: string) => HOURS.filter(h => parseInt(h) > parseInt(start));

  const prev = () => {
    if (view === "year") setCurrent(c => ({ ...c, year: c.year - 1 }));
    else if (view === "month") setCurrent(c => c.month === 0 ? { ...c, year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
    else if (view === "week") {
      const d = new Date(current.year, current.month, current.day - 7);
      setCurrent({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    } else {
      const d = new Date(current.year, current.month, current.day - 1);
      setCurrent({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    }
  };
  const next = () => {
    if (view === "year") setCurrent(c => ({ ...c, year: c.year + 1 }));
    else if (view === "month") setCurrent(c => c.month === 11 ? { ...c, year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
    else if (view === "week") {
      const d = new Date(current.year, current.month, current.day + 7);
      setCurrent({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    } else {
      const d = new Date(current.year, current.month, current.day + 1);
      setCurrent({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    }
  };

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weekStart = new Date(current.year, current.month, current.day);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });

  const titleLabel = () => {
    if (view === "year") return `${current.year}`;
    if (view === "month") return `${MONTHS[current.month]} ${current.year}`;
    if (view === "week") {
      const end = weekDays[6];
      return `${weekDays[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return new Date(current.year, current.month, current.day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const openModal = (date: string, time?: string) => {
    const start = time || "09";
    const end = HOURS.find(h => parseInt(h) > parseInt(start)) || HOURS[HOURS.length - 1];
    setModal({ open: true, date });
    setForm({ title: "", startTime: start, endTime: end, priority: "medium", avatars: [] });
  };
  const closeModal = () => setModal({ open: false, date: "" });

  const addAction = () => {
    if (!form.title.trim()) return;
    setActions(prev => [...prev, { id: Date.now(), date: modal.date, startTime: form.startTime, endTime: form.endTime, title: form.title.trim(), priority: form.priority, done: false, avatars: form.avatars.length ? form.avatars : undefined }]);
    closeModal();
  };

  const toggleDone = (id: number) => setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  const deleteAction = (id: number) => setActions(prev => prev.filter(a => a.id !== id));

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="overflow-x-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <button
            onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() })}
            className="bg-[#FFFFFF] border-[1.22px] py-1.5 px-3 border-[#F5F6F7] rounded-full cursor-pointer hover:bg-[#f3f4f6] transition-colors"
          >
            <h2 className="text-sm font-bold text-[#0C0A0B]">Today</h2>
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-2 rounded-full border-[1.44px] border-[#F5F6F7] transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-[#C3CAD9]" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-[#0C0A0B] min-w-24 sm:min-w-40 text-center">{titleLabel()}</span>
            <button onClick={next} className="p-2 rounded-full transition-colors cursor-pointer border-[1.44px] border-[#F5F6F7]">
              <ChevronRight className="w-4 h-4 text-[#C3CAD9]" />
            </button>
          </div>
          <div className="flex items-center border-[1.22px] border-[#F5F6F7] rounded-lg overflow-hidden">
            {(["year", "month", "week", "day"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-x-[0.61px] border-[#F5F6F7] capitalize ${view === v ? "text-[#0C0A0B] font-bold" : "text-[#535353] font-semibold"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* MONTH VIEW */}
        {view === "month" && (
          <>
            <div className="grid grid-cols-7 border border-[#e5e7eb] rounded-t-lg overflow-hidden bg-[#f9fafb]">
              {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-medium text-[#6a7282] py-2 border-r border-[#e5e7eb] last:border-r-0">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.slice(0, 2)}</span>
              </div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const key = toKey(current.year, current.month, day);
                const dayActions = actions.filter(a => a.date === key);
                const isToday = key === todayKey;
                return (
                  <div key={key} onClick={() => openModal(key)}
                    className={`min-h-[60px] sm:min-h-20 p-1 sm:p-1.5 rounded-lg border cursor-pointer transition-colors hover:border-[#1F7A4D] hover:bg-[#f0fdf4] ${isToday ? "border-[#1F7A4D] bg-[#ecfdf5]" : "border-[#e5e7eb] bg-white"}`}
                  >
                    <div className={`text-[10px] sm:text-xs font-semibold mb-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[#1F7A4D] text-white" : "text-[#242424]"}`}>{day}</div>
                    <div className="space-y-0.5 hidden sm:block">
                      {dayActions.slice(0, 2).map(a => (
                        <div key={a.id} className="text-[10px] px-1 py-0.5 rounded truncate font-medium bg-white border border-[#F5F6F7] text-[#242424]"
                          style={{ textDecoration: a.done ? "line-through" : "none", opacity: a.done ? 0.6 : 1 }}>
                          {a.startTime}–{a.endTime} {a.title}
                        </div>
                      ))}
                      {dayActions.length > 2 && <div className="text-[10px] text-[#6a7282] px-1">+{dayActions.length - 2} more</div>}
                    </div>
                    {dayActions.length > 0 && <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#1F7A4D] mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* WEEK VIEW */}
        {view === "week" && (
          <div className="overflow-x-auto">
            <div className="min-w-[560px] w-full">
              <div className="grid border border-[#e5e7eb] rounded-t-lg overflow-hidden bg-[#f9fafb]" style={{ gridTemplateColumns: `40px repeat(${weekDays.length}, minmax(0, 1fr))` }}>
                <div className="flex items-center justify-center border-r border-[#e5e7eb] py-2">
                  <Clock className="w-3 h-3 text-[#6a7282]" />
                </div>
                {weekDays.map(d => {
                  const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
                  const isToday = key === todayKey;
                  return (
                    <div key={key} className="flex items-center justify-center gap-1.5 py-2 px-2 border-r-[1.22px] border-[#F2F3F5] last:border-r-0 overflow-hidden min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-[#0C0A0B] truncate">{DAYS[d.getDay()]}</span>
                      <span className={`text-[10px] sm:text-xs font-semibold flex items-center justify-center rounded-full w-5 h-5 ${isToday ? "bg-[#1F7A4D] text-white" : "text-[#242424]"}`}>{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border border-[#e5e7eb] border-t-0 rounded-b-lg overflow-hidden">
                {HOURS.map(hour => (
                  <div key={hour} className="grid border-b border-[#e5e7eb] last:border-b-0" style={{ gridTemplateColumns: `40px repeat(${weekDays.length}, minmax(0, 1fr))`, minHeight: `${SLOT_H}px` }}>
                    <div className="text-[9px] sm:text-[10px] text-[#535353] px-1 border-r border-[#e5e7eb] text-right leading-none pt-2">{hour}</div>
                    {weekDays.map(d => {
                      const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
                      const isToday = key === todayKey;
                      const startingHere = actions.filter(a => a.date === key && a.startTime === hour);
                      return (
                        <div key={key} onClick={() => openModal(key, hour)}
                          className={`relative border-r border-[#e5e7eb] last:border-r-0 cursor-pointer transition-colors hover:bg-[#f0fdf4] px-2 ${isToday ? "bg-[#ecfdf5]" : "bg-white"}`}
                        >
                          {startingHere.map(a => {
                            const span = parseInt(a.endTime) - parseInt(a.startTime);
                            return (
                              <div key={a.id} onClick={e => e.stopPropagation()}
                                className="absolute left-2 right-2 rounded px-1 py-0.5 text-[10px] font-medium z-10 bg-white border border-[#F5F6F7] text-[#242424]"
                                style={{ top: 2, height: `${span * SLOT_H - 4}px`, opacity: a.done ? 0.6 : 1 }}
                              >
                                {span === 1 ? (
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#ffffff] bg-[#3361FF] py-0.5 px-1 rounded-sm text-[9px] shrink-0">
                                        <span className="sm:hidden">{a.startTime}</span>
                                        <span >{a.startTime}:00</span>
                                      </span>
                                      {a.avatars?.map(p => <img key={p.name} src={p.avatar} alt={p.name} className="w-4 h-4 rounded-sm shrink-0 ml-0.5 first:ml-0" />)}
                                    </div>
                                    <span className="truncate font-semibold text-[#4D5E80] text-[9px] block">{a.title}</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex gap-1 mb-0.5 flex-wrap">
                                      <span className="text-[#ffffff] bg-[#3361FF] py-0.5 px-1 rounded-sm shrink-0">
                                        <span>{a.startTime}:00</span>
                                        {/* <span>{a.startTime}:00</span> */}
                                      </span>
                                      <span className="text-[#ffffff] bg-[#3361FF] py-0.5 px-1 rounded-sm shrink-0">
                                        <span>{a.endTime}:00</span>
                                        {/* <span className="hidden sm:inline">{a.endTime}:00</span> */}
                                      </span>
                                    </div>
                                    <span className="block truncate font-semibold text-[#4D5E80]">{a.title}</span>
                                    {a.avatars?.length && (
                                      <div className="flex mt-0.5">
                                        {a.avatars.map(p => <img key={p.name} src={p.avatar} alt={p.name} className="w-4 h-4 rounded-sm ml-1 first:ml-0 " />)}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DAY VIEW */}
      {view === "day" && (() => {
        const key = toKey(current.year, current.month, current.day);
        const isToday = key === todayKey;
        return (
          <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
            <div className="grid border-b border-[#e5e7eb] bg-[#f9fafb]" style={{ gridTemplateColumns: "40px 1fr" }}>
              <div className="flex items-center justify-center border-r border-[#e5e7eb] py-3">
                <Clock className="w-3.5 h-3.5 text-[#6a7282]" />
              </div>
              <div className="flex items-center justify-between px-3 sm:px-4 py-3">
                <p className="text-xs sm:text-sm font-semibold text-[#242424] truncate">
                  {new Date(current.year, current.month, current.day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <button onClick={() => openModal(key)}
                  className="ml-2 shrink-0 inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#1F7A4D] text-white rounded-lg text-xs font-medium hover:bg-[#176939] transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Add Action</span>
                </button>
              </div>
            </div>
            {HOURS.map(hour => {
              const startingHere = actions.filter(a => a.date === key && a.startTime === hour);
              return (
                <div key={hour} onClick={() => openModal(key, hour)}
                  style={{ minHeight: `${SLOT_H}px` }}
                  className={`relative flex border-b border-[#e5e7eb] last:border-b-0 cursor-pointer hover:bg-[#f0fdf4] transition-colors ${isToday ? "bg-[#ecfdf5]/40" : "bg-white"}`}
                >
                  <div className="w-10 shrink-0 text-[10px] text-[#6a7282] text-right px-1 pt-2 border-r border-[#e5e7eb]">{hour}</div>
                  <div className="flex-1 relative">
                    {startingHere.map(a => {
                      const span = parseInt(a.endTime) - parseInt(a.startTime);
                      return (
                        <div key={a.id} onClick={e => e.stopPropagation()}
                          className="absolute left-1 right-1 rounded-lg border border-[#F5F6F7] bg-white px-2 py-1 z-10"
                          style={{ top: 4, height: `${span * SLOT_H - 8}px`, opacity: a.done ? 0.6 : 1 }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              {span === 1 ? (
                                <div className="flex items-center gap-1">
                                  {a.avatars?.map(p => <img key={p.name} src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full shrink-0 -ml-1 first:ml-0 border border-white" />)}
                                  <p className="text-[10px] font-medium text-[#6a7282]">{a.startTime}:00 – {a.endTime}:00</p>
                                </div>
                              ) : (
                                <p className="text-[10px] font-medium text-[#6a7282]">{a.startTime}:00 – {a.endTime}:00</p>
                              )}
                              <p className="text-xs font-semibold text-[#242424] truncate">{a.title}</p>
                              {span > 1 && a.avatars?.length && (
                                <div className="flex mt-1">
                                  {a.avatars.map(p => <img key={p.name} src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full -ml-1 first:ml-0 border border-white" />)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-0.5 shrink-0">
                              <button onClick={() => toggleDone(a.id)} className="cursor-pointer">
                                {a.done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A4D]" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#d1d5db]" />}
                              </button>
                              <button onClick={() => deleteAction(a.id)} className="p-0.5 hover:bg-red-100 rounded text-[#FB2C36] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* YEAR VIEW */}
      {view === "year" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MONTHS.map((m, mi) => {
            const monthKey = `${current.year}-${String(mi + 1).padStart(2, "0")}`;
            const count = actions.filter(a => a.date.startsWith(monthKey)).length;
            const isCurrentMonth = mi === today.getMonth() && current.year === today.getFullYear();
            return (
              <div key={m} onClick={() => { setCurrent(c => ({ ...c, month: mi })); setView("month"); }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover:border-[#1F7A4D] hover:bg-[#f0fdf4] ${isCurrentMonth ? "border-[#1F7A4D] bg-[#ecfdf5]" : "border-[#e5e7eb] bg-white"}`}
              >
                <p className={`text-sm font-semibold ${isCurrentMonth ? "text-[#1F7A4D]" : "text-[#242424]"}`}>{m}</p>
                {count > 0
                  ? <p className="text-xs text-[#6a7282] mt-1">{count} action{count > 1 ? "s" : ""}</p>
                  : <p className="text-xs text-[#d1d5db] mt-1">No actions</p>
                }
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/40?img=12"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#e5e7eb]"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#242424]">Add Action</h3>
                  <p className="text-sm text-[#6a7282]">
                    {new Date(modal.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Assign To</label>
                <div className="flex gap-2 flex-wrap">
                  {PEOPLE.map(p => {
                    const selected = form.avatars.some(a => a.name === p.name);
                    return (
                      <button key={p.name} type="button"
                        onClick={() => setForm(f => ({ ...f, avatars: selected ? f.avatars.filter(a => a.name !== p.name) : [...f.avatars, p] }))}
                        className={`rounded-full border-2 transition-colors cursor-pointer ${selected ? "border-[#1F7A4D]" : "border-transparent hover:border-[#1F7A4D]"
                          }`}
                      >
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full block" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Action Title <span className="text-[#FB2C36]">*</span></label>
                <input autoFocus type="text" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addAction()}
                  placeholder="e.g. Send renewal notices to expired members"
                  className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">Start Time</label>
                  <select value={form.startTime}
                    onChange={e => {
                      const s = e.target.value;
                      const newEnd = HOURS.find(h => parseInt(h) > parseInt(s)) || HOURS[HOURS.length - 1];
                      setForm(f => ({ ...f, startTime: s, endTime: newEnd }));
                    }}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] bg-white"
                  >
                    {HOURS.slice(0, -1).map(h => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#242424] mb-1">End Time</label>
                  <select value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-lg outline-none text-sm focus:border-[#1F7A4D] bg-white"
                  >
                    {endTimeOptions(form.startTime).map(h => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
              </div>

              {actions.filter(a => a.date === modal.date).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#6a7282] mb-2">Existing actions on this date</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {actions.filter(a => a.date === modal.date).map(a => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#F5F6F7] bg-white">
                        <span className="text-xs text-[#6a7282] shrink-0 mr-2 flex items-center gap-1"><Clock className="w-3 h-3" />{a.startTime}:00–{a.endTime}:00</span>
                        <span className="text-sm text-[#242424] truncate flex-1">{a.title}</span>
                        <button onClick={() => deleteAction(a.id)} className="ml-2 p-1 hover:bg-red-50 rounded text-[#FB2C36] cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={addAction} disabled={!form.title.trim()}
                 className="flex-1 py-2.5 bg-[#1F7A4D] text-white rounded-lg text-sm font-medium hover:bg-[#176939] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    // </div >
  );
}
