import Link from "next/link";

export const metadata = {
  title:
    "Коя институция отговаря за сондажите и подземните води? | Sondi.bg",
  description:
    "Към кого да се обърнеш при въпроси за подземни води, водовземане, разрешителни, мониторинг, защитени зони и басейнови дирекции.",
};

export default function GroundwaterCompetentAuthoritiesKnowledgePage() {
  const institutions = [
    {
      title: "Басейнова дирекция",
      label: "Управление на басейново ниво",
      text:
        "Участва в управлението на водите за съответния район, поддържа регистри, организира дейности по оценка и издава разрешителни в предвидените от закона случаи.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "Министерство на околната среда и водите",
      label: "Национална политика",
      text:
        "Провежда държавната политика по управление на водите и координира дейността на басейновите дирекции и мониторинга.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Изпълнителна агенция по околна среда",
      label: "Мониторинг и данни",
      text:
        "Участва в изпълнението на мониторинга на водите и в събирането на данни за тяхното състояние.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Здравни органи и ВиК оператори",
      label: "Питейна вода и водоснабдяване",
      text:
        "Имат отношение към питейното водоснабдяване и контрола в рамките на своите компетентности.",
      tone: "bg-[#f3f1fa]",
    },
  ];

  const basinDistricts = [
    {
      title: "Дунавски район",
      center: "Плевен",
      description:
        "Обхваща водосборите на реките от Дунавския район и съответните подземни води.",
    },
    {
      title: "Черноморски район",
      center: "Варна",
      description:
        "Обхваща водосборите на реките, които се вливат в Черно море.",
    },
    {
      title: "Източнобеломорски район",
      center: "Пловдив",
      description:
        "Обхваща водосборите на Марица, Тунджа, Арда и Бяла река.",
    },
    {
      title: "Западнобеломорски район",
      center: "Благоевград",
      description:
        "Обхваща водосборите на Струма, Места и Доспат.",
    },
  ];

  const practicalQuestions = [
    {
      question: "Къде се проверява към кой район попада имотът?",
      answer:
        "Проверява се по местоположението на имота и обхвата на съответната басейнова дирекция.",
    },
    {
      question: "Кой поддържа официални данни за водните тела?",
      answer:
        "Басейновите дирекции поддържат специализирани данни, карти, регистри и информация за управлението на водите.",
    },
    {
      question: "Къде се поставят въпроси за водовземане?",
      answer:
        "Според конкретния случай и приложимите правила въпросите се насочват към компетентната басейнова дирекция или друг определен от закона орган.",
    },
    {
      question: "Кой участва в мониторинга?",
      answer:
        "Мониторингът се организира и изпълнява чрез компетентните институции и структури, включително басейновите дирекции и ИАОС.",
    },
    {
      question: "Къде се проверяват защитените водоизточници?",
      answer:
        "Информацията се проверява чрез официалните данни и регистри на компетентните институции за съответния район.",
    },
  ];

  const regionalOffices = [
    "Пазарджик",
    "Смолян",
    "Кърджали",
    "Хасково",
    "Сливен",
    "Стара Загора",
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
            Компетентни институции · Раздел 11
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Коя институция
            <br />
            отговаря за подземните води?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Каква е ролята на басейновите дирекции,
            министерствата и институциите при управлението
            на водите, мониторинга и водовземането.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кой управлява водите в България?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Управлението на водите се осъществява на
              национално и басейново ниво. Националната
              политика се координира от компетентните
              министерства, а басейновите дирекции
              работят за определени водосборни райони.
            </p>

            <p>
              За собственик на имот най-важно обикновено
              е да установи коя басейнова дирекция
              отговаря за района, в който попада
              съответното място.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Основни институции и техните роли
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {institutions.map((institution) => (
              <div
                key={institution.title}
                className={
                  `border border-[#dce8ea] p-6 ${institution.tone}`
                }
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  {institution.label}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[#244b55]">
                  {institution.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {institution.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво прави басейновата дирекция?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Басейновата дирекция участва в изготвянето
              на планове за управление, оценката на
              състоянието на водите, анализа на натиска
              и планирането на мерки.
            </p>

            <p>
              Тя поддържа специализирани данни и регистри,
              участва в мониторинга и упражнява
              правомощията си по разрешителни и контрол
              в предвидените от закона случаи.
            </p>

            <p>
              При определени процедури дирекцията издава
              становища за допустимост и участва в
              определянето на санитарно-охранителни зони.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Четирите басейнови района в България
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {basinDistricts.map((district) => (
              <div
                key={district.title}
                className="border border-[#dce8ea] bg-white p-6"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b9aa5]">
                  Център: {district.center}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[#244b55]">
                  {district.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {district.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Басейновите райони не съвпадат непременно
              с административните области.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Компетентната дирекция се определя според
              местоположението и водосборния район,
              а не само според областта или общината.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кой отговаря за Източнобеломорския район?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              За Източнобеломорския район компетентният
              басейнов орган е Басейнова дирекция
              „Източнобеломорски район“ с център Пловдив.
            </p>

            <p>
              Районът обхваща водосборите на Марица,
              Тунджа, Арда и Бяла река.
            </p>
          </div>

          <div className="mt-8 border border-[#dce8ea] bg-[#edf8fa] p-6">
            <h3 className="text-lg font-semibold text-[#244b55]">
              Регионални бюра, посочени в ПУРБ
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {regionalOffices.map((office) => (
                <div
                  key={office}
                  className="bg-white px-4 py-3 text-[#536f76]"
                >
                  {office}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Практически въпроси
          </h2>

          <div className="mt-8 grid gap-5">
            {practicalQuestions.map((item) => (
              <div
                key={item.question}
                className="border border-[#dce8ea] bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {item.question}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава това при проверка на имот?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Първата стъпка е да се установят
              местоположението на имота и съответното
              подземно водно тяло.
            </p>

            <p>
              След това могат да се проверят официалните
              данни за състоянието, риска, защитените
              зони, мониторинга и предвидените мерки.
            </p>

            <p>
              При въпроси за конкретна административна
              процедура се търси компетентната институция
              според действащите правила и особеностите
              на конкретния случай.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Информационната карта не замества
              официална административна консултация.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Изискванията и компетентният орган зависят
              от конкретния случай и приложимото
              законодателство.
            </p>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Най-важното
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Басейновите дирекции управляват водите
            по райони, а не просто по административни
            области. За въпроси относно водовземане,
            регистри, мониторинг и защитени зони трябва
            да се установи коя дирекция е компетентна
            за конкретното местоположение.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 11: компетентни
            органи за управление на водите на национално
            и басейново ниво в Източнобеломорски район.
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