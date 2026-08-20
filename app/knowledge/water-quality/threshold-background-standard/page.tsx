import Link from "next/link";

export const metadata = {
  title:
    "Прагови, фонови стойности и стандарт за качество | Sondi.bg",
  description:
    "Разбираемо обяснение на праговата стойност, естествената фонова стойност, стандарта за качество и правилното сравняване на данните.",
};

export default function ThresholdBackgroundStandardPage() {
  const concepts = [
    {
      title: "Фонова стойност",
      short: "Какво е естествено за водното тяло?",
      text:
        "Описва характерното съдържание на даден показател, свързано с естествените условия и геоложката среда.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Прагова стойност",
      short: "Кога стойността изисква внимание?",
      text:
        "Официално определена стойност за конкретното подземно водно тяло, използвана при оценката на химичното му състояние.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Стандарт за качество",
      short: "Какво изисква приложимият критерий?",
      text:
        "Нормативна или официална референтна стойност, спрямо която се оценява съдържанието на определени вещества.",
      tone: "bg-[#edf6fa]",
    },
  ];

  const exampleRows = [
    {
      label: "Фонова стойност",
      value: "3,08 mg/l",
      meaning:
        "Оценено характерно естествено съдържание на нитрати за водното тяло.",
    },
    {
      label: "Прагова стойност",
      value: "38,27 mg/l",
      meaning:
        "Стойност, използвана при оценката на химичното състояние.",
    },
    {
      label: "Стандарт за качество",
      value: "50 mg/l",
      meaning:
        "Приложимата официална стойност за нитрати.",
    },
    {
      label: "Базова стойност",
      value: "17,2125 mg/l",
      meaning:
        "Референтна стойност от използвания базов период в официалните данни.",
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
            Мониторинг и показатели · Раздел 4
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Прагови, фонови стойности
            <br />
            и стандарт за качество
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Тези стойности помагат да се разбере кое е
            естествено за водното тяло, кога един
            показател изисква внимание и спрямо какъв
            официален критерий се сравнява.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Три различни стойности с различна роля
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            В мониторинговите данни един и същ показател
            може да има фонова стойност, прагова стойност
            и стандарт за качество. Те не са взаимозаменяеми
            и не трябва да се четат като три отделни
            лабораторни резултата.
          </p>

          <div className="mt-8 grid gap-4">
            {concepts.map((concept, index) => (
              <div
                key={concept.title}
                className={`grid gap-4 border border-[#dce8ea] p-7 md:grid-cols-[55px_220px_1fr] ${concept.tone}`}
              >
                <div className="text-sm font-semibold text-[#6b9aa5]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#244b55]">
                    {concept.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6b8187]">
                    {concept.short}
                  </p>
                </div>

                <p className="leading-7 text-[#637c82]">
                  {concept.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е фонова стойност?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подземната вода естествено разтваря
              минерали и вещества от скалите и
              седиментите, през които преминава.
              Следователно част от химичния състав може
              да има естествен геоложки произход.
            </p>

            <p>
              Фоновата стойност помага да се различи
              характерното естествено съдържание от
              допълнително натоварване, което може да е
              свързано с човешка дейност.
            </p>
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Високата естествена стойност не винаги
            означава замърсяване от човешка дейност
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Някои вещества могат естествено да присъстват
            в по-високи концентрации заради местната
            геология. Това не ги прави автоматично
            безопасни за всяка употреба, но е важно за
            правилното определяне на произхода.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е прагова стойност?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Праговата стойност се определя за
              конкретен показател и подземно водно тяло.
              Тя участва в официалната оценка дали
              химичното състояние е добро или лошо.
            </p>

            <p>
              При определянето ѝ могат да се отчитат
              стандартът за качество, естественият фон,
              предназначението на водите и връзката със
              зависими водни системи.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е стандарт за качество?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Стандартът за качество е официалният
              критерий за дадено вещество или показател.
              Например в данните от Раздел 4 стандартът
              за нитрати е посочен като 50 mg/l.
            </p>

            <p>
              Стандартът може да е еднакъв за много
              водни тела, докато праговата и фоновата
              стойност могат да бъдат свързани с
              характеристиките на конкретното водно тяло.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Реален пример от Раздел 4
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Нитрати в ПВТ BG3G00000NQ018
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            За водното тяло в района Пазарджик–Пловдив
            официалните данни съдържат следните стойности
            за нитрати:
          </p>

          <div className="mt-8 border-t border-[#dce8ea]">
            {exampleRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 border-b border-[#dce8ea] py-5 md:grid-cols-[190px_130px_1fr]"
              >
                <strong>{row.label}</strong>

                <span className="font-semibold text-[#2c8498]">
                  {row.value}
                </span>

                <span className="leading-7 text-[#637c82]">
                  {row.meaning}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как се сравнява измерена стойност?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-3">
            <div className="bg-[#eef8f2] p-6">
              <strong>Под фоновата стойност</strong>

              <p className="mt-2 text-sm leading-6 text-[#637c82]">
                Стойността е под оцененото характерно
                естествено съдържание.
              </p>
            </div>

            <div className="bg-[#fff8e8] p-6">
              <strong>Над фона или прага</strong>

              <p className="mt-2 text-sm leading-6 text-[#637c82]">
                Необходимо е да се разгледат методиката,
                поредицата от измервания и останалите
                тестове.
              </p>
            </div>

            <div className="bg-[#fff1f1] p-6">
              <strong>Над стандарта</strong>

              <p className="mt-2 text-sm leading-6 text-[#637c82]">
                Налице е официално превишение на
                приложимата стойност за показателя.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Важно при четене
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Винаги проверявай мерната единица. Стойност
            в mg/l не може да се сравнява директно със
            стойност в µg/l, без предварително
            преобразуване на единиците.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означават стойностите за конкретен имот?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Праговете и фоновите стойности описват
            официалната оценка на подземното водно тяло.
            Те са важна основа за тълкуване, но не са
            измерване на водата в конкретен кладенец или
            сондаж.
          </p>
        </section>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – фонови нива,
            прагови стойности, базови нива и стандарти
            за качество на подземните води.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/exploitation-index"
            className="text-sm text-[#56818b]"
          >
            ← Експлоатационен индекс
          </Link>

          <Link
            href="/knowledge/water-quality/upward-trend"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Възходяща тенденция →
          </Link>
        </div>
      </article>
    </main>
  );
}