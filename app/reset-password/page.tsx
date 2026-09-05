"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { createClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
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

    const password = String(
      data.get("password") || ""
    );

    const repeatPassword = String(
      data.get("repeatPassword") || ""
    );

    if (password.length < 6) {
      setMessageType("error");
      setMessage(
        "\u041f\u0430\u0440\u043e\u043b\u0430\u0442\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043f\u043e\u043d\u0435 6 \u0441\u0438\u043c\u0432\u043e\u043b\u0430."
      );
      return;
    }

    if (password !== repeatPassword) {
      setMessageType("error");
      setMessage(
        "\u0414\u0432\u0435\u0442\u0435 \u043f\u0430\u0440\u043e\u043b\u0438 \u043d\u0435 \u0441\u044a\u0432\u043f\u0430\u0434\u0430\u0442."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(
        "\u041b\u0438\u043d\u043a\u044a\u0442 \u0437\u0430 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u0435 \u043d\u0435\u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0438\u043b\u0438 \u0435 \u0438\u0437\u0442\u0435\u043a\u044a\u043b."
      );
      return;
    }

    setMessageType("success");
    setMessage(
      "\u041f\u0430\u0440\u043e\u043b\u0430\u0442\u0430 \u0435 \u0441\u043c\u0435\u043d\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e. \u041f\u0440\u0435\u043d\u0430\u0441\u043e\u0447\u0432\u0430\u043d\u0435 \u043a\u044a\u043c \u0432\u0445\u043e\u0434..."
    );

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
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
          {"\u041d\u041e\u0412\u0410 \u041f\u0410\u0420\u041e\u041b\u0410"}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {"\u0421\u044a\u0437\u0434\u0430\u0439\u0442\u0435 \u043d\u043e\u0432\u0430 \u043f\u0430\u0440\u043e\u043b\u0430"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#667f86]">
          {"\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u043d\u043e\u0432\u0430\u0442\u0430 \u0441\u0438 \u043f\u0430\u0440\u043e\u043b\u0430 \u0434\u0432\u0430 \u043f\u044a\u0442\u0438."}
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
              {"\u041d\u043e\u0432\u0430 \u043f\u0430\u0440\u043e\u043b\u0430"}
            </label>

            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#294a53]">
              {"\u041f\u043e\u0432\u0442\u043e\u0440\u0435\u0442\u0435 \u043f\u0430\u0440\u043e\u043b\u0430\u0442\u0430"}
            </label>

            <input
              name="repeatPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[#d7e5e8] px-4 py-3 outline-none focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white transition hover:bg-[#102f36] disabled:opacity-60"
          >
            {loading
              ? "\u0417\u0430\u043f\u0430\u0437\u0432\u0430\u043d\u0435..."
              : "\u0417\u0430\u043f\u0430\u0437\u0438 \u043d\u043e\u0432\u0430\u0442\u0430 \u043f\u0430\u0440\u043e\u043b\u0430"}
          </button>
        </form>
      </section>
    </main>
  );
}
