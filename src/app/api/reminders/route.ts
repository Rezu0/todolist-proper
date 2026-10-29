import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toReminder } from "@/lib/serialize";
import Reminder from "@/models/Reminder";

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { text, time, done } = await req.json().catch(() => ({}));
  try {
    await connectDB();
    const r = await Reminder.create({ userId: uid, text, time, done });
    return NextResponse.json(toReminder(r.toObject()), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
