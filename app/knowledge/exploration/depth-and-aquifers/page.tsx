import Link from "next/link";

export const metadata = {
  title: "Как се оценяват дълбочина и водоносни хоризонти | Sondi.bg",
  description:
    "Как се използват геология, близки сондажи, водни нива и геофизични данни за оценка на целеви дълбочини и водоносни хоризонти.",
};

export default function DepthAndAquifersKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Как се оценяват дълбочина и водоносни хоризонти
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Дълбочината до вода не се определя по един показател. Надеждната
            предварителна оценка съчетава геоложкия строеж, известните
            водоносни хоризонти, данните от близки сондажи и локалните
            геофизични измервания.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е водоносен хоризонт
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водоносният хоризонт е геоложка среда, която може да съхранява и
            предава подземна вода. Това може да бъде порест седиментен пласт,
            напукана скала, карстова зона или друга пропусклива структура,
            разположена между по-слабо пропускливи пластове.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Дълбочина до вода и дълбочина на сондажа не са едно и също
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Първата достигната вода може да се появи значително преди
            окончателната дълбочина на сондажа. Сондирането често продължава, за
            да се пресече по-голяма част от водоносната зона, да се достигне
            по-добър хоризонт или да се осигури необходимата конструкция на
            съоръжението.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показват близките сондажи
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако в близост има регистрирани сондажи, техните дълбочини, статични
            водни нива и данни за използвания водоносен хоризонт могат да дадат
            ценен ориентир. Най-полезно е сравнението със съоръжения в същата
            геоложка и хидрогеоложка среда.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо статичното водно ниво трябва да се тълкува внимателно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Статичното водно ниво е нивото, на което водата се установява в
            съществуващ сондаж при покой. То не е непременно равно на
            дълбочината, на която е пресечен водоносният пласт, и не трябва
            директно да се приема като очаквана дълбочина до вода в друг имот.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как геофизиката помага да се определят целеви интервали
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геофизичният профил може да покаже на какви дълбочини се променят
            физичните свойства на подземната среда. Когато дадена аномалия
            съвпада с очакван водоносен хоризонт или структурна зона, тя може да
            помогне за определяне на един или повече целеви интервали за
            сондиране.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо може да има повече от един водоносен хоризонт
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В някои райони се срещат няколко водоносни нива на различна
            дълбочина. Те могат да имат различен дебит, налягане и качество на
            водата. Затова оценката не трябва да се свежда само до въпроса
            „къде е първата вода“, а и до това кой хоризонт е най-подходящ за
            целта на сондажа.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG подпомага оценката на дълбочината
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът събира данни за хидрогеоложкия хоризонт, дебелината на
            водоносната среда, близки регистрирани сондажи, техните дълбочини и
            водни нива, когато са налични. Тези данни дават предварителен
            ориентир, който може да се използва при планиране на локално
            геофизично проучване и сондаж.
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
          целевата дълбочина се определя чрез съпоставяне на известните
          водоносни хоризонти, данните от близки съоръжения и локалните
          геофизични признаци, а окончателната дълбочина се уточнява при самото
          сондиране.
        </div>
      </article>
    </main>
  );
}