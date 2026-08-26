import Link from "next/link";

export const metadata = {
  title:
    "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0435\u0431\u0438\u0442 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 | Sondi.bg",
  description:
    "\u041a\u0430\u043a \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430, \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u0438 \u0434\u0435\u0431\u0438\u0442\u044a\u0442 \u043d\u0430 \u0435\u0434\u0438\u043d \u0441\u043e\u043d\u0434\u0430\u0436.",
};

const copy = {
  eyebrow:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u00b7 \u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0435\u0431\u0438\u0442",

  title1:
    "\u041f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a\u043e",

  title2:
    "\u043d\u0435 \u0432\u0438\u043d\u0430\u0433\u0438 \u0437\u043d\u0430\u0447\u0438 \u043f\u043e\u0432\u0435\u0447\u0435 \u0432\u043e\u0434\u0430.",

  intro:
    "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u043b\u0435\u0434\u0432\u0430 \u0440\u0435\u0430\u043b\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438, \u0430 \u043d\u0435 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0431\u0438\u0440\u0430 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u043b\u043d\u043e. \u041f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a\u0438\u044f\u0442 \u0441\u043e\u043d\u0434\u0430\u0436 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u0440\u0435\u0441\u0435\u0447\u0435 \u043f\u043e\u0432\u0435\u0447\u0435 \u0437\u043e\u043d\u0438, \u043d\u043e \u043d\u0435 \u0433\u0430\u0440\u0430\u043d\u0442\u0438\u0440\u0430 \u043f\u043e-\u0432\u0438\u0441\u043e\u043a \u0434\u0435\u0431\u0438\u0442.",

  map:
    "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u2192",

  back:
    "\u2190 \u041a\u044a\u043c \u0418\u0437\u0431\u043e\u0440 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e",

  main:
    "\u041a\u0430\u043a\u0432\u043e \u0432\u0441\u044a\u0449\u043d\u043e\u0441\u0442 \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430?",

  mainText:
    "\u0412\u0430\u0436\u043d\u043e \u0435 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u043b\u0438\u0447\u0430\u0432\u0430\u0442 \u043d\u044f\u043a\u043e\u043b\u043a\u043e \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u0438 \u043d\u0435\u0449\u0430: \u043f\u044a\u0440\u0432\u0430 \u0432\u043e\u0434\u0430, \u043e\u0441\u043d\u043e\u0432\u0435\u043d \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u0435\u043d \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b \u0438 \u043a\u0440\u0430\u0439\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430.",

  rate:
    "\u041e\u0442 \u043a\u0430\u043a\u0432\u043e \u0437\u0430\u0432\u0438\u0441\u0438 \u0434\u0435\u0431\u0438\u0442\u044a\u0442?",

  rateText:
    "\u0414\u0435\u0431\u0438\u0442\u044a\u0442 \u043d\u0435 \u0437\u0430\u0432\u0438\u0441\u0438 \u0441\u0430\u043c\u043e \u043e\u0442 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430. \u0412\u0430\u0436\u043d\u0438 \u0441\u0430 \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u043f\u0443\u0441\u043a\u043b\u0438\u0432\u043e\u0441\u0442\u0442\u0430, \u0434\u0435\u0431\u0435\u043b\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0437\u043e\u043d\u0430, \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u0430\u0442\u0430 \u0441\u0432\u044a\u0440\u0437\u0430\u043d\u043e\u0441\u0442, \u043f\u043e\u0434\u0445\u0440\u0430\u043d\u0432\u0430\u043d\u0435\u0442\u043e \u0438 \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",

  warning:
    "\u0412\u0430\u0436\u043d\u043e",

  warningTitle:
    "\u0414\u0435\u0431\u0438\u0442 \u043d\u0435 \u0441\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430 \u0441\u0430\u043c\u043e \u0441 \u0433\u0435\u043e\u0444\u0438\u0437\u0438\u0447\u043d\u043e \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0435.",

  warningText:
    "\u041f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u043e\u0447\u0435\u0440\u0442\u0430\u0435 \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u0438 \u0434\u0430 \u043f\u043e\u043c\u043e\u0433\u043d\u0435 \u0437\u0430 \u0438\u0437\u0431\u043e\u0440\u0430 \u043d\u0430 \u043a\u0440\u0430\u0439\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u043d\u043e \u0440\u0435\u0430\u043b\u043d\u0438\u044f\u0442 \u0434\u0435\u0431\u0438\u0442 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430 \u0441\u043b\u0435\u0434 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438 \u043e\u043f\u0438\u0442\u043d\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",

  next:
    "\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u0430 \u0442\u0435\u043c\u0430",

  waterLevels:
    "\u0412\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430",

  waterLevelsText:
    "\u0421\u043b\u0435\u0434 \u043a\u0430\u0442\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d, \u0435 \u0432\u0430\u0436\u043d\u043e \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0431\u0435\u0440\u0435 \u043a\u0430\u043a \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u043f\u0440\u0438 \u043f\u043e\u043a\u043e\u0439 \u0438 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",

  continue:
    "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0438 \u2192",

  firstWater:
    "\u041f\u044a\u0440\u0432\u0430 \u0432\u043e\u0434\u0430",

  mainZone:
    "\u041e\u0441\u043d\u043e\u0432\u0435\u043d \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u0435\u043d \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b",

  finalDepth:
    "\u041a\u0440\u0430\u0439\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",

  borehole:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437",
};

