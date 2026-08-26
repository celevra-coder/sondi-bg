import Link from "next/link";

export const metadata = {
  title:
    "\u0412\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430 \u0432 \u0441\u043e\u043d\u0434\u0430\u0436 | Sondi.bg",
  description:
    "\u041a\u0430\u043a\u0432\u043e \u0441\u0430 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u043e\u0442\u043e \u0438 \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e, \u043a\u0430\u043a\u0432\u043e \u0435 \u043f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0438 \u043a\u0430\u043a \u0442\u043e\u0432\u0430 \u0432\u043b\u0438\u044f\u0435 \u0432\u044a\u0440\u0445\u0443 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430.",
};

const copy = {
  eyebrow:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u00b7 \u0412\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430",

  title1:
    "\u0412\u043e\u0434\u0430\u0442\u0430 \u0432 \u0441\u043e\u043d\u0434\u0430\u0436\u0430",

  title2:
    "\u043d\u0435 \u0441\u0442\u043e\u0438 \u043d\u0430 \u0435\u0434\u043d\u043e \u043c\u044f\u0441\u0442\u043e.",

  intro:
    "\u041d\u0438\u0432\u043e\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u0441\u043f\u043e\u0440\u0435\u0434 \u0442\u043e\u0432\u0430 \u0434\u0430\u043b\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0435 \u0432 \u043f\u043e\u043a\u043e\u0439 \u0438\u043b\u0438 \u0441\u0435 \u0447\u0435\u0440\u043f\u0438 \u0432\u043e\u0434\u0430. \u0422\u043e\u0437\u0438 \u0440\u0430\u0437\u043b\u0438\u043a\u0430 \u0435 \u0432\u0430\u0436\u043d\u0430 \u0437\u0430 \u043e\u0446\u0435\u043d\u043a\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438 \u0437\u0430 \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u0438\u044f \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430.",

  back:
    "\u2190 \u041a\u044a\u043c \u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0435\u0431\u0438\u0442",

  next:
    "\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u0430 \u0442\u0435\u043c\u0430",

  equipment:
    "\u041f\u043e\u043c\u043f\u0438 \u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435",

  continue:
    "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0438 \u2192",

  static:
    "\u0421\u0442\u0430\u0442\u0438\u0447\u043d\u043e \u043d\u0438\u0432\u043e",

  dynamic:
    "\u0414\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e \u043d\u0438\u0432\u043e",

  drawdown:
    "\u041f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435",

  pump:
    "\u041f\u043e\u043c\u043f\u0430",

  explanation:
    "\u041f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u0441\u0435 \u043f\u043e\u043d\u0438\u0436\u0430\u0432\u0430. \u041a\u043e\u043b\u043a\u043e\u0442\u043e \u043f\u043e-\u0431\u044a\u0440\u0437\u043e \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u043f\u043e\u0434\u0445\u0440\u0430\u043d\u0432\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430, \u0442\u043e\u043b\u043a\u043e\u0432\u0430 \u043f\u043e-\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u043e \u043e\u0441\u0442\u0430\u0432\u0430 \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e.",

  caution:
    "\u0412\u0430\u0436\u043d\u043e",

  cautionTitle:
    "\u0412\u0438\u0441\u043e\u043a\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e \u043d\u0435 \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u0432\u0438\u0441\u043e\u043a \u0434\u0435\u0431\u0438\u0442.",

  cautionText:
    "\u0412 \u0435\u0434\u0438\u043d \u0441\u043e\u043d\u0434\u0430\u0436 \u0432\u043e\u0434\u0430\u0442\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438 \u043d\u0430 \u043c\u0430\u043b\u043a\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u043d\u043e \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u043d\u0438\u0432\u043e\u0442\u043e \u0434\u0430 \u043f\u0430\u0434\u0430 \u0431\u044a\u0440\u0437\u043e. \u0417\u0430\u0442\u043e\u0432\u0430 \u043e\u0446\u0435\u043d\u043a\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0431\u0430\u0437\u0438\u0440\u0430 \u0438 \u043d\u0430 \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043c\u0443 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",
};

