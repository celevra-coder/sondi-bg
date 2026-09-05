import Link from "next/link";

export const metadata = {
  title: "Общо и разрешено водовземане | Sondi.bg",
  description:
    "Разбираемо обяснение какво означават общо, разрешено и отчетено водовземане и как да се тълкуват тези стойности в анализите на SONDI.BG.",
};

export default function AbstractionKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Общо и разрешено водовземане
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Водовземането показва каква част от подземния воден ресурс е
            ангажирана за използване. В анализите могат да присъстват различни
            стойности — разрешено водовземане, общо водовземане, годишни лимити
            и количества за различни цели. Те не означават едно и също.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е водовземане
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водовземане е използването на подземна вода чрез сондажи, кладенци,
            каптажи и други водовземни съоръжения. То може да бъде за питейно
            водоснабдяване, земеделие, промишленост, битови нужди, туризъм,
            аквакултури или други цели.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава разрешено водовземане
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешеното водовземане е количеството, което е определено в
            действащите разрешителни за използване на подземни води. То показва
            какъв ресурс е административно ангажиран, но не доказва, че
            разрешеното количество се използва непрекъснато или в пълен размер.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава общо водовземане
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Общото водовземане обединява количествата, които се отчитат за
            водното тяло според използвания официален регистър или баланс. В
            зависимост от източника това може да включва разрешени количества,
            собствени потребности или други отчетени компоненти на използването
            на ресурса.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо разрешено и реално използвано количество могат да се различават
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешителното задава максимални или допустими параметри за
            водовземане, но действителното използване може да е по-ниско.
            Например дадено съоръжение може да работи сезонно или да използва
            само част от разрешения лимит. Затова разрешеното количество не
            трябва автоматично да се приема като реално изпомпано количество.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означават l/s и m³/год.
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Литри в секунда показват дебит — количество вода за единица време.
            Кубични метри за година показват годишен обем. Двата показателя не са
            директно взаимозаменяеми без да се знае колко време реално се
            извършва водовземането. Затова в официалните данни могат да се
            срещат и двата вида стойности.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се показва водовземането в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В SONDI.BG могат да се показват общо водовземане, разрешено
            водовземане, водовземане за собствени потребности, годишни лимити и
            разпределение по предназначение. Тези стойности се съпоставят с
            разполагаемия и свободния ресурс, за да се оцени натоварването на
            подземното водно тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за конкретен имот
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водовземането за цялото ПВТ показва общото натоварване на ресурса,
            но не казва колко вода може да се получи от конкретен сондаж. За
            локална оценка са важни близките съоръжения, техните дебити,
            геологията, водоносният хоризонт и конкретните условия на мястото.
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
          официални регистри за разрешителни и водовземане, водни баланси,
          планове за управление на речните басейни и официални оценки на
          използването на подземния воден ресурс.
        </div>
      </article>
    </main>
  );
}