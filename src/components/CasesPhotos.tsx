/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "@/lib/compress";

const MAX = 12;
const focusPaper = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";

interface Props {
  taskId: string;
  images: string[];
  onChange: (ids: string[]) => void;
  onError: (msg: string) => void;
  children?: React.ReactNode; // textarea case note; dibungkus supaya paste screenshot di dalamnya tertangkap
}

export default function CasePhotos({ taskId, images, onChange, onError, children }: Props) {
  const safeImages = Array.isArray(images) ? images : [];

  const fileRef = useRef<HTMLInputElement>(null);
  const latest = useRef<string[]>(safeImages);
  latest.current = safeImages;
  const [busy, setBusy] = useState(false);
  const [drop, setDrop] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [view, setView] = useState<string | null>(null);

  useEffect(() => {
    if (!view) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [view]);

  async function upload(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    const room = MAX - latest.current.length;
    if (room <= 0) return onError(`Up to ${MAX} photos per task`);
    setBusy(true);
    try {
      for (const f of imgs.slice(0, room)) {
        const blob = await compressImage(f); // JPEG, kualitas 0.8, maks 1600px
        const res = await fetch(`/api/images?taskId=${taskId}`, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
        const { id } = await res.json();
        latest.current = [...latest.current, id];
        onChange(latest.current);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to add the photo");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setConfirmId(null);
    const prev = latest.current;
    onChange(prev.filter((x) => x !== id));
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      onChange(prev);
      onError("Failed to delete the photo");
    }
  }

  function askRemove(id: string) {
    if (confirmId === id) return remove(id);
    setConfirmId(id);
    setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 3000);
  }

  return (
    <div
      className={drop ? "outline-2 outline-offset-2 outline-paper outline-dashed" : ""}
      onPaste={(e) => {
        const fs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
        if (!fs.length) return;
        e.preventDefault();
        upload(fs);
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDrop(true);
      }}
      onDragLeave={() => setDrop(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrop(false);
        upload(Array.from(e.dataTransfer.files));
      }}
    >
      {children}

      {safeImages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
            {safeImages.map((id) => (
            <div key={id} className="relative">
              <button
                type="button"
                aria-label="View photo"
                className={`block size-21 cursor-pointer overflow-hidden rounded-[10px] border border-paper/30 bg-white/50 p-0 ${focusPaper}`}
                onClick={() => setView(id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/images/${id}`} alt="Attached photo" loading="lazy" className="size-full object-cover" />
              </button>
              <button
                type="button"
                aria-label="Remove photo"
                title="Remove photo"
                className={`absolute top-0.75 right-0.75 h-5.5 min-w-5.5 cursor-pointer rounded-full border-0 text-[0.8rem] leading-none font-bold text-white ${
                  confirmId === id ? "bg-bad px-2 text-[0.7rem]" : "bg-black/70 p-0"
                } ${focusPaper}`}
                onClick={() => askRemove(id)}
              >
                {confirmId === id ? "Delete?" : "×"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <button
          type="button"
          disabled={busy}
          className={`cursor-pointer rounded-full border border-dashed border-paper-soft bg-white/50 px-2.5 py-0.75 text-[0.78rem] font-semibold text-paper disabled:cursor-default disabled:opacity-60 ${focusPaper}`}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Adding…" : "+ Add photo"}
        </button>
        <span className="font-note text-[0.76rem] text-paper-soft">or paste or drop a screenshot</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const fs = Array.from(e.target.files ?? []);
            e.target.value = "";
            upload(fs);
          }}
        />
      </div>

      {view && (
        <div
          role="dialog"
          aria-label="Photo"
          className="fixed inset-0 z-9 flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          onClick={() => setView(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/images/${view}`} alt="Attached photo" className="max-h-full max-w-full rounded-[10px]" />
        </div>
      )}
    </div>
  );
}