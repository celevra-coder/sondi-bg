import Link from "next/link";

export const metadata = {
  title: "Естествен, разполагаем и свободен ресурс | Sondi.bg",
  description:
    "Разбираемо обяснение каква е разликата между естествен, разполагаем и свободен ресурс на подземните води.",
};

export default function NaturalAvailableFreeResourcePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Естествен, разполагаем и свободен ресурс
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            В ресурсните оценки се използват няколко различни понятия. Те не са
            взаимозаменяеми. Естественият ресурс описва подхранването на
            водоносната система, разполагаемият ресурс показва каква част може
            да се използва устойчиво, а свободният ресурс показва какво остава
            след отчетеното водовземане.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е естествен ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Естественият ресурс е количеството подземна вода, което постъпва в
            системата чрез естествени процеси като инфилтрация от валежи,
            снеготопене, подхранване от реки и обмен с други водоносни
            хоризонти. Той е част от естествения воден баланс на подземното
            водно тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е ресурс за водните екосистеми
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Не целият естествен ресурс може да бъде използван за водовземане.
            Част от него трябва да остане в системата, за да поддържа свързани
            реки, извори, влажни зони и други зависими екосистеми. Тази част се
            отчита при определянето на ресурса, който може устойчиво да се
            използва.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е разполагаем ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разполагаемият ресурс е онази част от подземния воден ресурс, която
            може да бъде използвана при запазване на устойчивия баланс на
            водното тяло. Именно спрямо него се оценява натоварването от
            водовземане и се изчислява експлоатационният индекс.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е свободен ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Свободният ресурс е остатъкът след като от разполагаемия ресурс се
            отчетат вече ангажираните или разрешени количества за водовземане.
            Положителната стойност показва наличие на неангажиран ресурс на ниво
            подземно водно тяло, докато много малка или отрицателна стойност е
            сигнал за силно натоварване.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо тези стойности не са дебит на сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Всички тези ресурси се отнасят до цялото подземно водно тяло. Ако
            например свободният ресурс е 15 l/s, това не означава, че сондаж в
            конкретен имот ще даде 15 l/s. Реалният дебит зависи от локалната
            геология, водоносния хоризонт, неговата мощност, пропускливост и
            конструкцията на сондажа.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се показват тези стойности в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В SONDI.BG могат да се показват естествен ресурс, ресурс за водните
            екосистеми, разполагаем ресурс и свободен ресурс, когато има
            налични официални данни. Те се разглеждат заедно с разрешеното
            водовземане и експлоатационния индекс, за да се оцени общото
            натоварване на ПВТ.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как да ги тълкуваш правилно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-важно е показателите да не се разглеждат изолирано. Висок
            разполагаем ресурс може вече да е силно натоварен от водовземане, а
            по-малък ресурс може да има значителна свободна част. Затова
            правилната оценка съчетава разполагаем ресурс, свободен ресурс,
            водовземане, количествено състояние и експлоатационен индекс.
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
          официални водни баланси и регистри за подземните водни тела, планове
          за управление на речните басейни и официални оценки на разполагаемия
          и свободния подземен воден ресурс.
        </div>
      </article>
    </main>
  );
}