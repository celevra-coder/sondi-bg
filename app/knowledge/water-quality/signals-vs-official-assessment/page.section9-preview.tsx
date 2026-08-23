import Link from "next/link";

export const metadata = {
  title:
    "Сигнал, становище и официална оценка: разлики | Sondi.bg",
  description:
    "Каква е разликата между сигнал за замърсяване, експертно становище, официална оценка, мониторингов резултат и лабораторна проба от конкретен сондаж.",
};

export default function SignalsVsOfficialAssessmentKnowledgePage() {
  const informationTypes = [
    {
      title: "Сигнал",
      label: "Поставен въпрос",
      text:
        "Съобщение за наблюдаван или предполагаем проблем, което насочва вниманието към необходимост от проверка.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Становище",
      label: "Аргументирана позиция",
      text:
        "Писмено мнение на гражданин, специалист, организация или институция относно конкретен проблем или проект.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "Официална оценка",
      label: "Оценка за водното тяло",
      text:
        "Институционална оценка на химичното или количественото състояние на цялото подземно водно тяло.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Лабораторна проба",
      label: "Резултат за конкретна вода",
      text:
        "Изследване на проба от определен сондаж, кладенец или водоизточник в конкретен момент.",
      tone: "bg-[#f3f1fa]",
    },
  ];

  const interpretationExamples = [
    {
      situation:
        "Има сигнал за промишлено замърсяване в района.",
      correct:
        "Необходимо е да се провери какво точно е установено и дали има официални данни.",
      incorrect:
        "Всички сондажи в района със сигурност са замърсени.",
    },
    {
      situation:
        "Подземното водно тяло е с лошо химично състояние.",
      correct:
        "Има официално установен проблем на равнище водно тяло, който изисква внимание.",
      incorrect:
        "Водата във всеки отделен имот непременно е негодна.",
    },
    {
      situation:
        "Отделна водна проба показва превишение.",
      correct:
        "За конкретната проба и конкретния показател е установена стойност над съответната граница.",
      incorrect:
        "Цялото подземно водно тяло задължително е замърсено.",
    },
    {
      situation:
        "В обществена консултация е предложена нова мярка.",
      correct:
        "Поставен е въпрос, който може да бъде приет, отхвърлен или проучен допълнително.",
      incorrect:
        "Мярката вече е изпълнена и проблемът е отстранен.",
    },
  ];

  const verificationQuestions = [
    "Кой е източникът на информацията?",
    "Става ли дума за сигнал или за официална оценка?",
    "Кое място или водно тяло е засегнато?",
    "Посочен ли е конкретен замърсител?",
    "Има ли измерване или лабораторен резултат?",
    "За коя дата и кой пункт се отнасят данните?",
    "Сравнени ли са стойностите с приложим стандарт?",
    "Има ли официално предприети мерки?",
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
            Надеждност на информацията · Раздел 9
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Сигнал, становище
            <br />
            и официална оценка
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Как да различим поставен проблем от доказан
            резултат и защо не всяка тревожна информация
            описва водата в конкретния имот.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо е важно да различаваме източниците?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Информацията за подземните води може да идва
              от обществени консултации, институционални
              доклади, мониторингови пунктове или
              лабораторни изследвания.
            </p>

            <p>
              Тези източници не казват едно и също. Част
              от тях поставят въпрос, други дават официална
              оценка за голям район, а трети показват
              резултат за конкретно взета проба.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Четири различни вида информация
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {informationTypes.map((item) => (
              <div
                key={item.title}
                className={
                  `border border-[#dce8ea] p-6 ${item.tone}`
                }
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  {item.label}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[#244b55]">
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
            Кога сигналът става потвърден проблем?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Сигналът може да бъде основание за проверка,
              но сам по себе си не доказва наличие на
              замърсяване. Потвърждението изисква данни
              от подходящо изследване, мониторинг или
              официална институционална оценка.
            </p>

            <p>
              Дори при установен проблем е необходимо да
              се уточнят мястото, показателят, периодът
              и мащабът на въздействието.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Сигналът не е равнозначен на лабораторно доказателство.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Преди да се правят изводи за конкретен имот,
              трябва да се провери какъв е източникът и
              дали информацията е потвърдена.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Правилно и неправилно тълкуване
          </h2>

          <div className="mt-8 grid gap-5">
            {interpretationExamples.map((example) => (
              <div
                key={example.situation}
                className="border border-[#dce8ea] bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {example.situation}
                </h3>

                <div className="mt-4 border-l-4 border-[#85bf96] bg-[#eef8f2] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#39734b]">
                    Правилно тълкуване
                  </div>

                  <p className="mt-2 leading-7 text-[#536f76]">
                    {example.correct}
                  </p>
                </div>

                <div className="mt-3 border-l-4 border-[#d99a9a] bg-[#fff1f1] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#945858]">
                    Неправилно тълкуване
                  </div>

                  <p className="mt-2 leading-7 text-[#536f76]">
                    {example.incorrect}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво да провериш?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {verificationQuestions.map((question) => (
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
            Сигналът показва, че е поставен въпрос.
            Официалната оценка описва състоянието на
            подземното водно тяло. Лабораторната проба
            дава информация за конкретно изследвана вода.
            Тези три неща не трябва да се смесват.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 9: регистри на
            становищата и обществените консултации;
            Раздел 4: официални оценки и мониторинг на
            подземните водни тела.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/public-consultations"
            className="text-sm text-[#56818b]"
          >
            ← Обществени консултации
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