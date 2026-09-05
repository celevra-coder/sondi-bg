import Link from "next/link";

export const metadata = {
  title: "Разрешителни за водовземане | Sondi.bg",
  description:
    "Разбираемо обяснение какво показват разрешителните за водовземане, сроковете и разрешените количества и как да се тълкуват в SONDI.BG.",
};

export default function WaterAbstractionPermitsKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Разрешителни за водовземане
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Разрешителните показват какви количества подземна вода са
            административно разрешени за използване, за каква цел и за какъв
            срок. Те са важна част от оценката на натоварването на ресурса, но
            не трябва да се тълкуват като директна информация за наличието или
            дебита на вода в конкретен имот.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво представлява разрешителното
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешителното е административен акт, с който се определят условията
            за използване на воден ресурс. В него могат да бъдат посочени
            разрешен дебит, годишен обем, предназначение, срок на действие и
            конкретно водовземно съоръжение.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава „действащо разрешително“
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Действащо е разрешително, което според наличните официални данни е в
            срок и продължава да има правно действие. Това не означава
            задължително, че съоръжението работи постоянно или че всеки разрешен
            литър се използва реално.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показват разрешеният дебит и годишният лимит
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешеният дебит обикновено показва максимално допустимо количество
            за единица време, например в l/s. Годишният лимит показва максимален
            обем за определен период, например в m³/год. Тези стойности описват
            правото на водовземане, а не непременно реално използваното
            количество.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо броят разрешителни не е броят на сондажите около имота
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато PRO анализът показва броя действащи разрешителни за дадено
            подземно водно тяло, това е стойност за цялото ПВТ. То може да
            обхваща голяма територия. Следователно този брой не трябва да се
            тълкува като броя на сондажите в непосредствена близост до избраната
            координата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава разрешително за минерална вода
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Наличието на разрешителни за минерална вода в рамките на дадено
            подземно водно тяло показва, че в него има регистрирано използване на
            минерални води. Това обаче не доказва, че минерална вода има точно в
            избрания имот или на конкретна дълбочина.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG използва разрешителните
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът може да показва броя действащи разрешителни, разрешени
            количества, годишни лимити, номера и срокове на разрешителни за
            близки съоръжения. Тази информация се използва като част от оценката
            на ресурсното натоварване и локалния контекст.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как правилно да тълкуваш разрешителните
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешителните са важен ориентир за това как ресурсът вече е
            разпределен и използван административно. Те трябва да се разглеждат
            заедно със свободния ресурс, експлоатационния индекс и
            количественото състояние. За конкретен имот са важни и близките
            водовземни съоръжения, тяхната дълбочина, дебит и водоносен хоризонт.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/resources"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Водовземане и ресурси
          </Link>

          <Link
            href="/map"
            className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white"
          >
            Към картата →
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] px-6 py-5 text-sm leading-6 text-[#637f87]">
          <strong className="text-[#173f48]">Източници и методична основа:</strong>{" "}
          официални регистри на разрешителни за водовземане, планове за
          управление на речните басейни и официални данни за използването на
          подземните водни ресурси.
        </div>
      </article>
    </main>
  );
}