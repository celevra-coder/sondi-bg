import Link from "next/link";

const articles = [
  {
    category: "ОСНОВИ",
    title: "Какво е количествен ресурс на подземните води",
    description: "Какво означава ресурсът на едно подземно водно тяло и защо това не е директна прогноза за конкретен сондаж.",
    href: "/knowledge/resources/quantitative-resource",
  },
  {
    category: "ВОДЕН БАЛАНС",
    title: "Естествен, разполагаем и свободен ресурс",
    description: "Каква е разликата между основните ресурсни показатели, които виждаш в анализа.",
    href: "/knowledge/resources/natural-available-free-resource",
  },
  {
    category: "ВОДОВЗЕМАНЕ",
    title: "Общо и разрешено водовземане",
    description: "Как се различават използваните, разрешените и отчетените количества вода.",
    href: "/knowledge/resources/abstraction",
  },
  {
    category: "ЕКСПЛОАТАЦИЯ",
    title: "Какво е експлоатационен индекс",
    description: "Как се изчислява каква част от разполагаемия ресурс се използва и как се тълкува.",
    href: "/knowledge/resources/exploitation-index",
  },
  {
    category: "НАТОВАРВАНЕ",
    title: "Какво означава натоварване на ресурса",
    description: "Как се различават ниско, умерено и високо натоварване на подземния воден ресурс.",
    href: "/knowledge/resources/resource-load",
  },
  {
    category: "ПРЕДНАЗНАЧЕНИЕ",
    title: "Водовземане по предназначение",
    description: "Питейно водоснабдяване, земеделие, промишленост, самоснабдяване и други основни цели.",
    href: "/knowledge/resources/abstraction-by-use",
  },
  {
    category: "РАЗРЕШИТЕЛНИ",
    title: "Разрешителни за водовземане",
    description: "Какво показват действащите разрешителни, сроковете и разрешените количества и какво не могат да докажат.",
    href: "/knowledge/resources/permits",
  },
  {
    category: "СВОБОДЕН РЕСУРС",
    title: "Свободен ресурс и ново водовземане",
    description: "Какво означава положителен, ограничен или отрицателен свободен ресурс за цялото ПВТ.",
    href: "/knowledge/resources/free-resource-new-abstraction",
  },
  {
    category: "КОНКРЕТЕН ИМОТ",
    title: "Как ресурсът на ПВТ се отнася към конкретен сондаж",
    description: "Защо ресурсът на цялото водно тяло не е прогноза за дебита в конкретния имот.",
    href: "/knowledge/resources/resource-vs-well",
  },
];

export default function ResourcesKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Водовземане и ресурси
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            Разбери как се оценява наличният ресурс, как се отчита водовземането и как да тълкуваш експлоатационния индекс, свободния ресурс и разрешителните в анализите на SONDI.BG.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group border border-[#dce8eb] bg-white p-7 transition hover:border-[#a9cfd6] hover:shadow-[0_16px_45px_rgba(23,63,72,.08)]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c969f]">
                {article.category}
              </div>
              <h2 className="mt-4 text-xl font-bold leading-7 text-[#173f48]">
                {article.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6c8187]">
                {article.description}
              </p>
              <div className="mt-6 text-sm font-semibold text-[#177f98]">
                Прочети →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/knowledge" className="text-sm font-semibold text-[#177f98]">
            ← Към всички теми
          </Link>
        </div>
      </section>
    </main>
  );
}