import Link from "next/link";

export const metadata = {
  title: "Комбиниране на методи за по-надеждно проучване | Sondi.bg",
  description:
    "Защо най-надеждната оценка при търсене на подземна вода идва от съпоставяне на независими методи и различни източници на данни.",
};

export default function CombinedMethodsKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Комбиниране на методи за по-надеждно проучване
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Най-добрата предварителна оценка за сондажна точка обикновено не
            идва от един метод. Тя се изгражда чрез съпоставяне на геоложки,
            хидрогеоложки, структурни, геофизични и локални данни.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо един метод рядко е достатъчен
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Всеки метод има свои силни страни и ограничения. Геологията дава
            общия строеж, геофизиката показва физични контрасти, близките
            сондажи дават локален ориентир, а структурните данни показват
            възможни пътища за движение на водата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Геологията определя рамката
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геоложката и хидрогеоложката информация помага да се разбере какъв
            тип водоносна среда е възможна в района, кои пластове могат да бъдат
            водоносни и къде е логично да се търсят по-пропускливи зони.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Геофизиката проверява локалните промени
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геофизичните измервания помагат да се открият промени по профила и
            в дълбочина. Когато геофизична аномалия съвпада с геоложки логична
            зона, интерпретацията става по-силна от тази на аномалия, разглеждана
            самостоятелно.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Близките сондажи и извори дават реален контекст
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Съществуващите съоръжения могат да покажат на какви дълбочини е
            достигната вода, какви дебити са публикувани и кои хоризонти са
            използвани. Тази информация е особено ценна, когато се намира в
            сходна геоложка среда.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Разломите и структурите добавят пространствена логика
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В пукнатинни и скални среди структурните линии могат да влияят
            върху движението на подземните води. Най-важно е дали потенциалната
            структура съвпада с подходяща геология и дали има независими данни,
            които подкрепят нейното значение.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се оценява съвпадението между методите
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            По-надеждна е точка, при която няколко независими признака сочат към
            една и съща зона — например подходящ водоносен хоризонт, близка
            структурна линия, геофизична аномалия и сходни резултати от близки
            сондажи. Колкото по-добро е съвпадението, толкова по-силна е
            предварителната оценка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо комбинираният подход намалява риска
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако два метода дават различни резултати, това е сигнал за
            допълнителна проверка, а не причина единият автоматично да бъде
            игнориран. Комбинирането на данни помага да се откриват
            противоречия, да се избират контролни профили и да се намалява
            рискът от решение, основано на един единствен показател.
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
          най-силната предварителна оценка е тази, при която различни
          независими методи и източници на данни подкрепят една и съща
          интерпретация.
        </div>
      </article>
    </main>
  );
}