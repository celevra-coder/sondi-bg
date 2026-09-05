import Link from "next/link";

const articles = [
  {
    category: "ОСНОВИ",
    title: "Какво е мониторинг на подземните води",
    description: "Какво се наблюдава, защо се прави мониторинг и как тези данни участват в официалните оценки.",
    href: "/knowledge/monitoring/what-is-groundwater-monitoring",
  },
  {
    category: "МОНИТОРИНГОВИ ПУНКТОВЕ",
    title: "Какво е мониторингов пункт",
    description: "Какво представлява пунктът, към кое подземно водно тяло се отнася и как правилно да се тълкува.",
    href: "/knowledge/monitoring/monitoring-point",
  },
  {
    category: "ХИМИЧЕН МОНИТОРИНГ",
    title: "Какво показва химичният мониторинг",
    description: "Какви показатели се изследват и какво означават резултатите от официалните химични пунктове.",
    href: "/knowledge/monitoring/chemical-monitoring",
  },
  {
    category: "КОЛИЧЕСТВЕН МОНИТОРИНГ",
    title: "Количествен мониторинг и водни нива",
    description: "Как се следят водните нива и количественото състояние на подземните води.",
    href: "/knowledge/monitoring/quantitative-monitoring",
  },
  {
    category: "ПРЕВИШЕНИЯ",
    title: "Какво означава превишение в мониторингов пункт",
    description: "Как се тълкува превишение и каква е разликата между отделен пункт и оценката на цялото ПВТ.",
    href: "/knowledge/monitoring/exceedances",
  },
  {
    category: "ТЕНДЕНЦИИ",
    title: "Какво е възходяща тенденция",
    description: "Какво означава трайно покачване на даден показател и защо то е важно дори преди достигане на нормата.",
    href: "/knowledge/monitoring/upward-trend",
  },
  {
    category: "ПИТЕЙНИ ВОДИ",
    title: "Мониторинг за питейни води и защитни зони",
    description: "Какво показват пунктовете, свързани с питейно водоснабдяване и защитени зони.",
    href: "/knowledge/monitoring/drinking-water-monitoring",
  },
  {
    category: "ПРИПОКРИВАЩИ СЕ ПВТ",
    title: "Мониторинг при няколко подземни водни тела",
    description: "Как се четат данните, когато една точка попада в повече от едно подземно водно тяло.",
    href: "/knowledge/monitoring/multiple-groundwater-bodies",
  },
  {
    category: "НЕПЪЛНИ ДАННИ",
    title: "Какво означава „няма данни“",
    description: "Защо липсата на публикувано измерване не означава автоматично липса на вода, добро качество или липса на риск.",
    href: "/knowledge/monitoring/missing-data",
  },
];

export default function MonitoringKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Мониторинг на подземните води
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            Разбери какво означават мониторинговите пунктове, химичните и количествените измервания, превишенията и тенденциите, които виждаш в анализите на SONDI.BG.
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