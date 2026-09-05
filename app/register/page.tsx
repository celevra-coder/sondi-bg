"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase-browser";

type AccountType =
  | "client"
  | "provider"
  | "both";

const T = {
  eyebrow:
    "\u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0410\u0426\u0418\u042f",
  title:
    "\u0421\u044a\u0437\u0434\u0430\u0439\u0442\u0435 \u0430\u043a\u0430\u0443\u043d\u0442 \u0432 SONDI.BG",
  help:
    "\u0421 \u0435\u0434\u0438\u043d \u0430\u043a\u0430\u0443\u043d\u0442 \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0438, \u0434\u0430 \u043f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0438 \u0438 \u0434\u0430 \u0432\u0438\u0436\u0434\u0430\u0442\u0435 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u0438.",
  who:
    "\u041a\u0430\u043a \u0449\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442\u0435 SONDI.BG?",
  client:
    "\u0422\u044a\u0440\u0441\u044f \u0443\u0441\u043b\u0443\u0433\u0438",
  provider:
    "\u041f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u043c \u0443\u0441\u043b\u0443\u0433\u0438",
  both:
    "\u0418 \u0434\u0432\u0435\u0442\u0435",
  email:
    "\u0418\u043c\u0435\u0439\u043b",
  password:
    "\u041f\u0430\u0440\u043e\u043b\u0430",
  passwordHelp:
    "\u041c\u0438\u043d\u0438\u043c\u0443\u043c 6 \u0441\u0438\u043c\u0432\u043e\u043b\u0430",
  create:
    "\u0421\u044a\u0437\u0434\u0430\u0439 \u0430\u043a\u0430\u0443\u043d\u0442",
  creating:
    "\u0421\u044a\u0437\u0434\u0430\u0432\u0430\u043d\u0435...",
  google:
    "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0438 \u0441 Google",
  or:
    "\u0438\u043b\u0438",
  existing:
    "\u0412\u0435\u0447\u0435 \u0438\u043c\u0430\u0442\u0435 \u0430\u043a\u0430\u0443\u043d\u0442?",
  login:
    "\u0412\u0445\u043e\u0434",
  success:
    "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u0430.",
};

export default function RegisterPage() {
  const supabase = createClient();

  const [accountType, setAccountType] =
    useState<AccountType>("client");

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
          /(?:^|; )ai_smm_auth_next=([^;]*)/
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
      if (document.referrer) {
        const referrer =
          new URL(document.referrer);

        if (
          referrer.origin ===
            window.location.origin &&
          referrer.pathname !== "/login" &&
          referrer.pathname !== "/register" &&
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
      target.startsWith("/auth/callback")
    ) {
      target = "/explore";
    }

    setReturnTo(target);

    document.cookie =
      `ai_smm_auth_next=${encodeURIComponent(target)}; path=/; max-age=3600; samesite=lax`;
  }, []);

  const [showPassword, setShowPassword] =
    useState(false);

  async function registerWithEmail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const email = String(
      data.get("email") || ""
    ).trim();

    const password = String(
      data.get("password") || ""
    );

    setLoading(true);
    setMessage("");

    const { data: result, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type:
              accountType,
          },
          emailRedirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (result.session) {
      window.location.href =
        returnTo;
      return;
    }

    setMessage(
      T.success +
        " " +
        "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0438\u043c\u0435\u0439\u043b\u0430 \u0441\u0438, \u0430\u043a\u043e \u0435 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u043f\u043e\u0442\u0432\u044a\u0440\u0436\u0434\u0435\u043d\u0438\u0435."
    );
  }

  async function registerWithGoogle() {
    setMessage("");

    document.cookie =
      `ai_smm_auth_next=${encodeURIComponent(returnTo)}; path=/; max-age=3600; samesite=lax`;

    document.cookie =
      `sondi_account_type=${accountType}; path=/; max-age=900; samesite=lax`;

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
    <main className="flex min-h-screen items-center justify-center bg-[#f2f8f8] px-4 py-12">
      <section className="w-full max-w-lg rounded-[30px] border border-[#d9e7e9] bg-white p-7 shadow-[0_24px_80px_rgba(20,63,73,.10)] sm:p-9">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          {T.eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {T.title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667f85]">
          {T.help}
        </p>

        <div className="mt-7">
          <div className="mb-3 text-sm font-bold text-[#294a53]">
            {T.who}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {([
              ["client", T.client],
              ["provider", T.provider],
              ["both", T.both],
            ] as const).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAccountType(value)
                  }
                  className={
                    "rounded-2xl border px-3 py-3 text-sm font-semibold transition " +
                    (
                      accountType === value
                        ? "border-[#16825c] bg-[#edf8f3] text-[#176247]"
                        : "border-[#d8e5e7] bg-white text-[#526b72]"
                    )
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-[#d7e5e8] bg-[#f7fbfb] px-4 py-3 text-sm text-[#46636a]">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void registerWithGoogle()
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
          onSubmit={registerWithEmail}
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
              minLength={6}
              autoComplete="new-password"
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
            <div className="mt-2 text-xs text-[#819398]">
              {T.passwordHelp}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#16825c] px-6 py-3.5 font-bold text-white transition hover:bg-[#126d4d] disabled:opacity-60"
          >
            {loading
              ? T.creating
              : T.create}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-[#6b8187]">
          {T.existing}
          {" "}
          <a
            href="/login"
            className="font-bold text-[#167454]"
          >
            {T.login}
          </a>
        </div>
      </section>
    </main>
  );
}
