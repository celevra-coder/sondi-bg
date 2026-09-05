import Link from "next/link";

export const metadata = {
  title: "Какво е количествен ресурс на подземните води? | Sondi.bg",
  description:
    "Разбираемо обяснение какво означава количественият ресурс на едно подземно водно тяло и как да се тълкува в анализите на SONDI.BG.",
};

export default function QuantitativeResourceKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво е количествен ресурс на подземните води
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Количественият ресурс описва водните количества, с които разполага
            дадено подземно водно тяло и как те се съпоставят с водовземането.
            Това е оценка за цялата водоносна система, а не прогноза колко вода
            ще даде конкретен бъдещ сондаж.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво всъщност означава „ресурс“
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При подземните води ресурсът не е просто количеството вода, което
            физически съществува под земята. Той е част от водния баланс и
            отчита естественото подхранване, необходимостта от запазване на
            зависими екосистеми и количествата, които могат да бъдат използвани
            без да се наруши устойчивостта на водното тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Ресурсът се оценява за подземното водно тяло
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Официалните ресурсни показатели обикновено се отнасят за цялото
            подземно водно тяло. То може да обхваща голяма площ и различни
            водоносни хоризонти. Затова стойност от например десетки литри в
            секунда не означава, че такъв дебит е наличен във всяка отделна
            точка на картата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква е връзката между ресурс и водовземане
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            За да се разбере дали едно водно тяло е натоварено, ресурсът се
            сравнява с количествата, които вече се използват или са разрешени за
            водовземане. Колкото по-голяма част от разполагаемия ресурс е
            ангажирана, толкова по-ограничени могат да бъдат възможностите за
            допълнително водовземане.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо количественият ресурс се променя
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подхранването на подземните води зависи от валежите, инфилтрацията,
            реките, релефа и геоложките условия. Водовземането от сондажи и
            кладенци също влияе върху баланса. Затова ресурсните оценки могат да
            се актуализират, когато има нови официални данни или промяна в
            натоварването на водното тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава добро количествено състояние
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Добро количествено състояние означава, че според официалната оценка
            балансът между наличния ресурс и водовземането не показва
            недопустимо натоварване на подземното водно тяло. Това обаче не
            означава, че във всяка конкретна точка има достатъчен дебит за
            планираното водоползване.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво виждаш в PRO анализа на SONDI.BG
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В раздела за количествен ресурс могат да се показват разполагаем
            ресурс, общо и разрешено водовземане, свободен ресурс,
            експлоатационен индекс, количествено състояние и оценка на
            натоварването. Тези показатели се разглеждат заедно, защото само
            една стойност рядко е достатъчна за правилна оценка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за конкретен сондаж
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ресурсът на ПВТ показва регионалната водна обезпеченост и
            натоварването на системата. За конкретен сондаж обаче са важни още
            геологията, водоносният хоризонт, дълбочината, близките съоръжения и
            техните реални дебити. Затова ресурсът е важен ориентир за
            устойчивостта и възможностите за водовземане, но не е директна
            прогноза за дебита на избраната точка.
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
          официални водни баланси, регистри за ресурс и водовземане, планове за
          управление на речните басейни и утвърдени принципи за оценка на
          количественото състояние на подземните водни тела.
        </div>
      </article>
    </main>
  );
}