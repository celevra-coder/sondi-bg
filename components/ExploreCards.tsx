"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const cards = [
  {
    number: "01",
    title: "Провери място",
    text: "Геология, водни тела и мониторинг за конкретни координати.",
    href: "/analysis",
    type: "analysis",
  },
  {
    number: "02",
    title: "Интерактивна карта",
    text: "Официални пространствени данни върху реалната карта.",
    href: "/map",
    type: "map",
  },
  {
    number: "03",
    title: "Подземни води",
    text: "Водни тела, водоносни хоризонти и подземна структура.",
    href: "/groundwater",
    type: "groundwater",
  },
  {
    number: "04",
    title: "Сондажи",
    text: "Дълбочини, водни нива, дебит и подготовка за сондиране.",
    href: "/drilling",
    type: "drilling",
  },
  {
    number: "05",
    title: "Мониторинг",
    text: "Наблюдателни точки, нива, дебити и исторически измервания.",
    href: "/monitoring",
    type: "monitoring",
  },
  {
    number: "06",
    title: "Sondi PRO",
    text: "Професионални анализи, слоеве и подробни отчети.",
    href: "/pro",
    type: "pro",
  },
];

function Preview({ type }: { type: string }) {
  if (type === "map") {
    return (
      <div className="relative h-32 overflow-hidden bg-[#143d47]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[10%] top-[22%] h-px w-[70%] rotate-[-9deg] bg-[#76c9d8]" />
          <div className="absolute left-[17%] top-[52%] h-px w-[65%] rotate-[7deg] bg-[#76c9d8]" />
          <div className="absolute left-[30%] top-[12%] h-[75%] w-px rotate-[16deg] bg-[#76c9d8]" />
        </div>
        <span className="absolute left-[24%] top-[38%] h-3 w-3 rounded-full bg-[#75d7e5]" />
        <span className="absolute right-[29%] top-[29%] h-3 w-3 rounded-full bg-[#75d7e5]" />
        <span className="absolute bottom-[20%] left-[55%] h-3 w-3 rounded-full bg-[#75d7e5]" />
      </div>
    );
  }

  if (type === "analysis") {
    return (
      <div className="h-32 bg-[#edf8fa] p-5">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#77939b]">
          Анализ на точка
        </div>
        <div className="mt-2 text-lg font-semibold text-[#163b44]">
          42.1354, 24.7453
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Геология", "Водни тела", "Мониторинг"].map((x) => (
            <span key={x} className="rounded-full bg-white px-2.5 py-1 text-[10px] text-[#56757e]">
              {x}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === "groundwater") {
    return (
      <div className="relative h-32 overflow-hidden bg-[#342d28]">
        <div className="absolute left-0 right-0 top-[18%] h-5 bg-[#725640]" />
        <div className="absolute left-0 right-0 top-[42%] h-6 bg-[#4e4b46]" />
        <div className="absolute left-0 right-0 top-[68%] h-7 bg-[#263f46]" />
        <div className="absolute bottom-[12%] left-[15%] right-[12%] h-[3px] bg-[#66b6c8]/70" />
      </div>
    );
  }

  if (type === "drilling") {
    return (
      <div className="relative h-32 bg-[#eef7f9]">
        <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 bg-[#294f59]" />
        <div className="absolute left-1/2 top-[18%] h-3 w-20 -translate-x-1/2 bg-[#b7dce4]" />
        <div className="absolute left-1/2 top-[48%] h-3 w-28 -translate-x-1/2 bg-[#7fbecd]" />
        <div className="absolute left-1/2 top-[74%] h-3 w-16 -translate-x-1/2 bg-[#55a7b9]" />
      </div>
    );
  }

  if (type === "monitoring") {
    return (
      <div className="relative h-32 bg-[#f5fbfc]">
        <svg viewBox="0 0 300 120" className="h-full w-full">
          <polyline
            points="10,90 55,75 95,82 135,50 180,58 225,31 290,42"
            fill="none"
            stroke="#2f8da3"
            strokeWidth="4"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-32 bg-[#153d47] p-5 text-white">
      <div className="text-[9px] uppercase tracking-[0.2em] text-white/50">
        Sondi PRO
      </div>
      <div className="mt-3 text-sm">Координати → Геология → Води → Отчет</div>
      <div className="mt-5 h-2 w-[80%] rounded-full bg-[#65bdcf]" />
      <div className="mt-2 h-2 w-[60%] rounded-full bg-white/25" />
    </div>
  );
}

export default function ExploreCards() {
  const [start, setStart] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStart((value) => (value + 1) % cards.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const visible = [
    cards[start % cards.length],
    cards[(start + 1) % cards.length],
    cards[(start + 2) % cards.length],
  ];

  const next = () => setStart((value) => (value + 1) % cards.length);
  const prev = () =>
    setStart((value) => (value - 1 + cards.length) % cards.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="grid gap-5 md:grid-cols-3">
          {visible.map((card, index) => (
            <Link
              key={`${start}-${card.number}`}
              href={card.href}
              className={`sondi-carousel-card group overflow-hidden bg-white shadow-[0_18px_55px_rgba(24,70,82,.15)] ${
                index === 1 ? "md:-translate-y-8" : ""
              }`}
            >
              <Preview type={card.type} />

              <div className="p-7">
                <div className="text-[10px] tracking-[0.2em] text-[#8fa6ac]">
                  {card.number}
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#153943]">
                  {card.title}
                </h3>

                <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#657e85]">
                  {card.text}
                </p>

                <div className="mt-6 text-sm text-[#1d788f]">
                  Научи повече
                  <span className="ml-2 inline-block transition group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-[-22px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#153943] text-white shadow-lg lg:flex"
      >
        ←
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute right-[-22px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#153943] text-white shadow-lg lg:flex"
      >
        →
      </button>
    </div>
  );
}