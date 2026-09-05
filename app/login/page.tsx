"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase-browser";

const T = {
  eyebrow:
    "\u0412\u0425\u041e\u0414",
  title:
    "\u0412\u0445\u043e\u0434 \u0432 SONDI.BG",
  help:
    "\u0412\u043b\u0435\u0437\u0442\u0435 \u0432 \u0430\u043a\u0430\u0443\u043d\u0442\u0430 \u0441\u0438, \u0437\u0430 \u0434\u0430 \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0432\u0430\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0438\u0442\u0435 \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u0441\u0438.",
  email:
    "\u0418\u043c\u0435\u0439\u043b",
  password:
    "\u041f\u0430\u0440\u043e\u043b\u0430",
  enter:
    "\u0412\u0445\u043e\u0434",
  entering:
    "\u0412\u0445\u043e\u0434...",
  google:
    "\u0412\u0445\u043e\u0434 \u0441 Google",
  or:
    "\u0438\u043b\u0438",
  newUser:
    "\u041d\u044f\u043c\u0430\u0442\u0435 \u0430\u043a\u0430\u0443\u043d\u0442?",
  register:
    "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
};

export default function LoginPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [returnTo, setReturnTo] =
    useState("/explore");

  useEffect(() => {
    function readReturnCookie() {
      const match =
        document.cookie.match(
          /(?:^|; )sondi_auth_next=([^;]*)/
        );

      if (!match) return "";

      try {
        return decodeURIComponent(match[1]);
      } catch {
        return "";
      }
    }

    let target = readReturnCookie();

    try {
      if (!target && document.referrer) {
        const referrer =
          new URL(document.referrer);

        if (
          referrer.origin ===
            window.location.origin &&
          referrer.pathname !== "/login" &&
          referrer.pathname !== "/register" &&
          referrer.pathname !== "/forgot-password" &&
          referrer.pathname !== "/reset-password" &&
          referrer.pathname !== "/auth/callback"
        ) {
          target =
            referrer.pathname +
            referrer.search +
            referrer.hash;
        }
      }
    } catch {
      // Keep the previously stored destination.
    }

    if (
      !target.startsWith("/") ||
      target.startsWith("//") ||
      target === "/login" ||
      target === "/register" ||
      target === "/forgot-password" ||
      target === "/reset-password" ||
      target.startsWith("/auth/callback")
    ) {
      target = "/explore";
    }

    setReturnTo(target);

    document.cookie =
      `sondi_auth_next=${encodeURIComponent(target)}; path=/; max-age=3600; samesite=lax`;

    document.cookie =
      "ai_smm_auth_next=; path=/; max-age=0; samesite=lax";
  }, []);

  const [showPassword, setShowPassword] =
    useState(false);

  async function loginWithEmail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: String(
          data.get("email") || ""
        ).trim(),
        password: String(
          data.get("password") || ""
        ),
      });

    setLoading(false);

    if (error) {
      setMessage(
        "\u041d\u0435\u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0438\u043c\u0435\u0439\u043b \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u0430."
      );
      return;
    }

    document.cookie =
      "sondi_auth_next=; path=/; max-age=0; samesite=lax";

    window.location.href =
      returnTo;
  }

  async function loginWithGoogle() {
    setMessage("");

    document.cookie =
      `sondi_auth_next=${encodeURIComponent(returnTo)}; path=/; max-age=3600; samesite=lax`;

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">
      <video
        className="absolute inset-0 h-full w-full object-cover object-[52%_center] sm:object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/videos/sondi-hero.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/60" />
      <section className="relative z-10 w-full max-w-md rounded-[30px] border border-white/70 bg-white/95 p-7 shadow-[0_28px_90px_rgba(0,0,0,.30)] backdrop-blur-sm sm:p-9">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          {T.eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {T.title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667f85]">
          {T.help}
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-[#efcccc] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#974646]">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void loginWithGoogle()
          }
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d5e2e4] bg-white px-5 py-3.5 font-bold text-[#294a53] transition hover:bg-[#f7fafb]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="#4285F4"
              d="M21.805 10.023h-9.18v3.955h5.282c-.228 1.272-.914 2.35-1.95 3.073v2.55h3.16c1.85-1.705 2.916-4.218 2.916-7.196 0-.828-.074-1.625-.228-2.382Z"
            />
            <path
              fill="#34A853"
              d="M12.625 22c2.638 0 4.85-.872 6.467-2.364l-3.16-2.55c-.876.588-1.997.936-3.307.936-2.55 0-4.71-1.723-5.485-4.037H3.88v2.63A9.77 9.77 0 0 0 12.625 22Z"
            />
            <path
              fill="#FBBC05"
              d="M7.14 13.985a5.86 5.86 0 0 1-.306-1.86c0-.646.111-1.272.306-1.86V7.634H3.88A9.89 9.89 0 0 0 2.84 12.125c0 1.594.38 3.103 1.04 4.49l3.26-2.63Z"
            />
            <path
              fill="#EA4335"
              d="M12.625 6.228c1.437 0 2.726.494 3.742 1.464l2.805-2.805C17.47 3.3 15.258 2.25 12.625 2.25A9.77 9.77 0 0 0 3.88 7.634l3.26 2.63c.775-2.314 2.935-4.036 5.485-4.036Z"
            />
          </svg>
          {T.google}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-[#84979b]">
          <div className="h-px flex-1 bg-[#e0e9eb]" />
          {T.or}
          <div className="h-px flex-1 bg-[#e0e9eb]" />
        </div>

        <form
          onSubmit={loginWithEmail}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#294a53]">
              {T.email}
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#294a53]">
              {T.password}
            </label>
            <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl pr-12 border border-[#d7e5e8] px-4 py-3 outline-none focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "????? ????????"
                    : "?????? ????????"
                }
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#6f858b] transition hover:text-[#173f48]"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c5.5 0 9.5 5 9.5 8a7.4 7.4 0 0 1-2 3.7" />
                    <path d="M6.5 6.5C4 8.1 2.5 10.3 2.5 12c0 3 4 8 9.5 8 1.4 0 2.7-.3 3.8-.8" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm font-semibold text-[#167454] transition hover:text-[#0f5b40]"
            >
              {"\u0417\u0430\u0431\u0440\u0430\u0432\u0435\u043d\u0430 \u043f\u0430\u0440\u043e\u043b\u0430?"}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white transition hover:bg-[#102f36] disabled:opacity-60"
          >
            {loading
              ? T.entering
              : T.enter}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-[#6b8187]">
          {T.newUser}
          {" "}
          <a
            href="/register"
            className="font-bold text-[#167454]"
          >
            {T.register}
          </a>
        </div>
      </section>
    </main>
  );
}
