import Link from "next/link";

export default function ArtesianWaterPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
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