import Link from "next/link";

export const metadata = {
  title:
    "Как обществените консултации променят ПУРБ | Sondi.bg",
  description:
    "Как граждани, организации, ВиК оператори и специалисти участват в обсъждането на плановете за управление на речните басейни и как предложенията се превръщат в официални мерки.",
};

export default function PublicConsultationsKnowledgePage() {
  const participants = [
    {
      title: "Граждани и местни общности",
      text:
        "Могат да посочат наблюдавани проблеми, промени във водоснабдяването или опасения за местната среда.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Екологични организации",
      text:
        "Представят становища за натиск, замърсяване, пропуски в оценките и необходимост от допълнителни мерки.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "ВиК оператори и общини",
      text:
        "Поставят въпроси за водоизточниците, разрешителните, защитените зони и практическите проблеми при водоснабдяването.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Специалисти и научни организации",
      text:
        "Дават експертни предложения за мониторинга, методиките, конкретни замърсители и необходимите проучвания.",
      tone: "bg-[#f3f1fa]",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Публикуване на проект или междинен преглед",
      text:
        "Басейновата дирекция представя проект на план, доклад или друг документ за обществено обсъждане.",
    },
    {
      number: "02",
      title: "Подаване на становища и предложения",
      text:
        "Граждани, организации и институции посочват проблеми, липсващи данни или конкретни предложения.",
    },
    {
      number: "03",
      title: "Преглед и официален отговор",
      text:
        "Компетентните институции разглеждат предложенията и отбелязват дали ги приемат, отхвърлят или приемат частично.",
    },
    {
      number: "04",
      title: "Отразяване в окончателния план",
      text:
        "Приетите предложения могат да доведат до ново проучване, допълнителен мониторинг или промяна в програмата от мерки.",
    },
  ];

  const practicalQuestions = [
    "Кой е подал становището?",
    "Какъв проблем е поставен?",
    "Посочено ли е конкретно място?",
    "Има ли официален отговор?",
    "Прието ли е предложението?",
    "Предвидено ли е допълнително проучване?",
    "Отразено ли е в окончателните мерки?",
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
            Обществени консултации · Раздел 9
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как обществените
            <br />
            консултации променят ПУРБ
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Как граждани, специалисти и организации поставят
            въпроси за водите и как техните предложения могат
            да повлияят на официалните планове и мерки.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво представлява обществената консултация?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Планът за управление на речните басейни не се
              изготвя само чрез вътрешна работа на
              институциите. Преди окончателното му приемане
              заинтересованите страни могат да разгледат
              публикуваните документи и да представят своите
              становища.
            </p>

            <p>
              Това позволява да бъдат поставени въпроси за
              местни проблеми, пропуски в наличната информация,
              възможни източници на замърсяване и необходимост
              от допълнителен контрол.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кой участва?
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {participants.map((participant) => (
              <div
                key={participant.title}
                className={
                  `border border-[#dce8ea] p-6 ${participant.tone}`
                }
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {participant.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {participant.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как предложението стига до официалния план?
          </h2>

          <div className="mt-8 grid gap-5">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 border border-[#dce8ea] bg-white p-6 md:grid-cols-[70px_1fr]"
              >
                <div className="text-2xl font-semibold text-[#438594]">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#244b55]">
                    {step.title}
                  </h3>

                  <p className="mt-2 leading-7 text-[#637c82]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какви въпроси са поставяни за подземните води?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              В документите по обществените консултации са
              обсъждани въпроси за химичното състояние,
              индустриалния натиск, разрешителните за
              водовземане, защитата на питейните водоизточници
              и необходимостта от по-добър мониторинг.
            </p>

            <p>
              Част от становищата поставят конкретни местни
              проблеми, а други са насочени към методиката,
              достъпността на информацията и програмата от
              мерки за целия басейнов район.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Подаденият сигнал не е автоматично доказан факт.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Становището показва, че е поставен въпрос.
              За потвърждение са необходими официални данни,
              мониторинг, проверка или лабораторен анализ.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо това има значение за собственика на имот?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Обществените консултации дават контекст за
              проблемите, които са обсъждани в даден район.
              Те могат да насочат вниманието към теми като
              промишлен натиск, недостиг на данни или нужда
              от допълнително наблюдение.
            </p>

            <p>
              Това обаче не определя само по себе си
              качеството, дебита или годността на водата от
              конкретен сондаж.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как да четеш подобна информация?
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
            Обществените консултации позволяват проблемите
            с водите да бъдат поставени пред институциите.
            Приетите предложения могат да доведат до
            проучвания и мерки, но самото становище не е
            равнозначно на официална оценка за конкретен имот.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 9: обществени
            консултации, регистри на постъпилите становища,
            проведени срещи и официални отговори по проекта
            на плана за Източнобеломорски район.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/environmental-objectives-exemptions"
            className="text-sm text-[#56818b]"
          >
            ← Екологични цели и срокове
          </Link>

          <Link
            href="/knowledge/water-quality"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Всички материали →
          </Link>
        </div>
      </article>
    </main>
  );
}