"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Clock, CheckCircle2 } from "lucide-react";
import api from "../utils/api";
import { imgUrl } from "../utils/imgUrl";

interface Action {
  id: string;
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  avatars?: { name: string; avatar: string }[];
}

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

  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    api.get("/api/v1/dashboard-actions/get-actions")
      .then(({ data }) => {
        const raw = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setActions(raw.map((a: Action) => ({ ...a, id: a._id ?? a.id })));
      })
      .catch(() => {
        setActions([
          { id: "1", date: toKey(today.getFullYear(), today.getMonth(), today.getDate()), startTime: "09", endTime: "11", title: "Review membership renewals", priority: "high", done: false },
          { id: "2", date: toKey(today.getFullYear(), today.getMonth(), today.getDate() + 2), startTime: "11", endTime: "13", title: "Send payment reminders", priority: "medium", done: false },
        ]);
      });
  }, []);

  const [modal, setModal] = useState<{ open: boolean; date: string }>({ open: false, date: "" });
  const [form, setForm] = useState({ title: "", startTime: "09", endTime: "10", priority: "medium" as Action["priority"], avatars: [] as { name: string; file: File; preview: string }[] });
  const [viewAction, setViewAction] = useState<Action | null>(null);

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

  const addAction = async () => {
    if (!form.title.trim()) return;
    const fd = new FormData();
    fd.append("date", modal.date);
    fd.append("startTime", form.startTime);
    fd.append("endTime", form.endTime);
    fd.append("title", form.title.trim());
    fd.append("priority", form.priority);
    form.avatars.forEach(a => {
      fd.append("names[]", a.name);
      fd.append("avatars", a.file);
    });
    try {
      const { data } = await api.post("/api/v1/dashboard-actions/create-action", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const created: Action = { ...data, id: data._id ?? data.id };
      setActions(prev => [...prev, created]);
    } catch {
      setActions(prev => [...prev, { id: Date.now().toString(), date: modal.date, startTime: form.startTime, endTime: form.endTime, title: form.title.trim(), priority: form.priority, done: false, avatars: form.avatars.map(a => ({ name: a.name, avatar: a.preview })) }]);
    }
    closeModal();
  };

  const toggleDone = async (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    try { await api.patch(`/api/v1/dashboard-actions/toggle-done/${id}`); } catch { /* optimistic */ }
  };

  const deleteAction = async (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    try { await api.delete(`/api/v1/dashboard-actions/delete-action/${id}`); } catch { /* optimistic */ }
  };

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
                    {dayActions.length > 0 && (
                      <p className="text-[10px] text-[#6a7282] mt-0.5">{dayActions.length} action{dayActions.length > 1 ? "s" : ""}</p>
                    )}
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
                          {startingHere.map((a, ai) => {
                            const span = parseInt(a.endTime) - parseInt(a.startTime);
                            const total = startingHere.length;
                            const width = total > 1 ? `calc(${100 / total}% - 4px)` : "calc(100% - 16px)";
                            const left = total > 1 ? `calc(${(ai / total) * 100}% + 2px)` : "8px";
                            return (
                              <div key={a.id} onClick={e => { e.stopPropagation(); setViewAction(a); }}
                                className="absolute rounded px-1 py-0.5 text-[10px] font-medium z-10 bg-white border border-[#F5F6F7] text-[#242424] cursor-pointer hover:border-[#1F7A4D] transition-colors"
                                style={{ top: 2, height: `${span * SLOT_H - 4}px`, width, left, opacity: a.done ? 0.6 : 1 }}
                              >
                                {span === 1 ? (
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#ffffff] bg-[#3361FF] py-0.5 px-1 rounded-sm text-[9px] shrink-0">
                                        <span className="sm:hidden">{a.startTime}</span>
                                        <span >{a.startTime}:00</span>
                                      </span>
                                      {a.avatars?.map(p => <img key={p.name} src={imgUrl(p.avatar, "avatar")} alt={p.name} className="w-4 h-4 rounded-sm shrink-0 ml-0.5 first:ml-0" />)}
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
                                        {a.avatars.map(p => <img key={p.name} src={imgUrl(p.avatar, "avatar")} alt={p.name} className="w-4 h-4 rounded-sm ml-1 first:ml-0 " />)}
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
                    {startingHere.map((a, ai) => {
                      const span = parseInt(a.endTime) - parseInt(a.startTime);
                      const total = startingHere.length;
                      const width = total > 1 ? `calc(${100 / total}% - 4px)` : "calc(100% - 8px)";
                      const left = total > 1 ? `calc(${(ai / total) * 100}% + 2px)` : "4px";
                      return (
                        <div key={a.id} onClick={e => { e.stopPropagation(); setViewAction(a); }}
                          className="absolute rounded-lg border border-[#F5F6F7] bg-white px-2 py-1 z-10 cursor-pointer hover:border-[#1F7A4D] transition-colors"
                          style={{ top: 4, height: `${span * SLOT_H - 8}px`, width, left, opacity: a.done ? 0.6 : 1 }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              {span === 1 ? (
                                <div className="flex items-center gap-1">
                                  {a.avatars?.map(p => <img key={p.name} src={imgUrl(p.avatar, "avatar")} alt={p.name} className="w-5 h-5 rounded-full shrink-0 -ml-1 first:ml-0 border border-white" />)}
                                  <p className="text-[10px] font-medium text-[#6a7282]">{a.startTime}:00 – {a.endTime}:00</p>
                                </div>
                              ) : (
                                <p className="text-[10px] font-medium text-[#6a7282]">{a.startTime}:00 – {a.endTime}:00</p>
                              )}
                              <p className="text-xs font-semibold text-[#242424] truncate">{a.title}</p>
                              {span > 1 && a.avatars?.length && (
                                <div className="flex mt-1">
                                  {a.avatars.map(p => <img key={p.name} src={imgUrl(p.avatar, "avatar")} alt={p.name} className="w-5 h-5 rounded-full -ml-1 first:ml-0 border border-white" />)}
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
                <div className="space-y-2">
                  {form.avatars.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            const preview = URL.createObjectURL(file);
                            setForm(f => ({ ...f, avatars: f.avatars.map((av, idx) => idx === i ? { ...av, file, preview } : av) }));
                          };
                          input.click();
                        }}
                        className="w-9 h-9 rounded-full shrink-0 overflow-hidden border-2 border-dashed border-[#e5e7eb] hover:border-[#1F7A4D] transition cursor-pointer flex items-center justify-center bg-[#f9fafb]"
                      >
                        {a.preview
                          ? <img src={a.preview} alt={a.name} className="w-full h-full object-cover" />
                          : <Plus className="w-4 h-4 text-[#9ca3af]" />}
                      </button>
                      <input
                        type="text"
                        value={a.name}
                        onChange={e => setForm(f => ({ ...f, avatars: f.avatars.map((av, idx) => idx === i ? { ...av, name: e.target.value } : av) }))}
                        placeholder="Person name"
                        className="flex-1 px-2 py-1.5 border border-[#e5e7eb] rounded-lg text-sm outline-none focus:border-[#1F7A4D]"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, avatars: f.avatars.filter((_, idx) => idx !== i) }))}
                        className="p-1 hover:bg-red-50 rounded text-[#FB2C36] cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {form.avatars.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, avatars: [...f.avatars, { name: "", file: null as unknown as File, preview: "" }] }))}
                      className="flex items-center gap-1.5 text-xs text-[#1F7A4D] hover:underline cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Person
                    </button>
                  )}
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
      {/* Action Detail Modal */}
      {viewAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    viewAction.priority === "high" ? "bg-red-100 text-red-600" :
                    viewAction.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>{viewAction.priority}</span>
                  {viewAction.done && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D0FAE5] text-[#1F7A4D]">Done</span>}
                </div>
                <h3 className="text-lg font-bold text-[#242424]">{viewAction.title}</h3>
                <p className="text-sm text-[#6a7282] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(viewAction.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  &nbsp;·&nbsp;{viewAction.startTime}:00 – {viewAction.endTime}:00
                </p>
              </div>
              <button onClick={() => setViewAction(null)} className="p-2 hover:bg-[#f3f4f6] rounded-lg cursor-pointer shrink-0">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            {viewAction.avatars && viewAction.avatars.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-[#6a7282] mb-2">Assigned To</p>
                <div className="flex flex-wrap gap-3">
                  {viewAction.avatars.map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                      <img src={imgUrl(p.avatar, "avatar")} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-[#e5e7eb]" />
                      <span className="text-sm text-[#242424]">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { toggleDone(viewAction.id); setViewAction(a => a ? { ...a, done: !a.done } : null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewAction.done
                    ? "border-[#e5e7eb] text-[#6a7282] hover:bg-[#f9fafb]"
                    : "border-[#1F7A4D] text-[#1F7A4D] hover:bg-[#f0fdf4]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {viewAction.done ? "Mark Undone" : "Mark Done"}
              </button>
              <button
                onClick={() => { deleteAction(viewAction.id); setViewAction(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium border border-[#FB2C36] text-[#FB2C36] hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    // </div >
  );
}
