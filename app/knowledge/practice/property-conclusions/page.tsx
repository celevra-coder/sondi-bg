import Link from "next/link";

export const metadata = {
  title: "Какво може да се заключи за конкретен имот | Sondi.bg",
  description:
    "Кратко обяснение кои изводи могат да се направят за конкретен имот от наличните официални и пространствени данни.",
};

export default function PropertyConclusionsKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво може да се заключи за конкретен имот
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Данните за района могат да дадат много полезен контекст, но не
            всичко, което е известно за едно подземно водно тяло, важи
            директно за всяка отделна точка в него.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво може да се определи по местоположение
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Може да се установи към кое подземно водно тяло принадлежи точката,
            какъв е общият геоложки контекст и какви официални данни са налични
            за района.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показват близките обекти
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Близки сондажи, извори и мониторингови пунктове могат да дадат
            полезен ориентир за местните условия, но не доказват, че същите
            условия се повтарят в имота.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показва ресурсът на водното тяло
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ресурсните показатели показват общото натоварване и състояние на
            водното тяло. Те не са прогноза за дебита на бъдещ сондаж в
            конкретния имот.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показва геологията
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геоложките и хидрогеоложките данни показват каква водоносна среда
            е възможна и кои структури могат да бъдат важни. Реалните условия
            на конкретната точка обаче се уточняват с локално проучване.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показват защитените зони
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако има пространствени данни за защитени зони, може да се провери
            дали избраната точка попада в тях. При такова попадане е нужна
            допълнителна проверка на приложимия режим.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво не може да се твърди само от картата
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Само по регионални и пространствени данни не може да се гарантира
            наличие на вода, точна дълбочина, дебит или качество в конкретната
            точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се стига до практическо решение
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-добрата оценка идва от съчетаване на официалните данни с
            геологията, близките обекти и локално проучване на самия терен.
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