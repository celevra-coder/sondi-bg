import Link from "next/link";

export const metadata = {
  title:
    "Как се сравняват оценките от ПУРБ 2 и ПУРБ 3? | Sondi.bg",
  description:
    "Разбираемо обяснение на сравнението между ПУРБ 2016–2021 и ПУРБ 2022–2027, химичното състояние и оценката на риска.",
};

export default function RbmpComparisonKnowledgePage() {
  const comparedFields = [
    {
      title: "Риск в ПУРБ 2",
      period: "2016–2021",
      text:
        "Оценката дали водното тяло е било застрашено да не постигне поставените цели през предходния период.",
    },
    {
      title: "Състояние в ПУРБ 2",
      period: "2016–2021",
      text:
        "Официалната оценка на химичното състояние за предходния планов период.",
    },
    {
      title: "Риск в ПУРБ 3",
      period: "2022–2027",
      text:
        "Актуалната оценка на опасността водното тяло да не постигне или запази добро състояние.",
    },
    {
      title: "Състояние в ПУРБ 3",
      period: "2022–2027",
      text:
        "Официалната оценка на химичното състояние за текущия планов период.",
    },
  ];

  const changeCases = [
    {
      title: "Подобрение",
      example: "Лошо → Добро",
      text:
        "Новата оценка показва добро състояние, но причините трябва да се търсят в данните, мерките и използваната методика.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Без промяна",
      example: "Лошо → Лошо",
      text:
        "Проблемът остава отчетен и в двата планови периода.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Влошаване",
      example: "Добро → Лошо",
      text:
        "В новата оценка е установен проблем, който не е присъствал или не е бил отчетен по същия начин преди.",
      tone: "bg-[#fff1f1]",
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
            Практическо тълкуване · Раздел 4
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как се сравняват оценките
            <br />
            от ПУРБ 2 и ПУРБ 3?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Сравнението показва дали официалната оценка
            на риска и химичното състояние се е променила
            между двата планови периода.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво са ПУРБ 2 и ПУРБ 3?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Плановете за управление на речните басейни
              се изготвят за определени периоди. В
              данните от Раздел 4 са сравнени оценките
              от ПУРБ 2016–2021 и ПУРБ 2022–2027.
            </p>

            <p>
              За всяко подземно водно тяло могат да
              бъдат показани както химичното състояние,
              така и оценката на риска за двата периода.
            </p>
          </div>
        </section>

        <div className="my-14 grid gap-4 md:grid-cols-2">
          <div className="border border-[#dce8ea] bg-[#f6fbfc] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d969f]">
              ПУРБ 2
            </div>

            <div className="mt-3 text-2xl font-semibold">
              2016–2021
            </div>

            <p className="mt-3 leading-7 text-[#637c82]">
              Предходният планов период, използван като
              база за сравнение.
            </p>
          </div>

          <div className="border border-[#bcdbe1] bg-[#edf8fa] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#438594]">
              ПУРБ 3
            </div>

            <div className="mt-3 text-2xl font-semibold">
              2022–2027
            </div>

            <p className="mt-3 leading-7 text-[#637c82]">
              Текущият планов период и актуалната
              официална оценка.
            </p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кои полета се сравняват?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {comparedFields.map((field) => (
              <div
                key={field.title}
                className="border border-[#dce8ea] p-6"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  {field.period}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[#244b55]">
                  {field.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {field.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Възможни промени
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Как се тълкува разликата?
          </h2>

          <div className="mt-8 grid gap-4">
            {changeCases.map((item) => (
              <div
                key={item.title}
                className={`grid gap-4 border border-[#dce8ea] p-7 md:grid-cols-[140px_150px_1fr] ${item.tone}`}
              >
                <strong>{item.title}</strong>

                <span className="font-semibold text-[#47717b]">
                  {item.example}
                </span>

                <p className="leading-7 text-[#637c82]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Промяната в оценката не е автоматично
            измерена тенденция
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Различната оценка между два ПУРБ може да е
            свързана с нови мониторингови данни,
            допълнителни пунктове, промяна в натиска,
            приложени мерки или актуализирана методика.
          </p>
        </div>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Реален пример от Раздел 4
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            ПВТ BG3G00000NQ018
          </h2>

          <div className="mt-8 overflow-hidden border border-[#dce8ea]">
            <div className="grid grid-cols-3 bg-[#f6fbfc] text-sm font-semibold">
              <div className="p-5">Период</div>
              <div className="p-5">Риск</div>
              <div className="p-5">Състояние</div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#dce8ea]">
              <div className="p-5 font-semibold">
                ПУРБ 2
              </div>
              <div className="bg-[#fff8e8] p-5">
                В риск
              </div>
              <div className="bg-[#fff1f1] p-5">
                Лошо
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#dce8ea]">
              <div className="p-5 font-semibold">
                ПУРБ 3
              </div>
              <div className="bg-[#fff8e8] p-5">
                В риск
              </div>
              <div className="bg-[#fff1f1] p-5">
                Лошо
              </div>
            </div>
          </div>

          <p className="mt-6 leading-7 text-[#637c82]">
            В този пример оценката остава непроменена:
            водното тяло е в риск и в лошо химично
            състояние и през двата периода.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво трябва да се провери при промяна?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {[
              "Кои показатели са проблемни?",
              "Има ли нови мониторингови пунктове?",
              "Променени ли са праговете или методиката?",
              "Отчетена ли е възходяща тенденция?",
              "Променил ли се е натискът от човешка дейност?",
              "Какви мерки са приложени?",
            ].map((item) => (
              <div
                key={item}
                className="bg-white p-6 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Най-важното
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Сравнението между ПУРБ 2 и ПУРБ 3 показва
            промяната на официалната регионална оценка.
            За да се разбере причината за тази промяна,
            трябва да се разгледат показателите,
            мониторингът, тенденциите и използваната
            методика.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – сравнение на
            оценките за риск и химично състояние между
            ПУРБ 2016–2021 и ПУРБ 2022–2027.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/water-balance"
            className="text-sm text-[#56818b]"
          >
            ← Официален воден баланс
          </Link>

          <Link
            href="/knowledge/water-quality/regional-vs-water-sample"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Регионална оценка и водна проба →
          </Link>
        </div>
      </article>
    </main>
  );
}