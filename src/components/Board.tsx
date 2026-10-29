/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { addDays, diffDays, fromKey, today } from "@/lib/date";
import type { Reminder, Status, Task } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS: Record<Status, string> = { todo: "Not started", doing: "In progress", done: "Done" };
const NEXT: Record<Status, Status> = { todo: "doing", doing: "done", done: "todo" };
const fmtFull = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short" });

type TaskPatch = Partial<Pick<Task, "text" | "status" | "due" | "note" | "day">>;

/* ---------- class Tailwind yang dipakai berulang ---------- */
const focusUi = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const focusPaper = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";
const fieldBase = `scheme-light min-w-0 border border-paper/30 bg-white/60 text-paper placeholder:text-paper-soft/80 ${focusPaper}`;
const field = `${fieldBase} rounded-lg px-2.5 py-2`;
const fieldSm = `${fieldBase} rounded-md px-1.5 py-[3px] text-[0.8rem]`;
const pbtnBase = `cursor-pointer rounded-lg bg-gray-900 !text-white font-semibold hover:bg-black ${focusPaper}`;
const pbtn = `${pbtnBase} px-3.5 py-2`;
const pbtnSm = `${pbtnBase} px-2.5 py-1.5 text-[0.8rem]`;
const ibtn = `inline-flex size-8 cursor-pointer items-center justify-center rounded-lg p-0 text-paper-soft hover:bg-paper/12 hover:text-paper [&_svg]:size-[18px] ${focusPaper}`;
const nbtnBase = `inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-line bg-bar font-semibold text-ink hover:border-ink-soft [&_svg]:size-[18px] ${focusUi}`;
const nbtn = `${nbtnBase} h-10 min-w-10 px-3 text-[0.9rem]`;
const nbtnSm = `${nbtnBase} h-[30px] px-3 text-[0.8rem]`;

const note = "relative isolate min-w-0 rounded-[3px] px-3.5 pt-5 pb-[18px] text-paper shadow-note dark:shadow-note-dark min-[480px]:px-5 min-[480px]:pt-[22px] min-[480px]:pb-5";
const tape = "before:pointer-events-none before:absolute before:-top-[9px] before:left-1/2 before:z-10 before:-ml-[38px] before:h-5 before:w-[76px] before:rotate-[-2deg] before:bg-[#fffdf2]/65 before:shadow-[0_1px_2px_rgba(0,0,0,0.12)] before:content-['']";
const noteTodo = `${note} ${tape} rotate-[-0.25deg] bg-p-todo`;
const noteRem = `${note} ${tape} rotate-[0.45deg] bg-p-rem`;
const noteLate = `${note} ${tape} rotate-[-0.4deg] bg-p-late`;
const noteTitle = "font-note text-2xl leading-[1.2] font-bold";
const hint = "mt-0.5 mb-2 text-[0.82rem] text-paper-soft";
const emptyCls = "mt-2.5 mb-1 font-note text-[1.1rem] text-paper-soft";
const addForm = "mt-3.5 flex flex-wrap gap-2 border-t border-dashed border-paper/30 pt-3.5";
const rowCls = "border-t border-dashed border-paper/30";
const stColor: Record<Status, string> = { todo: "text-paper-soft", doing: "text-doing", done: "text-done" };

/* ---------- API helper ---------- */
async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}

/* ---------- icons ---------- */
function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const IconNote = () => <Svg><path d="M5 4h14v11l-5 5H5z" /><path d="M14 20v-5h5" /></Svg>;
const IconNext = () => <Svg><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
const IconDel = () => <Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const IconLeft = () => <Svg><path d="M15 5l-7 7 7 7" /></Svg>;
const IconRight = () => <Svg><path d="M9 5l7 7-7 7" /></Svg>;

function StatusIcon({ status }: { status: Status }) {
  if (status === "doing")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    );
  if (status === "done")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EditInput({ value, onDone }: { value: string; onDone: (v: string | null) => void }) {
  const finished = useRef(false);
  const finish = (v: string | null) => {
    if (finished.current) return;
    finished.current = true;
    onDone(v);
  };
  return (
    <input
      type="text"
      className={`${field} w-full`}
      maxLength={200}
      defaultValue={value}
      autoFocus
      aria-label="Edit task text"
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => finish(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); finish(e.currentTarget.value); }
        else if (e.key === "Escape") finish(null);
      }}
    />
  );
}

/* ---------- board ---------- */
interface Props {
  initialTasks: Task[];
  initialReminders: Reminder[];
  userName: string;
}

