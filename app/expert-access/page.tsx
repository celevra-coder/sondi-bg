"use client";

import { useEffect, useMemo, useState } from "react";

type PreviousAnalysis = {
  id: string;
  created_at: string;
  analysis_version: number;
  charged_cents: number;
  payment_type: string;
  update_available: boolean;
};

type AccessStatus = {
  authenticated: boolean;
  admin?: boolean;
  unlimited?: boolean;
  current_version?: number;
  analysis_key?: string;
  free_analyses_remaining?: number;
  paid_balance_cents?: number;
  analysis_price_cents?: number;
  can_top_up?: boolean;
  previous_analysis?: PreviousAnalysis | null;
};

const TIERS = [
  {
    key: "199",
    amount: "1,99 €",
    rate: "1,99 € / анализ",
    analyses: "1 анализ",
  },
  {
    key: "500",
    amount: "5,00 €",
    rate: "1,25 € / анализ",
    analyses: "4 анализа",
  },
  {
    key: "1000",
    amount: "10,00 €",
    rate: "1,00 € / анализ",
    analyses: "10 анализа",
  },
  {
    key: "2000",
    amount: "20,00 €",
    rate: "0,80 € / анализ",
    analyses: "25 анализа",
  },
];

function euro(cents: number) {
  return (cents / 100)
    .toFixed(2)
    .replace(".", ",") + " €";
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ExpertAccessPage() {
  const [status, setStatus] =
    useState<AccessStatus | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [checkoutTier, setCheckoutTier] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  useEffect(() => {
    setQuery(window.location.search);
  }, []);

  const params = useMemo(
    () => new URLSearchParams(query),
    [query]
  );

  const lat = params.get("lat") || "";
  const lng = params.get("lng") || "";
  const gwb = params.get("gwb") || "";
  const gwbsRaw =
    params.get("gwbs") || "";

  const gwbs = gwbsRaw
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  useEffect(() => {
    async function loadAccess() {
      setLoading(true);
      setError("");

      try {
        const accessParams =
          new URLSearchParams();

        accessParams.set("lat", lat);
        accessParams.set("lng", lng);

        const response = await fetch(
          `/api/expert-access?${accessParams.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Неуспешна проверка на достъпа."
          );
        }

        setStatus(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Възникна грешка."
        );
      } finally {
        setLoading(false);
      }
    }

    if (!query) { return; }

    if (!lat || !lng) {
      setError(
        "Липсват координати за SONDI EXPERT анализа."
      );
      setLoading(false);
      return;
    }

    void loadAccess();
  }, [query, lat, lng]);

  function rememberReturn() {
    const target =
      `${window.location.pathname}${window.location.search}${window.location.hash}`;

    document.cookie =
      `sondi_auth_next=${encodeURIComponent(target)}; path=/; max-age=3600; samesite=lax`;
  }

  async function startAnalysis() {
    if (starting) {
      return;
    }

    setStarting(true);
    setError("");

    try {
      const queryParams:
        Record<string, string> = {};

      params.forEach((value, key) => {
        queryParams[key] = value;
      });

      const response = await fetch(
        "/api/expert-start",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            lat,
            lng,
            gwb,
            gwbs,
            queryParams,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          data?.error ===
            "no_expert_access" ||
          data?.error ===
            "insufficient_expert_balance"
        ) {
          setStatus(current =>
            current
              ? {
                  ...current,
                  free_analyses_remaining:
                    0,
                }
              : current
          );

          throw new Error(
            "Няма достатъчен EXPERT баланс за нов анализ."
          );
        }

        throw new Error(
          data?.error ||
            "Анализът не можа да бъде стартиран."
        );
      }

      const proParams =
        new URLSearchParams(params);

      if (data.analysis_id) {
        proParams.set(
          "analysis_id",
          String(data.analysis_id)
        );
      }

      window.location.href =
        `/pro?${proParams.toString()}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Възникна грешка."
      );
      setStarting(false);
    }
  }

  async function startCheckout(
    tier: string
  ) {
    if (checkoutTier) {
      return;
    }

    setCheckoutTier(tier);
    setError("");

    try {
      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tier,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 409
        ) {
          throw new Error(
            data?.message ||
              "Първо използвайте текущия си баланс."
          );
        }

        throw new Error(
          data?.error ||
            "Неуспешно стартиране на плащането."
        );
      }

      if (!data?.url) {
        throw new Error(
          "Stripe не върна адрес за плащане."
        );
      }

      window.location.href =
        data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Възникна грешка."
      );
      setCheckoutTier(null);
    }
  }

  const freeRemaining =
    status?.free_analyses_remaining ??
    0;

  const paidBalance =
    status?.paid_balance_cents ?? 0;

  const activePrice =
    status?.analysis_price_cents ?? 0;

  const previous =
    status?.previous_analysis || null;

  const previousAnalysisHref = (() => {
    if (!previous) {
      return "";
    }

    const previousParams =
      new URLSearchParams(params);

    previousParams.set(
      "analysis_id",
      previous.id
    );

    return `/pro?${previousParams.toString()}`;
  })();
  const canStart =
    Boolean(status?.admin) ||
    freeRemaining > 0 ||
    (
      activePrice > 0 &&
      paidBalance >= activePrice
    );

  return (
    <main className="min-h-screen bg-[#f2f8f8] px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-4xl rounded-[30px] border border-[#d9e7e9] bg-white p-6 shadow-[0_24px_80px_rgba(20,63,73,.10)] sm:p-10">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          SONDI EXPERT
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          Професионален анализ на избраната точка
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b8187]">
          Координати:{" "}
          <strong className="text-[#365c65]">
            {lat || "—"}, {lng || "—"}
          </strong>
          {gwb ? (
            <>
              {" · "}
              ПВТ:{" "}
              <strong className="text-[#365c65]">
                {gwb}
              </strong>
            </>
          ) : null}
        </p>

        {loading && (
          <div className="mt-8 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] px-5 py-8 text-sm text-[#6b8187]">
            Проверка на EXPERT достъпа...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#efb5b5] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#a12626]">
            {error}
          </div>
        )}

        {!loading &&
          status &&
          !status.authenticated && (
            <div className="mt-8 rounded-[24px] border border-[#d9e7e9] bg-[#f7fbfb] p-6">
              <h2 className="text-xl font-bold text-[#173f48]">
                Влезте в профила си
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6b8187]">
                SONDI EXPERT анализите се
                запазват в личния ви профил.
                Новата регистрация включва
                2 безплатни EXPERT анализа.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/login"
                  onClick={rememberReturn}
                  className="inline-flex items-center justify-center rounded-xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white"
                >
                  Вход
                </a>

                <a
                  href="/register"
                  onClick={rememberReturn}
                  className="inline-flex items-center justify-center rounded-xl border border-[#b9d7dc] bg-[#eef8f9] px-5 py-3 text-sm font-bold text-[#245d68]"
                >
                  Регистрация
                </a>
              </div>
            </div>
          )}

        {!loading &&
          status?.authenticated &&
          status.admin && (
            <div className="mt-8 rounded-2xl border border-[#b7dfcf] bg-[#effaf5] p-5">
              <div className="font-bold text-[#176247]">
                Администраторски достъп
              </div>

              <p className="mt-2 text-sm leading-6 text-[#3f6d5d]">
                EXPERT анализите са достъпни
                без ограничение и без таксуване.
              </p>

              <button
                type="button"
                onClick={() =>
                  void startAnalysis()
                }
                disabled={starting}
                className="mt-5 rounded-xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {starting
                  ? "Отваряне..."
                  : "Отвори SONDI EXPERT"}
              </button>
            </div>
          )}

        {!loading &&
          status?.authenticated &&
          !status.admin && (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                    Безплатни анализи
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#173f48]">
                    {freeRemaining}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                    EXPERT баланс
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#173f48]">
                    {euro(paidBalance)}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                    Текуща ставка
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#173f48]">
                    {activePrice
                      ? euro(activePrice)
                      : "—"}
                  </div>
                </div>
              </div>

              {previous && (
                <div className="mt-6 rounded-2xl border border-[#ead7a3] bg-[#fff8e5] p-5 text-[#87661c]">
                  <div className="font-bold">
                    Тази точка вече е анализирана
                  </div>

                  <p className="mt-2 text-sm leading-6">
                    Последен анализ:{" "}
                    <strong>
                      {formatDate(
                        previous.created_at
                      )}
                    </strong>
                    .
                  </p>

                  <p className="mt-2 text-sm leading-6">
                    {previous.update_available
                      ? "След последния анализ има обновяване на SONDI EXPERT. Новият анализ може да съдържа актуализирани резултати."
                      : "Няма съществено обновяване на SONDI EXPERT след последния анализ."}
                  </p>

                  <p className="mt-2 text-sm font-semibold leading-6">
                    {freeRemaining > 0
                      ? "Ако продължите, ще бъде създаден нов анализ и ще бъде използван 1 безплатен анализ."
                      : `Ако продължите, ще бъде създаден нов анализ и ще бъде таксуван според текущата ви ставка${activePrice > 0 ? ` (${euro(activePrice)})` : ""}.`}
                  </p>

                  <a
                    href={previousAnalysisHref}
                    className="mt-4 inline-flex rounded-xl bg-[#87661c] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    {"\u041e\u0442\u0432\u043e\u0440\u0438 \u043f\u0440\u0435\u0434\u0438\u0448\u043d\u0438\u044f \u0430\u043d\u0430\u043b\u0438\u0437"}
                  </a>                </div>
              )}

              {canStart && (
                <div className="mt-6 rounded-[24px] border border-[#cfe2dd] bg-[#f1f8f6] p-6">
                  <h2 className="text-xl font-bold text-[#173f48]">
                    Готово за анализ
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#526e75]">
                    {freeRemaining > 0
                      ? `Ще бъде използван 1 безплатен анализ. След това ще ви останат ${freeRemaining - 1}.`
                      : `Цена на новия анализ: ${euro(activePrice)}. Баланс след анализа: ${euro(paidBalance - activePrice)}.`}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void startAnalysis()
                    }
                    disabled={starting}
                    className="mt-5 rounded-xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {starting
                      ? "Стартиране..."
                      : previous
                        ? "Анализирай отново"
                        : "Стартирай SONDI EXPERT"}
                  </button>
                </div>
              )}

              {!canStart && (
                <div className="mt-8 border-t border-[#e1ecee] pt-8">
                  <h2 className="text-2xl font-bold text-[#173f48]">
                    Заредете EXPERT баланс
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6b8187]">
                    По-голямото зареждане дава
                    по-ниска цена за един анализ.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {TIERS.map(tier => (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() =>
                          void startCheckout(
                            tier.key
                          )
                        }
                        disabled={
                          Boolean(
                            checkoutTier
                          ) ||
                          paidBalance > 0
                        }
                        className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5 text-left transition hover:border-[#9fc9c1] hover:bg-[#f1f8f6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="text-xl font-bold text-[#173f48]">
                          {tier.amount}
                        </div>

                        <div className="mt-2 text-sm font-semibold text-[#28634f]">
                          {tier.rate}
                        </div>

                        <div className="mt-1 text-xs text-[#789096]">
                          {tier.analyses}
                        </div>

                        {checkoutTier ===
                          tier.key && (
                          <div className="mt-3 text-xs font-bold text-[#56858e]">
                            Отваряне на плащането...
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {paidBalance > 0 && (
                    <div className="mt-4 rounded-xl border border-[#ead7a3] bg-[#fff8e5] px-4 py-3 text-xs leading-5 text-[#87661c]">
                      Ново зареждане е възможно
                      след изчерпване на текущия
                      платен баланс.
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-[#d9e7e9] bg-white p-5 text-sm leading-6 text-[#526e75]">
                    За фирми и професионални
                    потребители с постоянна
                    необходимост от SONDI EXPERT:
                    {" "}
                    <a
                      href="mailto:info@sondi.bg"
                      className="font-bold text-[#177f98]"
                    >
                      info@sondi.bg
                    </a>
                    {" "}
                    — възможност за неограничен
                    професионален достъп.
                  </div>
                </div>
              )}
            </>
          )}

        <div className="mt-8 border-t border-[#e3edef] pt-5">
          <a
            href={
              query
                ? `/map${query}`
                : "/map"
            }
            className="text-sm font-bold text-[#56858e]"
          >
            ← Обратно към картата
          </a>
        </div>
      </section>
    </main>
  );
}