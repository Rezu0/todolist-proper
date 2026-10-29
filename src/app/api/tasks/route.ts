import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { toTask } from "@/lib/serialize";
import Task from "@/models/Task";

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { day, text, status, due, note } = await req.json().catch(() => ({}));
  try {
    await connectDB();
    const task = await Task.create({ userId: uid, day, text, status, due, note });
    return NextResponse.json(toTask(task.toObject()), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
