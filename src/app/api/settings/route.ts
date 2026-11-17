import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { fail, unauthorized } from "@/lib/http";
import { mergeSettings, normalizeSettings } from "@/lib/settings";
import User from "@/models/User";

// Body: patch parsial (atau objek lengkap). Selalu divalidasi ulang di server.
export async function PATCH(req: Request) {
  const uid = await getUserId();
  if (!uid) return unauthorized();

  const body = await req.json().catch(() => ({}));
  try {
    await connectDB();
    const user = await User.findById(uid).select("settings").lean<{ settings?: unknown }>();
    if (!user) return unauthorized();
    const next = mergeSettings(normalizeSettings(user.settings), body);
    await User.updateOne({ _id: uid }, { settings: next });
    return NextResponse.json(next);
  } catch (e) {
    return fail(e);
  }
}