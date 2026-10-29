import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toReminder } from "@/lib/serialize";
import Reminder from "@/models/Reminder";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  for (const k of ["text", "time", "done"]) if (k in body) update[k] = body[k];

  try {
    await connectDB();
    const r = await Reminder.findOneAndUpdate({ _id: id, userId: uid }, update, { new: true, runValidators: true });
    if (!r) return NextResponse.json({ error: "Reminder tidak ditemukan" }, { status: 404 });
    return NextResponse.json(toReminder(r.toObject()));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  try {
    await connectDB();
    const res = await Reminder.deleteOne({ _id: id, userId: uid });
    if (!res.deletedCount) return NextResponse.json({ error: "Reminder tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
