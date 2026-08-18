import Link from "next/link";

export default function WaterLevelPage() {
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
            Практически въпроси · 04
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е
            <br />
            водно ниво?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Водното ниво показва докъде се установява водата
            в кладенец, сондаж или наблюдателен пункт.
            То не е непременно същото като дълбочината,
            на която е пресечен водоносният пласт.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Статично водно ниво
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Това е нивото, на което водата се установява в
            съоръжението, когато не се изпомпва и системата е
            имала достатъчно време да се възстанови.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Динамично водно ниво
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Когато помпата работи, нивото обикновено се понижава.
            Нивото по време на водочерпене се нарича динамично
            или работно водно ниво.
          </p>
        </section>

        <div className="my-12 grid gap-5 md:grid-cols-2">
          <div className="bg-[#edf8fa] p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-[#438594]">
              Преди изпомпване
            </div>
            <div className="mt-3 text-2xl font-semibold">
              Статично ниво
            </div>
            <p className="mt-3 leading-7 text-[#5d777e]">
              Показва естественото установено ниво в сондажа.
            </p>
          </div>

          <div className="bg-[#f5f8f8] p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-[#65858b]">
              При изпомпване
            </div>
            <div className="mt-3 text-2xl font-semibold">
              Динамично ниво
            </div>
            <p className="mt-3 leading-7 text-[#5d777e]">
              Показва как системата реагира при реално водочерпене.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е понижение?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Разликата между статичното и динамичното ниво показва
            колко се понижава водата при дадено водочерпене.
            Това е важна информация за поведението на водоносния пласт.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Водното ниво се променя във времето
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Нивото може да се изменя сезонно, вследствие на суша,
            валежи, водочерпене или промяна в подхранването.
            Затова едно единично измерване показва състоянието
            в конкретен момент, а не постоянна стойност завинаги.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Не бъркай водно ниво с дълбочина на сондажа</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Сондаж с дълбочина 80 m може например да има вода,
            установена много по-високо в тръбата. Двете стойности
            описват различни неща.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/why-wells-dry"
            className="text-sm text-[#56818b]"
          >
            ← Защо сондажът пресъхва?
          </Link>

          <Link
            href="/knowledge/groundwater/is-groundwater-static"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Подземната вода стои ли на едно място? →
          </Link>
        </div>
      </article>
    </main>
  );
}