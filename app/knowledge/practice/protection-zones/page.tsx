import Link from "next/link";

export const metadata = {
  title: "Какво представляват защитените и санитарно-охранителните зони | Sondi.bg",
  description:
    "Кратко обяснение какво представляват защитените и санитарно-охранителните зони и защо са важни при планиране на сондаж.",
};

export default function ProtectionZonesKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво представляват защитените и санитарно-охранителните зони
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Около определени водоизточници и водни обекти могат да бъдат
            определяни защитени зони, в които се прилагат специални условия за
            опазване на водата.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо съществуват защитени зони
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Основната им цел е да намалят риска от замърсяване или друго
            неблагоприятно въздействие върху важни водоизточници.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е санитарно-охранителна зона
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Това е зона около определен водоизточник, в която могат да действат
            специални изисквания и ограничения с цел защита на водата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо е важно точното местоположение
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Данните за защитена зона на ниво водно тяло не означават автоматично,
            че всеки имот в него попада в конкретен защитен пояс. Това трябва да
            се проверява пространствено за избраната точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво може да означава попадане в такава зона
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Попадането в защитена зона е сигнал, че преди сондаж или друга
            дейност трябва да се провери какъв режим е приложим за конкретното
            място.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво не трябва да се заключава автоматично
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Самото наличие на защитена зона в района не означава автоматично,
            че всяка дейност е забранена. Важен е конкретният режим и точната
            позиция на имота спрямо зоната.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG използва тези данни
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато има налични пространствени данни, SONDI.BG може да покаже
            дали избраната точка попада в известна защитена или
            санитарно-охранителна зона и да я отбележи като важен фактор за
            допълнителна проверка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Кога трябва да се потвърди информацията
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При реално планиране на сондаж или друга дейност информацията за
            защитената зона трябва да се потвърди чрез актуален официален
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