import Link from "next/link";

export const metadata = {
  title:
    "\u041f\u043e\u043c\u043f\u0438 \u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 | Sondi.bg",
  description:
    "\u041a\u0430\u043a \u0441\u0435 \u0438\u0437\u0431\u0438\u0440\u0430\u0442 \u043f\u043e\u0442\u043e\u043f\u044f\u0435\u043c\u0430 \u043f\u043e\u043c\u043f\u0430, \u043d\u0430\u043f\u043e\u0440, \u0434\u0435\u0431\u0438\u0442, \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440 \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u043e\u0442\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435.",
};

const copy = {
  eyebrow:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u00b7 \u041f\u043e\u043c\u043f\u0438 \u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435",

  title1:
    "\u0414\u043e\u0431\u0440\u0438\u044f\u0442 \u0441\u043e\u043d\u0434\u0430\u0436",

  title2:
    "\u0438\u043c\u0430 \u043d\u0443\u0436\u0434\u0430 \u043e\u0442 \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u0430 \u043f\u043e\u043c\u043f\u0430.",

  intro:
    "\u041f\u043e\u043c\u043f\u0430\u0442\u0430 \u043d\u0435 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0431\u0438\u0440\u0430 \u0441\u0430\u043c\u043e \u043f\u043e \u043c\u043e\u0449\u043d\u043e\u0441\u0442. \u0412\u0430\u0436\u043d\u0438 \u0441\u0430 \u0440\u0435\u0430\u043b\u043d\u0438\u044f\u0442 \u0434\u0435\u0431\u0438\u0442 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430, \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e, \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438\u044f\u0442 \u043d\u0430\u043f\u043e\u0440 \u0438 \u043d\u0430\u0447\u0438\u043d\u044a\u0442, \u043f\u043e \u043a\u043e\u0439\u0442\u043e \u0449\u0435 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0432\u043e\u0434\u0430\u0442\u0430.",

  back:
    "\u2190 \u041a\u044a\u043c \u0412\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430",

  map:
    "\u041e\u0442\u0432\u043e\u0440\u0438 \u043a\u0430\u0440\u0442\u0430 \u2192",

  pump:
    "\u041f\u043e\u0442\u043e\u043f\u044f\u0435\u043c\u0430 \u043f\u043e\u043c\u043f\u0430",

  pipe:
    "\u041d\u0430\u043f\u043e\u0440\u043d\u0430 \u0442\u0440\u044a\u0431\u0430",

  cable:
    "\u0417\u0430\u0445\u0440\u0430\u043d\u0432\u0430\u0449 \u043a\u0430\u0431\u0435\u043b",

  filter:
    "\u0424\u0438\u043b\u0442\u044a\u0440\u043d\u0430 \u0437\u043e\u043d\u0430",

  water:
    "\u041f\u043e\u0442\u043e\u043a \u043a\u044a\u043c \u043f\u043e\u043c\u043f\u0430\u0442\u0430",

  principle:
    "\u041a\u0430\u043a\u0432\u043e \u0435 \u0432\u0430\u0436\u043d\u043e",

  principleTitle:
    "\u041f\u043e\u043c\u043f\u0430\u0442\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0441\u044a\u043e\u0431\u0440\u0430\u0437\u0435\u043d\u0430 \u0441\u044a\u0441 \u0441\u043e\u043d\u0434\u0430\u0436\u0430.",

  principleText:
    "\u041f\u0440\u0435\u043a\u0430\u043b\u0435\u043d\u043e \u043c\u043e\u0449\u043d\u0430\u0442\u0430 \u043f\u043e\u043c\u043f\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0432\u0430\u043b\u044f \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u043f\u043e-\u0431\u044a\u0440\u0437\u043e, \u043e\u0442\u043a\u043e\u043b\u043a\u043e\u0442\u043e \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u043e\u0434\u0430\u0432\u0430 \u0432\u043e\u0434\u0430. \u041f\u0440\u0430\u0432\u0438\u043b\u043d\u0438\u044f\u0442 \u0438\u0437\u0431\u043e\u0440 \u0441\u0435 \u043f\u0440\u0430\u0432\u0438 \u0441\u043f\u0440\u044f\u043c\u043e \u0440\u0435\u0430\u043b\u043d\u043e\u0442\u043e \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430.",

  warning:
    "\u0427\u0435\u0441\u0442\u0430 \u0433\u0440\u0435\u0448\u043a\u0430",

  warningTitle:
    "\u041f\u043e-\u043c\u043e\u0449\u043d\u0430 \u043f\u043e\u043c\u043f\u0430 \u043d\u0435 \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u043f\u043e-\u0434\u043e\u0431\u0440\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430.",

  warningText:
    "\u041f\u043e\u043c\u043f\u0430, \u043a\u043e\u044f\u0442\u043e \u0447\u0435\u0440\u043f\u0438 \u043f\u043e\u0432\u0435\u0447\u0435 \u043e\u0442 \u0442\u043e\u0432\u0430, \u043a\u043e\u0435\u0442\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430, \u043c\u043e\u0436\u0435 \u0434\u0430 \u0434\u043e\u0432\u0435\u0434\u0435 \u0434\u043e \u043f\u0440\u0435\u043a\u043e\u043c\u0435\u0440\u043d\u043e \u043f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435, \u0440\u0430\u0431\u043e\u0442\u0430 \u043d\u0430 \u0441\u0443\u0445\u043e \u0438 \u043f\u043e-\u0431\u044a\u0440\u0437\u043e \u0438\u0437\u043d\u043e\u0441\u0432\u0430\u043d\u0435 \u043d\u0430 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",

  finish:
    "\u0421\u043b\u0435\u0434 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e",

  finishTitle:
    "\u0414\u043e\u0431\u0440\u0438\u044f\u0442 \u0441\u043e\u043d\u0434\u0430\u0436 \u0442\u0440\u044f\u0431\u0432\u0430 \u0438 \u0434\u0430 \u0441\u0435 \u043d\u0430\u0431\u043b\u044e\u0434\u0430\u0432\u0430.",

  finishText:
    "\u041f\u0435\u0440\u0438\u043e\u0434\u0438\u0447\u043d\u0430\u0442\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u043d\u0430 \u0432\u043e\u0434\u043d\u0438\u0442\u0435 \u043d\u0438\u0432\u0430, \u0434\u0435\u0431\u0438\u0442\u0430 \u0438 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430 \u043f\u043e\u043c\u0430\u0433\u0430 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0440\u0438\u044f\u0442 \u043d\u0430\u0432\u0440\u0435\u043c\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u0438 \u0432 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438\u043b\u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",

  backToDrilling:
    "\u041a\u044a\u043c \u0441\u0435\u043a\u0446\u0438\u044f \u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u2192",
};

