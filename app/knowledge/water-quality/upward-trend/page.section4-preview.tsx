import Link from "next/link";

export const metadata = {
  title:
    "Какво означава възходяща тенденция във водите? | Sondi.bg",
  description:
    "Разбираемо обяснение на възходящата тенденция, времевите серии и правилното тълкуване на промените в показателите на подземните води.",
};

export default function UpwardTrendKnowledgePage() {
  const interpretationCases = [
    {
      title: "Ниска стойност, но се увеличава",
      text:
        "Показателят може още да е под стандарта, но устойчивото му нарастване предупреждава за бъдещ проблем.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Висока стойност без ясна промяна",
      text:
        "Може да има превишение, но поредицата да не показва постоянно нарастване във времето.",
      tone: "bg-[#fff1f1]",
    },
    {
      title: "Намаляваща стойност",
      text:
        "Поредицата може да показва подобрение, но е необходимо достатъчно дълго наблюдение, за да се потвърди посоката.",
      tone: "bg-[#eef8f2]",
    },
  ];

  const trendRequirements = [
    {
      title: "Поредица от години",
      text:
        "Едно измерване не може да покаже тенденция. Необходима е времева серия от последователни наблюдения.",
    },
    {
      title: "Сравними измервания",
      text:
        "Данните трябва да позволяват сравнение между отделните години и периоди.",
    },
    {
      title: "Посока на промяната",
      text:
        "Оценява се дали стойностите устойчиво нарастват, намаляват или не показват ясна посока.",
    },
    {
      title: "Значение за водното тяло",
      text:
        "Резултатите от отделни пунктове се разглеждат в контекста на цялото подземно водно тяло.",
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
            Какво означава
            <br />
            възходяща тенденция?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Възходящата тенденция показва устойчиво
            увеличаване на даден показател във времето,
            а не просто една висока измерена стойност.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Тенденцията е посока, не единичен резултат
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато един показател се измерва в
              продължение на няколко години, резултатите
              образуват времева серия. Тя позволява да
              се види дали стойностите се увеличават,
              намаляват или се колебаят без ясна посока.
            </p>

            <p>
              Възходящата тенденция означава, че
              статистическата и експертната оценка
              установяват нарастване, което е достатъчно
              устойчиво, за да бъде отчетено като
              проблем за проследяване.
            </p>
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Една висока стойност не е възходяща тенденция
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Единичното превишение показва проблем в
            конкретно измерване. Тенденцията показва как
            стойностите се променят в по-дълъг период.
            Двете оценки са свързани, но не означават
            едно и също.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е необходимо, за да се оцени тенденция?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {trendRequirements.map((item) => (
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

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Три различни ситуации
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Стойност и посока на промяната
          </h2>

          <div className="mt-8 grid gap-4">
            {interpretationCases.map((item) => (
              <div
                key={item.title}
                className={`border border-[#dce8ea] p-7 ${item.tone}`}
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

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Може ли да има тенденция без превишение?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Да. Един показател може все още да е под
              праговата стойност или стандарта, но да
              нараства последователно. Именно затова
              тенденциите са важни за ранното откриване
              на бъдещи проблеми.
            </p>

            <p>
              Ако нарастването продължи, стойността може
              по-късно да достигне ниво, което влияе
              върху химичното състояние или оценката на
              риска.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво показват времевите серии в PRO анализа?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            За всяка налична серия се показват
            мониторинговият пункт, наблюдаваният
            показател, началната и крайната година и
            броят на използваните стойности. Така може
            да се види къде и за какво е проследявана
            промяната.
          </p>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-4">
            {[
              "Мониторингов пункт",
              "Показател",
              "Период",
              "Брой стойности",
            ].map((item) => (
              <div
                key={item}
                className="bg-white p-6 text-center font-semibold text-[#476b74]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Пример от Раздел 4
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            За ПВТ BG3G00000NQ018 е отчетена възходяща
            тенденция и са налични времеви серии за обща
            алфа-активност и тетрахлоретилен. Това
            показва необходимост от проследяване на
            развитието, а не еднакво състояние във всеки
            пункт от водното тяло.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава за конкретен имот?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Възходящата тенденция е регионален сигнал за
            наблюдавания показател. Тя не означава, че
            същото нарастване задължително присъства във
            водата на всеки конкретен кладенец или
            сондаж.
          </p>
        </section>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – оценка на
            значимите и устойчиви възходящи тенденции в
            концентрациите на замърсители в подземните
            води.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/threshold-background-standard"
            className="text-sm text-[#56818b]"
          >
            ← Прагови и фонови стойности
          </Link>

          <Link
            href="/knowledge/water-quality/monitoring-exceedances"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Мониторинг и превишения →
          </Link>
        </div>
      </article>
    </main>
  );
}