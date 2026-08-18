import Link from "next/link";

export default function GroundwaterTypesPage() {
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
            Основи · 04
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Порови, пукнатинни
            <br />
            и карстови води
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Водата може да се намира под земята по различен начин.
            Геоложката среда определя къде се съхранява, как се движи
            и как може да бъде достигната със сондаж.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[860px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Три различни начина водата да използва скалата
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Най-общо можем да разграничим подземни води,
            които се движат през пори, през пукнатини или през
            развити карстови кухини и канали.
          </p>
        </section>

        <section className="mt-12 border border-[#dce8ea] p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6595a0]">
            01
          </div>

          <h2 className="mt-3 text-3xl font-semibold">
            Порови води
          </h2>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Срещат се основно в рохкави материали като пясъци
            и чакъли. Водата запълва пространствата между
            отделните зърна и се движи през свързаните пори.
          </p>

          <div className="mt-6 bg-[#f4fafb] p-5 text-sm leading-6 text-[#5d777e]">
            Типични среди: речни тераси, алувиални наслаги,
            пясъчно-чакълести пластове и някои седиментни басейни.
          </div>
        </section>

        <section className="mt-6 border border-[#dce8ea] p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6595a0]">
            02
          </div>

          <h2 className="mt-3 text-3xl font-semibold">
            Пукнатинни води
          </h2>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            При плътните скали основната скална маса може да
            пропуска много малко вода. Тогава движението се
            концентрира в пукнатини, разломи и други нарушени
            части на скалата.
          </p>

          <div className="mt-6 bg-[#f4fafb] p-5 text-sm leading-6 text-[#5d777e]">
            При сондиране резултатът може силно да зависи от това
            дали конкретната сондажна линия пресича активна
            водоносна пукнатинна зона.
          </div>
        </section>

        <section className="mt-6 border border-[#dce8ea] p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6595a0]">
            03
          </div>

          <h2 className="mt-3 text-3xl font-semibold">
            Карстови води
          </h2>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Карстът се развива в разтворими скали, най-често
            карбонатни. С времето водата може да разширява
            пукнатините и да създава кухини и подземни канали.
          </p>

          <p className="mt-4 text-[17px] leading-8 text-[#536f76]">
            В такива системи движението може да бъде много
            неравномерно и локално значително по-бързо,
            отколкото в порести водоносни пластове.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо типът е важен?
          </h2>

          <div className="mt-8 overflow-hidden border border-[#dce8ea]">
            <div className="grid grid-cols-3 bg-[#edf7f9] p-4 text-sm font-semibold">
              <div>Тип</div>
              <div>Къде е водата?</div>
              <div>Характер</div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#dce8ea] p-4 text-sm">
              <div className="font-medium">Порови</div>
              <div className="text-[#607b82]">Между зърната</div>
              <div className="text-[#607b82]">По-разпределен поток</div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#dce8ea] p-4 text-sm">
              <div className="font-medium">Пукнатинни</div>
              <div className="text-[#607b82]">В пукнатини</div>
              <div className="text-[#607b82]">Локализиран поток</div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#dce8ea] p-4 text-sm">
              <div className="font-medium">Карстови</div>
              <div className="text-[#607b82]">Кухини и канали</div>
              <div className="text-[#607b82]">Силно неравномерен поток</div>
            </div>
          </div>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Затова геологията има значение</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Две места могат да имат подземни води, но начинът,
            по който водата се намира и движи под тях, може да бъде
            напълно различен. Това променя и подхода при
            проучване и сондиране.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/groundwater-body"
            className="border border-[#b7d5dc] px-6 py-3 text-sm font-medium text-[#27697a]"
          >
            ← Предишна статия
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