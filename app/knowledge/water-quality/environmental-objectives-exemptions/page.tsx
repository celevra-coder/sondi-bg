import Link from "next/link";

export const metadata = {
  title:
    "Екологични цели, срокове и изключения за подземните води | Sondi.bg",
  description:
    "Разбираемо обяснение на екологичните цели за подземните води, сроковете след 2027 г., по-малко строгите цели и защитата на питейните води.",
};

export default function EnvironmentalObjectivesKnowledgePage() {
  const goalTypes = [
    {
      title: "Запазване на добро състояние",
      status: "Добро състояние",
      text:
        "Когато подземното водно тяло вече е в добро химично състояние, целта е това състояние да се запази и да не се допуска влошаване.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Постигната цел",
      status: "Подобрение",
      text:
        "В предходен период водното тяло е имало проблем, но актуалната официална оценка показва, че поставената цел вече е постигната.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "Удължен срок",
      status: "След 2027 г.",
      text:
        "Добро състояние не може да бъде постигнато в обичайния срок и е предвидено допълнително време при официално обосновани условия.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "По-малко строга цел",
      status: "Специален случай",
      text:
        "При определени обстоятелства се поставя по-малко строга цел за конкретен показател, когато постигането на обичайния стандарт е особено трудно.",
      tone: "bg-[#fff1f1]",
    },
  ];

  const practicalQuestions = [
    "Какво е актуалното химично състояние?",
    "Каква официална цел е поставена?",
    "Има ли конкретен проблемен показател?",
    "Определен ли е срок след 2027 г.?",
    "Има ли удължаване или по-малко строга цел?",
    "Каква е официалната обосновка?",
    "Каква е целта за защита на питейните води?",
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
            Официални цели и изключения · Раздел 5
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Екологични цели,
            <br />
            срокове и изключения
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Какво трябва да се постигне за подземното водно
            тяло, кога се очаква това и защо понякога срокът
            е удължен или целта е по-малко строга.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво представлява екологичната цел?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Екологичната цел показва какво състояние трябва
              да бъде постигнато или запазено за дадено
              подземно водно тяло според официалния план за
              управление на речните басейни.
            </p>

            <p>
              Ако състоянието вече е добро, целта обикновено
              е то да бъде запазено. Ако има проблем,
              се определя какво трябва да се подобри и в
              какъв срок.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Четири основни ситуации
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {goalTypes.map((goal) => (
              <div
                key={goal.title}
                className={`border border-[#dce8ea] p-6 ${goal.tone}`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  {goal.status}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[#244b55]">
                  {goal.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {goal.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава срок след 2027 г.?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Това означава, че официалната цел за постигане
              на добро състояние е отложена за период след
              2027 г. Удължаването не означава, че проблемът
              е пренебрегнат.
            </p>

            <p>
              Причините може да са свързани с необходимост
              от допълнителни проучвания, планирани мерки,
              бавно възстановяване на подземните води или
              времето, нужно на замърсителя да намалее.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Удълженият срок не е прогноза за конкретен сондаж.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Той се отнася до цялото подземно водно тяло,
              а не до качеството на водата в определен имот.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава по-малко строга цел?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              По-малко строга цел се прилага, когато за
              конкретен показател обичайната цел не може
              да бъде постигната в пълен обем при наличните
              условия.
            </p>

            <p>
              В официалните данни това е придружено от
              конкретен проблемен показател, правно основание
              и обосновка. Например показателят може да бъде
              нитрати, когато значителна част от водното тяло
              е засегната от дифузен земеделски натиск.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Каква е разликата между чл. 4(4) и чл. 4(5)?
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="border border-[#dce8ea] bg-[#fff8e8] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a2b]">
                Чл. 4(4)
              </div>

              <h3 className="mt-3 text-xl font-semibold">
                Удължаване на срока
              </h3>

              <p className="mt-3 leading-7 text-[#637c82]">
                Целта остава постигане на добро състояние,
                но е необходимо повече време.
              </p>
            </div>

            <div className="border border-[#dce8ea] bg-[#fff1f1] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a15f5f]">
                Чл. 4(5)
              </div>

              <h3 className="mt-3 text-xl font-semibold">
                По-малко строга цел
              </h3>

              <p className="mt-3 leading-7 text-[#637c82]">
                Определя се различна, по-малко строга цел
                за конкретен показател при официално
                обосновани условия.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо има отделна цел за питейните води?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато подземното водно тяло е свързано със
              зона за защита на води, предназначени за
              питейно-битово водоснабдяване, се посочва и
              специална цел за опазване на тези води.
            </p>

            <p>
              Целта може да бъде предотвратяване на
              влошаване или достигане на подходящи стойности
              по конкретни показатели. Това не заменя
              лабораторно изследване на вода от конкретен
              кладенец или сондаж.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как да прочетеш информацията в PRO анализа?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {practicalQuestions.map((question) => (
              <div
                key={question}
                className="bg-white p-6 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">
                  ✓
                </span>

                {question}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Най-важното
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Екологичната цел показва какво трябва да бъде
            постигнато или запазено за цялото подземно
            водно тяло. Срокът и изключението обясняват
            кога и при какви условия се очаква това,
            но не определят сами качеството на водата
            в конкретен имот.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 5: екологични цели
            за подземните водни тела, изключения от
            постигането на добро състояние и цели за
            зоните за защита на питейните води.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/rbmp-comparison"
            className="text-sm text-[#56818b]"
          >
            ← Сравнение между ПУРБ 2 и ПУРБ 3
          </Link>

          <Link
            href="/knowledge/water-quality/drinking-water-protection-zones"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Защита на питейните води →
          </Link>
        </div>
      </article>
    </main>
  );
}