import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import Image from "@/models/Image";
import Task from "@/models/Task";

const MAX_BYTES = 1.5 * 1024 * 1024; // batas setelah dikompres di client
const MAX_PER_TASK = 12;

// Body = byte JPEG mentah (Content-Type: image/jpeg), taskId lewat query string.
// Foto terhubung ke task lewat Image.taskId (tidak bergantung pada schema Task).
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const taskId = new URL(req.url).searchParams.get("taskId") ?? "";
  if (req.headers.get("content-type")?.split(";")[0] !== "image/jpeg") {
    return NextResponse.json({ error: "Hanya JPEG yang diterima" }, { status: 415 });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return NextResponse.json({ error: "File kosong" }, { status: 400 });
  if (buf.length > MAX_BYTES) return NextResponse.json({ error: "Foto terlalu besar" }, { status: 413 });
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) {
    return NextResponse.json({ error: "Bukan file JPEG yang valid" }, { status: 400 });
  }

  try {
    await connectDB();
    if (!(await Task.exists({ _id: taskId, userId: uid }))) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }
    if ((await Image.countDocuments({ taskId, userId: uid })) >= MAX_PER_TASK) {
      return NextResponse.json({ error: `Maksimal ${MAX_PER_TASK} foto per task` }, { status: 409 });
    }
    const img = await Image.create({ userId: uid, taskId, contentType: "image/jpeg", size: buf.length, data: buf });
    return NextResponse.json({ id: img._id.toString() }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}