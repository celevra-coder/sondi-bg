"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type AccountType = "client" | "provider" | "both";

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("client");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        document.cookie =
          `ai_smm_auth_next=${encodeURIComponent("/account")}; path=/; max-age=3600; samesite=lax`;
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("user_profiles")
        .select("account_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (
        data?.account_type === "client" ||
        data?.account_type === "provider" ||
        data?.account_type === "both"
      ) {
        setAccountType(data.account_type);
      }

      setLoading(false);
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [supabase]);

  const typeLabel =
    accountType === "provider"
      ? "Предлагам услуги"
      : accountType === "both"
        ? "И двете"
        : "Търся услуги";

  return (
    <main className="min-h-screen bg-[#f2f8f8] px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-4xl rounded-[30px] border border-[#d9e7e9] bg-white p-7 shadow-[0_24px_80px_rgba(20,63,73,.10)] sm:p-10">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          АКАУНТ
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          Моят профил
        </h1>

        {loading ? (
          <div className="mt-8 text-sm text-[#6b8187]">
            Зареждане...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#789096]">
                  Имейл
                </div>
                <div className="mt-2 break-all font-semibold text-[#294e59]">
                  {email}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#789096]">
                  Тип акаунт
                </div>
                <div className="mt-2 font-semibold text-[#294e59]">
                  {typeLabel}
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-[#cfe7e2] bg-[#f0f8f5] p-5 text-sm leading-6 text-[#466c62]">
              Тук ще управлявате своите заявки и профила си на изпълнител.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
