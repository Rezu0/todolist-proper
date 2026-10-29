import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { setAuthCookie } from "@/lib/auth";
import { fail } from "@/lib/http";
import User from "@/models/User";

export async function POST(req: Request) {
  const { name = "", email = "", password = "" } = await req.json().catch(() => ({}));
  const mail = String(email).trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(mail) || String(password).length < 8) {
    return NextResponse.json({ error: "Email tidak valid atau password kurang dari 8 karakter" }, { status: 400 });
  }

  try {
    await connectDB();
    if (await User.exists({ email: mail })) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    const user = await User.create({
      name: String(name).trim(),
      email: mail,
      passwordHash: await bcrypt.hash(String(password), 10),
    });
    await setAuthCookie(user._id.toString());
    return NextResponse.json({ id: user._id.toString() }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
