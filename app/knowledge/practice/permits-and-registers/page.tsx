import Link from "next/link";

export const metadata = {
  title: "Какво показват разрешителните и регистрите | Sondi.bg",
  description:
    "Кратко обяснение каква информация дават официалните разрешителни и регистри и как да се използват правилно.",
};

export default function PermitsAndRegistersKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво показват разрешителните и регистрите
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Официалните регистри помагат да се разбере какви съоръжения,
            разрешителни и водовземания са отчетени за даден район или
            подземно водно тяло.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква информация може да има в регистрите
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В зависимост от регистъра могат да се срещат данни за съоръжения,
            разрешителни, предназначение на водата, срокове и разрешени
            количества.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Разрешително и съоръжение не са едно и също
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Един запис за разрешително не трябва автоматично да се приема като
            отделен сондаж до конкретния имот. Данните трябва да се четат според
            това за какво точно се отнася записът.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо актуалността е важна
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Регистрите могат да се обновяват периодично. Затова при важна
            практическа проверка трябва да се гледа към каква дата или период
            се отнася наличната информация.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво не доказва броят на разрешителните
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Голям брой разрешителни за едно водно тяло не означава, че около
            избраната точка има същия брой сондажи и не показва директно
            условията в конкретния имот.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се използват като практически ориентир
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Регистрите са полезни за общ контекст — дали в района има официално
            водовземане, какви видове съоръжения са отчетени и как се използва
            подземният ресурс.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG използва тези данни
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            SONDI.BG показва наличните официални записи като част от общия
            анализ. Те се разглеждат заедно с геологията, ресурса, близките
            съоръжения и останалите пространствени данни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Кога е нужна допълнителна проверка
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако даден запис е стар, непълен, противоречив или има значение за
            конкретно решение, той трябва да се потвърди чрез актуален официален
            източник.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/practice"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Практика и регулации
          </Link>

          <Link
            href="/map"
            className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white"
          >
            Към картата →
          </Link>
        </div>
      </article>
    </main>
  );
}