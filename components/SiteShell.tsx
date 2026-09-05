"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

const menus = [
  {
    label: "СОНДАЖИ",
    items: [
      ["Преди да направите сондаж", "/drilling"],
      ["Избор на място", "/drilling/location"],
      ["Дълбочина и дебит", "/drilling/depth"],
      ["Водни нива", "/drilling/water-levels"],
      ["Помпи и оборудване", "/drilling/equipment"],
    ],
  },
  {
    label: "SONDI EXPERT",
    items: [
      ["Анализ по координати", "/analysis"],
      ["EXPERT карта", "/map"],
      ["Профили на водни тела", "/groundwater/bodies"],
      ["Мониторинг и данни", "/monitoring"],
      ["Професионални отчети", "/pro"],
      ["Официални източници", "/sources"],
    ],
  },
];


const expertDescriptions: Record<string, string> = {
  "/analysis":
    "\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e\u0442\u043e, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u0442\u0430 \u0438 \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u0442\u0430 \u0437\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435",
  "/map":
    "\u0420\u0430\u0437\u0448\u0438\u0440\u0435\u043d\u0438 \u0441\u043b\u043e\u0435\u0432\u0435 \u0437\u0430 \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u0441\u043e\u043d\u0434\u0430\u0436\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438 \u0440\u0438\u0441\u043a",
  "/groundwater/bodies":
    "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430, \u0440\u0435\u0441\u0443\u0440\u0441\u0430 \u0438 \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435\u0442\u043e",
  "/monitoring":
    "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f, \u043d\u0430\u0431\u043b\u044e\u0434\u0430\u0432\u0430\u043d\u0438 \u0442\u043e\u0447\u043a\u0438 \u0438 \u0440\u0435\u0430\u043b\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u0437\u0430 \u0440\u0430\u0439\u043e\u043d\u0430",
  "/pro":
    "\u0413\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0430\u043d\u0430\u043b\u0438\u0437, \u043e\u0446\u0435\u043d\u043a\u0430 \u043d\u0430 \u0442\u0435\u0440\u0435\u043d\u0430 \u0438 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0438 \u0437\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435",
  "/sources":
    "\u041f\u0440\u043e\u0438\u0437\u0445\u043e\u0434 \u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u043d\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438",
};

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [supabase] = useState(() => createClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsAuthenticated(Boolean(data.session));
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsAuthenticated(Boolean(session));
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/explore";
  }

  function rememberAuthReturn() {
    const target =
      `${window.location.pathname}${window.location.search}${window.location.hash}`;

    document.cookie =
      `ai_smm_auth_next=${encodeURIComponent(target)}; path=/; max-age=3600; samesite=lax`;
  }

  const keepHeaderVisible = pathname === "/explore";

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#102f38]">
      {!keepHeaderVisible && (
        <div
          className="fixed left-0 right-0 top-0 z-[110] h-5"
          onMouseEnter={() => setHeaderOpen(true)}
        />
      )}

      {!keepHeaderVisible && (
        <button
          type="button"
          onClick={() => {
            const nextOpen = !headerOpen;
            setHeaderOpen(nextOpen);

            if (typeof window !== "undefined" && window.innerWidth < 1280) {
              setMobileOpen(nextOpen);
            }
          }}
          className="fixed right-4 top-3 z-[120] rounded-full border border-[#b9dbe3] bg-[#e8f6f9]/95 px-4 py-2 text-xs font-medium text-[#24505b] shadow-md backdrop-blur-xl transition hover:bg-white"
        >
          {headerOpen && mobileOpen ? "Затвори" : "Меню"}
        </button>
      )}

      <header
        onMouseEnter={() => setHeaderOpen(true)}
        onMouseLeave={() => {
          if (!keepHeaderVisible) setHeaderOpen(false);
        }}
        className={[
          "z-[100] border-b border-[#cde7ee] bg-[#e5f5f9]/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          keepHeaderVisible
            ? "sticky top-0 translate-y-0"
            : "fixed left-0 right-0 top-0",
          !keepHeaderVisible && !headerOpen
            ? "-translate-y-full"
            : "translate-y-0",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[86px] max-w-[1540px] items-center px-7 lg:px-10">
          <Link href="/explore" className="flex shrink-0 items-center gap-3">
            <div className="relative h-12 w-12">
              <div className="absolute left-[13px] top-[5px] h-7 w-5 rotate-45 rounded-[70%_35%_70%_35%] border-[3px] border-[#167d96]" />
              <div className="absolute bottom-[7px] left-[5px] h-[3px] w-10 rounded-full bg-[#71bacb]" />
              <div className="absolute bottom-[1px] left-[10px] h-[2px] w-8 rounded-full bg-[#9bd0db]" />
            </div>

            <div>
              <div className="text-[25px] font-semibold tracking-[-0.05em]">
                Sondi<span className="text-[#19839c]">.bg</span>
              </div>
              <div className="-mt-1 text-[8px] uppercase tracking-[0.3em] text-[#648894]">
                Underground Water
              </div>
            </div>
          </Link>

          <nav className="ml-auto hidden h-full items-center gap-1 xl:flex">
            <Link
              href="/explore"
              className="px-4 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
            >
              НАЧАЛО
            </Link>

            <Link
              href="/map"
              className="px-4 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
            >
              КАРТА
            </Link>

            <Link
              href="/services"
              className="px-4 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
            >
              УСЛУГИ
            </Link>

            {menus.map((menu) => (
              <div key={menu.label} className="group relative flex h-full items-center">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-[#294e59] transition group-hover:text-[#15809a]"
                >
                  {menu.label}
                  <span className="text-[8px]">▼</span>
                </button>

                {menu.label === "SONDI EXPERT" ? (
                  <div className="pointer-events-none absolute left-1/2 top-[72px] w-[690px] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="border border-[#cde5eb] bg-[#f8fdfe] p-3 shadow-[0_22px_60px_rgba(29,77,90,.16)]">
                      <div className="mb-3 px-2 pt-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f8898]">
                          SONDI EXPERT
                        </div>
                        <div className="mt-1 text-[12px] text-[#718a91]">
                          {"\u041f\u043e\u0432\u0435\u0447\u0435 \u0434\u0430\u043d\u043d\u0438 \u0438 \u043f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a \u043f\u043e\u0433\u043b\u0435\u0434 \u0432\u044a\u0440\u0445\u0443 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {menu.items.map(([label, href], index) => (
                          <div
                            key={label}
                            className="flex min-h-[104px] gap-4 border border-[#e1eef1] bg-white px-4 py-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b9dae1] bg-[#e7f4f7] text-[11px] font-semibold text-[#28798b]">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="text-[14px] font-semibold leading-5 text-[#294e59]">
                                {label}
                              </span>

                              <p className="mt-1.5 text-[12px] leading-[1.55] text-[#6b858c]">
                                {expertDescriptions[href]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pointer-events-none absolute left-0 top-[72px] w-[315px] translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="overflow-hidden border border-[#cde5eb] bg-[#f8fdfe] shadow-[0_22px_60px_rgba(29,77,90,.16)]">
                      {menu.items.map(([label, href]) => (
                        <Link
                          key={label}
                          href={href}
                          className="flex items-center justify-between border-b border-[#e0eef2] px-5 py-4 text-sm text-[#355863] transition last:border-b-0 hover:bg-[#dff2f7] hover:pl-7 hover:text-[#137891]"
                        >
                          <span>{label}</span>
                          <span className="text-[#7caab5]">
                            {"\u2192"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/knowledge"
              className="px-4 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
            >
              ЗНАНИЯ
            </Link>

            <Link
              href="/about"
              className="px-4 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
            >
              ЗА НАС
            </Link>

            <div className="ml-3 h-7 w-px bg-[#bfdde5]" />

            {authReady && (
              isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="px-3 py-3 text-[13px] font-medium text-[#294e59] transition hover:text-[#15809a]"
                  >
                    {"ПРОФИЛ"}
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="ml-1 rounded-full bg-[#177f98] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#126a80]"
                  >
                    {"ИЗХОД"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={rememberAuthReturn}
                    className="px-3 py-3 text-[13px] font-medium text-[#294e59]"
                  >
                    {"ВХОД"}
                  </Link>

                  <Link
                    href="/register"
                    onClick={rememberAuthReturn}
                    className="ml-1 rounded-full bg-[#177f98] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#126a80]"
                  >
                    {"РЕГИСТРАЦИЯ"}
                  </Link>
                </>
              )
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-auto text-2xl xl:hidden"
            aria-label="Меню"
          >
            ☰
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#cde5eb] bg-[#f5fbfd] px-7 py-6 xl:hidden">
            <div className="grid gap-4 text-sm">
              <Link href="/explore">Начало</Link>
              <Link href="/map">Карта</Link>
              <Link href="/drilling">Сондажи</Link>
              <Link href="/pro">Професионалисти</Link>
              <Link href="/knowledge">Знания</Link>
              <Link href="/about">За нас</Link>
              {authReady && (
                isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                    >
                      {"Профил"}
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="text-left"
                    >
                      {"Изход"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => {
                        rememberAuthReturn();
                        setMobileOpen(false);
                      }}
                    >
                      {"Вход"}
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => {
                        rememberAuthReturn();
                        setMobileOpen(false);
                      }}
                    >
                      {"Регистрация"}
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="bg-[#143d47] text-white">
        <div className="mx-auto max-w-[1540px] px-7 py-14 lg:px-10">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="text-3xl font-semibold tracking-[-0.05em]">
                Sondi<span className="text-[#6dc4d7]">.bg</span>
              </div>

              <p className="mt-5 text-sm leading-7 text-white/55">
                Подземни води, геология, мониторинг и сондажи в България.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold">ПЛАТФОРМА</div>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/map">Интерактивна карта</Link>
                <Link href="/analysis">Анализ на място</Link>
                <Link href="/monitoring">Мониторинг</Link>
                <Link href="/pro">Sondi EXPERT</Link>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">ИНФОРМАЦИЯ</div>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/groundwater">Подземни води</Link>
                <Link href="/drilling">Сондажи</Link>
                <Link href="/knowledge">Знания</Link>
                <Link href="/sources">Източници на данни</Link>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">SONDI.BG</div>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/about">За платформата</Link>
                <Link href="/contact">Контакти</Link>
                <Link href="/sources">Произход на данните</Link>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">ПРАВНА ИНФОРМАЦИЯ</div>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <Link href="/privacy">Политика за поверителност</Link>
                <Link href="/terms">Условия за ползване</Link>
                <Link href="/cookies">Политика за бисквитки</Link>
                <Link href="/disclaimer">Отказ от отговорност</Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:justify-between">
            <span>© 2026 Sondi.bg. Всички права запазени.</span>
            <span>Подземни води · Геология · Сондажи</span>
          </div>
        </div>
      </footer>
    </div>
  );
}