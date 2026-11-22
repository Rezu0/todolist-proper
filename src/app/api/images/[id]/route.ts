import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import Image from "@/models/Image";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const { id } = await params;
  try {
    await connectDB();
    // Tanpa .lean(): dengan dokumen Mongoose biasa, field Buffer selalu berupa Buffer.
    // (Dengan lean(), driver bisa mengembalikan objek Binary yang tidak bisa dibaca sebagai byte.)
    const img = await Image.findOne({ _id: id, userId: uid }).select("data contentType");
    if (!img) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    const bytes = Buffer.from(img.data as Buffer);
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
    const res = await Image.deleteOne({ _id: id, userId: uid });
    if (!res.deletedCount) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}