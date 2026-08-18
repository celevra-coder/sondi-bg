import Link from "next/link";

export default function HowGroundwaterMovesPage() {
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
            Образователна статия
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как се движи
            <br />
            водата под земята?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Подземната вода обикновено не стои неподвижно.
            Тя се движи през пори, пукнатини и кухини,
            но често много по-бавно от водата в една река.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Под земята рядко има празна „река“
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Една от най-разпространените представи е, че
              подземната вода тече в големи празни канали като
              река под земята.
            </p>

            <p>
              В много райони водата всъщност се намира и движи
              между зърната на пясък и чакъл или през малки
              пукнатини в скалите.
            </p>

            <p>
              Големи подземни канали действително могат да
              съществуват в карстови райони, но това е специфична
              геоложка среда, а не общият модел навсякъде.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво кара водата да се движи?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Основната причина е разликата в хидравличния потенциал.
            Казано по-просто, водата се стреми да се движи от
            места с по-висок воден потенциал към места с по-нисък.
          </p>

          <div className="mt-8 bg-[#edf8fa] p-7">
            <div className="font-semibold">
              Това не е задължително същото като наклона на терена.
            </div>

            <p className="mt-3 leading-7 text-[#5d777e]">
              Повърхността може да се спуска в една посока,
              а подземният поток да бъде повлиян от геоложките
              пластове, пукнатините и налягането и да се движи
              по различен път.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Геологията определя пътя
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="border border-[#dce8ea] p-6">
              <strong>Пясък и чакъл</strong>
              <p className="mt-3 text-sm leading-6 text-[#647e84]">
                Водата се движи през пространствата между отделните зърна.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <strong>Напукани скали</strong>
              <p className="mt-3 text-sm leading-6 text-[#647e84]">
                Движението може да бъде концентрирано в пукнатини
                и разломни зони.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <strong>Карст</strong>
              <p className="mt-3 text-sm leading-6 text-[#647e84]">
                Водата може да използва кухини и канали и локално
                да се движи значително по-бързо.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо това е важно за сондажите?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Два сондажа на сравнително малко разстояние могат
            да имат различен резултат, ако единият пресича
            по-пропусклив пласт или активна пукнатинна зона,
            а другият – по-слабо водопропусклива среда.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Затова само разстоянието до успешен съседен сондаж
            не е достатъчно, за да се предвиди резултатът
            в нова точка.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#f3fafb] p-7">
          <strong>Най-просто казано</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Подземната вода следва геологията.
            Къде и колко бързо се движи зависи от това
            през какъв материал преминава и как са свързани
            водопропускливите части на подземната среда.
          </p>
        </div>

        <div className="mt-16 border-t border-[#dce8ea] pt-8">
          <div className="text-sm text-[#78949b]">
            Следваща статия
          </div>

          <Link
            href="/knowledge/groundwater/water-in-well"
            className="mt-2 inline-block text-xl font-semibold text-[#257589]"
          >
            Откъде идва водата в един сондаж? →
          </Link>
        </div>
      </article>
    </main>
  );
}