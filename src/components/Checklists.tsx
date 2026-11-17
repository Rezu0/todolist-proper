"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Checklist, Show } from "@/lib/serializeLists";

const focusPaper = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";
const field = `scheme-light min-w-0 rounded-lg border border-paper/30 bg-white/60 px-2.5 py-2 text-paper placeholder:text-paper-soft/80 ${focusPaper}`;
const pbtn = `cursor-pointer rounded-lg bg-gray-900 px-3.5 py-2 font-semibold !text-white hover:bg-black disabled:cursor-default disabled:opacity-55 ${focusPaper}`;
const ibtn = `inline-flex size-8 cursor-pointer items-center justify-center rounded-lg p-0 text-paper-soft hover:bg-paper/12 hover:text-paper ${focusPaper}`;
const rowCls = "border-t border-dashed border-paper/30";
const note = "relative min-w-0 rounded-[var(--note-r,3px)] bg-p-list px-3.5 pt-5 pb-[18px] text-paper shadow-note dark:shadow-note-dark min-[480px]:px-5";
const Del = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

interface Common {
  lists: Checklist[];
  shows: Show[];
  day: string;
  setShows: React.Dispatch<React.SetStateAction<Show[]>>;
  onError: (msg: string) => void;
}

async function addShow({ shows, setShows, onError }: Common, listId: string, day: string) {
  if (shows.some((s) => s.list === listId && s.day === day)) return;
  try {
    const created = await api<Show>("/api/shows", "POST", { listId, day });
    setShows((ss) => (ss.some((s) => s.id === created.id) ? ss : [...ss, created]));
  } catch {
    onError("Failed to show the checklist");
  }
}

