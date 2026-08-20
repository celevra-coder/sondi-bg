import Link from "next/link";

export const metadata = {
  title:
    "Какво е количествено състояние на подземните води? | Sondi.bg",
  description:
    "Разбираемо обяснение на количественото състояние, водния баланс, разполагаемия ресурс и водовземането от подземните водни тела.",
};

export default function QuantitativeStatusKnowledgePage() {
  const balanceElements = [
    {
      title: "Разполагаем ресурс",
      text:
        "Оцененото количество подземна вода, което може да участва във водния баланс при отчитане на нуждите на водната система.",
    },
    {
      title: "Общо водовземане",
      text:
        "Сумата от отчетеното използване на подземни води за водоснабдяване, земеделие, промишленост и други цели.",
    },
    {
      title: "Самоснабдяване",
      text:
        "Оценка на водата, използвана от населението извън основните централизирани системи.",
    },
    {
      title: "Експлоатационен индекс",
      text:
        "Съотношение между използваното количество и разполагаемия ресурс на водното тяло.",
    },
  ];

  const importantDistinctions = [
    {
      title: "Регионален ресурс",
      text:
        "Количественото състояние се определя за цялото подземно водно тяло, което може да обхваща голяма територия.",
    },
    {
      title: "Местен дебит",
      text:
        "Дебитът на конкретен сондаж зависи от местната геология, водоносния пласт, дълбочината и конструкцията.",
    },
    {
      title: "Водно ниво",
      text:
        "Нивото в един кладенец може да се променя сезонно и не представя автоматично състоянието на цялото водно тяло.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link
            href="/knowledge/water-quality"
            className="text-sm text-[#4e8795] hover:text-[#173d47]"
          >
            ← Качество и състояние
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Официална оценка · Раздел 4
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е количествено
            <br />
            състояние?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Количественото състояние показва дали
            използването на подземните води е съвместимо
            с наличния ресурс и устойчивостта на водната
            система.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Основният въпрос е балансът
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подземните води постоянно се подхранват,
              движат и използват. Количествената оценка
              сравнява наличния ресурс с водовземането и
              проследява дали използването създава
              значим натиск върху водното тяло.
            </p>

            <p>
              Целта не е просто да се преброи водата,
              а да се прецени дали системата може да
              поддържа необходимите нива, свързаните
              води и зависимите екосистеми.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Добро и лошо количествено състояние
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            <div className="bg-[#eef8f2] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#31805b]">
                Добро
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#245640]">
                Използването е в приемлив баланс
              </h3>

              <p className="mt-3 leading-7 text-[#58746a]">
                Официалната оценка не показва значим
                количествен проблем за водното тяло
                според приложените тестове.
              </p>
            </div>

            <div className="bg-[#fff1f1] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b24a4a]">
                Лошо
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#833838]">
                Установен е количествен проблем
              </h3>

              <p className="mt-3 leading-7 text-[#785858]">
                Водовземането, нивата или въздействието
                върху свързани води и екосистеми показват,
                че системата не изпълнява условията за
                добра оценка.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Воден баланс
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Какви стойности участват в оценката?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {balanceElements.map((item) => (
              <div
                key={item.title}
                className="border border-[#dce8ea] p-6"
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Голям ресурс не означава автоматично голям
            дебит във всяка точка
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Водата не е разпределена равномерно в
            подземното водно тяло. Един район може да
            има добър регионален баланс, но конкретният
            имот да попада върху слаб, дълбок или трудно
            достъпен водоносен пласт.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво още се наблюдава?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Освен общия воден баланс могат да се
              разглеждат дългосрочните промени на водните
              нива, връзката с повърхностни води,
              зависимите екосистеми и опасността от
              навлизане на солени или замърсени води.
            </p>

            <p>
              Така оценката отчита не само колко вода се
              използва, но и как това използване влияе
              върху цялата подземна система.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Важно разграничение
          </h2>

          <div className="mt-8 grid gap-4">
            {importantDistinctions.map((item) => (
              <div
                key={item.title}
                className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[170px_1fr]"
              >
                <strong className="text-[#244b55]">
                  {item.title}
                </strong>

                <p className="leading-7 text-[#637c82]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Състояние и количествен риск
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Количественото състояние показва текущата
              официална оценка. Количественият риск
              показва дали има опасност доброто състояние
              да не бъде постигнато или запазено.
            </p>

            <p>
              Затова е възможно текущото състояние да е
              добро, но определени тенденции или натиск
              да изискват проследяване.
            </p>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Какво означава за конкретен имот?
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Количественото състояние дава информация за
            устойчивостта на голямата подземна система.
            За оценка на конкретна сондажна точка са
            важни местната геология, дълбочината,
            водоносният пласт и резултатите от теренното
            проучване.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – оценка на
            количественото състояние и водния баланс на
            подземните водни тела.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/chemical-risk"
            className="text-sm text-[#56818b]"
          >
            ← Химичен риск
          </Link>

          <Link
            href="/knowledge/water-quality/exploitation-index"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Експлоатационен индекс →
          </Link>
        </div>
      </article>
    </main>
  );
}