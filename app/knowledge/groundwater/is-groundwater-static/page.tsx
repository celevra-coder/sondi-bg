import Link from "next/link";

export default function IsGroundwaterStaticPage() {
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
            Практически въпроси · 05
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Подземната вода
            <br />
            стои ли на едно място?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Обикновено не. Подземната вода е част от водния
            кръговрат и в повечето водоносни системи постепенно
            се движи от зоните на подхранване към местата,
            където се оттича или се черпи.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Движението често е много бавно
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            В река водата може да измине километри за часове.
            Под земята движението често е много по-бавно,
            защото водата преминава през тесни пори и пукнатини.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Скоростта обаче зависи силно от геоложката среда.
            В едри чакъли или развити карстови канали движението
            може да бъде значително по-бързо.
          </p>
        </section>

        <div className="my-12 bg-[#edf8fa] p-7">
          <div className="font-semibold">
            Водата се движи от по-висок към по-нисък хидравличен потенциал
          </div>

          <p className="mt-3 leading-7 text-[#5d777e]">
            Това не означава непременно, че тя просто следва
            наклона на земната повърхност. Подземният поток
            се определя и от геологията, налягането и връзката
            между водоносните пластове.
          </p>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Откъде тръгва и къде отива?
          </h2>

          <div className="mt-8 space-y-4">
            {[
              ["Подхранване", "Валежи, реки или други източници добавят вода към системата."],
              ["Движение", "Водата преминава през порите, пукнатините или карстовите канали."],
              ["Оттичане", "Подземната вода може да достигне извор, река, влажна зона или друга част на системата."],
              ["Водовземане", "Кладенци и сондажи също извеждат вода от водоносната система."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="grid gap-2 border-b border-[#dce8ea] py-5 md:grid-cols-[160px_1fr]"
              >
                <strong>{title}</strong>
                <p className="leading-7 text-[#607b82]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо това е важно при замърсяване?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако замърсител попадне в подземната вода, той може
            постепенно да бъде пренесен по посоката на подземния
            поток. Затова замърсяване, възникнало на едно място,
            може да има значение и за други места по-надолу в системата.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            А как сондажът влияе на движението?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Когато започне изпомпване, нивото около сондажа
            се понижава и това променя локалния хидравличен градиент.
            Водата от околната среда започва да се насочва към
            водочерпното съоръжение.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Подземният водоносен пласт е динамична система</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            В него едновременно протичат подхранване, движение,
            естествено оттичане и понякога човешко водочерпене.
            Именно балансът между тези процеси определя поведението
            на подземните води.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/water-level"
            className="border border-[#b7d5dc] px-6 py-3 text-sm font-medium text-[#27697a]"
          >
            ← Водно ниво
          </Link>

          <Link
            href="/knowledge/groundwater"
            className="bg-[#153d47] px-6 py-3 text-sm font-medium text-white"
          >
            Всички теми →
          </Link>
        </div>
      </article>
    </main>
  );
}