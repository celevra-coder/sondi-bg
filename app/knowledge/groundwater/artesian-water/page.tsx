import KnowledgeArticleJsonLd from "@/components/KnowledgeArticleJsonLd";
export const metadata = {
  alternates: { canonical: "/knowledge/groundwater/artesian-water" },

  title: "Какво е артезианска вода?",
  description: "Артезианската вода е свързана с напорен водоносен хоризонт – система, в която водата се намира под налягане между по-слабо пропускливи пластове.",
};

import Link from "next/link";

export default function ArtesianWaterPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
        <KnowledgeArticleJsonLd
          title={metadata.title}
          description={metadata.description}
          path={metadata.alternates.canonical}
          sectionName="Подземни води"
          sectionPath="/knowledge/groundwater"
        />
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link href="/knowledge/groundwater" className="text-sm text-[#4e8795] hover:text-[#173d47]">
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как работят подземните води · 04
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е
            <br />
            артезианска вода?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Артезианската вода е свързана с напорен водоносен
            хоризонт – система, в която водата се намира под
            налягане между по-слабо пропускливи пластове.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Водата може да се издигне сама в сондажа
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако сондаж пресече напорен водоносен хоризонт,
            водата може да се издигне в сондажната тръба над
            дълбочината, на която самият пласт е бил достигнат.
          </p>
        </section>

        <div className="my-12 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Важно
          </div>

          <p className="mt-4 text-lg leading-8 text-white/80">
            Артезиански сондаж не означава задължително,
            че водата ще излиза сама на земната повърхност.
          </p>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кога водата излиза сама?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако напорът е достатъчно висок и пиезометричното ниво
            се намира над земната повърхност, водата може да започне
            да изтича без помпа. Това се нарича самоизлив.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Ако нивото се издигне само частично в сондажа,
            системата пак е напорна, но за извеждане на водата
            до повърхността може да е необходима помпа.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Откъде идва налягането?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Водоносният пласт може да се подхранва на по-висока
            надморска височина. Когато водата е ограничена между
            по-слабо пропускливи пластове, тази разлика във
            височината може да създаде хидравличен напор.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава артезианският напор при сондаж?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Напорът показва, че водата в пресечения водоносен хоризонт
              се намира под хидравлично налягане. След достигането му
              водното ниво в сондажа може да се установи значително
              по-високо от самата дълбочина на водоносния пласт.
            </p>

            <p>
              Това обаче не означава автоматично висок дебит. Количеството
              вода, което сондажът може устойчиво да отдава, зависи и от
              пропускливостта, дебелината и пространствената свързаност
              на водоносната среда.
            </p>

            <p>
              Затова при оценка на напорен хоризонт трябва да се разграничават
              дълбочината на пласта, установеното водно ниво и реалната
              продуктивност на сондажа.
            </p>

            <p>
              Виж още за{" "}
              <Link
                href="/knowledge/groundwater/water-level"
                className="font-semibold text-[#257589]"
              >
                водното ниво в сондаж
              </Link>
              {" "}и за{" "}
              <Link
                href="/knowledge/groundwater/aquifer"
                className="font-semibold text-[#257589]"
              >
                водоносните пластове
              </Link>.
            </p>
          </div>
        </section>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <h2 className="text-xl font-semibold">
            Източници и допълнително четене
          </h2>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-[#607b82]">
            <li>
              <a
                href="https://www.usgs.gov/water-science-school/science/artesian-water-and-artesian-wells"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                USGS — Artesian Water and Artesian Wells
              </a>
            </li>
            <li>
              <a
                href="https://www.usgs.gov/water-science-school/science/aquifers-and-groundwater"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                USGS — Aquifers and Groundwater
              </a>
            </li>
          </ul>
        </section>
        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Артезианска ≠ минерална</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            „Артезианска“ описва хидравличните условия и налягането.
            Терминът сам по себе си не казва дали водата е минерална,
            топла или подходяща за пиене.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link href="/knowledge/groundwater/shallow-deep-water" className="text-sm text-[#56818b]">
            ← Плитки и дълбоки води
          </Link>

          <Link href="/knowledge/groundwater/springs" className="text-right text-sm font-semibold text-[#257589]">
            Как възникват изворите? →
          </Link>
        </div>
      </article>
    </main>
  );
}