const cards = [
  {
    number: "01",
    title:
      "\u041f\u044a\u0440\u0432\u0430 \u0432\u043e\u0434\u0430",
    text:
      "\u041f\u044a\u0440\u0432\u043e\u0442\u043e \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u0435 \u0435 \u0437\u0430\u0434\u044a\u043b\u0436\u0438\u0442\u0435\u043b\u043d\u043e \u043e\u0441\u043d\u043e\u0432\u043d\u0430\u0442\u0430 \u0446\u0435\u043b. \u041f\u043b\u0438\u0442\u043a\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0430 \u0441\u0435\u0437\u043e\u043d\u043d\u0438 \u0438\u043b\u0438 \u0441 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d \u0434\u0435\u0431\u0438\u0442.",
  },
  {
    number: "02",
    title:
      "\u041e\u0441\u043d\u043e\u0432\u0435\u043d \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u0435\u043d \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b",
    text:
      "\u0422\u043e\u0432\u0430 \u0435 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u043d\u0430\u0442\u0430 \u0437\u043e\u043d\u0430, \u043a\u043e\u044f\u0442\u043e \u0435 \u043d\u0430\u0439-\u0432\u0430\u0436\u043d\u0430 \u0437\u0430 \u043f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438 \u0444\u0438\u043b\u0442\u044a\u0440\u043d\u0430\u0442\u0430 \u0447\u0430\u0441\u0442.",
  },
  {
    number: "03",
    title:
      "\u041a\u0440\u0430\u0439\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",
    text:
      "\u041a\u0440\u0430\u0439\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u043e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d\u043e \u0435 \u043f\u043e\u0434 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u044f \u0446\u0435\u043b\u0435\u0432\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b, \u0437\u0430 \u0434\u0430 \u0441\u0435 \u043f\u0440\u0435\u043c\u0438\u043d\u0435 \u043f\u0440\u0435\u0437 \u043d\u0435\u0433\u043e \u0438 \u0434\u0430 \u0441\u0435 \u043e\u0441\u0442\u0430\u0432\u0438 \u0440\u0435\u0437\u0435\u0440\u0432 \u0437\u0430 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430.",
  },
  {
    number: "04",
    title:
      "\u0420\u0435\u0430\u043b\u0435\u043d \u0434\u0435\u0431\u0438\u0442",
    text:
      "\u0414\u043e\u0431\u0440\u0438\u044f\u0442 \u0434\u0435\u0431\u0438\u0442 \u0438\u0437\u0438\u0441\u043a\u0432\u0430 \u043d\u0435 \u0441\u0430\u043c\u043e \u0432\u043e\u0434\u0430 \u0432 \u0434\u0443\u043f\u043a\u0430\u0442\u0430, \u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0434\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u043e\u0434\u0430\u0432\u0430 \u0432\u043e\u0434\u0430 \u043a\u044a\u043c \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",
  },
];

