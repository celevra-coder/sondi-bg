import Link from "next/link";

export const metadata = {
  title:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u0437\u0430 \u0432\u043e\u0434\u0430 | Sondi.bg",
  description:
    "\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u0434\u0435\u0431\u0438\u0442, \u0432\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430, \u043f\u043e\u043c\u043f\u0438 \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u043f\u0440\u0435\u0434\u0438 \u0441\u043e\u043d\u0434\u0430\u0436 \u0437\u0430 \u0432\u043e\u0434\u0430.",
};

const copy = {
  eyebrow:
    "Sondi.bg \u00b7 \u0421\u043e\u043d\u0434\u0430\u0436\u0438",

  title1:
    "\u041f\u0440\u0435\u0434\u0438 \u0434\u0430 \u043f\u0440\u043e\u0431\u0438\u0435\u0442\u0435,",

  title2:
    "\u0440\u0430\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0442\u0435\u0440\u0435\u043d\u0430.",

  intro:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0430\u0442\u0430 \u0441\u0442\u044a\u043f\u043a\u0430. \u041f\u0440\u0435\u0434\u0438 \u043d\u0435\u0433\u043e \u0438\u043c\u0430 \u043c\u044f\u0441\u0442\u043e, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u0434\u0435\u0431\u0438\u0442 \u0438 \u0440\u0435\u0434\u0438\u0446\u0430 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u044f. \u0422\u0430\u0437\u0438 \u0441\u0435\u043a\u0446\u0438\u044f \u043f\u043e\u0434\u0440\u0435\u0436\u0434\u0430 \u043d\u0430\u0439-\u0432\u0430\u0436\u043d\u043e\u0442\u043e \u043f\u0440\u0435\u0434\u0438, \u043f\u043e \u0432\u0440\u0435\u043c\u0435 \u0438 \u0441\u043b\u0435\u0434 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e.",

  map:
    "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u2192",

  knowledge:
    "\u041a\u044a\u043c \u0437\u043d\u0430\u043d\u0438\u044f\u0442\u0430",

  section:
    "\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0430\u0437\u0434\u0435\u043b",

  sectionTitle:
    "\u041e\u0442 \u0438\u0437\u0431\u043e\u0440\u0430 \u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0434\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435\u0442\u043e",

  sectionText:
    "\u0412\u0441\u044f\u043a\u0430 \u0442\u0435\u043c\u0430 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430 \u043e\u0442\u0434\u0435\u043b\u043d\u0430 \u0447\u0430\u0441\u0442 \u043e\u0442 \u043f\u0440\u043e\u0446\u0435\u0441\u0430 \u0438 \u043e\u0431\u044f\u0441\u043d\u044f\u0432\u0430 \u043a\u043e\u0438 \u0434\u0430\u043d\u043d\u0438 \u0441\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u043e \u0432\u0430\u0436\u043d\u0438 \u0437\u0430 \u0431\u044a\u0434\u0435\u0449\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436.",

  tool:
    "\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442",

  toolTitle:
    "\u0418\u043c\u0430\u0442\u0435 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e \u043c\u044f\u0441\u0442\u043e?",

  toolText:
    "\u041a\u0430\u0440\u0442\u0430\u0442\u0430 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0441\u043e\u043d\u0434\u0430\u0436\u0438, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438\u044f \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u043e\u043a\u043e\u043b\u043e \u0438\u0437\u0431\u0440\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430.",

  openMap:
    "\u041e\u0442\u0432\u043e\u0440\u0438 \u043a\u0430\u0440\u0442\u0430 \u2192",

  read:
    "\u041f\u0440\u043e\u0447\u0435\u0442\u0438 \u043f\u043e\u0432\u0435\u0447\u0435",
};

