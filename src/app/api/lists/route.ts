import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toList } from "@/lib/serializeLists";
import Checklist from "@/models/Checklist";

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { title } = await req.json().catch(() => ({}));
  try {
    await connectDB();
    const l = await Checklist.create({ userId: uid, title });
    return NextResponse.json(toList(l.toObject()), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}