const cards = [
  {
    number: "01",
    title:
      "\u0414\u0435\u0431\u0438\u0442 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430",
    body:
      "\u0414\u0435\u0431\u0438\u0442\u044a\u0442 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0441\u044a\u043e\u0431\u0440\u0430\u0437\u0435\u043d \u0441 \u0434\u0435\u0431\u0438\u0442\u0430, \u043a\u043e\u0439\u0442\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u043e\u0434\u0434\u044a\u0440\u0436\u0430 \u043f\u0440\u0438 \u0440\u0435\u0430\u043b\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0430.",
  },
  {
    number: "02",
    title:
      "\u041d\u0430\u043f\u043e\u0440",
    body:
      "\u041d\u0430\u043f\u043e\u0440\u044a\u0442 \u0437\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u043c\u043e\u043d\u0442\u0430\u0436, \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e, \u0434\u0435\u043d\u0438\u0432\u0435\u043b\u0430\u0446\u0438\u044f\u0442\u0430 \u0434\u043e \u043c\u044f\u0441\u0442\u043e\u0442\u043e \u043d\u0430 \u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435 \u0438 \u0437\u0430\u0433\u0443\u0431\u0438\u0442\u0435 \u043f\u043e \u0442\u0440\u044a\u0431\u043d\u0438\u044f \u043f\u044a\u0442.",
  },
  {
    number: "03",
    title:
      "\u0414\u0438\u0430\u043c\u0435\u0442\u044a\u0440 \u0438 \u043c\u043e\u043d\u0442\u0430\u0436",
    body:
      "\u041f\u043e\u043c\u043f\u0430\u0442\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0441\u044a\u0432\u043c\u0435\u0441\u0442\u0438\u043c\u0430 \u0441 \u0432\u044a\u0442\u0440\u0435\u0448\u043d\u0438\u044f \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438 \u0434\u0430 \u0438\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0437\u0430 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u0435\u043d \u043c\u043e\u043d\u0442\u0430\u0436 \u0438 \u0441\u0435\u0440\u0432\u0438\u0437.",
  },
  {
    number: "04",
    title:
      "\u0417\u0430\u0449\u0438\u0442\u0430 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430",
    body:
      "\u0417\u0430\u0449\u0438\u0442\u0430 \u043e\u0442 \u0440\u0430\u0431\u043e\u0442\u0430 \u043d\u0430 \u0441\u0443\u0445\u043e, \u043f\u0440\u0435\u0442\u043e\u0432\u0430\u0440\u0432\u0430\u043d\u0435 \u0438 \u043d\u0435\u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u043e \u043d\u0430\u043f\u0440\u0435\u0436\u0435\u043d\u0438\u0435 \u0435 \u0432\u0430\u0436\u043d\u0430 \u0437\u0430 \u0434\u044a\u043b\u0433\u043e\u0441\u0440\u043e\u0447\u043d\u0430\u0442\u0430 \u0440\u0430\u0431\u043e\u0442\u0430 \u043d\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430\u0442\u0430.",
  },
  {
    number: "05",
    title:
      "\u041e\u043f\u0438\u0442\u043d\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435",
    body:
      "\u041f\u0440\u0435\u0434\u0438 \u043e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u043d\u0438\u044f \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0435\u043d \u0440\u0435\u0436\u0438\u043c \u0435 \u043f\u043e\u043b\u0435\u0437\u043d\u043e \u0434\u0430 \u0441\u0435 \u0437\u043d\u0430\u0435 \u043a\u0430\u043a \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0440\u0435\u0430\u0433\u0438\u0440\u0430 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",
  },
];

