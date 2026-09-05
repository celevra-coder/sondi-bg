"use client";

import { useEffect, useState } from "react";

const cards = [
  {
    number: "01",
    title: "Геология",
    text: "Геоложки единици, литология и строеж на терена.",
    type: "geology",
  },
  {
    number: "02",
    title: "Подземни води",
    text: "Подземни водни тела, водоносни хоризонти и хидрогеоложки контекст.",
    type: "groundwater",
  },
  {
    number: "03",
    title: "Количествен ресурс",
    text: "Ресурс, водовземане и натиск върху подземните води.",
    type: "resource",
  },
  {
    number: "04",
    title: "Мониторинг",
    text: "Наблюдателни точки, състояние и налични измервания.",
    type: "monitoring",
  },
  {
    number: "05",
    title: "Активни разломи",
    text: "Разломни структури и структурен контекст около избраното място.",
    type: "faults",
  },
  {
    number: "06",
    title: "Сондажен контекст",
    text: "Данни и фактори, които подпомагат предварителната оценка за сондиране.",
    type: "drilling",
  },
];

function Preview({ type }: { type: string }) {
  if (type === "geology") {
    return (
      <div className="relative h-32 overflow-hidden bg-[#dfecef]">
        <div className="absolute inset-x-0 top-[10%] h-7 rotate-[-3deg] bg-[#c89e73]/70" />
        <div className="absolute inset-x-0 top-[34%] h-8 rotate-[2deg] bg-[#8d8a72]/65" />
        <div className="absolute inset-x-0 top-[61%] h-9 rotate-[-2deg] bg-[#687a75]/70" />
        <div className="absolute left-[64%] top-0 h-full w-[2px] rotate-[13deg] bg-[#3b6670]/60" />
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

  if (type === "resource") {
    return (
      <div className="h-32 bg-[#edf8fa] p-5">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#77939b]">
          Количествен баланс
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-[#67838b]">
              <span>Ресурс</span>
              <span>82%</span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className="h-2 w-[82%] rounded-full bg-[#5aaec0]" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-[#67838b]">
              <span>Натиск</span>
              <span>46%</span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className="h-2 w-[46%] rounded-full bg-[#86c9d5]" />
            </div>
          </div>
        </div>
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

  if (type === "faults") {
    return (
      <div className="relative h-32 overflow-hidden bg-[#173f49]">
        <div className="absolute left-[8%] top-[30%] h-[2px] w-[82%] rotate-[-11deg] bg-[#76c9d8]" />
        <div className="absolute left-[15%] top-[58%] h-[2px] w-[70%] rotate-[7deg] bg-[#9bd9e3]/80" />
        <div className="absolute left-[48%] top-[5%] h-[90%] w-[2px] rotate-[18deg] bg-white/35" />
        <span className="absolute left-[44%] top-[45%] h-3 w-3 rounded-full bg-[#7ad3df]" />
      </div>
    );
  }

  return (
    <div className="relative h-32 bg-[#eef7f9]">
      <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 bg-[#294f59]" />
      <div className="absolute left-1/2 top-[18%] h-3 w-20 -translate-x-1/2 bg-[#b7dce4]" />
      <div className="absolute left-1/2 top-[48%] h-3 w-28 -translate-x-1/2 bg-[#7fbecd]" />
      <div className="absolute left-1/2 top-[74%] h-3 w-16 -translate-x-1/2 bg-[#55a7b9]" />
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
            <article
              key={`${start}-${card.number}`}
              className={`sondi-carousel-card group relative overflow-hidden rounded-[28px] border border-[#d2e6eb] bg-white/95 shadow-[0_22px_65px_rgba(24,70,82,.13)] backdrop-blur transition duration-500 ease-out hover:scale-[1.015] hover:border-[#a8d3dc] hover:shadow-[0_30px_85px_rgba(24,70,82,.20)] ${
                index === 1 ? "md:-translate-y-8" : ""
              }`}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 z-20 h-36 w-36 rounded-full bg-[#8ed3df]/15 blur-2xl transition duration-700 group-hover:scale-150" />
              <div className="pointer-events-none absolute left-7 right-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#65b6c6]/70 to-transparent" />

              <div className="relative overflow-hidden">
                <Preview type={card.type} />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 shadow-[0_0_12px_rgba(255,255,255,.85)] transition-all duration-700 ease-out group-hover:translate-y-[127px] group-hover:opacity-90" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[#153943]/5" />
              </div>

              <div className="relative p-7">
                <div className="inline-flex rounded-full border border-[#d5e8ec] bg-[#f4fafb] px-3 py-1 text-[9px] font-semibold tracking-[0.22em] text-[#72949c] shadow-sm">
                  {card.number}
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#153943]">
                  {card.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#657e85]">
                  {card.text}
                </p>

                <div className="pointer-events-none absolute bottom-5 right-6 h-7 w-7 rounded-full border border-[#b8dbe2]/60 opacity-40 transition duration-500 group-hover:scale-125 group-hover:opacity-80">
                  <div className="absolute inset-[7px] rounded-full bg-[#6bb7c7]/70" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Предишни карти"
        className="absolute left-[-22px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#153943] text-white shadow-lg lg:flex"
      >
        ←
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Следващи карти"
        className="absolute right-[-22px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#153943] text-white shadow-lg lg:flex"
      >
        →
      </button>
    </div>
  );
}