import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toList } from "@/lib/serializeLists";
import Checklist, { ChecklistShow } from "@/models/Checklist";

type Ctx = { params: Promise<{ id: string }> };
type ItemIn = { id?: string; text?: string };

// Body: { title?, items?: [{ id?, text }] }. Item tanpa id dianggap baru;
// respons berisi list lengkap beserta id item dari server.
export async function PATCH(req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if ("title" in body) update.title = body.title;
  if (Array.isArray(body.items)) {
    update.items = (body.items as ItemIn[])
      .slice(0, 100)
      .map((i) => ({ ...(i.id ? { _id: i.id } : {}), text: i.text }));
  }

  try {
    await connectDB();
    const l = await Checklist.findOneAndUpdate({ _id: id, userId: uid }, update, { new: true, runValidators: true });
    if (!l) return NextResponse.json({ error: "Checklist tidak ditemukan" }, { status: 404 });
    return NextResponse.json(toList(l.toObject()));
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
    const res = await Checklist.deleteOne({ _id: id, userId: uid });
    if (!res.deletedCount) return NextResponse.json({ error: "Checklist tidak ditemukan" }, { status: 404 });
    await ChecklistShow.deleteMany({ listId: id, userId: uid });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}