import Link from "next/link";

const articles = [
  {
    category: "ПРЕДИ СОНДАЖ",
    title: "Какво трябва да се провери преди сондаж",
    description: "Основните проверки за мястото, водното тяло, наличните данни и възможните ограничения.",
    href: "/knowledge/practice/before-drilling",
  },
  {
    category: "РЕГИСТРИ",
    title: "Какво показват разрешителните и регистрите",
    description: "Каква информация може да се намери в официалните записи и как да се използва като ориентир.",
    href: "/knowledge/practice/permits-and-registers",
  },
  {
    category: "ЗАЩИТЕНИ ЗОНИ",
    title: "Какво представляват защитените и санитарно-охранителните зони",
    description: "Защо около някои водоизточници има специални зони и защо местоположението трябва да се проверява.",
    href: "/knowledge/practice/protection-zones",
  },
  {
    category: "КОНКРЕТЕН ИМОТ",
    title: "Какво може да се заключи за конкретен имот",
    description: "Кои изводи могат да се направят от наличните данни и кои изискват допълнителна проверка на място.",
    href: "/knowledge/practice/property-conclusions",
  },
  {
    category: "ОФИЦИАЛНА ПРОВЕРКА",
    title: "Кога е нужна допълнителна официална проверка",
    description: "В кои случаи данните в картата не са достатъчни и трябва да се потвърди актуалният административен режим.",
    href: "/knowledge/practice/official-check",
  },
];

export default function PracticeKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Практика и регулации
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            Кратък практически ориентир какво е важно да се провери преди сондаж и кога наличните данни трябва да се потвърдят официално.
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