const cards = [
  {
    number: "01",
    title:
      "\u0421\u0442\u0430\u0442\u0438\u0447\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e",
    body:
      "\u0422\u043e\u0432\u0430 \u0435 \u043d\u0438\u0432\u043e\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u0432 \u0441\u043e\u043d\u0434\u0430\u0436\u0430, \u043a\u043e\u0433\u0430\u0442\u043e \u043d\u0435 \u0441\u0435 \u0447\u0435\u0440\u043f\u0438 \u0432\u043e\u0434\u0430 \u0438 \u0441\u0438\u0441\u0442\u0435\u043c\u0430\u0442\u0430 \u0435 \u0432 \u043f\u043e\u043a\u043e\u0439.",
  },
  {
    number: "02",
    title:
      "\u0414\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e",
    body:
      "\u0422\u043e\u0432\u0430 \u0435 \u043d\u0438\u0432\u043e\u0442\u043e, \u043a\u043e\u0435\u0442\u043e \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430 \u043f\u0440\u0438 \u0440\u0430\u0431\u043e\u0442\u0430 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430. \u0422\u043e \u0435 \u043e\u0441\u043e\u0431\u0435\u043d\u043e \u0432\u0430\u0436\u043d\u043e \u0437\u0430 \u0440\u0435\u0430\u043b\u043d\u0430\u0442\u0430 \u0435\u043a\u0441\u043f\u043b\u043e\u0430\u0442\u0430\u0446\u0438\u044f.",
  },
  {
    number: "03",
    title:
      "\u041f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435 \u043d\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e",
    body:
      "\u0420\u0430\u0437\u043b\u0438\u043a\u0430\u0442\u0430 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u043e\u0442\u043e \u0438 \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043a\u0430\u043a \u0441\u0438\u0441\u0442\u0435\u043c\u0430\u0442\u0430 \u0440\u0435\u0430\u0433\u0438\u0440\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435.",
  },
  {
    number: "04",
    title:
      "\u0412\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435",
    body:
      "\u0421\u043b\u0435\u0434 \u0441\u043f\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430\u0442\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u043f\u043e\u0441\u0442\u0435\u043f\u0435\u043d\u043d\u043e \u0441\u0435 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430. \u0421\u043a\u043e\u0440\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u0442\u043e\u0432\u0430 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u0441\u044a\u0449\u043e \u0434\u0430\u0432\u0430 \u0432\u0430\u0436\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f.",
  },
];

function WaterLevelVisual() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#cfe4e8] bg-[#e7f6f8] shadow-[0_30px_70px_rgba(30,80,90,.14)]">
      <svg viewBox="0 0 820 610" className="block h-auto w-full">
        <rect width="820" height="610" fill="#e7f6f8" />

        <rect x="0" y="145" width="820" height="465" fill="#b89a70" />
        <rect x="0" y="290" width="820" height="320" fill="#8f765f" />
        <rect x="0" y="435" width="820" height="175" fill="#625d58" />

        <rect x="380" y="80" width="60" height="470" rx="20" fill="#153d47" />

        <rect
          x="390"
          y="235"
          width="40"
          height="250"
          rx="16"
          fill="#3da5ba"
          className="animate-[waterLevel_4s_ease-in-out_infinite]"
        />

        <line
          x1="215"
          y1="235"
          x2="365"
          y2="235"
          stroke="#2e7f8f"
          strokeWidth="3"
          strokeDasharray="8 8"
        />

        <line
          x1="215"
          y1="330"
          x2="365"
          y2="330"
          stroke="#2e7f8f"
          strokeWidth="3"
          strokeDasharray="8 8"
        />

        <text x="70" y="242" fill="#174e59" fontSize="21" fontWeight="700">
          {copy.static}
        </text>

        <text x="70" y="337" fill="#174e59" fontSize="21" fontWeight="700">
          {copy.dynamic}
        </text>

        <line
          x1="170"
          y1="245"
          x2="170"
          y2="325"
          stroke="#cf7b46"
          strokeWidth="6"
        />

        <polygon
          points="160,255 180,255 170,240"
          fill="#cf7b46"
        />

        <polygon
          points="160,315 180,315 170,330"
          fill="#cf7b46"
        />

        <text
          x="55"
          y="292"
          fill="#8b5736"
          fontSize="19"
          fontWeight="700"
        >
          {copy.drawdown}
        </text>

        <rect x="395" y="390" width="30" height="70" rx="8" fill="#d7e9ec" />

        <text x="470" y="430" fill="#eef8fa" fontSize="19" fontWeight="700">
          {copy.pump}
        </text>
      </svg>

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/85 p-5 backdrop-blur-md">
        <div className="text-sm leading-6 text-[#506d74]">
          {copy.explanation}
        </div>
      </div>
    </div>
  );
}

export default function WaterLevelsPage() {
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

            <div className="mt-9">
              <Link
                href="/drilling/depth"
                className="inline-flex border border-[#a8ccd4] px-7 py-3.5 text-sm font-semibold text-[#2d6976] transition hover:bg-white"
              >
                {copy.back}
              </Link>
            </div>
          </div>

          <div className="animate-[floatWater_7s_ease-in-out_infinite]">
            <WaterLevelVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="sticky top-28">
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                {copy.static} ? {copy.dynamic}
              </h2>

              <p className="mt-5 leading-8 text-[#647d84]">
                {copy.explanation}
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

      <section className="mx-auto max-w-[1180px] px-7 pb-20 lg:px-10">
        <div className="rounded-[26px] border border-[#e4d8ba] bg-[#fff9ea] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a37]">
            {copy.caution}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
            {copy.cautionTitle}
          </h2>

          <p className="mt-5 max-w-4xl leading-8 text-[#6d6758]">
            {copy.cautionText}
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
                {copy.equipment}
              </h2>
            </div>

            <Link
              href="/drilling/equipment"
              className="inline-flex shrink-0 bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {copy.continue}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatWater {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        @keyframes waterLevel {
          0%, 100% {
            y: 235px;
            height: 250px;
          }
          50% {
            y: 315px;
            height: 170px;
          }
        }
      `}</style>
    </main>
  );
}
