import Link from "next/link";

const sections = [
  {
    title: "Подземни води",
    count: "12 материала",
    description:
      "Основи, водоносни хоризонти, подземни водни тела и видове подземни води.",
    href: "/knowledge/groundwater",
  },
  {
    title: "Геология",
    count: "10 материала",
    description:
      "Геоложки карти, скали, седименти, геоложки периоди и разломни структури.",
    href: "/knowledge/geology",
  },
  {
    title: "Качество и състояние",
    count: "11 материала",
    description:
      "Химично състояние, риск, замърсяване, нитрати и значими натиски.",
    href: "/knowledge/water-quality",
  },
  {
    title: "Мониторинг",
    count: "8 материала",
    description:
      "Наблюдателни пунктове, водни нива, дебити и правилно тълкуване на измерванията.",
    href: "/knowledge/monitoring",
  },
  {
    title: "Водовземане и ресурси",
    count: "9 материала",
    description:
      "Наличен ресурс, разрешено водовземане, експлоатация и устойчивост.",
    href: "/knowledge/resources",
  },
  {
    title: "Сондажи",
    count: "14 материала",
    description:
      "Избор на място, дълбочина, конструкция, обсадни тръби, филтри и дебит.",
    href: "/knowledge/drilling",
  },
  {
    title: "Проучване за вода",
    count: "10 материала",
    description:
      "Геофизика, VES, профилиране, радиестезия и комбиниране на методи.",
    href: "/knowledge/exploration",
  },
  {
    title: "Практика и регулации",
    count: "9 материала",
    description:
      "Какво може да се заключи за конкретен имот, разрешителни и практически решения.",
    href: "/knowledge/practice",
  },
];

export default function KnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 pb-20 pt-24 lg:px-10">
          <div className="max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#438594]">
              Sondi.bg · Знания
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#153943] md:text-6xl">
              Подземните води,
              <br />
              подредени по теми.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#53747c]">
              Избери тема и разгледай конкретните материали в нея.
              Съдържанието е организирано от основните понятия към
              практическото им приложение.
            </p>

            <div className="mt-9 max-w-2xl">
              <input
                type="search"
                placeholder="Какво искаш да разбереш?"
                className="w-full rounded-full border border-[#b9dce3] bg-white px-6 py-4 text-sm text-[#173d47] outline-none placeholder:text-[#7d9aa1]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-20 lg:px-10">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#6595a0]">
            Основни теми
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#153943]">
            Избери област
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group min-h-[230px] border border-[#dce9ec] bg-white p-7 transition hover:-translate-y-1 hover:border-[#9fcbd5] hover:shadow-[0_18px_50px_rgba(28,85,99,.08)]"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b9aa5]">
                {section.count}
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#173d47]">
                {section.title}
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#6b8187]">
                {section.description}
              </p>

              <div className="mt-7 text-sm font-medium text-[#257589]">
                Отвори темата
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e3ecee] bg-[#f6fbfc]">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-7 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#6595a0]">
              Не търсиш теория?
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#153943]">
              Провери конкретно място на картата.
            </h2>
          </div>

          <Link
            href="/map"
            className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-medium text-white"
          >
            Отвори картата →
          </Link>
        </div>
      </section>
    </main>
  );
}