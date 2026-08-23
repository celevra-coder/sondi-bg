import Link from "next/link";

export const metadata = {
  title:
    "Как се четат мониторинговите данни и превишенията? | Sondi.bg",
  description:
    "Разбираемо обяснение на мониторинговите пунктове, показателите, средните стойности, нормите и установените превишения.",
};

export default function MonitoringExceedancesKnowledgePage() {
  const recordFields = [
    {
      title: "Мониторингов пункт",
      text:
        "Мястото, от което са вземани проби или са извършвани наблюдения.",
    },
    {
      title: "Показател",
      text:
        "Изследваното вещество или характеристика – например нитрати, сулфати, манган или обща алфа-активност.",
    },
    {
      title: "Средна стойност",
      text:
        "Обобщена стойност от наличните резултати за разглеждания период, а не непременно най-високото единично измерване.",
    },
    {
      title: "Стандарт или норма",
      text:
        "Официалната стойност, спрямо която се проверява дали е налице превишение.",
    },
    {
      title: "Превишение",
      text:
        "Отбелязва се, когато използваната стойност е над приложимия стандарт за съответния показател.",
    },
  ];

  const exampleExceedances = [
    {
      station: "Борец, ПС – Сондаж",
      indicator: "Обща алфа-активност",
      value: "0,376",
      standard: "0,1",
      unit: "Bq/l",
    },
    {
      station: "Първомай, Сондаж",
      indicator: "Естествен уран",
      value: "0,0415",
      standard: "0,03",
      unit: "mg/l",
    },
    {
      station: "Браниполе, ПС-ПБВ",
      indicator: "Нитрати",
      value: "55,25",
      standard: "50",
      unit: "mg/l",
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
            Как се четат мониторинговите
            <br />
            данни и превишенията?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Мониторингът показва къде е наблюдавана
            водата, какви показатели са изследвани и
            дали отчетените стойности превишават
            приложимите стандарти.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Всеки запис отговаря на няколко въпроса
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            За да се разбере един мониторингов резултат,
            трябва едновременно да се видят мястото,
            показателят, използваната стойност, мерната
            единица и стойността, с която е сравнена.
          </p>

          <div className="mt-8 grid gap-4">
            {recordFields.map((field, index) => (
              <div
                key={field.title}
                className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[50px_200px_1fr]"
              >
                <div className="text-sm font-semibold text-[#6b9aa5]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <strong className="text-[#244b55]">
                  {field.title}
                </strong>

                <p className="leading-7 text-[#637c82]">
                  {field.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Брой превишения и брой пунктове не са едно
            и също
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Един мониторингов пункт може да има
            превишения по няколко различни показателя.
            Затова девет превишения не означават
            непременно девет различни проблемни пункта.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава средна стойност?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              В официалните таблици може да бъде
              използвана средна стойност от няколко
              измервания. Тя обобщава наблюденията за
              определен период и не показва задължително
              най-ниския или най-високия отделен резултат.
            </p>

            <p>
              Когато средната стойност е над стандарта,
              в PRO анализа записът се показва като
              установено превишение.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Как се прави сравнението?
          </div>

          <div className="mt-8 border border-[#dce8ea] bg-[#f6fbfc] p-8">
            <div className="grid gap-6 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#6d969f]">
                  Измерена стойност
                </div>

                <div className="mt-3 text-xl font-semibold">
                  55,25 mg/l
                </div>
              </div>

              <div className="text-2xl text-[#7d9da4]">
                &gt;
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#6d969f]">
                  Стандарт
                </div>

                <div className="mt-3 text-xl font-semibold">
                  50 mg/l
                </div>
              </div>

              <div className="text-2xl text-[#7d9da4]">
                =
              </div>

              <div className="bg-[#fff1f1] p-4 font-semibold text-[#963e3e]">
                Превишение
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Реални примери от Раздел 4
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            ПВТ BG3G00000NQ018
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            За водното тяло в района Пазарджик–Пловдив
            са отчетени девет превишения. Те включват
            обща алфа-активност, естествен уран, нитрати
            и ортофосфати.
          </p>

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[720px] border-t border-[#dce8ea]">
              <div className="grid grid-cols-[1.4fr_1fr_.55fr_.55fr_.4fr] gap-4 border-b border-[#dce8ea] bg-[#f6fbfc] px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d969f]">
                <div>Пункт</div>
                <div>Показател</div>
                <div>Стойност</div>
                <div>Норма</div>
                <div>Единица</div>
              </div>

              {exampleExceedances.map((item) => (
                <div
                  key={`${item.station}-${item.indicator}`}
                  className="grid grid-cols-[1.4fr_1fr_.55fr_.55fr_.4fr] gap-4 border-b border-[#dce8ea] px-4 py-5 text-sm"
                >
                  <div>{item.station}</div>
                  <div>{item.indicator}</div>
                  <div className="font-semibold text-[#a33f3f]">
                    {item.value}
                  </div>
                  <div>{item.standard}</div>
                  <div>{item.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо мерната единица е задължителна?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Числото няма смисъл без мерната единица.
              Стойност в mg/l не може да се сравнява
              директно със стойност в µg/l или Bq/l.
            </p>

            <p>
              Показатели като нитрати, метали и
              радиоактивност могат да използват различни
              единици и различни стандарти.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво не може да се заключи?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border border-[#dce8ea] p-6">
              <strong>
                Не може да се приеме, че всички пунктове
                са замърсени
              </strong>

              <p className="mt-3 leading-7 text-[#637c82]">
                Превишението е свързано с конкретен пункт,
                показател и период.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <strong>
                Не може да се приеме, че всяка проба е
                над нормата
              </strong>

              <p className="mt-3 leading-7 text-[#637c82]">
                Показаната стойност може да е средна от
                няколко отделни измервания.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Какво означава за конкретен имот?
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Близък мониторингов пункт дава важна
            информация за района, но не замества проба
            от конкретния водоизточник. Подземната вода
            може да се различава според пласта,
            дълбочината и местните условия.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – програми за
            мониторинг, резултати за питейни води и
            оценка на химичното състояние.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/upward-trend"
            className="text-sm text-[#56818b]"
          >
            ← Възходяща тенденция
          </Link>

          <Link
            href="/knowledge/water-quality/water-balance"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Официален воден баланс →
          </Link>
        </div>
      </article>
    </main>
  );
}