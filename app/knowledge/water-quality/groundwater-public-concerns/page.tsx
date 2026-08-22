import Link from "next/link";

export const metadata = {
  title:
    "Проблеми с подземните води в обществените консултации | Sondi.bg",
  description:
    "Промишлен натиск, хром, уранодобив, мониторинг и водовземане: какво показват обществените становища за подземните води.",
};

export default function GroundwaterPublicConcernsKnowledgePage() {
  const publicConcerns = [
    {
      title: "Въпроси за хром в района на Ямбол",
      label: "Промишлен натиск",
      text:
        "По време на обществените консултации е поставен въпрос за замърсяване на подземни води с хром и възможностите за ограничаване на проблема.",
      clarification:
        "Това е поставен въпрос, а не доказателство, че всеки сондаж в района съдържа хром.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Индустриален натиск около „Марица-изток“",
      label: "Промишлена дейност",
      text:
        "Представено е становище за възможен натиск и замърсяване на повърхностни и подземни води около индустриалния комплекс.",
      clarification:
        "Опасенията трябва да се сравнят с официалните оценки и данните от мониторинга.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "Последици от уранодобив",
      label: "Историческа дейност",
      text:
        "Поставена е необходимостта от научна оценка и мерки за последиците от уранодобива върху подземните води.",
      clarification:
        "Споменаването на уранодобив не доказва наличие на уран в конкретен сондаж.",
      tone: "bg-[#fff1f1]",
    },
    {
      title: "Промени в подземните води около Марица",
      label: "Водни нива",
      text:
        "В становищата са поставени въпроси за понижаване на подземните води около река Марица.",
      clarification:
        "Подобни сигнали се проверяват чрез официален мониторинг и данни за количественото състояние.",
      tone: "bg-[#f3f1fa]",
    },
    {
      title: "Недостатъчни данни за област Смолян",
      label: "Липсваща информация",
      text:
        "Поставени са въпроси за наличните оценки и мерки за подземните водни тела в област Смолян.",
      clarification:
        "Недостатъчната информация не означава автоматично замърсена вода.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Разрешителни и защитени водоизточници",
      label: "Административни въпроси",
      text:
        "Обсъждани са процедури по водовземане, санитарно-охранителни зони и изисквания за изследване на водите.",
      clarification:
        "Административните затруднения не са равнозначни на установено замърсяване.",
      tone: "bg-[#f5f8f9]",
    },
  ];

  const verificationSteps = [
    "Провери кой е подал сигнала или становището.",
    "Уточни за кое населено място или район се отнася.",
    "Потърси официалната оценка за подземното водно тяло.",
    "Прегледай мониторинговите данни и установените показатели.",
    "Провери дали са предвидени конкретни мерки.",
    "Не прави извод за имота без надеждни местни данни.",
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
            Обществени сигнали · Раздел 9
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какви проблеми
            <br />
            са поставени за подземните води?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Примери от обществените консултации за
            замърсяване, водовземане, мониторинг и
            недостатъчна информация.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво показват обществените становища?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Граждани, специалисти, организации и
              институции могат да поставят въпроси за
              проблеми с подземните води при обсъждането
              на официалните планове.
            </p>

            <p>
              Тези становища дават важен контекст, но
              не представляват автоматично доказателство
              за замърсяване на конкретен имот.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Примери за поставени проблеми
          </h2>

          <div className="mt-8 grid gap-5">
            {publicConcerns.map((concern) => (
              <div
                key={concern.title}
                className={
                  `border border-[#dce8ea] p-6 ${concern.tone}`
                }
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  {concern.label}
                </div>

                <h3 className="mt-3 text-xl font-semibold text-[#244b55]">
                  {concern.title}
                </h3>

                <p className="mt-3 leading-7 text-[#536f76]">
                  {concern.text}
                </p>

                <div className="mt-4 border-t border-[#dce8ea] pt-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#507983]">
                    Правилно тълкуване
                  </div>

                  <p className="mt-2 leading-7 text-[#637c82]">
                    {concern.clarification}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо сигналът не е оценка за конкретен имот?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Обществените становища невинаги съдържат
              точни координати, код на подземно водно
              тяло или лабораторни резултати.
            </p>

            <p>
              Затова сигнал за даден район не трябва
              автоматично да се представя като установен
              проблем във всеки имот от този район.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Местният сигнал не е оценка за конкретен сондаж.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              За конкретна вода значение имат
              местоположението, официалните данни
              и лабораторните изследвания.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как да провериш подобна информация?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {verificationSteps.map((step) => (
              <div
                key={step}
                className="bg-white p-6 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">
                  ✓
                </span>

                {step}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Най-важното
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Обществените становища насочват вниманието
            към възможни проблеми, но за конкретен имот
            са необходими официални данни, надежден
            мониторинг и при необходимост лабораторно
            изследване.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 9: обществени
            консултации, становища и предложения за
            Източнобеломорски район.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/signals-vs-official-assessment"
            className="text-sm text-[#56818b]"
          >
            ← Сигнал и официална оценка
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