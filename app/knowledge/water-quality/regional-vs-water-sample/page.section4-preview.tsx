import Link from "next/link";

export const metadata = {
  title:
    "Регионална оценка и водна проба от конкретен сондаж | Sondi.bg",
  description:
    "Разликата между официалната регионална оценка на подземното водно тяло и лабораторното изследване на вода от конкретен кладенец или сондаж.",
};

export default function RegionalVsWaterSamplePage() {
  const regionalAssessment = [
    "Обхваща голямо подземно водно тяло",
    "Използва данни от официални мониторингови пунктове",
    "Показва химично и количествено състояние",
    "Показва риск, натиск и възходящи тенденции",
    "Сравнява резултати за по-дълъг период",
  ];

  const localSample = [
    "Отнася се за конкретен водоизточник",
    "Показва състава на взетата вода в момента на пробата",
    "Може да включва избрани химични показатели",
    "Може да включва микробиологични изследвания",
    "Резултатът зависи от правилното вземане и съхранение",
  ];

  const localInfluences = [
    {
      title: "Водоносен пласт",
      text:
        "Различните пластове могат да имат различен химичен състав дори на една и съща координата.",
    },
    {
      title: "Дълбочина",
      text:
        "Плитките и дълбоките води могат да се различават по произход, възраст и уязвимост към замърсяване.",
    },
    {
      title: "Конструкция на сондажа",
      text:
        "Филтрите, обсадните тръби и изолацията между пластовете могат да влияят върху получената вода.",
    },
    {
      title: "Местен източник на замърсяване",
      text:
        "Септични ями, земеделие, промишлена дейност или повърхностно проникване могат да създадат локален проблем.",
    },
    {
      title: "Период на пробата",
      text:
        "Сезонът, валежите, продължителността на работа и престоят на водата могат да повлияят върху резултата.",
    },
    {
      title: "Начин на пробовземане",
      text:
        "Неправилно взета, съхранявана или транспортирана проба може да даде подвеждащ резултат.",
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
            Регионална оценка
            <br />
            и водна проба от сондаж
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Официалната оценка на подземното водно тяло
            и лабораторният резултат от конкретен
            водоизточник дават различна, но взаимно
            допълваща се информация.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Два различни мащаба
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              PRO анализът използва официални данни за
              подземното водно тяло, в което попада
              избраната точка. Това водно тяло може да
              обхваща голяма територия и множество
              водоизточници.
            </p>

            <p>
              Лабораторната проба се взема от конкретен
              кладенец, сондаж или извор. Тя показва
              състава на тази вода към момента на
              пробовземането и за изследваните показатели.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="grid gap-px bg-[#dce8ea] md:grid-cols-2">
            <div className="bg-[#edf8fa] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#438594]">
                Регионална оценка
              </div>

              <h2 className="mt-3 text-2xl font-semibold">
                Подземно водно тяло
              </h2>

              <div className="mt-6 space-y-4">
                {regionalAssessment.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 leading-7 text-[#5b767d]"
                  >
                    <span className="text-[#2c8498]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fff8e8] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b19]">
                Локално изследване
              </div>

              <h2 className="mt-3 text-2xl font-semibold">
                Конкретна водна проба
              </h2>

              <div className="mt-6 space-y-4">
                {localSample.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 leading-7 text-[#715f3c]"
                  >
                    <span className="text-[#9a6b19]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Лошото регионално състояние не доказва, че
            всяка местна проба е над нормата
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Проблемът може да е установен само в част от
            мониторинговите пунктове или за определени
            показатели. Регионалната оценка показва какво
            трябва да се провери с повишено внимание.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Възможно ли е обратното?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Да. Водно тяло с добро общо състояние може
              да съдържа конкретен водоизточник с локален
              проблем. Причината може да бъде местно
              замърсяване, лоша конструкция или
              проникване на повърхностни води.
            </p>

            <p>
              Затова добрата регионална оценка не е
              гаранция, че водата от всеки кладенец или
              сондаж е подходяща за конкретна употреба.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Местни фактори
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Защо водата може да се различава?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {localInfluences.map((factor) => (
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
            Как се използват двете оценки заедно?
          </h2>

          <div className="mt-8 grid gap-4">
            <div className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[70px_1fr]">
              <div className="text-2xl font-semibold text-[#2c8498]">
                01
              </div>

              <div>
                <strong>
                  Провери регионалния контекст
                </strong>

                <p className="mt-2 leading-7 text-[#637c82]">
                  Виж химичното състояние, риска,
                  проблемните показатели и тенденциите
                  на водното тяло.
                </p>
              </div>
            </div>

            <div className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[70px_1fr]">
              <div className="text-2xl font-semibold text-[#2c8498]">
                02
              </div>

              <div>
                <strong>
                  Определи какво трябва да се изследва
                </strong>

                <p className="mt-2 leading-7 text-[#637c82]">
                  Регионалните проблемни показатели
                  помагат при избора на подходящ набор
                  от лабораторни изследвания.
                </p>
              </div>
            </div>

            <div className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[70px_1fr]">
              <div className="text-2xl font-semibold text-[#2c8498]">
                03
              </div>

              <div>
                <strong>
                  Изследвай конкретния водоизточник
                </strong>

                <p className="mt-2 leading-7 text-[#637c82]">
                  Лабораторният резултат показва
                  състоянието на конкретната проба за
                  включените показатели.
                </p>
              </div>
            </div>

            <div className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[70px_1fr]">
              <div className="text-2xl font-semibold text-[#2c8498]">
                04
              </div>

              <div>
                <strong>
                  Тълкувай резултатите според употребата
                </strong>

                <p className="mt-2 leading-7 text-[#637c82]">
                  Изискванията са различни според това
                  дали водата ще се използва за пиене,
                  битови нужди, напояване или друга цел.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Правилно пробовземане
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Пробата трябва да бъде взета, съхранена и
            транспортирана според указанията на избраната
            лаборатория. Подходящият съд, времето до
            анализа и начинът на вземане зависят от
            изследваните показатели.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кога е нужна нова проба?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {[
              "След изграждане или ремонт на водоизточника",
              "При промяна във вкус, мирис, цвят или мътност",
              "При съмнение за местен източник на замърсяване",
              "Когато водата ще се използва за питейни нужди",
              "При дълъг период без предишно изследване",
              "Когато регионалните данни показват нов проблем",
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

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – регионална оценка
            на химичното и количественото състояние,
            мониторинг, тенденции и проблемни показатели.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/rbmp-comparison"
            className="text-sm text-[#56818b]"
          >
            ← Сравнение ПУРБ 2 и ПУРБ 3
          </Link>

          <Link
            href="/knowledge/water-quality/drinking-water-protection-zones"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Зони за защита на водите →
          </Link>
        </div>
      </article>
    </main>
  );
}