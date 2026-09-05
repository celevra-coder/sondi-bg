"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { createClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"error" | "success" | "">("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const email = String(
      data.get("email") || ""
    ).trim();

    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      );

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0438\u0437\u043f\u0440\u0430\u0442\u0438\u043c \u043b\u0438\u043d\u043a \u0437\u0430 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435. \u041e\u043f\u0438\u0442\u0430\u0439\u0442\u0435 \u043e\u0442\u043d\u043e\u0432\u043e."
      );
      return;
    }

    setMessageType("success");
    setMessage(
      "\u0410\u043a\u043e \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430 \u0430\u043a\u0430\u0443\u043d\u0442 \u0441 \u0442\u043e\u0437\u0438 \u0438\u043c\u0435\u0439\u043b, \u0449\u0435 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u043b\u0438\u043d\u043a \u0437\u0430 \u0441\u043c\u044f\u043d\u0430 \u043d\u0430 \u043f\u0430\u0440\u043e\u043b\u0430\u0442\u0430. \u0418\u043c\u0430\u0439\u0442\u0435 \u043f\u0440\u0435\u0434\u0432\u0438\u0434, \u0447\u0435 \u0438\u043c\u0435\u0439\u043b\u044a\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u0440\u0438\u0441\u0442\u0438\u0433\u043d\u0435 \u0441\u044a\u0441 \u0437\u0430\u0431\u0430\u0432\u044f\u043d\u0435 \u0441\u043f\u043e\u0440\u0435\u0434 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0430\u0442\u0430 \u043f\u043e\u0449\u0430. \u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0438 \u043f\u0430\u043f\u043a\u0430 \u0421\u043f\u0430\u043c / \u041d\u0435\u0436\u0435\u043b\u0430\u043d\u0430 \u043f\u043e\u0449\u0430."
    );
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
          {"\u0412\u042a\u0417\u0421\u0422\u0410\u041d\u041e\u0412\u042f\u0412\u0410\u041d\u0415"}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {"\u0417\u0430\u0431\u0440\u0430\u0432\u0435\u043d\u0430 \u043f\u0430\u0440\u043e\u043b\u0430"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667f86]">
          {"\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435\u0439\u043b\u0430, \u0441 \u043a\u043e\u0439\u0442\u043e \u0441\u0442\u0435 \u0441\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043b\u0438."}
        </p>

        {message && (
          <div
            className={
              "mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold " +
              (messageType === "error"
                ? "border-[#efb5b5] bg-[#fff1f1] text-[#a12626]"
                : "border-[#b7dfcf] bg-[#effaf5] text-[#176247]")
            }
          >
            {message}
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#294a53]">
              {"\u0418\u043c\u0435\u0439\u043b"}
            </label>

            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white transition hover:bg-[#102f36] disabled:opacity-60"
          >
            {loading
              ? "\u0418\u0437\u043f\u0440\u0430\u0449\u0430\u043d\u0435..."
              : "\u0418\u0437\u043f\u0440\u0430\u0442\u0438 \u043b\u0438\u043d\u043a"}
          </button>
        </form>

        <div className="mt-7 text-center text-sm">
          <a
            href="/login"
            className="font-bold text-[#167454]"
          >
            {"\u041e\u0431\u0440\u0430\u0442\u043d\u043e \u043a\u044a\u043c \u0432\u0445\u043e\u0434"}
          </a>
        </div>
      </section>
    </main>
  );
}
