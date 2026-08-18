import Link from "next/link";

export default function WaterInWellPage() {
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
            Практически въпрос
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Откъде идва водата
            <br />
            в един сондаж?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Сондажът не създава вода. Той пресича геоложка среда,
            която вече съдържа и пропуска подземна вода,
            и създава възможност тя да постъпва към сондажния ствол.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Сондажът е достъп до водоносната среда
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато сондажът достигне водоносен пласт,
              пукнатинна зона или друга водопропусклива структура,
              водата от околната среда може да започне да постъпва
              към него.
            </p>

            <p>
              Количеството вода зависи не само от това дали
              е „улучена вода“, а и от способността на околната
              геоложка среда постоянно да подава вода към сондажа.
            </p>
          </div>
        </section>

        <div className="my-12 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.2em] text-[#8bc8d3]">
            Важното разграничение
          </div>

          <p className="mt-4 text-lg leading-8 text-white/80">
            Да се достигне вода и да се получи устойчив дебит
            са две различни неща.
          </p>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как водата влиза в сондажа?
          </h2>

          <div className="mt-8 space-y-5">
            {[
              {
                title: "През порест пласт",
                text:
                  "При пясъци и чакъли водата постъпва от порите между частиците към филтърната част на сондажа.",
              },
              {
                title: "През пукнатини",
                text:
                  "В скални терени притокът често е концентриран в една или няколко водоносни пукнатини.",
              },
              {
                title: "През карстови кухини",
                text:
                  "В карстови райони водата може да постъпва през по-големи канали и разтворени кухини.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-l-4 border-[#73acb8] bg-[#f6fbfc] p-6"
              >
                <strong>{item.title}</strong>
                <p className="mt-2 leading-7 text-[#5d777e]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо две близки точки могат да дадат различен резултат?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Водоносният пласт не е задължително еднакъв навсякъде.
              Дебелината му може да се изменя, част от него може
              да премине в глина или по-плътна скала, а пукнатините
              могат да бъдат локални.
            </p>

            <p>
              Затова успешен сондаж в съседен имот е ценна
              информация, но не представлява гаранция за
              същата дълбочина или дебит в нова точка.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво става при изпомпване?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Когато започне изпомпване, нивото в сондажа обикновено
            се понижава. Това създава разлика в хидравличния
            потенциал и водата от околната водоносна среда
            започва да се насочва към сондажа.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Ако водоносният пласт може да подава достатъчно вода,
            се установява работен режим. Ако подаването е слабо
            спрямо изпомпването, нивото може да продължи да пада.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Запомни</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Дълбок сондаж не означава автоматично голям дебит,
            а плитък сондаж не означава автоматично слаб водоизточник.
            По-важно е каква водоносна структура е пресечена
            и как тя се подхранва.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater"
            className="border border-[#b7d5dc] px-6 py-3 text-sm font-medium text-[#27697a]"
          >
            ← Всички статии
          </Link>

          <Link
            href="/map"
            className="bg-[#153d47] px-6 py-3 text-sm font-medium text-white"
          >
            Провери място на картата →
          </Link>
        </div>
      </article>
    </main>
  );
}