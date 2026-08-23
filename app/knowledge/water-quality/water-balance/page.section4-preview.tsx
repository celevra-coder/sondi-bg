import Link from "next/link";

export const metadata = {
  title:
    "Какво показва официалният воден баланс? | Sondi.bg",
  description:
    "Разбираемо обяснение на разполагаемия ресурс, общото водовземане, самоснабдяването и водния баланс на подземните водни тела.",
};

export default function WaterBalanceKnowledgePage() {
  const balanceComponents = [
    {
      title: "Разполагаем ресурс",
      text:
        "Оцененото количество подземна вода, което участва в официалния баланс на водното тяло.",
    },
    {
      title: "Водовземане по разрешителни",
      text:
        "Оцененото използване, отчетено чрез разрешителните и данните на компетентните институции.",
    },
    {
      title: "Самоснабдяване на населението",
      text:
        "Допълнително оценено използване от собствени водоизточници извън основните централизирани системи.",
    },
    {
      title: "Общо водовземане",
      text:
        "Сборът от включените в оценката количества вода, използвани от подземното водно тяло.",
    },
  ];

  const useCategories = [
    "Обществено водоснабдяване",
    "Земеделие",
    "Промишленост",
    "Аквакултури",
    "Битово самоснабдяване",
    "Туризъм и рекреация",
    "Други цели",
  ];

  const exampleRows = [
    {
      label: "Разполагаем ресурс",
      value: "3 359,11 l/s",
    },
    {
      label: "Разполагаем ресурс за година",
      value: "105 932 795 m³/год.",
    },
    {
      label: "Водовземане по данни на дирекциите",
      value: "59 831 579 m³/год.",
    },
    {
      label: "Самоснабдяване на населението",
      value: "1 676 769 m³/год.",
    },
    {
      label: "Общо водовземане",
      value: "61 508 348 m³/год.",
    },
    {
      label: "Експлоатационен индекс",
      value: "0,581 · приблизително 58%",
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
            Какво показва
            <br />
            официалният воден баланс?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Водният баланс сравнява оценения
            разполагаем ресурс на подземното водно тяло
            с количеството вода, което се използва.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Баланс между ресурс и използване
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подземното водно тяло получава вода чрез
              подхранване и губи вода чрез естествен
              отток и водовземане. Официалният баланс
              използва наличните оценки, за да покаже
              каква част от разполагаемия ресурс се
              използва.
            </p>

            <p>
              Той е основна част от количествената
              оценка, но се разглежда заедно с водните
              нива, свързаните води, екосистемите и
              останалите приложими тестове.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Основни части на баланса
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {balanceComponents.map((item) => (
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

        <div className="my-14 border border-[#cfe1e5] bg-[#f4fafb] p-8 text-center">
          <div className="text-sm uppercase tracking-[0.18em] text-[#62929d]">
            Опростено представяне
          </div>

          <div className="mt-5 text-xl font-semibold">
            Разполагаем ресурс
          </div>

          <div className="my-3 text-2xl text-[#7d9da4]">
            спрямо
          </div>

          <div className="text-xl font-semibold">
            Общо водовземане
          </div>

          <div className="mt-5 text-sm leading-7 text-[#6b8187]">
            Съотношението между двете участва в
            изчисляването на експлоатационния индекс.
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо се използват l/s и m³/год.?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Литрите в секунда показват среден дебит.
              Кубичните метри за година показват
              приблизителния годишен обем, съответстващ
              на този дебит или на отчетеното използване.
            </p>

            <p>
              Двете единици описват количеството по
              различен начин. При сравнение стойностите
              трябва да бъдат приведени към еднакъв
              период и мерна единица.
            </p>
          </div>

          <div className="mt-8 bg-[#edf8fa] p-7">
            <div className="font-semibold">
              Приблизително преобразуване
            </div>

            <p className="mt-3 leading-7 text-[#5b767d]">
              1 l/s при непрекъснат среден дебит
              съответства на около 31 536 m³ за една
              година.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Реален пример от Раздел 4
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            ПВТ BG3G00000NQ018
          </h2>

          <div className="mt-8 border-t border-[#dce8ea]">
            {exampleRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 border-b border-[#dce8ea] py-5 md:grid-cols-[1fr_240px]"
              >
                <strong>{row.label}</strong>

                <span className="font-semibold text-[#2c8498] md:text-right">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 leading-7 text-[#637c82]">
            В този пример количественото състояние е
            оценено като добро, а общото използване е
            приблизително 58% от разполагаемия ресурс.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            За какво се използва водата?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Разделянето по предназначение показва кои
            дейности участват във водовземането. В PRO
            анализа подробните количества са групирани
            в следните категории:
          </p>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {useCategories.map((category) => (
              <div
                key={category}
                className="bg-white p-5 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">
                  ✓
                </span>
                {category}
              </div>
            ))}
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Водният баланс не показва количеството вода,
            съхранено под земята
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Той е управленска оценка на ресурса и
            използването за определен период. Не трябва
            да се чете като точен обем на цялата вода,
            която физически се намира в скалите и
            седиментите.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво може да промени баланса?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border border-[#dce8ea] p-6">
              <strong>Промяна в подхранването</strong>

              <p className="mt-3 leading-7 text-[#637c82]">
                Валежи, засушаване, климатични промени и
                връзката с повърхностните води могат да
                променят ресурса.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <strong>Промяна във водовземането</strong>

              <p className="mt-3 leading-7 text-[#637c82]">
                Нови водоизточници, разрешителни и
                увеличено потребление могат да променят
                използваното количество.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Какво означава за конкретен имот?
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Добрият регионален воден баланс не гарантира
            определен дебит на конкретна точка.
            Наличието и добивът на вода зависят от
            местната геология, водоносния пласт,
            дълбочината и конструкцията на сондажа.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – тест за воден
            баланс, оценка на водовземането и
            количественото състояние на подземните
            водни тела.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/monitoring-exceedances"
            className="text-sm text-[#56818b]"
          >
            ← Мониторинг и превишения
          </Link>

          <Link
            href="/knowledge/water-quality/rbmp-comparison"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Сравнение ПУРБ 2 и ПУРБ 3 →
          </Link>
        </div>
      </article>
    </main>
  );
}