import { NextResponse } from "next/server";

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export function fail(err: unknown) {
  if (err instanceof Error && (err.name === "ValidationError" || err.name === "CastError")) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
}
