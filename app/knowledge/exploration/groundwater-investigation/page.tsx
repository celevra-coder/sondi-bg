import Link from "next/link";

export const metadata = {
  title: "Какво представлява проучването за подземна вода | Sondi.bg",
  description:
    "Разбираемо обяснение какво представлява проучването за подземна вода и какви данни се използват преди избор на място за сондаж.",
};

export default function GroundwaterInvestigationKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво представлява проучването за подземна вода
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Проучването за подземна вода е процес на събиране и съпоставяне на
            информация за геологията, водоносните хоризонти, структурите,
            съществуващите водоизточници и локалните измервания преди да бъде
            избрана точка за сондаж.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо е необходимо предварително проучване
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземната вода не е разпределена равномерно. Дори в рамките на един
            имот различни точки могат да пресичат различни пластове, пукнатини
            или водоносни зони. Целта на проучването е да се намали тази
            несигурност преди скъпото изпълнение на сондаж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            С какво започва оценката
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Първата стъпка е регионалният контекст — към кое подземно водно тяло
            принадлежи мястото, какъв е типът на водоносната среда, каква е
            литологията и кои хидрогеоложки хоризонти са известни в района.
            Тази информация определя какво реалистично може да се очаква.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо близките сондажи и извори са важни
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Регистрирани съоръжения в близост могат да дадат информация за
            достигнати дълбочини, статични водни нива, дебити и използвани
            водоносни хоризонти. Те са силен локален ориентир, но не гарантират,
            че същите условия се повтарят в избраната точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква е ролята на разломите и пукнатинните зони
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В скални терени разломите и придружаващите ги пукнатини могат да
            увеличат вторичната пропускливост и да създадат предпочитани пътища
            за движение на подземните води. Затова структурната обстановка е
            важна част от оценката, но близостта до разлом сама по себе си не е
            доказателство за водоносна зона.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво добавя геофизичното измерване
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геофизичните методи измерват физични свойства на подземната среда и
            могат да покажат контрасти, промени в строежа, зони на разуплътняване
            или аномалии, които заслужават допълнително внимание. Интерпретацията
            е най-надеждна, когато се сравнява с известната геология и други
            независими данни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG помага преди локалното проучване
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът събира регионална и пространствена информация за
            водоносната среда, близките сондажи и извори, известните разломни
            структури, количествения ресурс и други фактори. Това помага да се
            изгради предварителна картина преди измерване на място.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какъв е реалният резултат от едно добро проучване
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Добрата оценка не обещава вода с абсолютна сигурност. Тя подрежда
            наличните доказателства и определя една или повече точки с по-добра
            перспектива спрямо останалата част от терена. Окончателното
            потвърждение за дълбочина, дебит и качество идва след изпълнение и
            изпитване на сондажа.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/exploration"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Проучване за вода
          </Link>
          <Link
            href="/map"
            className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white"
          >
            Към картата →
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] px-6 py-5 text-sm leading-6 text-[#637f87]">
          <strong className="text-[#173f48]">Методична основа:</strong>{" "}
          геоложка и хидрогеоложка оценка, официални данни за водни тела,
          съществуващи водовземни съоръжения, структурна геология и локални
          геофизични наблюдения.
        </div>
      </article>
    </main>
  );
}