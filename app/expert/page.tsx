import Link from "next/link";

export const metadata = {
  title:
    "SONDI EXPERT | \u0420\u0430\u0437\u0448\u0438\u0440\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438",
  description:
    "SONDI EXPERT \u0441\u044a\u0431\u0438\u0440\u0430 \u043d\u0430 \u0435\u0434\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0440\u0430\u0437\u0448\u0438\u0440\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437, \u043a\u0430\u0440\u0442\u043e\u0432\u0438 \u0434\u0430\u043d\u043d\u0438, \u043f\u0440\u043e\u0444\u0438\u043b\u0438 \u043d\u0430 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u043e\u0442\u0447\u0435\u0442\u0438 \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438.",
};

const copy = {
  eyebrow:
    "SONDI EXPERT",

  title1:
    "\u041f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a \u043f\u043e\u0433\u043b\u0435\u0434",

  title2:
    "\u0432\u044a\u0440\u0445\u0443 \u0435\u0434\u043d\u043e \u043c\u044f\u0441\u0442\u043e.",

  intro:
    "SONDI EXPERT \u0435 \u0440\u0430\u0437\u0448\u0438\u0440\u0435\u043d\u0438\u044f\u0442 \u0441\u043b\u043e\u0439 \u043d\u0430 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0442\u0430 \u0437\u0430 \u0445\u043e\u0440\u0430, \u043a\u043e\u0438\u0442\u043e \u0438\u0441\u043a\u0430\u0442 \u043f\u043e\u0432\u0435\u0447\u0435 \u043e\u0442 \u043e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d \u043f\u043e\u0433\u043b\u0435\u0434 \u0432\u044a\u0440\u0445\u0443 \u043a\u0430\u0440\u0442\u0430. \u0422\u0443\u043a \u0441\u0435 \u0441\u044a\u0431\u0438\u0440\u0430\u0442 \u043f\u043e-\u0434\u0435\u0442\u0430\u0439\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438, \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442, \u043f\u0440\u043e\u0444\u0438\u043b\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438 \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u043e\u0442\u0447\u0435\u0442\u0438.",

  mapButton:
    "\u041e\u0442\u0432\u043e\u0440\u0438 EXPERT \u043a\u0430\u0440\u0442\u0430 \u2192",

  analysisButton:
    "\u0410\u043d\u0430\u043b\u0438\u0437 \u043f\u043e \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438",

  sectionLabel:
    "\u041a\u0430\u043a\u0432\u043e \u043f\u0440\u0435\u0434\u043b\u0430\u0433\u0430 SONDI EXPERT",

  sectionTitle:
    "\u0428\u0435\u0441\u0442 \u043d\u0430\u0447\u0438\u043d\u0430 \u0434\u0430 \u0432\u0438\u0434\u0438\u0442\u0435 \u043f\u043e\u0432\u0435\u0447\u0435",

  sectionText:
    "\u0412\u0441\u0435\u043a\u0438 \u043c\u043e\u0434\u0443\u043b \u0434\u043e\u0431\u0430\u0432\u044f \u0440\u0430\u0437\u043b\u0438\u0447\u0435\u043d \u0441\u043b\u043e\u0439 \u043a\u044a\u043c \u043e\u0446\u0435\u043d\u043a\u0430\u0442\u0430 \u043d\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e \u043c\u044f\u0441\u0442\u043e.",

  open:
    "\u041e\u0442\u0432\u043e\u0440\u0438",

  closingLabel:
    "\u0415\u0434\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u00b7 \u043f\u043e\u0432\u0435\u0447\u0435 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442",

  closingTitle:
    "\u041a\u0430\u0440\u0442\u0430\u0442\u0430 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043a\u044a\u0434\u0435 \u0441\u0442\u0435. EXPERT \u043e\u0431\u044f\u0441\u043d\u044f\u0432\u0430 \u043a\u0430\u043a\u0432\u043e \u0438\u043c\u0430 \u043e\u043a\u043e\u043b\u043e \u0432\u0430\u0441.",

  closingText:
    "\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0438\u043d\u0430 \u0438\u0434\u0432\u0430 \u043e\u0442 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044f\u0442\u0430 \u043c\u0435\u0436\u0434\u0443 \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u0441\u043e\u043d\u0434\u0430\u0436\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438 \u0438 \u043b\u043e\u043a\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442.",
};

