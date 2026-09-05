"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase-browser";

const T = {
  eyebrow:
    "\u0410\u0414\u041c\u0418\u041d\u0418\u0421\u0422\u0420\u0410\u0426\u0418\u042f",
  title:
    "\u0412\u0445\u043e\u0434 \u0432 SONDI.BG",
  help:
    "\u0412\u0445\u043e\u0434 \u0437\u0430 \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 \u0437\u0430\u044f\u0432\u043a\u0438\u0442\u0435 \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0438\u0442\u0435 \u0432 \u0440\u0430\u0437\u0434\u0435\u043b \u201e\u0423\u0441\u043b\u0443\u0433\u0438\u201c.",
  email:
    "\u0418\u043c\u0435\u0439\u043b",
  password:
    "\u041f\u0430\u0440\u043e\u043b\u0430",
  enter:
    "\u0412\u0445\u043e\u0434",
  entering:
    "\u0412\u0445\u043e\u0434...",
  invalid:
    "\u041d\u0435\u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0438\u043c\u0435\u0439\u043b \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u0430.",
  forbidden:
    "\u0422\u043e\u0437\u0438 \u0430\u043a\u0430\u0443\u043d\u0442 \u043d\u044f\u043c\u0430 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0441\u043a\u0438 \u0434\u043e\u0441\u0442\u044a\u043f.",
};

export default function AdminLoginPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    if (
      params.get("error") ===
      "forbidden"
    ) {
      setError(T.forbidden);
    }
  }, []);

  async function handleSubmit(
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
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setLoading(false);
      setError(T.invalid);
      return;
    }

    window.location.href =
      "/admin/services";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f7f8] px-4 py-12">
      <section className="w-full max-w-md rounded-[30px] border border-[#d8e7e9] bg-white p-7 shadow-[0_24px_80px_rgba(20,63,73,.10)] sm:p-9">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          {T.eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {T.title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6a8187]">
          {T.help}
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#efcccc] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#974646]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
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
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#294a53]">
              {T.password}
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white transition hover:bg-[#102f36] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? T.entering
              : T.enter}
          </button>
        </form>
      </section>
    </main>
  );
}
