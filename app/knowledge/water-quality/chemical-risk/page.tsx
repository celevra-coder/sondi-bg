import Link from "next/link";

export const metadata = {
  title:
    "Какво означава подземно водно тяло в риск? | Sondi.bg",
  description:
    "Разбираемо обяснение на химичния риск, разликата между риск и състояние и правилното тълкуване на официалната оценка.",
};

export default function ChemicalRiskKnowledgePage() {
  const riskFactors = [
    {
      title: "Установени превишения",
      text:
        "Наблюдавани вещества над приложимите стандарти или прагови стойности могат да покажат реален проблем.",
    },
    {
      title: "Възходяща тенденция",
      text:
        "Постепенното увеличаване на даден показател може да създаде бъдещ риск, дори когато текущите стойности още не са критични.",
    },
    {
      title: "Натиск от човешка дейност",
      text:
        "Земеделие, населени места, промишленост и други дейности могат да увеличават вероятността от замърсяване.",
    },
    {
      title: "Засегнати води и екосистеми",
      text:
        "Оценява се дали проблемът може да влияе върху питейното водоснабдяване, повърхностни води или зависими екосистеми.",
    },
  ];

  const combinations = [
    {
      status: "Добро състояние",
      risk: "Не е в риск",
      meaning:
        "Текущата оценка е благоприятна и не е установена значима опасност за постигането на целите.",
      tone: "bg-[#eef8f2]",
    },
    {
      status: "Добро състояние",
      risk: "В риск",
      meaning:
        "Състоянието в момента е добро, но има натиск или тенденция, които могат да го влошат.",
      tone: "bg-[#fff8e8]",
    },
    {
      status: "Лошо състояние",
      risk: "В риск",
      meaning:
        "Вече е установен проблем и има опасност доброто състояние да не бъде постигнато в планирания период.",
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
            Официална оценка · Раздел 4
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво означава водно тяло
            <br />
            „в риск“?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Рискът показва дали има опасност подземното
            водно тяло да не постигне или запази добро
            състояние през периода на управление.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Рискът гледа напред
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Химичното състояние описва какво показват
              наличните данни за разглеждания период.
              Оценката на риска разглежда дали натискът,
              тенденциите и наблюдаваните проблеми могат
              да попречат на постигането на добро
              състояние в бъдеще.
            </p>

            <p>
              Затова водно тяло може да бъде в добро
              състояние, но едновременно с това да бъде
              определено „в риск“. Това не е
              противоречие, а предупреждение за възможно
              бъдещо влошаване.
            </p>
          </div>
        </section>

        <div className="my-14 grid gap-px bg-[#dce8ea] md:grid-cols-2">
          <div className="bg-[#fff8e8] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b19]">
              В риск
            </div>

            <p className="mt-4 leading-7 text-[#715f3c]">
              Има установени фактори, които могат да
              попречат на постигането или запазването
              на добро състояние.
            </p>
          </div>

          <div className="bg-[#eef8f2] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#31805b]">
              Не е в риск
            </div>

            <p className="mt-4 leading-7 text-[#58746a]">
              Наличната оценка не показва значима
              опасност водното тяло да не изпълни
              поставените цели.
            </p>
          </div>
        </div>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Основания за оценката
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Какво може да създава риск?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {riskFactors.map((factor) => (
              <div
                key={factor.title}
                className="border border-[#dce8ea] p-6"
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {factor.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {factor.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как се съчетават състояние и риск?
          </h2>

          <div className="mt-8 grid gap-4">
            {combinations.map((item) => (
              <div
                key={`${item.status}-${item.risk}`}
                className={`grid gap-4 border border-[#dce8ea] p-6 md:grid-cols-[170px_130px_1fr] ${item.tone}`}
              >
                <strong>{item.status}</strong>

                <span className="font-semibold text-[#476b74]">
                  {item.risk}
                </span>

                <p className="leading-7 text-[#637c82]">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            „В риск“ не означава еднакво замърсяване
            навсякъде
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Оценката се отнася за цялото подземно водно
            тяло. Проблемът може да е свързан с определени
            райони, пунктове или показатели, а не с всяка
            точка от неговата територия.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо оценката на риска е важна?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Тя помага да се определят нужните мерки,
              мониторинг и действия за ограничаване на
              замърсяването. Водно тяло в риск обикновено
              изисква по-внимателно проследяване.
            </p>

            <p>
              Сравнението между различните периоди на
              ПУРБ показва дали оценката се подобрява,
              остава непроменена или се влошава.
            </p>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Практическо тълкуване
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Ако избраната точка попада във водно тяло
            в риск, това е сигнал да се разгледат
            проблемните показатели, тенденциите и
            мониторинговите резултати. Самата оценка не
            доказва качеството на водата в конкретен
            имот.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – оценка на риска
            и състоянието на подземните водни тела.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/chemical-status"
            className="text-sm text-[#56818b]"
          >
            ← Химично състояние
          </Link>

          <Link
            href="/knowledge/water-quality/quantitative-status"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Количествено състояние →
          </Link>
        </div>
      </article>
    </main>
  );
}