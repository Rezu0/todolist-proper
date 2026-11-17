import type { CSSProperties } from "react";

/* Dipakai di server (validasi API, page.tsx) dan di client (Board, StylePanel). */

export const THEMES = [
  { id: "classic", name: "Classic", swatch: "hsl(215 14% 55%)" },
  { id: "pink", name: "Bubblegum", swatch: "hsl(340 78% 76%)" },
  { id: "orange", name: "Peach", swatch: "hsl(22 92% 72%)" },
  { id: "lemon", name: "Lemon", swatch: "hsl(48 92% 66%)" },
  { id: "green", name: "Matcha", swatch: "hsl(100 48% 62%)" },
  { id: "mint", name: "Mint", swatch: "hsl(160 55% 64%)" },
  { id: "blue", name: "Sky", swatch: "hsl(205 78% 70%)" },
  { id: "purple", name: "Lavender", swatch: "hsl(265 62% 74%)" },
  { id: "custom", name: "Custom", swatch: "conic-gradient(#ff6b9d, #ffb347, #ffe66d, #7bed9f, #70a1ff, #b388ff, #ff6b9d)" },
] as const;

// v = nama CSS variable dari next/font (lihat layout.tsx)
export const NOTE_FONTS = [
  { id: "kalam", name: "Kalam", v: "--font-kalam" },
  { id: "caveat", name: "Caveat", v: "--font-caveat" },
  { id: "patrick", name: "Patrick Hand", v: "--font-patrick" },
  { id: "indie", name: "Indie Flower", v: "--font-indie" },
  { id: "gaegu", name: "Gaegu", v: "--font-gaegu" },
  { id: "fredoka", name: "Fredoka (round)", v: "--font-fredoka" },
] as const;

export const UI_FONTS = [
  { id: "figtree", name: "Figtree", v: "--font-figtree" },
  { id: "nunito", name: "Nunito", v: "--font-nunito" },
  { id: "quicksand", name: "Quicksand", v: "--font-quicksand" },
  { id: "fredoka", name: "Fredoka", v: "--font-fredoka" },
  { id: "system", name: "System", v: "" },
] as const;

export const NOTE_KEYS = ["todo", "rem", "list", "late", "slip"] as const;
export type NoteKey = (typeof NOTE_KEYS)[number];

export const PALETTE = ["#ffd1dc", "#ffd6a5", "#fdf2a0", "#d4f0a8", "#b8ecd2", "#b5e3f5", "#d4ccfa", "#f8c8f0", "#ffffff", "#e8e2d4"];

export interface Settings {
  theme: string;
  custom: { h: number; s: number };
  fonts: { note: string; ui: string };
  round: boolean;
  nc: Record<NoteKey, string>; // warna note per jenis; "" = ikut tema
}

export type SettingsPatch = {
  theme?: string;
  custom?: Partial<Settings["custom"]>;
  fonts?: Partial<Settings["fonts"]>;
  round?: boolean;
  nc?: Partial<Settings["nc"]>;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "classic",
  custom: { h: 330, s: 50 },
  fonts: { note: "kalam", ui: "figtree" },
  round: true,
  nc: { todo: "", rem: "", list: "", late: "", slip: "" },
};

const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: unknown, lo: number, hi: number, d: number) => (Number.isFinite(+(v as number)) ? Math.max(lo, Math.min(hi, +(v as number))) : d);
const pick = <T extends { id: string }>(list: readonly T[], id: unknown, d: string) => (list.some((x) => x.id === id) ? (id as string) : d);

// Whitelist ketat: apa pun yang tidak valid kembali ke default
export function normalizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof Settings, Record<string, unknown> | unknown>>;
  const custom = (r.custom ?? {}) as Record<string, unknown>;
  const fonts = (r.fonts ?? {}) as Record<string, unknown>;
  const nc = (r.nc ?? {}) as Record<string, unknown>;
  const D = DEFAULT_SETTINGS;
  return {
    theme: pick(THEMES, r.theme, D.theme),
    custom: { h: clamp(custom.h, 0, 360, D.custom.h), s: clamp(custom.s, 10, 80, D.custom.s) },
    fonts: { note: pick(NOTE_FONTS, fonts.note, D.fonts.note), ui: pick(UI_FONTS, fonts.ui, D.fonts.ui) },
    round: r.round !== false,
    nc: Object.fromEntries(NOTE_KEYS.map((k) => [k, typeof nc[k] === "string" && HEX.test(nc[k] as string) ? nc[k] : ""])) as Settings["nc"],
  };
}

export function mergeSettings(cur: Settings, patch: unknown): Settings {
  const p = (patch && typeof patch === "object" ? patch : {}) as SettingsPatch;
  return normalizeSettings({
    ...cur,
    ...p,
    custom: { ...cur.custom, ...p.custom },
    fonts: { ...cur.fonts, ...p.fonts },
    nc: { ...cur.nc, ...p.nc },
  });
}

// Atribut + CSS variable untuk elemen pembungkus (class "themed")
export function themeStyle(s: Settings): { attrs: { "data-accent": string }; style: CSSProperties } {
  const st: Record<string, string | number> = {};
  if (s.theme === "custom") {
    const { h, s: sat } = s.custom;
    st["--h"] = h;
    st["--s"] = `${sat}%`;
    st["--h-todo"] = h;
    st["--h-rem"] = (h + 60) % 360;
    st["--h-slip"] = (h + 180) % 360;
    st["--h-late"] = (h + 25) % 360;
    st["--h-list"] = (h + 120) % 360;
  }
  NOTE_KEYS.forEach((k) => {
    if (s.nc[k]) st[`--p-${k}`] = s.nc[k];
  });
  const nf = NOTE_FONTS.find((f) => f.id === s.fonts.note) ?? NOTE_FONTS[0];
  const uf = UI_FONTS.find((f) => f.id === s.fonts.ui) ?? UI_FONTS[0];
  st["--note-font"] = `var(${nf.v})`;
  st["--ui-font"] = uf.v ? `var(${uf.v})` : "system-ui";
  st["--note-r"] = s.round ? "14px" : "3px";
  return { attrs: { "data-accent": s.theme }, style: st as CSSProperties };
}