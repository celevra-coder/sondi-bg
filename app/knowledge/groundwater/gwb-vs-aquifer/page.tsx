import Link from "next/link";

export default function GwbVsAquiferPage() {
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
            Как да четем картата · 01
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            ПВТ и водоносен пласт –
            <br />
            каква е разликата?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Двете понятия са свързани, но описват различни неща.
            Водоносният пласт е реалната геоложка среда, а ПВТ е
            регионална единица, използвана за управление и наблюдение.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Водоносният пласт е геологията
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Това може да бъде пласт от пясък и чакъл, напукана
            скала или друга среда, която съдържа и пропуска вода.
            Именно такава структура реално може да бъде пресечена
            от сондаж.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            ПВТ е регионална единица
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Подземното водно тяло обхваща определена територия
            и се използва за оценяване на състоянието, натиска,
            риска и мониторинга на подземните води.
          </p>
        </section>

        <div className="my-12 grid gap-5 md:grid-cols-2">
          <div className="border border-[#dce8ea] bg-[#f6fbfc] p-7">
            <div className="text-xl font-semibold">
              Водоносен пласт
            </div>
            <p className="mt-3 leading-7 text-[#607b82]">
              Реална физическа среда под земята.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6c858b]">
              Пясък, чакъл, напукана скала, карст и други
              водопропускливи материали.
            </p>
          </div>

          <div className="border border-[#dce8ea] bg-white p-7">
            <div className="text-xl font-semibold">
              Подземно водно тяло
            </div>
            <p className="mt-3 leading-7 text-[#607b82]">
              Регионална единица за управление.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6c858b]">
              Има официален код, граници, състояние,
              мониторинг и оценки на риска.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо това е важно при работа с картата?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Когато картата показва, че една координата попада в
            определено ПВТ, това не означава, че на точно тази
            координата започва конкретен водоносен пласт на
            определена дълбочина.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            ПВТ дава регионалния хидрогеоложки контекст.
            За конкретната подземна структура е нужна
            по-детайлна информация.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Най-просто казано</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            ПВТ показва към коя по-голяма система принадлежи районът.
            Водоносният пласт е това, което реално трябва да бъде
            намерено и пресечено при сондиране.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater"
            className="text-sm text-[#56818b]"
          >
            ← Всички теми
          </Link>

          <Link
            href="/knowledge/groundwater/gwb-overlap"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Защо ПВТ се припокриват? →
          </Link>
        </div>
      </article>
    </main>
  );
}