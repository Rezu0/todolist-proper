"use client";

import { NOTE_FONTS, PALETTE, THEMES, UI_FONTS, type NoteKey, type Settings, type SettingsPatch } from "@/lib/settings";

const ring = "ring-2 ring-offset-1 ring-gray-500";

/* Pilihan warna: "" = ikut tema. Dipakai di panel Style dan di tiap case note. */
export function Palette({ value, onPick, autoLabel = "Theme" }: { value: string; onPick: (c: string) => void; autoLabel?: string }) {
  const cur = (value || "").toLowerCase();
  return (
    <div role="group" aria-label="Note color" className="flex flex-wrap items-center gap-1.5 py-1.5">
      <button
        type="button"
        aria-pressed={!cur}
        className={`cursor-pointer rounded-full border border-black/30 bg-white/60 px-2.5 py-0.5 text-[0.72rem] font-bold text-[#342f22] ${!cur ? ring : ""}`}
        onClick={() => onPick("")}
      >
        {autoLabel}
      </button>
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          title={c}
          aria-pressed={cur === c}
          style={{ background: c }}
          className={`size-[22px] cursor-pointer rounded-full border-2 border-black/30 p-0 ${cur === c ? ring : ""}`}
          onClick={() => onPick(c)}
        />
      ))}
      <label className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#5e5640]">
        Custom
        <input type="color" value={cur || "#ffd1dc"} className="h-6 w-[30px] cursor-pointer border-0 bg-transparent p-0" onChange={(e) => onPick(e.target.value)} />
      </label>
    </div>
  );
}

const NOTE_LABELS: Record<NoteKey, string> = {
  todo: "To-do",
  rem: "Reminders",
  list: "Checklists",
  late: "Unfinished",
  slip: "Case notes",
};

interface Props {
  settings: Settings;
  onChange: (patch: SettingsPatch) => void;
  onResetNotes: () => void;
  onResetAll: () => void;
}

export default function StylePanel({ settings: s, onChange, onResetNotes, onResetAll }: Props) {
  const row = "flex flex-wrap items-center gap-x-4 gap-y-2";
  const lab = "flex-none basis-[92px] text-[0.74rem] font-bold tracking-[0.08em] text-ink-soft uppercase";
  const sub = "inline-flex items-center gap-2 text-[0.85rem] text-ink-soft";
  const sel = "rounded-lg border border-line bg-desk px-2 py-1.5 text-ink";
  const btn = "h-[34px] cursor-pointer rounded-[10px] border border-line bg-bar px-3 text-[0.85rem] font-semibold text-ink hover:border-ink-soft";

  return (
    <div id="stylePanel" className="flex flex-col gap-3.5 rounded-xl border border-line bg-bar px-4 py-3.5">
      <div className={row}>
        <span className={lab}>Theme</span>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Color theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={`${t.name} theme`}
              title={t.name}
              aria-pressed={s.theme === t.id}
              style={{ background: t.swatch }}
              className={`size-7 cursor-pointer rounded-full border-2 border-bar p-0 shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_2px_var(--ink-soft)] aria-pressed:shadow-[0_0_0_2px_var(--ink)]`}
              onClick={() => onChange({ theme: t.id })}
            />
          ))}
        </div>
      </div>

      {s.theme === "custom" && (
        <div className={row}>
          <span className={lab}>Your colors</span>
          <label className={sub}>
            Color
            <input type="range" min={0} max={360} step={1} value={s.custom.h} className="w-[140px] accent-accent" onChange={(e) => onChange({ custom: { h: +e.target.value } })} />
          </label>
          <label className={sub}>
            Soft to bold
            <input type="range" min={10} max={80} step={1} value={s.custom.s} className="w-[140px] accent-accent" onChange={(e) => onChange({ custom: { s: +e.target.value } })} />
          </label>
        </div>
      )}

      <div className={row}>
        <span className={lab}>Fonts</span>
        <label className={sub}>
          Notes
          <select className={sel} value={s.fonts.note} onChange={(e) => onChange({ fonts: { note: e.target.value } })}>
            {NOTE_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
        <label className={sub}>
          App
          <select className={sel} value={s.fonts.ui} onChange={(e) => onChange({ fonts: { ui: e.target.value } })}>
            {UI_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
      </div>

      <div className={row}>
        <span className={lab}>Notes</span>
        <label className={sub}>
          <input type="checkbox" className="size-[18px] accent-accent" checked={s.round} onChange={(e) => onChange({ round: e.target.checked })} />
          Rounded corners
        </label>
        <button type="button" className={btn} onClick={onResetNotes}>Reset note colors</button>
      </div>

      <div className="flex flex-col gap-1">
        <span className={lab}>Note colors</span>
        {(Object.keys(NOTE_LABELS) as NoteKey[]).map((k) => (
          <div key={k} className={row}>
            <span className="basis-[92px] text-[0.85rem] text-ink-soft">{NOTE_LABELS[k]}</span>
            <Palette value={s.nc[k]} onPick={(c) => onChange({ nc: { [k]: c } })} />
          </div>
        ))}
      </div>

      <div className={row}>
        <button type="button" className={btn} onClick={onResetAll}>Reset all style</button>
      </div>
    </div>
  );
}