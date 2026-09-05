import Link from "next/link";

const groups = [
  {
    title: "Основи",
    intro:
      "Първите понятия, които помагат да разберем какво представляват подземните води.",
    items: [
      {
        title: "Какво е подземна вода?",
        href: "/knowledge/groundwater/what-is-groundwater",
      },
      {
        title: "Какво е водоносен пласт?",
        href: "/knowledge/groundwater/aquifer",
      },
      {
        title: "Какво е подземно водно тяло?",
        href: "/knowledge/groundwater/groundwater-body",
      },
      {
        title: "Порови, пукнатинни и карстови води",
        href: "/knowledge/groundwater/types",
      },
    ],
  },
  {
    title: "Как работят подземните води",
    intro:
      "Как водата попада под земята, движи се между пластовете и излиза отново на повърхността.",
    items: [
      {
        title: "Как се образуват подземните води?",
        href: "/knowledge/groundwater/how-groundwater-forms",
      },
      {
        title: "Как се движи водата под земята?",
        href: "/knowledge/groundwater/how-groundwater-moves",
      },
      {
        title: "Плитки и дълбоки подземни води",
        href: "/knowledge/groundwater/shallow-deep-water",
      },
      {
        title: "Какво е артезианска вода?",
        href: "/knowledge/groundwater/artesian-water",
      },
      {
        title: "Как възникват естествените извори?",
        href: "/knowledge/groundwater/springs",
      },
      {
        title: "Как валежите стигат до подземните води?",
        href: "/knowledge/groundwater/rain-recharge",
      },
    ],
  },
  {
    title: "Практически въпроси",
    intro:
      "Въпроси, които най-често възникват при кладенци, сондажи и търсене на вода.",
    items: [
      {
        title: "Откъде идва водата в един сондаж?",
        href: "/knowledge/groundwater/water-in-well",
      },
      {
        title: "Защо водата може да е на 15 m тук, а на 60 m наблизо?",
        href: "/knowledge/groundwater/depth-differences",
      },
      {
        title: "Защо сондаж или кладенец може да пресъхне?",
        href: "/knowledge/groundwater/why-wells-dry",
      },
      {
        title: "Какво е водно ниво?",
        href: "/knowledge/groundwater/water-level",
      },
      {
        title: "Подземната вода стои ли на едно място?",
        href: "/knowledge/groundwater/is-groundwater-static",
      },
    ],
  },
  {
    title: "Как да четем картата на Sondi.bg",
    intro:
      "Обяснения на официалните данни, които виждаш в картата и анализа на конкретна точка.",
    items: [
      {
        title: "ПВТ и водоносен пласт – каква е разликата?",
        href: "/knowledge/groundwater/gwb-vs-aquifer",
      },
      {
        title: "Защо няколко ПВТ могат да се припокриват?",
        href: "/knowledge/groundwater/gwb-overlap",
      },
      {
        title: "Какво показват официалните карти?",
        href: "/knowledge/groundwater/official-maps",
      },
    ],
  },
];

export default function GroundwaterKnowledgePage() {
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
              Знания · Подземни води
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Подземните води
              <br />
              от основите до практиката.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#53747c]">
              Как се образуват, къде се намират, как се движат
              и защо условията могат да се променят само на няколко
              десетки метра разстояние.
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
