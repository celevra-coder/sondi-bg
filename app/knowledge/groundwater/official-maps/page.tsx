import Link from "next/link";

export default function OfficialMapsPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link
            href="/knowledge/groundwater"
            className="text-sm text-[#4e8795] hover:text-[#173d47]"
          >
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как да четем картата · 03
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво показват
            <br />
            официалните карти?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Официалните карти дават регионален контекст за
            подземните води, геологията, мониторинга и състоянието
            на водните ресурси.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Картата събира информация за големи територии
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Регионалните карти са създадени, за да показват
            общата структура и състояние на водните и геоложките
            системи. Те не са сондажен разрез за всеки отделен имот.
          </p>
        </section>

        <div className="my-12 grid gap-px bg-[#dce8ea] md:grid-cols-2">
          {[
            {
              title: "Подземни водни тела",
              text: "Показват към кои официално определени водни системи принадлежи районът.",
            },
            {
              title: "Мониторингови пунктове",
              text: "Показват къде има официално наблюдение на нива, дебити или други показатели.",
            },
            {
              title: "Геоложка среда",
              text: "Дава регионална информация за геоложката възраст и основните геоложки единици.",
            },
            {
              title: "Разломи",
              text: "Показват картографирани активни структурни линии в регионален мащаб.",
            },
            {
              title: "Състояние и риск",
              text: "Позволяват да се разглежда химичното и количественото състояние на ПВТ.",
            },
            {
              title: "Натиск върху водите",
              text: "Може да се оценява влияние от водовземане, земеделие, населени места и други източници.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white p-6"
            >
              <strong>{item.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[#607b82]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо регионалната информация е полезна?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Тя помага да се разбере в каква среда се намира
            избраната точка и какви водни системи, геоложки условия
            и наблюдения има около нея.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Това е ценна първа стъпка преди по-детайлно проучване.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Мащабът има значение
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Колкото по-общ е мащабът на една карта, толкова по-малко
            е подходяща тя за точни заключения в рамките на един двор.
            Регионална граница може да бъде напълно подходяща за
            национален или басейнов анализ, но не и за определяне
            на точната литология под една сондажна точка.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Картата дава контекст, не окончателна присъда</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Най-полезна е, когато различните слоеве се разглеждат
            заедно и се интерпретират според техния мащаб и предназначение.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/gwb-overlap"
            className="text-sm text-[#56818b]"
          >
            ← Припокриване на ПВТ
          </Link>

          <Link
            href="/knowledge/groundwater/map-limitations"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво не може да покаже картата? →
          </Link>
        </div>
      </article>
    </main>
  );
}