export default function Board({ initialTasks, initialReminders, userName }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [reminders, setReminders] = useState(initialReminders);
  // today & view kosong sampai mount, supaya tanggal server (UTC) tidak bentrok dengan tanggal browser
  const [t, setT] = useState("");
  const [view, setView] = useState("");
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [newText, setNewText] = useState("");
  const [newDue, setNewDue] = useState("");
  const [remText, setRemText] = useState("");
  const [remTime, setRemTime] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let last = today();
    setT(last);
    setView(last);
    const id = setInterval(() => {
      const n = today();
      if (n === last) return;
      const prev = last;
      last = n;
      setT(n);
      setView((v) => (v === prev ? n : v));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  if (!t) return null;

  /* ---------- helpers ---------- */
  function showToast(msg: string, undo?: () => void) {
    setToast({ msg, undo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }
  const isLate = (x: Task) => x.status !== "done" && !!x.due && diffDays(x.due, t) < 0;
  function dueInfo(x: Task) {
    if (!x.due || x.status === "done") return { text: "", cls: "" };
    const d = diffDays(x.due, t);
    if (d < 0) return { text: `${-d} ${d === -1 ? "day" : "days"} overdue`, cls: "late" };
    if (d === 0) return { text: "Due today", cls: "soon" };
    if (d === 1) return { text: "Due tomorrow", cls: "soon" };
    return { text: "", cls: "" };
  }
  const setLocal = (id: string, patch: TaskPatch) =>
    setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  /* ---------- task actions ---------- */
  async function patchTask(id: string, patch: TaskPatch) {
    const prev = tasks.find((x) => x.id === id);
    if (!prev) return;
    setLocal(id, patch); // optimistic
    try {
      await api(`/api/tasks/${id}`, "PATCH", patch);
    } catch {
      setLocal(id, prev);
      showToast("Failed to save the change");
    }
  }

  function changeNote(id: string, value: string) {
    setLocal(id, { note: value });
    clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(() => {
      api(`/api/tasks/${id}`, "PATCH", { note: value }).catch(() => showToast("Failed to save the note"));
    }, 600);
  }

  function closeNote(id: string) {
    setOpenNotes((o) => {
      const n = { ...o };
      delete n[id];
      return n;
    });
  }

  function toggleNote(task: Task) {
    const wasOpen = !!task.note || !!openNotes[task.id];
    if (wasOpen && !task.note) return closeNote(task.id);
    setOpenNotes((o) => ({ ...o, [task.id]: true }));
    setTimeout(() => document.getElementById(`n-${task.id}`)?.focus(), 0);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    try {
      const created = await api<Task>("/api/tasks", "POST", { day: view, text, due: newDue });
      setTasks((ts) => [...ts, created]);
      setNewText("");
      setNewDue("");
    } catch {
      showToast("Failed to add the task");
    }
  }

  async function moveTask(task: Task, toDay: string) {
    const from = task.day;
    await patchTask(task.id, { day: toDay });
    showToast(`Moved to ${fmtShort.format(fromKey(toDay))}`, () => patchTask(task.id, { day: from }));
  }

  async function deleteTask(task: Task) {
    setTasks((ts) => ts.filter((x) => x.id !== task.id));
    try {
      await api(`/api/tasks/${task.id}`, "DELETE");
    } catch {
      setTasks((ts) => [...ts, task]);
      showToast("Failed to delete the task");
      return;
    }
    showToast("Task deleted", async () => {
      try {
        const restored = await api<Task>("/api/tasks", "POST", {
          day: task.day, text: task.text, status: task.status, due: task.due, note: task.note,
        });
        setTasks((ts) => [...ts, restored]);
      } catch {
        showToast("Failed to restore the task");
      }
    });
  }

  function finishEdit(task: Task, v: string | null) {
    setEditingId(null);
    const text = v?.trim();
    if (text && text !== task.text) patchTask(task.id, { text });
  }

  /* ---------- reminder actions ---------- */
  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    const text = remText.trim();
    if (!text) return;
    try {
      const created = await api<Reminder>("/api/reminders", "POST", { text, time: remTime });
      setReminders((rs) => [...rs, created]);
      setRemText("");
      setRemTime("");
    } catch {
      showToast("Failed to add the reminder");
    }
  }

  async function toggleReminder(r: Reminder, checked: boolean) {
    const done = checked ? [...r.done, view] : r.done.filter((d) => d !== view);
    setReminders((rs) => rs.map((x) => (x.id === r.id ? { ...x, done } : x)));
    try {
      await api(`/api/reminders/${r.id}`, "PATCH", { done });
    } catch {
      setReminders((rs) => rs.map((x) => (x.id === r.id ? r : x)));
      showToast("Failed to save the change");
    }
  }

  async function deleteReminder(r: Reminder) {
    setReminders((rs) => rs.filter((x) => x.id !== r.id));
    try {
      await api(`/api/reminders/${r.id}`, "DELETE");
    } catch {
      setReminders((rs) => [...rs, r]);
      showToast("Failed to delete the reminder");
      return;
    }
    showToast("Reminder deleted", async () => {
      try {
        const restored = await api<Reminder>("/api/reminders", "POST", { text: r.text, time: r.time, done: r.done });
        setReminders((rs) => [...rs, restored]);
      } catch {
        showToast("Failed to restore the reminder");
      }
    });
  }

  async function logout() {
    await api("/api/auth/logout", "POST").catch(() => {});
    window.location.href = "/login";
  }

  /* ---------- derived ---------- */
  const dayTasks = tasks.filter((x) => x.day === view);
  const doneCount = dayTasks.filter((x) => x.status === "done").length;
  const doingCount = dayTasks.filter((x) => x.status === "doing").length;
  const lateCount = tasks.filter(isLate).length;

  const dow = (fromKey(view).getDay() + 6) % 7;
  const weekStart = addDays(view, -dow);

  const sortedTasks = [...dayTasks].sort((a, b) => {
    const da = a.status === "done" ? 1 : 0;
    const db = b.status === "done" ? 1 : 0;
    if (da !== db) return da - db;
    const xa = a.due || "9999";
    const xb = b.due || "9999";
    if (xa !== xb) return xa < xb ? -1 : 1;
    return a.created - b.created;
  });

  const sortedReminders = [...reminders].sort((a, b) => {
    const xa = a.time || "99:99";
    const xb = b.time || "99:99";
    return xa < xb ? -1 : xa > xb ? 1 : 0;
  });

  const lateTasks = tasks
    .filter((x) => x.status !== "done" && x.day !== view && (x.day < t || isLate(x)))
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const lateShown = lateTasks.slice(0, 6);

  const dateLabel = fmtFull.format(fromKey(view));

  return (
    <>
      <div className="mx-auto flex max-w-270 flex-col gap-5.5">
        <header className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h1 className="text-[0.78rem] font-bold tracking-[0.14em] text-ink-soft uppercase">Daily Work Board</h1>
            <span className="inline-flex items-center gap-2.5 text-[0.8rem] text-ink-soft">
              {userName}
              <button type="button" className={nbtnSm} onClick={logout}>Sign out</button>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mx-1 min-w-0 flex-auto font-note text-[clamp(1.5rem,5vw,2.2rem)] leading-[1.15] font-bold text-balance">
              {view === t ? `${dateLabel} (today)` : dateLabel}
            </h2>
            <button type="button" className={nbtn} aria-label="Previous day" onClick={() => setView(addDays(view, -1))}><IconLeft /></button>
            <button type="button" className={nbtn} aria-label="Next day" onClick={() => setView(addDays(view, 1))}><IconRight /></button>
            {view !== t && <button type="button" className={nbtn} onClick={() => setView(t)}>Today</button>}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((name, i) => {
              const k = addDays(weekStart, i);
              const all = tasks.filter((x) => x.day === k);
              const left = all.filter((x) => x.status !== "done").length;
              const badge = left > 0 ? left : all.length > 0 ? "✓" : "";
              const sel = k === view;
              const sub = sel ? "text-on-accent" : "text-ink-soft";
              return (
                <button
                  key={k}
                  type="button"
                  className={`flex min-w-0 cursor-pointer flex-col items-center gap-px rounded-[10px] border pt-1.5 pb-1.25 ${focusUi} ${
                    sel ? "border-accent bg-accent text-on-accent" : "border-line bg-bar text-ink"
                  }`}
                  aria-label={fmtFull.format(fromKey(k)) + (left ? `, ${left} tasks not done` : "")}
                  aria-current={sel ? "date" : undefined}
                  onClick={() => setView(k)}
                >
                  <span className={`text-[0.7rem] tracking-[0.06em] uppercase ${sub}`}>{name}</span>
                  <span className={`text-[1.05rem] font-bold tabular-nums ${k === t ? "underline decoration-2 underline-offset-[3px]" : ""}`}>{fromKey(k).getDate()}</span>
                  <span className={`min-h-[1em] text-[0.68rem] font-semibold tabular-nums ${sub}`}>{badge}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div
                className="h-full rounded-full bg-meter transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0}%` }}
              />
            </div>
            <p className="m-0 text-[0.9rem] text-ink-soft">
              {dayTasks.length
                ? `${doneCount} of ${dayTasks.length} tasks done${doingCount ? ` · ${doingCount} in progress` : ""}`
                : "No tasks for this day yet"}
              {lateCount > 0 && <span className="font-semibold text-warn"> · {lateCount} overdue</span>}
            </p>
          </div>
        </header>

        <main className="grid grid-cols-[minmax(0,1fr)] gap-6.5 min-[880px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] min-[880px]:items-start">
          <section className={noteTodo} aria-labelledby="todoH">
            <h3 id="todoH" className={noteTitle}>{view === t ? "Today's to-do" : `To-do · ${fmtShort.format(fromKey(view))}`}</h3>
            <p className={hint}>Tap the circle to change status: not started, in progress, done. The note icon opens a small case note under the task.</p>

            <ul>
              {sortedTasks.map((task) => {
                const di = dueInfo(task);
                const showSlip = !!task.note || !!openNotes[task.id];
                const done = task.status === "done";
                return (
                  <li key={task.id} className={`grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1 py-2.5 min-[481px]:grid-cols-[auto_minmax(0,1fr)_auto] ${rowCls}`}>
                    <button
                      type="button"
                      className={`col-start-1 row-start-1 inline-flex size-9 cursor-pointer items-center justify-center rounded-full p-0 [&_svg]:size-7 ${stColor[task.status]} ${focusPaper}`}
                      aria-label={`Status: ${STATUS[task.status]}. Tap to change to ${STATUS[NEXT[task.status]]}`}
                      onClick={() => patchTask(task.id, { status: NEXT[task.status] })}
                    >
                      <StatusIcon status={task.status} />
                    </button>

                    <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-1">
                      {editingId === task.id ? (
                        <EditInput value={task.text} onDone={(v) => finishEdit(task, v)} />
                      ) : (
                        <button
                          type="button"
                          className={`cursor-pointer pt-1 text-left text-base font-medium wrap-anywhere ${done ? "text-paper-soft line-through" : "text-paper"} ${focusPaper}`}
                          aria-label={`Edit text: ${task.text}`}
                          onClick={() => setEditingId(task.id)}
                        >
                          {task.text}
                        </button>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] text-paper-soft">
                        <span className={`font-bold ${stColor[task.status]}`}>{STATUS[task.status]}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <label htmlFor={`due-${task.id}`}>Due</label>
                          <input type="date" id={`due-${task.id}`} className={fieldSm} value={task.due} onChange={(e) => patchTask(task.id, { due: e.target.value })} />
                        </span>
                        {di.text && <span className={`font-bold ${di.cls === "late" ? "text-bad" : "text-paper"}`}>{di.text}</span>}
                      </div>
                      {showSlip && (
                        <div className="mt-1 rotate-[-0.5deg] rounded-xs bg-p-slip px-2 pt-1.5 pb-2 shadow-[0_1px_2px_rgba(20,30,40,0.25)]">
                          <label
                            className="font-note text-[0.9rem] font-bold text-paper-soft"
                            htmlFor={`n-${task.id}`}
                          >
                            Case note
                          </label>

                          <textarea
                            id={`n-${task.id}`}
                            className="mt-0.5 block min-h-[3.4em] w-full resize-y rounded-none border-0 bg-transparent px-0 py-0.5 font-note text-[1.02rem] leading-[1.35] text-paper field-sizing-content scheme-light placeholder:text-paper-soft/80 focus:ring-0 focus:outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper focus-visible:outline-dotted"
                            rows={2}
                            maxLength={2000}
                            placeholder="Blockers, ticket number, call outcome"
                            value={task.note}
                            onChange={(e) => changeNote(task.id, e.target.value)}
                            onBlur={(e) => {
                              if (e.currentTarget.value.trim()) return;
                              changeNote(task.id, "");
                              closeNote(task.id);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-start-2 row-start-2 flex items-start gap-0.5 min-[481px]:col-start-3 min-[481px]:row-start-1">
                      <button type="button" className={`${ibtn} ${task.note ? "bg-white/45 text-paper" : ""}`} aria-label="Case note" title="Case note" onClick={() => toggleNote(task)}><IconNote /></button>
                      <button type="button" className={ibtn} aria-label="Move to tomorrow" title="Move to tomorrow" onClick={() => moveTask(task, addDays(task.day, 1))}><IconNext /></button>
                      <button type="button" className={ibtn} aria-label="Delete task" title="Delete task" onClick={() => deleteTask(task)}><IconDel /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {sortedTasks.length === 0 && <p className={emptyCls}>No tasks for this day yet.</p>}

            <form className={addForm} autoComplete="off" onSubmit={addTask}>
              <label className="sr-only" htmlFor="taskText">New task</label>
              <input id="taskText" type="text" className={`${field} flex-[1_1_200px]`} placeholder="Write a new task" maxLength={200} required value={newText} onChange={(e) => setNewText(e.target.value)} />
              <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-paper-soft">
                <label htmlFor="taskDue">Due</label>
                <input id="taskDue" type="date" className={field} value={newDue} onChange={(e) => setNewDue(e.target.value)} />
              </span>
              <button className={pbtn} type="submit">Add</button>
            </form>
          </section>

          <div className="flex min-w-0 flex-col gap-6.5">
            <section className={noteRem} aria-labelledby="remH">
              <h3 id="remH" className={noteTitle}>Daily reminders</h3>
              <p className={hint}>Shows up every day. Checks are tracked per day.</p>
              <ul>
                {sortedReminders.map((r) => {
                  const on = r.done.includes(view);
                  return (
                    <li key={r.id} className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-1 py-2 ${rowCls}`}>
                      <input type="checkbox" id={`rc-${r.id}`} className="m-0 size-5 accent-done" checked={on} onChange={(e) => toggleReminder(r, e.target.checked)} />
                      <label className={`font-medium wrap-anywhere ${on ? "text-paper-soft line-through" : ""}`} htmlFor={`rc-${r.id}`}>{r.text}</label>
                      <span className="text-[0.85rem] font-bold tabular-nums">{r.time}</span>
                      <button type="button" className={ibtn} aria-label={`Delete reminder: ${r.text}`} title="Delete reminder" onClick={() => deleteReminder(r)}><IconDel /></button>
                    </li>
                  );
                })}
              </ul>
              {sortedReminders.length === 0 && <p className={emptyCls}>No reminders yet.</p>}
              <form className={addForm} autoComplete="off" onSubmit={addReminder}>
                <label className="sr-only" htmlFor="remText">New reminder</label>
                <input id="remText" type="text" className={`${field} flex-[1_1_200px]`} placeholder="e.g. check incoming email" maxLength={120} required value={remText} onChange={(e) => setRemText(e.target.value)} />
                <label className="sr-only" htmlFor="remTime">Time</label>
                <input id="remTime" type="time" className={`${field} flex-none`} value={remTime} onChange={(e) => setRemTime(e.target.value)} />
                <button className={pbtn} type="submit">Add</button>
              </form>
            </section>

            {lateTasks.length > 0 && (
              <section className={noteLate} aria-labelledby="lateH">
                <h3 id="lateH" className={noteTitle}>Unfinished</h3>
                <p className={hint}>Tasks from other days that are not done or are past due.</p>
                <ul>
                  {lateShown.map((x) => {
                    const di = dueInfo(x);
                    return (
                      <li key={x.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 py-2 ${rowCls}`}>
                        <span className="font-medium wrap-anywhere">{x.text}</span>
                        <span className="col-start-1 text-[0.78rem] text-paper-soft">
                          From {fmtShort.format(fromKey(x.day))}
                          {di.text && <> · <b className="text-bad">{di.text}</b></>}
                        </span>
                        <button type="button" className={`${pbtnSm} col-start-2 row-span-2 row-start-1`} onClick={() => moveTask(x, view)}>Move here</button>
                      </li>
                    );
                  })}
                </ul>
                {lateTasks.length > lateShown.length && <p className="mt-1.5 text-[0.8rem] text-paper-soft">+ {lateTasks.length - lateShown.length} more tasks</p>}
              </section>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div
          className="fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-1/2 z-5 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3.5 rounded-[10px] bg-ink px-4 py-2.5 text-[0.9rem] text-desk shadow-note dark:shadow-note-dark"
          role="status"
        >
          <span>{toast.msg}</span>
          {toast.undo && (
            <button type="button" className="cursor-pointer border-0 bg-transparent px-1 py-0.5 font-bold text-inherit underline" onClick={() => { toast.undo?.(); setToast(null); }}>
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}
