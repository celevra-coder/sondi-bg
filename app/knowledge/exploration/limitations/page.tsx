import Link from "next/link";

export const metadata = {
  title: "Какво може и какво не може да предвиди едно проучване | Sondi.bg",
  description:
    "Какви изводи могат разумно да се направят преди сондиране и кои параметри могат да се потвърдят едва след изпълнение и изпитване на сондажа.",
};

export default function InvestigationLimitationsKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво може и какво не може да предвиди едно проучване
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Предварителното проучване може значително да подобри избора на
            сондажна точка и да намали риска, но не може да даде абсолютна
            гаранция за вода, точен дебит, окончателна дълбочина или качество
            преди реалното сондиране.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво може да покаже предварителното проучване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Проучването може да покаже кои части от терена са по-перспективни,
            какъв тип водоносна среда се очаква, къде има структурни или
            геофизични аномалии и кои дълбочини заслужават по-голямо внимание.
            То позволява различните възможни точки да бъдат сравнени по обща
            логика.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Може ли да се определи точната дълбочина до вода
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Обикновено може да се определи ориентировъчен интервал или една
            или повече целеви дълбочини. Точната дълбочина до водоносния пласт
            обаче зависи от локалния строеж и се потвърждава при самото
            сондиране.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Може ли предварително да се знае дебитът
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Данните от близки сондажи и характеристиките на водоносния хоризонт
            могат да дадат ориентир, но реалният дебит на новото съоръжение се
            установява след изпълнение на сондажа и водочерпно изпитване.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Може ли да се предвиди качеството на водата
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Регионалните данни за химично състояние и анализите от съществуващи
            водоизточници могат да покажат възможни рискове. Те не заменят
            лабораторното изследване на водата от конкретния нов сондаж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо геофизичната аномалия не е гаранция
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геофизичният сигнал показва промяна във физичните свойства на
            подземната среда. Такава промяна може да е свързана с водонасищане,
            но може да бъде причинена и от глина, минерализация, различен тип
            скала или друга геоложка особеност. Затова аномалията трябва да се
            интерпретира заедно с останалите данни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава „по-перспективна точка“
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Това означава, че наличните данни подкрепят тази точка повече от
            останалите — например съвпадат подходяща геология, структурна зона,
            геофизична аномалия и локален хидрогеоложки контекст. Това е
            сравнителна оценка на риска, а не обещание за конкретен резултат.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какъв е правилният начин да се използва проучването
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-добре е предварителното проучване да се използва за избор на
            най-логичната сондажна цел, определяне на ориентировъчни интервали
            и планиране на самото сондиране. Окончателните данни за дебит,
            водно ниво и качество идват от реално изпълненото съоръжение,
            водочерпното изпитване и лабораторния анализ.
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
          <strong className="text-[#173f48]">Практически принцип:</strong>{" "}
          предварителното проучване намалява несигурността и подпомага избора
          на точка, но окончателното доказване на дълбочина, дебит и качество
          се извършва чрез реалния сондаж и последващите изпитвания.
        </div>
      </article>
    </main>
  );
}