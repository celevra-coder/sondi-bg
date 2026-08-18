"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menus = [
  {
    label: "ПОДЗЕМНИ ВОДИ",
    items: [
      ["Какво са подземните води", "/groundwater"],
      ["Подземни водни тела", "/groundwater/bodies"],
      ["Водоносни хоризонти", "/groundwater/aquifers"],
      ["Мониторинг", "/monitoring"],
      ["Качество на водата", "/water-quality"],
      ["Минерални води", "/mineral-water"],
    ],
  },
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
    label: "ПРОФЕСИОНАЛИСТИ",
    items: [
      ["Анализ по координати", "/analysis"],
      ["PRO карта", "/map"],
      ["Профили на водни тела", "/groundwater/bodies"],
      ["Мониторинг и данни", "/monitoring"],
      ["Професионални отчети", "/pro"],
      ["Официални източници", "/sources"],
    ],
  },
];

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);

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
          onClick={() => setHeaderOpen((value) => !value)}
          className="fixed right-4 top-3 z-[120] rounded-full border border-[#b9dbe3] bg-[#e8f6f9]/95 px-4 py-2 text-xs font-medium text-[#24505b] shadow-md backdrop-blur-xl transition hover:bg-white"
        >
          Меню
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

                <div className="pointer-events-none absolute left-0 top-[72px] w-[315px] translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden border border-[#cde5eb] bg-[#f8fdfe] shadow-[0_22px_60px_rgba(29,77,90,.16)]">
                    {menu.items.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center justify-between border-b border-[#e0eef2] px-5 py-4 text-sm text-[#355863] transition last:border-b-0 hover:bg-[#dff2f7] hover:pl-7 hover:text-[#137891]"
                      >
                        <span>{label}</span>
                        <span className="text-[#7caab5]">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
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

            <Link
              href="/login"
              className="px-3 py-3 text-[13px] font-medium text-[#294e59]"
            >
              ВХОД
            </Link>

            <Link
              href="/register"
              className="ml-1 rounded-full bg-[#177f98] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#126a80]"
            >
              РЕГИСТРАЦИЯ
            </Link>
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
              <Link href="/groundwater">Подземни води</Link>
              <Link href="/drilling">Сондажи</Link>
              <Link href="/pro">Професионалисти</Link>
              <Link href="/knowledge">Знания</Link>
              <Link href="/about">За нас</Link>
              <Link href="/login">Вход</Link>
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
                <Link href="/pro">Sondi PRO</Link>
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