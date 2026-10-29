import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { setAuthCookie } from "@/lib/auth";
import { fail } from "@/lib/http";
import User from "@/models/User";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));

  try {
    await connectDB();
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
    if (!ok) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    await setAuthCookie(user._id.toString());
    return NextResponse.json({ id: user._id.toString() });
  } catch (e) {
    return fail(e);
  }
}
