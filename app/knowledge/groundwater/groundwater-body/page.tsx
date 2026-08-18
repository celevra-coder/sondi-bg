import Link from "next/link";

export default function GroundwaterBodyPage() {
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
            Основи · 03
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е подземно
            <br />
            водно тяло?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Подземното водно тяло, или ПВТ, е регионална единица,
            чрез която подземните води се описват, наблюдават
            и управляват.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            ПВТ не е просто „един пласт вода“
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Едно подземно водно тяло може да обхваща голяма
              територия и да включва геоложки пластове със сходни
              хидрогеоложки характеристики.
            </p>

            <p>
              То е удобен начин институциите да следят количеството,
              качеството, натиска и състоянието на подземните води
              в регионален мащаб.
            </p>
          </div>
        </section>

        <div className="my-12 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Важно разграничение
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <strong>Водоносен пласт</strong>
              <p className="mt-2 leading-7 text-white/70">
                Реална геоложка среда, през която може да се
                съхранява и движи вода.
              </p>
            </div>

            <div>
              <strong>Подземно водно тяло</strong>
              <p className="mt-2 leading-7 text-white/70">
                Регионална единица за управление и оценка
                на подземните води.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо ПВТ са толкова големи?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Подземните системи не следват границите на имоти,
            села или общини. Един водоносен комплекс може да
            преминава под голяма територия и да се подхранва
            на едно място, докато водата се използва на друго.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво се оценява за едно ПВТ?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {[
              "Химично състояние",
              "Количествено състояние",
              "Натиск от водовземане",
              "Натиск от замърсяване",
              "Риск от непостигане на добро състояние",
              "Мониторингови резултати",
            ].map((item) => (
              <div
                key={item}
                className="bg-white p-6 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">✓</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо една точка може да попада в две ПВТ?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Картата е двуизмерна, а подземната геология е
            триизмерна. На една и съща координата могат да
            присъстват различни водоносни системи на различна
            дълбочина. Затова границите на ПВТ могат да се
            припокриват върху картата.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Какво означава това за конкретен имот?</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Фактът, че имотът попада в ПВТ, дава ценен регионален
            контекст, но не определя автоматично точната дълбочина,
            дебита или качеството на водата в бъдещ сондаж.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/aquifer"
            className="text-sm text-[#56818b]"
          >
            ← Водоносен пласт
          </Link>

          <Link
            href="/knowledge/groundwater/types"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Видове подземни води →
          </Link>
        </div>
      </article>
    </main>
  );
}