function EquipmentVisual() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#cfe4e8] bg-[#e7f6f8] shadow-[0_30px_70px_rgba(30,80,90,.14)]">
      <svg viewBox="0 0 820 610" className="block h-auto w-full">
        <rect width="820" height="610" fill="#e7f6f8" />

        <rect x="0" y="145" width="820" height="465" fill="#b89b72" />
        <rect x="0" y="300" width="820" height="310" fill="#8d7560" />
        <rect x="0" y="450" width="820" height="160" fill="#625d59" />

        <path
          d="M40 375 C180 345 285 385 360 370"
          stroke="#52b7ca"
          strokeWidth="38"
          strokeLinecap="round"
          opacity=".55"
          className="animate-[pulse_3.5s_ease-in-out_infinite]"
        />

        <path
          d="M780 375 C645 345 540 385 460 370"
          stroke="#52b7ca"
          strokeWidth="38"
          strokeLinecap="round"
          opacity=".55"
          className="animate-[pulse_3.5s_ease-in-out_infinite]"
        />

        <rect
          x="370"
          y="75"
          width="80"
          height="485"
          rx="24"
          fill="#153d47"
        />

        <rect
          x="382"
          y="325"
          width="56"
          height="170"
          rx="14"
          fill="#5eb5c7"
          opacity=".9"
        />

        <rect
          x="390"
          y="390"
          width="40"
          height="86"
          rx="12"
          fill="#dbe9ec"
          className="animate-[pumpMove_2.8s_ease-in-out_infinite]"
        />

        <line
          x1="410"
          y1="82"
          x2="410"
          y2="390"
          stroke="#d8eef2"
          strokeWidth="8"
        />

        <line
          x1="430"
          y1="85"
          x2="430"
          y2="390"
          stroke="#e5a94e"
          strokeWidth="5"
        />

        <path
          d="M394 405 C350 395 310 390 270 390"
          stroke="#81d0de"
          strokeWidth="5"
          fill="none"
          strokeDasharray="10 10"
          className="animate-[flowDash_1.6s_linear_infinite]"
        />

        <path
          d="M426 405 C470 395 510 390 550 390"
          stroke="#81d0de"
          strokeWidth="5"
          fill="none"
          strokeDasharray="10 10"
          className="animate-[flowDash_1.6s_linear_infinite]"
        />

        <line
          x1="480"
          y1="180"
          x2="690"
          y2="180"
          stroke="#527981"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <line
          x1="480"
          y1="245"
          x2="690"
          y2="245"
          stroke="#527981"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <line
          x1="480"
          y1="415"
          x2="690"
          y2="415"
          stroke="#527981"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <line
          x1="250"
          y1="455"
          x2="350"
          y2="455"
          stroke="#527981"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <text x="700" y="187" fill="#2d6976" fontSize="18" fontWeight="700">
          {copy.pipe}
        </text>

        <text x="700" y="252" fill="#85632e" fontSize="18" fontWeight="700">
          {copy.cable}
        </text>

        <text x="700" y="422" fill="#174e59" fontSize="18" fontWeight="700">
          {copy.pump}
        </text>

        <text x="50" y="462" fill="#eef8fa" fontSize="18" fontWeight="700">
          {copy.filter}
        </text>

        <text x="85" y="350" fill="#174e59" fontSize="18" fontWeight="700">
          {copy.water}
        </text>
      </svg>

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/85 p-5 backdrop-blur-md">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e8c98]">
          {copy.principle}
        </div>

        <div className="mt-2 text-sm leading-6 text-[#506d74]">
          {copy.principleText}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
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
                href="/drilling/water-levels"
                className="inline-flex border border-[#a8ccd4] px-7 py-3.5 text-sm font-semibold text-[#2d6976] transition hover:bg-white"
              >
                {copy.back}
              </Link>

              <Link
                href="/map"
                className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {copy.map}
              </Link>
            </div>
          </div>

          <div className="animate-[floatPump_7s_ease-in-out_infinite]">
            <EquipmentVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="sticky top-28">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5994a0]">
                {copy.principle}
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
                {copy.principleTitle}
              </h2>

              <p className="mt-5 leading-8 text-[#647d84]">
                {copy.principleText}
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
                  {item.body}
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
              {copy.warning}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
              {copy.warningTitle}
            </h2>
          </div>

          <p className="text-[16px] leading-8 text-white/65">
            {copy.warningText}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="rounded-[26px] border border-[#d5e8eb] bg-[#eff9fa] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#548f9c]">
            {copy.finish}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
            {copy.finishTitle}
          </h2>

          <p className="mt-5 max-w-4xl leading-8 text-[#647d84]">
            {copy.finishText}
          </p>

          <div className="mt-8">
            <Link
              href="/drilling"
              className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {copy.backToDrilling}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatPump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        @keyframes pumpMove {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes flowDash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -40; }
        }
      `}</style>
    </main>
  );
}