/* ---------- panel di Daily board: checklist yang tampil pada hari terpilih ---------- */
export function DayChecklists(p: Common & { goManage: () => void }) {
  const { lists, shows, day, setShows, onError } = p;
  const [pick, setPick] = useState("");
  const dayShows = shows.filter((s) => s.day === day && lists.some((l) => l.id === s.list));
  const shownIds = dayShows.map((s) => s.list);
  const avail = lists.filter((l) => !shownIds.includes(l.id));
  const sel = avail.some((l) => l.id === pick) ? pick : avail[0]?.id;

  async function toggle(s: Show, itemId: string, on: boolean) {
    const checked = on ? [...s.checked, itemId] : s.checked.filter((x) => x !== itemId);
    setShows((ss) => ss.map((x) => (x.id === s.id ? { ...x, checked } : x)));
    try {
      await api(`/api/shows/${s.id}`, "PATCH", { checked });
    } catch {
      setShows((ss) => ss.map((x) => (x.id === s.id ? s : x)));
      onError("Failed to save the change");
    }
  }

  async function hide(s: Show) {
    setShows((ss) => ss.filter((x) => x.id !== s.id));
    try {
      await api(`/api/shows/${s.id}`, "DELETE");
    } catch {
      setShows((ss) => [...ss, s]);
      onError("Failed to hide the checklist");
    }
  }

  return (
    <section className={`${note} rotate-[0.2deg]`} aria-labelledby="clH">
      <h3 id="clH" className="font-note text-2xl leading-[1.2] font-bold">Checklists</h3>
      <p className="mt-0.5 mb-2 text-[0.82rem] text-paper-soft">Reusable lists you can bring onto any day. Ticks are saved per day.</p>

      {dayShows.map((s) => {
        const l = lists.find((x) => x.id === s.list)!;
        const count = l.items.filter((i) => s.checked.includes(i.id)).length;
        return (
          <div key={s.id} className={`${rowCls} py-2`}>
            <div className="flex items-center gap-2">
              <h4 className="m-0 min-w-0 flex-1 font-note text-[1.2rem] leading-[1.2] wrap-anywhere">{l.title}</h4>
              <span className="text-[0.8rem] font-bold text-paper-soft tabular-nums">{count}/{l.items.length}</span>
              <button type="button" className={ibtn} aria-label={`Hide from this day: ${l.title}`} title="Hide from this day" onClick={() => hide(s)}><Del /></button>
            </div>
            <ul className="mt-1">
              {l.items.map((i) => {
                const on = s.checked.includes(i.id);
                const cid = `ck-${s.id}-${i.id}`;
                return (
                  <li key={i.id} className="flex items-start gap-2 py-1">
                    <input type="checkbox" id={cid} className="mt-px size-5 flex-none accent-done" checked={on} onChange={(e) => toggle(s, i.id, e.target.checked)} />
                    <label htmlFor={cid} className={`min-w-0 font-medium wrap-anywhere ${on ? "text-paper-soft line-through" : ""}`}>{i.text}</label>
                  </li>
                );
              })}
              {l.items.length === 0 && <li className="text-[0.85rem] text-paper-soft">No items yet. Add some in the Checklists tab.</li>}
            </ul>
          </div>
        );
      })}

      {!lists.length ? (
        <p className="mt-2.5 text-[0.85rem] text-paper-soft">
          You have no checklists yet. <button type="button" className="cursor-pointer font-bold underline" onClick={p.goManage}>Create one</button>
        </p>
      ) : !avail.length ? (
        <p className="mt-2.5 text-[0.85rem] text-paper-soft">
          All your checklists are showing on this day. <button type="button" className="cursor-pointer font-bold underline" onClick={p.goManage}>Manage checklists</button>
        </p>
      ) : (
        <form
          className={`mt-3 flex flex-wrap gap-2 pt-3 ${rowCls}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (sel) addShow(p, sel, day);
          }}
        >
          <label className="sr-only" htmlFor="showPick">Checklist to show on this day</label>
          <select id="showPick" className={`${field} flex-[1_1_160px]`} value={sel} onChange={(e) => setPick(e.target.value)}>
            {avail.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <button className={pbtn} type="submit">Show on this day</button>
        </form>
      )}
    </section>
  );
}

/* ---------- layar kelola: buat, ubah, hapus checklist dan itemnya ---------- */
export function ManageChecklists(p: Common & { setLists: React.Dispatch<React.SetStateAction<Checklist[]>>; dayLabel: string }) {
  const { lists, shows, day, setLists, setShows, onError } = p;
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const replace = (l: Checklist) => setLists((ls) => ls.map((x) => (x.id === l.id ? l : x)));

  // Kirim title + items; server mengembalikan list dengan id item yang baru
  async function save(l: Checklist, patch: Partial<Pick<Checklist, "title" | "items">>) {
    const next = { ...l, ...patch };
    replace(next);
    try {
      replace(await api<Checklist>(`/api/lists/${l.id}`, "PATCH", { title: next.title, items: next.items }));
    } catch {
      replace(l);
      onError("Failed to save the checklist");
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const title = name.trim();
    if (!title) return;
    try {
      const l = await api<Checklist>("/api/lists", "POST", { title });
      setLists((ls) => [...ls, l]);
      setName("");
    } catch {
      onError("Failed to create the checklist");
    }
  }

  async function remove(l: Checklist) {
    const gone = shows.filter((s) => s.list === l.id);
    setLists((ls) => ls.filter((x) => x.id !== l.id));
    setShows((ss) => ss.filter((s) => s.list !== l.id));
    try {
      await api(`/api/lists/${l.id}`, "DELETE");
    } catch {
      setLists((ls) => [...ls, l]);
      setShows((ss) => [...ss, ...gone]);
      onError("Failed to delete the checklist");
    }
  }

  return (
    <div className="flex flex-col gap-5.5">
      <form className="flex min-w-0 gap-2" autoComplete="off" onSubmit={create}>
        <label className="sr-only" htmlFor="newListName">New checklist name</label>
        <input id="newListName" className="min-w-0 flex-1 rounded-[10px] border border-line bg-bar px-3 py-2 text-ink" placeholder="New checklist name, e.g. Packing list" maxLength={80} required value={name} onChange={(e) => setName(e.target.value)} />
        <button className="cursor-pointer rounded-[10px] bg-accent px-4 py-2 font-semibold text-on-accent" type="submit">Create</button>
      </form>

      {!lists.length && <p className="text-ink-soft">No checklists yet. Create one above, add its items, then show it on any day.</p>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] items-start gap-6.5">
        {lists.map((l) => {
          const showing = shows.some((s) => s.list === l.id && s.day === day);
          const draft = drafts[l.id] ?? "";
          return (
            <section key={l.id} className={note} aria-label={`Checklist: ${l.title}`}>
              <label className="sr-only" htmlFor={`lt-${l.id}`}>Checklist name</label>
              <input
                id={`lt-${l.id}`}
                className={`${field} w-full px-2 py-1 font-note text-[1.4rem] font-bold`}
                maxLength={80}
                defaultValue={l.title}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (!v) e.target.value = l.title;
                  else if (v !== l.title) save(l, { title: v });
                }}
              />
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {l.items.map((i) => (
                  <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
                    <label className="sr-only" htmlFor={`li-${i.id}`}>Item</label>
                    <input
                      id={`li-${i.id}`}
                      className={`${field} w-full px-2 py-1.5`}
                      maxLength={200}
                      defaultValue={i.text}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v === i.text) return;
                        // kosong = hapus item
                        save(l, { items: v ? l.items.map((x) => (x.id === i.id ? { ...x, text: v } : x)) : l.items.filter((x) => x.id !== i.id) });
                      }}
                    />
                    <button type="button" className={ibtn} aria-label={`Delete item: ${i.text}`} title="Delete item" onClick={() => save(l, { items: l.items.filter((x) => x.id !== i.id) })}><Del /></button>
                  </li>
                ))}
              </ul>
              <form
                className={`mt-3.5 flex flex-wrap gap-2 pt-3.5 ${rowCls}`}
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = draft.trim();
                  if (!v) return;
                  setDrafts((d) => ({ ...d, [l.id]: "" }));
                  save(l, { items: [...l.items, { id: "", text: v }] });
                }}
              >
                <label className="sr-only" htmlFor={`ai-${l.id}`}>New item</label>
                <input id={`ai-${l.id}`} className={`${field} flex-[1_1_160px]`} placeholder="Add an item" maxLength={200} required value={draft} onChange={(e) => setDrafts((d) => ({ ...d, [l.id]: e.target.value }))} />
                <button className={pbtn} type="submit">Add</button>
              </form>
              <div className={`mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-3 ${rowCls}`}>
                <button type="button" className={pbtn} disabled={showing} onClick={() => addShow(p, l.id, day)}>
                  {showing ? "Showing" : "Show"} on {p.dayLabel}
                </button>
                <button type="button" className={ibtn} aria-label={`Delete checklist: ${l.title}`} title="Delete checklist" onClick={() => remove(l)}><Del /></button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}