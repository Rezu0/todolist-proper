import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import Image from "@/models/Image";
import Task from "@/models/Task";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  try {
    await connectDB();
    const img = await Image.findOne({ _id: id, userId: uid }).lean<{ data: Buffer; contentType: string }>();
    if (!img) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    // Buffer dari lean() bisa berupa Binary; Buffer.from menormalkannya
    const bytes = Buffer.from(img.data as unknown as Uint8Array);
    return new Response(bytes, {
      headers: {
        "Content-Type": img.contentType,
        "Content-Length": String(bytes.length),
        // id tidak pernah berubah isinya, jadi aman di-cache lama (private: hanya browser user)
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
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
    const img = await Image.findOneAndDelete({ _id: id, userId: uid });
    if (!img) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    await Task.updateOne({ _id: img.taskId, userId: uid }, { $pull: { images: img._id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}