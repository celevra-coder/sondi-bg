import Link from "next/link";

export const metadata = {
  title: "Свободен ресурс и ново водовземане | Sondi.bg",
  description:
    "Разбираемо обяснение какво означава свободният ресурс на подземно водно тяло и как се отнася към възможността за ново водовземане.",
};

export default function FreeResourceNewAbstractionKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Свободен ресурс и ново водовземане
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Свободният ресурс показва каква част от разполагаемия ресурс на
            подземното водно тяло остава неангажирана според наличните официални
            данни. Това е един от най-важните показатели при предварителна
            преценка дали има ресурсна възможност за ново водовземане.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се получава свободният ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Свободният ресурс се определя чрез сравнение между разполагаемия
            ресурс и вече ангажираните количества за водовземане. На практика
            той показва какъв количествен резерв остава в рамките на цялото
            подземно водно тяло според използваната официална оценка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава положителен свободен ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Положителната стойност означава, че според официалния баланс част от
            разполагаемия ресурс все още не е ангажирана. Това е по-благоприятна
            ресурсна ситуация, но не представлява автоматично право за ново
            водовземане и не гарантира, че исканото количество може да бъде
            разрешено на конкретното място.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава малък свободен ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Малкият положителен остатък показва, че водното тяло вече е близо до
            силно ресурсно натоварване. В такава ситуация дори сравнително малко
            ново водовземане може да бъде съществено спрямо оставащия резерв и
            трябва да се разглежда внимателно.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава отрицателен свободен ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Отрицателната стойност означава, че според използваните данни
            ангажираното водовземане надхвърля разполагаемия ресурс. Това е
            сериозен предупредителен сигнал за ресурсен дефицит и е причина
            възможността за допълнително водовземане да бъде проверена особено
            внимателно.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Свободният ресурс не е свободен дебит в конкретния имот
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако свободният ресурс на едно ПВТ е например 10 l/s, това не
            означава, че сондаж на конкретния имот може да черпи 10 l/s. Тази
            стойност се отнася за цялото водно тяло. Реалният дебит зависи от
            местната геология, водоносния хоризонт и техническите характеристики
            на сондажа.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG използва свободния ресурс
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В PRO анализа свободният ресурс се разглежда заедно с разполагаемия
            ресурс, разрешеното водовземане, експлоатационния индекс,
            количественото състояние и риска. Така може да се различи водно тяло
            с реален ресурсен резерв от такова, което е близо до или над
            наличния си количествен капацитет.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това преди нов сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Преди планиране на ново водовземане свободният ресурс е важна първа
            проверка. След нея трябва да се разгледат действащите разрешителни,
            количественото състояние, локалните водовземни съоръжения и
            геоложките условия. Наличието на свободен ресурс е положителен
            фактор, но не замества процедурата за оценка и разрешаване на
            конкретното водовземане.
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
          официални регистри за свободен и разполагаем ресурс, водовземане и
          разрешителни, планове за управление на речните басейни и официални
          оценки на количественото състояние на подземните водни тела.
        </div>
      </article>
    </main>
  );
}