import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toShow } from "@/lib/serializeLists";
import Checklist, { ChecklistShow } from "@/models/Checklist";

// Body: { listId, day }. Kalau sudah ada untuk hari itu, yang lama dikembalikan.
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { listId, day } = await req.json().catch(() => ({}));
  try {
    await connectDB();
    if (!(await Checklist.exists({ _id: listId, userId: uid }))) {
      return NextResponse.json({ error: "Checklist tidak ditemukan" }, { status: 404 });
    }
    try {
      const s = await ChecklistShow.create({ userId: uid, listId, day });
      return NextResponse.json(toShow(s.toObject()), { status: 201 });
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e;
      const s = await ChecklistShow.findOne({ userId: uid, listId, day });
      return NextResponse.json(toShow(s!.toObject()));
    }
  } catch (e) {
    return fail(e);
  }
}