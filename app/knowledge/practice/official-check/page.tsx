import Link from "next/link";

export const metadata = {
  title: "Кога е нужна допълнителна официална проверка | Sondi.bg",
  description:
    "Кратък ориентир кога наличните данни трябва да бъдат потвърдени чрез актуален официален източник.",
};

export default function OfficialCheckKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Кога е нужна допълнителна официална проверка
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Данните в картата и анализа са полезен ориентир, но при важни
            практически решения понякога е необходимо информацията да бъде
            потвърдена от актуален официален източник.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато данните са стари
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако регистърът или документът е с по-стара дата, е добре да се
            провери дали няма по-нова версия или актуализация.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато има противоречиви данни
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако различни източници дават различна информация, не трябва да се
            прави категоричен извод преди допълнителна проверка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато мястото попада в защитена зона
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако избраната точка попада в защитена или санитарно-охранителна
            зона, е необходимо да се провери конкретният приложим режим.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато предстои реална инвестиция
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При планиране на сондаж, проект или друга реална дейност е разумно
            ключовата информация да бъде потвърдена преди вземане на окончателно
            решение.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато липсват точни пространствени данни
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Данните за цялото водно тяло не винаги позволяват извод за конкретен
            имот. При липса на точни граници или координати е нужна допълнителна
            проверка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Когато липсва достатъчно информация
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Липсата на запис не трябва автоматично да се приема като липса на
            ограничение, съоръжение или режим. Понякога данните просто не са
            налични в използвания източник.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как да използваме SONDI.BG
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            SONDI.BG помага да се открият важните въпроси и наличните официални
            данни за мястото. Когато дадена информация е решаваща за реално
            действие, тя трябва да бъде проверена и в актуалния официален
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