const modules = [
  {
    number: "01",
    type: "analysis",
    title:
      "\u0410\u043d\u0430\u043b\u0438\u0437 \u043f\u043e \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438",
    description:
      "\u0418\u0437\u0431\u0438\u0440\u0430\u0442\u0435 \u0442\u043e\u0447\u043a\u0430 \u0438 \u043f\u043e\u043b\u0443\u0447\u0430\u0432\u0430\u0442\u0435 \u0441\u044a\u0431\u0440\u0430\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u0437\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u0442\u044f\u043b\u043e, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u0442\u0430, \u0431\u043b\u0438\u0437\u043a\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438 \u0440\u0438\u0441\u043a\u043e\u0432 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442.",
    href: "/analysis",
  },
  {
    number: "02",
    type: "map",
    title:
      "EXPERT \u043a\u0430\u0440\u0442\u0430",
    description:
      "\u041c\u043d\u043e\u0433\u043e\u0441\u043b\u043e\u0439\u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u0441 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0441\u043e\u043d\u0434\u0430\u0436\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u043d\u0430\u0442\u0438\u0441\u043a\u0438 \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0434\u0430\u043d\u043d\u0438.",
    href: "/map",
  },
  {
    number: "03",
    type: "profile",
    title:
      "\u041f\u0440\u043e\u0444\u0438\u043b\u0438 \u043d\u0430 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430",
    description:
      "\u041f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a \u043f\u043e\u0433\u043b\u0435\u0434 \u043a\u044a\u043c \u0442\u0438\u043f\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430, \u0440\u0435\u0441\u0443\u0440\u0441\u0430, \u043d\u0430\u0442\u043e\u0432\u0430\u0440\u0432\u0430\u043d\u0435\u0442\u043e, \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435\u0442\u043e \u0438 \u0432\u0430\u0436\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438.",
    href: "/groundwater/bodies",
  },
  {
    number: "04",
    type: "monitor",
    title:
      "\u041c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438 \u0434\u0430\u043d\u043d\u0438",
    description:
      "\u041f\u0440\u043e\u0441\u043b\u0435\u0434\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u043d\u0430\u0431\u043b\u044e\u0434\u0430\u0432\u0430\u043d\u0438 \u0442\u043e\u0447\u043a\u0438, \u0432\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430, \u0445\u0438\u043c\u0438\u0447\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0438 \u0442\u0435\u043d\u0434\u0435\u043d\u0446\u0438\u0438 \u0432 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438.",
    href: "/monitoring",
  },
  {
    number: "05",
    type: "report",
    title:
      "\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u043e\u0442\u0447\u0435\u0442\u0438",
    description:
      "\u041e\u0431\u043e\u0431\u0449\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u0432\u0430\u0436\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0434\u0430\u043d\u043d\u0438 \u0432 \u0435\u0434\u0438\u043d \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u0430\u043d \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437.",
    href: "/pro",
  },
  {
    number: "06",
    type: "sources",
    title:
      "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438",
    description:
      "\u041f\u0440\u043e\u0438\u0437\u0445\u043e\u0434 \u043d\u0430 \u0434\u0430\u043d\u043d\u0438\u0442\u0435, \u0431\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0438 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438, \u043f\u043b\u0430\u043d\u043e\u0432\u0435 \u0437\u0430 \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0438 \u0434\u0440\u0443\u0433\u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438.",
    href: "/sources",
  },
];

