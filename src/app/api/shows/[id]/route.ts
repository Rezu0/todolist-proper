import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toShow } from "@/lib/serializeLists";
import { ChecklistShow } from "@/models/Checklist";

type Ctx = { params: Promise<{ id: string }> };

// Body: { checked: string[] }
export async function PATCH(req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  const { checked } = await req.json().catch(() => ({}));
  if (!Array.isArray(checked)) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  try {
    await connectDB();
    const s = await ChecklistShow.findOneAndUpdate(
      { _id: id, userId: uid },
      { checked: checked.slice(0, 100).map(String) },
      { new: true }
    );
    if (!s) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(toShow(s.toObject()));
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
    const res = await ChecklistShow.deleteOne({ _id: id, userId: uid });
    if (!res.deletedCount) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}