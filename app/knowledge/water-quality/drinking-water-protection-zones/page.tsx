import Link from "next/link";

export default function DrinkingWaterProtectionZonesPage() {
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
            Защита на водите
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Зони за защита на подземни води
            <br />
            за питейни нужди
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Тези зони показват кои подземни води имат важно значение
            за питейно-битовото водоснабдяване и са включени
            в официалната система за защита и наблюдение.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво показва картата?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              На картата са показани подземните водни тела,
              чиито води се използват или са предназначени
              за питейно-битово водоснабдяване.
            </p>

            <p>
              Това позволява да се види къде в даден район
              подземните води имат особено значение като източник
              за населението и къде се прилагат мерки за тяхното
              опазване.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Официална карта
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Зоните за защита в региона
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Различните цветове показват отделни подземни водни тела
            и геоложки комплекси. Така може да се проследи
            как са разположени защитените води в по-голям регионален мащаб.
          </p>

          <div className="mt-8 overflow-hidden border border-[#d7e5e8] bg-[#f6fbfc]">
            <img
              src="/knowledge/groundwater-protection/gwb-protection-map.png"
              alt="Карта на зоните за защита на подземни води за питейно-битово водоснабдяване"
              className="block h-auto w-full"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/knowledge/groundwater-protection/gwb-protection-map.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#173d47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245762]"
            >
              Отвори картата в PDF →
            </a>

            <a
              href="/knowledge/groundwater-protection/gwb-protection-map.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-[#b8d7dd] px-5 py-3 text-sm font-semibold text-[#257589] transition hover:bg-[#edf8fa]"
            >
              Отвори в пълен размер
            </a>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо тези зони са важни?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {[
              {
                title: "Питейно водоснабдяване",
                text:
                  "Показват кои подземни води имат значение за снабдяването на населението с вода.",
              },
              {
                title: "Опазване на качеството",
                text:
                  "В тези райони качеството на водата е особено важно и подлежи на наблюдение и защита.",
              },
              {
                title: "Регионална картина",
                text:
                  "Картата помага да се разбере как различните водни тела са разположени в рамките на района.",
              },
              {
                title: "Връзка с геологията",
                text:
                  "Защитените води са свързани с различни геоложки комплекси и водоносни системи.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6"
              >
                <div className="font-semibold text-[#173d47]">
                  {item.title}
                </div>

                <p className="mt-2 text-sm leading-6 text-[#637c82]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво може да разбереш за своя район?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Ако районът попада в такава зона, това означава,
              че подземните води там имат значение за
              питейно-битовото водоснабдяване и са включени
              в официалния регистър за защита.
            </p>

            <p>
              Това е полезна информация, когато искаме да разберем
              значението на местните подземни води и начина,
              по който те се управляват и опазват.
            </p>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Добре е да знаеш
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Картата дава регионална информация за защитените
            подземни води. За конкретен имот допълнителни данни
            идват от геологията, местните водоносни пластове
            и проучванията на самия терен.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 3, Приложение 3.1.2.1 –
            подземни води, предназначени за питейно-битово
            водоснабдяване.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality"
            className="text-sm text-[#56818b]"
          >
            ← Качество и състояние
          </Link>

          <Link
            href="/knowledge"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Всички теми →
          </Link>
        </div>
      </article>
    </main>
  );
}