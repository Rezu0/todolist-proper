import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import Image from "@/models/Image";
import Task from "@/models/Task";

const MAX_BYTES = 1.5 * 1024 * 1024; // batas setelah dikompres di client
const MAX_PER_TASK = 12;

// Body = byte JPEG mentah (Content-Type: image/jpeg), taskId lewat query string.
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
  // Cek signature JPEG (FF D8 FF) supaya bukan file sembarang
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) {
    return NextResponse.json({ error: "Bukan file JPEG yang valid" }, { status: 400 });
  }

  try {
    await connectDB();
    const img = await Image.create({ userId: uid, taskId, contentType: "image/jpeg", size: buf.length, data: buf });

    // Atomik: hanya menambah kalau task milik user ini dan belum penuh
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: uid, [`images.${MAX_PER_TASK - 1}`]: { $exists: false } },
      { $push: { images: img._id } }
    );
    if (!task) {
      await Image.deleteOne({ _id: img._id });
      return NextResponse.json({ error: "Task tidak ditemukan atau foto sudah 12" }, { status: 404 });
    }
    return NextResponse.json({ id: img._id.toString() }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}