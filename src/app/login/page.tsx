
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-xl border border-[#e5e0d7] bg-[#fffefa] px-4 py-3 text-sm text-[#292720] outline-none transition duration-200 placeholder:text-[#aaa59a] hover:border-[#c8c0b3] focus:border-[#756c5d] focus:ring-4 focus:ring-[#756c5d]/10";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#f5f3ed] px-4 py-12 sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#e8e2d5]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#e9e4d9]/70 blur-3xl"
      />

      <section className="relative w-full max-w-105">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5dfd3] bg-[#fffefa] shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-[#514b3f]"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 9H16M8 12H13M8 15H11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#827b6e]">
            Daily Work Board
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#292720] sm:text-[34px]">
            {isLogin ? "Welcome back." : "Create your account."}
          </h1>

          <p className="mt-2 max-w-xs text-sm leading-6 text-[#777165]">
            {isLogin
              ? "Masuk dan lanjutkan pekerjaan yang sedang kamu kerjakan."
              : "Mulai atur pekerjaan dan catat task kamu dalam satu tempat."}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-[28px] border border-[#e7e2d8] bg-[#fffefa] p-6 shadow-[0_12px_50px_-20px_rgba(54,48,37,0.18)] sm:p-9">
          {/* Mode switch */}
          <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#f3f0e9] text-gray-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isLogin
                  ? "bg-[#a07a53] text-[#292720] shadow-sm"
                  : "text-[#8a8478] hover:text-[#514b3f]"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-[#a07a53] text-[#292720] shadow-sm"
                  : "text-[#8a8478] hover:text-[#514b3f]"
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#302e27]">
              {isLogin ? "Sign in to your account" : "Get started"}
            </h2>
            <p className="mt-1 text-sm text-[#8a8478]">
              {isLogin
                ? "Masukkan detail akun kamu di bawah."
                : "Isi detail berikut untuk membuat akun."}
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[13px] font-medium text-[#514b3f]"
                >
                  Nama lengkap
                </label>

                <input
                  id="name"
                  type="text"
                  className={inputCls}
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-medium text-[#514b3f]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                className={inputCls}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-medium text-[#514b3f]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                className={inputCls}
                placeholder={
                  isLogin ? "Masukkan password" : "Minimal 8 karakter"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#eed1cb] bg-[#fcf0ed] px-4 py-3 text-sm leading-5 text-[#a23d32]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#343229] px-4 py-3.5 text-sm font-semibold text-[#fffefa] shadow-sm transition duration-200 hover:bg-[#4a463b] focus:outline-none focus:ring-4 focus:ring-[#756c5d]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </svg>
              )}

              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}

              {!loading && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12H19M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#eee9df]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#aaa397]">
              Secure access
            </span>
            <div className="h-px flex-1 bg-[#eee9df]" />
          </div>

          <p className="text-center text-sm text-[#777165]">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              type="button"
              className="font-semibold text-[#454034] underline decoration-[#c8c0b3] underline-offset-4 transition hover:text-[#82745b]"
              onClick={() => {
                setMode(isLogin ? "register" : "login");
                setError("");
              }}
            >
              {isLogin ? "Buat akun" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#9a9386]">
          Simple workspace. Better focus.
        </p>
      </section>
    </main>
  );
}