function ExpertVisual({ type }: { type: string }) {
  if (type === "analysis") {
    return (
      <svg viewBox="0 0 520 260" className="h-full w-full">
        <rect width="520" height="260" rx="24" fill="#e7f6f8" />
        <path d="M20 205 C120 145 220 190 310 120 C385 62 438 88 500 55" fill="none" stroke="#74aab5" strokeWidth="3" />
        <circle cx="310" cy="120" r="12" fill="#1d8fa7" />
        <circle cx="310" cy="120" r="26" fill="none" stroke="#1d8fa7" strokeWidth="3" opacity=".35" className="animate-ping" />
        <rect x="58" y="50" width="130" height="18" rx="9" fill="#aad4dc" />
        <rect x="58" y="82" width="190" height="10" rx="5" fill="#c4e3e8" />
        <rect x="58" y="104" width="150" height="10" rx="5" fill="#c4e3e8" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg viewBox="0 0 520 260" className="h-full w-full">
        <rect width="520" height="260" rx="24" fill="#eaf7f9" />
        <path d="M60 55 L185 35 L240 88 L350 65 L465 105 L430 215 L300 205 L205 230 L85 188 Z" fill="#b8dbe2" />
        <path d="M70 85 L195 62 L260 110 L348 91 L430 119" fill="none" stroke="#5fa5b3" strokeWidth="18" opacity=".55" />
        <path d="M100 190 L190 135 L275 165 L390 120" fill="none" stroke="#d6a352" strokeWidth="7" strokeDasharray="13 10" className="animate-[dash_2s_linear_infinite]" />
        <circle cx="275" cy="165" r="10" fill="#174d59" />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 520 260" className="h-full w-full">
        <rect width="520" height="260" rx="24" fill="#edf7f8" />
        <path d="M0 80 C130 55 230 105 340 70 C410 48 455 62 520 52 L520 260 L0 260 Z" fill="#c8ab78" />
        <path d="M0 145 C120 115 230 165 345 130 C410 110 460 125 520 108 L520 260 L0 260 Z" fill="#9d8162" />
        <path d="M35 168 C150 130 265 175 390 135 C435 120 468 121 495 116" fill="none" stroke="#49a7bb" strokeWidth="30" opacity=".65" className="animate-pulse" />
      </svg>
    );
  }

  if (type === "monitor") {
    return (
      <svg viewBox="0 0 520 260" className="h-full w-full">
        <rect width="520" height="260" rx="24" fill="#ecf7f9" />
        <line x1="60" y1="210" x2="465" y2="210" stroke="#aacbd2" strokeWidth="2" />
        <line x1="60" y1="50" x2="60" y2="210" stroke="#aacbd2" strokeWidth="2" />
        <path d="M70 175 C120 140 155 160 195 120 C245 70 280 130 325 108 C370 85 405 112 455 65" fill="none" stroke="#238fa7" strokeWidth="5" />
        {[70,195,325,455].map((x, i) => (
          <circle key={x} cx={x} cy={[175,120,108,65][i]} r="7" fill="#d69b45" className="animate-pulse" />
        ))}
      </svg>
    );
  }

  if (type === "report") {
    return (
      <svg viewBox="0 0 520 260" className="h-full w-full">
        <rect width="520" height="260" rx="24" fill="#edf7f8" />
        <rect x="130" y="28" width="260" height="205" rx="14" fill="white" stroke="#cfe2e6" strokeWidth="2" />
        <rect x="160" y="58" width="110" height="14" rx="7" fill="#4d92a1" />
        <rect x="160" y="91" width="195" height="8" rx="4" fill="#d0e3e7" />
        <rect x="160" y="111" width="160" height="8" rx="4" fill="#d0e3e7" />
        <rect x="160" y="145" width="70" height="48" rx="8" fill="#dff0f3" />
        <rect x="244" y="145" width="110" height="48" rx="8" fill="#e9f5f7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 520 260" className="h-full w-full">
      <rect width="520" height="260" rx="24" fill="#edf7f8" />
      <rect x="72" y="58" width="105" height="144" rx="12" fill="#c3dfe5" />
      <rect x="207" y="38" width="105" height="164" rx="12" fill="#a9d1d9" />
      <rect x="342" y="78" width="105" height="124" rx="12" fill="#d5e8eb" />
      <circle cx="124" cy="91" r="14" fill="#438c9a" className="animate-pulse" />
      <circle cx="259" cy="71" r="14" fill="#438c9a" className="animate-pulse [animation-delay:500ms]" />
      <circle cx="394" cy="111" r="14" fill="#438c9a" className="animate-pulse [animation-delay:900ms]" />
    </svg>
  );
}

export default function ExpertPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfc] text-[#153943]">
      <section className="border-b border-[#d7e9ed] bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 py-24 lg:px-10">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#438594]">
              {copy.eyebrow}
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              {copy.title1}
              <br />
              {copy.title2}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#5f7b82]">
              {copy.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {copy.mapButton}
              </Link>

              <Link
                href="/analysis"
                className="inline-flex border border-[#9fcbd4] px-7 py-3.5 text-sm font-semibold text-[#2b6874] transition hover:bg-white"
              >
                {copy.analysisButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-20 lg:px-10">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b949f]">
            {copy.sectionLabel}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            {copy.sectionTitle}
          </h2>

          <p className="mt-5 leading-8 text-[#647d84]">
            {copy.sectionText}
          </p>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.number}
              href={module.href}
              className="group overflow-hidden rounded-[26px] border border-[#d6e7ea] bg-white transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(25,75,85,.10)]"
            >
              <div className="h-[235px] overflow-hidden border-b border-[#e0ecee]">
                <div className="h-full w-full transition duration-700 group-hover:scale-[1.025]">
                  <ExpertVisual type={module.type} />
                </div>
              </div>

              <div className="p-8">
                <div className="text-xs font-semibold tracking-[0.2em] text-[#67a4b1]">
                  {module.number}
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                  {module.title}
                </h3>

                <p className="mt-4 leading-7 text-[#687f85]">
                  {module.description}
                </p>

                <div className="mt-7 text-sm font-semibold text-[#28798b]">
                  {copy.open}
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    ?
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#12333b]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-7 py-20 text-white lg:grid-cols-[.9fr_1.1fr] lg:px-10">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#88c5d1]">
              {copy.closingLabel}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {copy.closingTitle}
            </h2>
          </div>

          <div>
            <p className="leading-8 text-white/65">
              {copy.closingText}
            </p>

            <Link
              href="/map"
              className="mt-7 inline-flex bg-white px-7 py-3.5 text-sm font-semibold text-[#153d47]"
            >
              {copy.mapButton}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -46; }
        }
      `}</style>
    </main>
  );
}
