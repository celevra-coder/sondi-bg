import Link from "next/link";

const groups = [
  {
    title: "Защита на водите",
    intro:
      "Как се определят защитените зони и какво означават те за подземните води и питейното водоснабдяване.",
    items: [
      {
        title: "Зони за защита на подземни води за питейни нужди",
        href: "/knowledge/water-quality/drinking-water-protection-zones",
      },
    ],
  },
];

export default function WaterQualityKnowledgePage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 pb-20 pt-20 lg:px-10">
          <Link
            href="/knowledge"
            className="text-sm text-[#4e8795] transition hover:text-[#173d47]"
          >
            ← Всички теми
          </Link>

          <div className="mt-10 max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#438594]">
              Знания · Качество и състояние
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Качеството на водата
              <br />
              и факторите, които го променят.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#53747c]">
              Химично състояние, замърсяване, нитрати, защитени
              зони и други показатели, които помагат да разберем
              какво се случва с подземните води.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-20 lg:px-10">
        <div className="space-y-20">
          {groups.map((group, groupIndex) => (
            <section key={group.title}>
              <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#75a0a9]">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                    {group.title}
                  </h2>

                  <p className="mt-4 max-w-md leading-7 text-[#657e84]">
                    {group.intro}
                  </p>
                </div>

                <div className="border-t border-[#dbe8eb]">
                  {group.items.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-5 border-b border-[#dbe8eb] py-5 transition hover:bg-[#f6fbfc] md:px-4"
                    >
                      <span className="w-8 text-xs text-[#91abb1]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="flex-1 text-base font-medium text-[#244b55]">
                        {item.title}
                      </span>

                      <span className="text-[#378195] transition group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Разделът ще се разширява</strong>

          <p className="mt-2 max-w-3xl leading-7 text-[#5b767d]">
            Тук постепенно ще бъдат добавени материалите за химично
            състояние, нитрати, замърсяване, значими натиски и
            оценка на риска за подземните води.
          </p>
        </div>
      </section>

      <section className="border-t border-[#e1ebed] bg-[#f6fbfc]">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-7 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#6595a0]">
              Практическо приложение
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
              Провери какво показват данните за конкретно място.
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