const topics = [
  {
    number: "01",
    title:
      "\u041f\u0440\u0435\u0434\u0438 \u0434\u0430 \u043d\u0430\u043f\u0440\u0430\u0432\u0438\u0442\u0435 \u0441\u043e\u043d\u0434\u0430\u0436",
    description:
      "\u041a\u0430\u043a\u0432\u043e \u0435 \u0434\u043e\u0431\u0440\u0435 \u0434\u0430 \u0437\u043d\u0430\u0435\u0442\u0435 \u043f\u0440\u0435\u0434\u0438 \u0437\u0430\u043f\u043e\u0447\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u2014 \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u043d\u0430 \u0442\u0435\u0440\u0435\u043d\u0430, \u0440\u0435\u0430\u043b\u0438\u0441\u0442\u0438\u0447\u043d\u0438 \u043e\u0447\u0430\u043a\u0432\u0430\u043d\u0438\u044f \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430.",
    href: "/drilling",
  },
  {
    number: "02",
    title:
      "\u0418\u0437\u0431\u043e\u0440 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e",
    description:
      "\u0417\u0430\u0449\u043e \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u0435 \u043f\u043e-\u0432\u0430\u0436\u043d\u0430 \u043e\u0442 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u043b\u043d\u043e\u0442\u043e \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u0438 \u043a\u0430\u043a \u0441\u0435 \u043a\u043e\u043c\u0431\u0438\u043d\u0438\u0440\u0430\u0442 \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u043a\u0430\u0440\u0442\u0430 \u0438 \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435.",
    href: "/drilling/location",
  },
  {
    number: "03",
    title:
      "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0435\u0431\u0438\u0442",
    description:
      "\u041a\u0430\u043a\u0432\u043e \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430\u0442 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430, \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u044f\u0442 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b \u0438 \u0434\u0435\u0431\u0438\u0442\u044a\u0442 \u0438 \u0437\u0430\u0449\u043e \u043f\u043e-\u0434\u044a\u043b\u0431\u043e\u043a\u043e \u043d\u0435 \u0432\u0438\u043d\u0430\u0433\u0438 \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u043f\u043e\u0432\u0435\u0447\u0435 \u0432\u043e\u0434\u0430.",
    href: "/drilling/depth",
  },
  {
    number: "04",
    title:
      "\u0412\u043e\u0434\u043d\u0438 \u043d\u0438\u0432\u0430",
    description:
      "\u0421\u0442\u0430\u0442\u0438\u0447\u043d\u043e \u0438 \u0434\u0438\u043d\u0430\u043c\u0438\u0447\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e, \u043f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435 \u043f\u0440\u0438 \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0438 \u043a\u0430\u043a \u0442\u0435\u0437\u0438 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438 \u0432\u043b\u0438\u044f\u044f\u0442 \u0432\u044a\u0440\u0445\u0443 \u0435\u043a\u0441\u043f\u043b\u043e\u0430\u0442\u0430\u0446\u0438\u044f\u0442\u0430.",
    href: "/drilling/water-levels",
  },
  {
    number: "05",
    title:
      "\u041f\u043e\u043c\u043f\u0438 \u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435",
    description:
      "\u041e\u0441\u043d\u043e\u0432\u043d\u0438 \u043f\u0440\u0438\u043d\u0446\u0438\u043f\u0438 \u043f\u0440\u0438 \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u043f\u043e\u0442\u043e\u043f\u044f\u0435\u043c\u0430 \u043f\u043e\u043c\u043f\u0430, \u043d\u0430\u043f\u043e\u0440, \u0434\u0435\u0431\u0438\u0442, \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440 \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u043d\u0430 \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",
    href: "/drilling/equipment",
  },
];

export default function DrillingPage() {
  return (
    <main className="min-h-screen bg-[#f7fbfc] text-[#153943]">
      <section className="border-b border-[#d7e9ed] bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 pb-20 pt-24 lg:px-10">
          <div className="max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#438594]">
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
                className="inline-flex items-center bg-[#153d47] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#1b4e59]"
              >
                {copy.map}
              </Link>

              <Link
                href="/knowledge"
                className="inline-flex items-center border border-[#9ecbd4] px-7 py-3.5 text-sm font-medium text-[#285f6c] transition hover:bg-white/60"
              >
                {copy.knowledge}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#5a919d]">
            {copy.section}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            {copy.sectionTitle}
          </h2>

          <p className="mt-5 text-base leading-8 text-[#647d84]">
            {copy.sectionText}
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-[#dce9ec] bg-[#dce9ec] md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.number}
              href={topic.href}
              className="group bg-white p-8 transition duration-500 hover:-translate-y-1 hover:bg-[#f3fafb] hover:shadow-[0_18px_45px_rgba(25,75,85,.07)] md:p-10"
            >
              <div className="text-xs font-semibold tracking-[0.2em] text-[#67a4b1]">
                {topic.number}
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
                {topic.title}
              </h3>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#6b8187]">
                {topic.description}
              </p>

              <div className="mt-7 text-sm font-medium text-[#28798b]">
                {copy.read}
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  ?
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#153d47]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-7 py-14 text-white lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[#8ac7d3]">
              {copy.tool}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
              {copy.toolTitle}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/65">
              {copy.toolText}
            </p>
          </div>

          <Link
            href="/map"
            className="inline-flex shrink-0 bg-white px-7 py-3.5 text-sm font-semibold text-[#153d47] transition hover:-translate-y-0.5"
          >
            {copy.openMap}
          </Link>
        </div>
      </section>
    </main>
  );
}
