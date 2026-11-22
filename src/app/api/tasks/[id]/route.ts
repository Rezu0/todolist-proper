import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toTask } from "@/lib/serialize";
import Task from "@/models/Task";
import Image from "@/models/Image";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Whitelist field: userId dan images tidak bisa diubah dari sini
  const update: Record<string, unknown> = {};
  for (const k of ["text", "status", "due", "note", "day", "color"]) if (k in body) update[k] = body[k];

  try {
    await connectDB();
    const task = await Task.findOneAndUpdate({ _id: id, userId: uid }, update, { new: true, runValidators: true });
    if (!task) return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    return NextResponse.json(toTask(task.toObject()));
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
    const res = await Task.deleteOne({ _id: id, userId: uid });
    if (!res.deletedCount) return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    await Image.deleteMany({ taskId: id, userId: uid }); // foto ikut terhapus
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}