function DepthVisual() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#cfe4e8] bg-[#e9f7f9] shadow-[0_30px_70px_rgba(30,80,90,.14)]">
      <svg
        viewBox="0 0 820 610"
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id="layer1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c7ad80" />
            <stop offset="100%" stopColor="#b69567" />
          </linearGradient>

          <linearGradient id="layer2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#aa8c67" />
            <stop offset="100%" stopColor="#917353" />
          </linearGradient>

          <linearGradient id="deepRock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a716a" />
            <stop offset="100%" stopColor="#56524f" />
          </linearGradient>
        </defs>

        <rect width="820" height="610" fill="#e9f7f9" />

        <path
          d="M0 120 C170 100 300 140 420 110 C560 80 670 120 820 95 L820 265 L0 265 Z"
          fill="url(#layer1)"
        />

        <path
          d="M0 265 C160 240 310 290 455 250 C600 215 690 255 820 235 L820 420 L0 420 Z"
          fill="url(#layer2)"
        />

        <path
          d="M0 420 C150 390 300 445 460 405 C620 365 700 420 820 390 L820 610 L0 610 Z"
          fill="url(#deepRock)"
        />

        <path
          d="M70 215 C230 180 400 225 565 190 C650 170 720 175 790 165"
          stroke="#58b6c9"
          strokeWidth="28"
          strokeLinecap="round"
          opacity=".38"
          className="animate-[pulse_4s_ease-in-out_infinite]"
        />

        <path
          d="M60 360 C220 325 390 375 555 335 C650 310 725 315 790 305"
          stroke="#2e94aa"
          strokeWidth="45"
          strokeLinecap="round"
          opacity=".72"
          className="animate-[pulse_3s_ease-in-out_infinite]"
        />

        <line
          x1="410"
          y1="65"
          x2="410"
          y2="545"
          stroke="#153d47"
          strokeWidth="10"
        />

        <rect
          x="397"
          y="285"
          width="26"
          height="150"
          rx="8"
          fill="#71c2d0"
          opacity=".9"
        />

        <circle
          cx="410"
          cy="65"
          r="18"
          fill="#153d47"
        />

        <circle
          cx="410"
          cy="65"
          r="34"
          fill="none"
          stroke="#4ca0b1"
          strokeWidth="3"
          opacity=".35"
          className="animate-ping"
        />

        <line
          x1="485"
          y1="205"
          x2="690"
          y2="205"
          stroke="#4c7881"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <line
          x1="485"
          y1="335"
          x2="690"
          y2="335"
          stroke="#4c7881"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <line
          x1="485"
          y1="515"
          x2="690"
          y2="515"
          stroke="#4c7881"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <text
          x="700"
          y="212"
          fill="#2d6976"
          fontSize="19"
          fontWeight="700"
        >
          {copy.firstWater}
        </text>

        <text
          x="700"
          y="342"
          fill="#174e59"
          fontSize="19"
          fontWeight="700"
        >
          {copy.mainZone}
        </text>

        <text
          x="700"
          y="522"
          fill="#51666a"
          fontSize="19"
          fontWeight="700"
        >
          {copy.finalDepth}
        </text>

        <text
          x="58"
          y="80"
          fill="#367581"
          fontSize="16"
          fontWeight="700"
          letterSpacing="3"
        >
          {copy.borehole}
        </text>
      </svg>

      <div className="absolute bottom-5 left-5 rounded-2xl border border-white/60 bg-white/85 px-5 py-4 backdrop-blur-md">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e8c98]">
          0 ? 100+ m
        </div>
        <div className="mt-1 text-sm text-[#557078]">
          {copy.main}
        </div>
      </div>
    </div>
  );
}

export default function DrillingDepthPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfc] text-[#153943]">
      <section className="overflow-hidden border-b border-[#d8e9ed] bg-[#e8f6f8]">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-7 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10 lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#438594]">
              {copy.eyebrow}
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              {copy.title1}
              <br />
              {copy.title2}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f7b82]">
              {copy.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {copy.map}
              </Link>

              <Link
                href="/drilling/location"
                className="inline-flex border border-[#a8ccd4] px-7 py-3.5 text-sm font-semibold text-[#2d6976] transition hover:bg-white"
              >
                {copy.back}
              </Link>
            </div>
          </div>

          <div className="animate-[floatDepth_7s_ease-in-out_infinite]">
            <DepthVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="sticky top-28">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5994a0]">
                {copy.main}
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
                {copy.main}
              </h2>

              <p className="mt-5 leading-8 text-[#647d84]">
                {copy.mainText}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {cards.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-[#dce9ec] bg-white p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(25,75,85,.08)]"
              >
                <div className="text-xs font-semibold tracking-[0.2em] text-[#68a5b2]">
                  {item.number}
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-[#687f85]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102f37]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-7 py-20 text-white lg:grid-cols-2 lg:px-10">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8bc8d3]">
              {copy.rate}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
              {copy.rate}
            </h2>
          </div>

          <p className="text-[16px] leading-8 text-white/65">
            {copy.rateText}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="rounded-[26px] border border-[#e4d8ba] bg-[#fff9ea] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a37]">
            {copy.warning}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
            {copy.warningTitle}
          </h2>

          <p className="mt-5 max-w-4xl leading-8 text-[#6d6758]">
            {copy.warningText}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 pb-20 lg:px-10">
        <div className="rounded-[26px] border border-[#d5e8eb] bg-[#eff9fa] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#548f9c]">
            {copy.next}
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                {copy.waterLevels}
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#647d84]">
                {copy.waterLevelsText}
              </p>
            </div>

            <Link
              href="/drilling/water-levels"
              className="inline-flex shrink-0 bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {copy.continue}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatDepth {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
      `}</style>
    </main>
  );
}
