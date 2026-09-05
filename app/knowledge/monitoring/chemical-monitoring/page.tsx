import Link from "next/link";

export const metadata = {
  title: "Какво показва химичният мониторинг? | Sondi.bg",
  description:
    "Разбираемо обяснение какво се измерва при химичния мониторинг на подземните води и как да се тълкуват резултатите в анализите на SONDI.BG.",
};

export default function ChemicalMonitoringKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво показва химичният мониторинг
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Химичният мониторинг проследява състава на подземните води чрез
            периодично вземане и анализиране на проби от определени
            мониторингови пунктове. Целта е да се установи дали водата запазва
            добро химично състояние, дали има превишения и дали някои показатели
            се влошават с времето.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво се измерва при химичния мониторинг
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В лаборатория се изследват различни физикохимични и химични
            показатели. В зависимост от конкретното подземно водно тяло могат
            да се следят нитрати, сулфати, хлориди, амоний, електропроводимост,
            метали, органични вещества и други показатели, определени в
            официалните програми за мониторинг.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо различните водни тела имат различни проблемни показатели
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Не всички подземни води са изложени на еднакви натиски. В земеделски
            райони по-важни могат да бъдат нитратите, около определени
            промишлени зони могат да се наблюдават други вещества, а някои
            показатели могат да имат и естествен геоложки произход. Затова
            химичната оценка се прави според характеристиките и натиска върху
            конкретното подземно водно тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава превишение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Превишение означава, че измерена стойност е над приложимата
            стандартна или прагова стойност за съответния показател. То е важен
            сигнал, но трябва да се знае къде е измерено, в кой пункт, при каква
            дълбочина и дали резултатът е единичен или се повтаря във времето.
            Един отделен резултат не трябва автоматично да се приема като
            характеристика на всяка вода в целия район.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се стига до оценка „добро“ или „лошо“ химично състояние
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Официалното химично състояние на едно подземно водно тяло не се
            определя само от една проба. Оценяват се резултатите от
            мониторинговата мрежа, пространственото разпространение на
            отклоненията, проблемните показатели и други установени въздействия.
            Затова е възможно отделен пункт да има отклонение, без това
            автоматично да означава, че цялото ПВТ е в лошо състояние.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е химичен риск
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Химичният риск е различен от текущото химично състояние. Едно водно
            тяло може в момента да е оценено като добро, но да е определено в
            риск, ако има данни, че съществува вероятност в бъдеще да не постигне
            или да не запази добро химично състояние. Затова в PRO анализа
            „състояние“ и „риск“ трябва да се четат като различни показатели.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво виждаш в PRO анализа на SONDI.BG
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът може да показва химичното състояние на подземното водно
            тяло, броя на химичните мониторингови пунктове, установени
            превишения, проблемни показатели и наличие на възходяща тенденция.
            При припокриване на няколко подземни водни тела информацията се
            разглежда поотделно, защото различните ПВТ могат да имат различно
            химично състояние и различни проблемни показатели.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за вода от конкретен сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Химичният мониторинг дава официална регионална информация за
            водоносната система, но не е лабораторен анализ на водата от
            конкретния имот. Един бъдещ или съществуващ сондаж може да черпи от
            различна дълбочина и от различен водоносен хоризонт. Ако трябва да
            се установи дали водата от конкретен сондаж е подходяща за определена
            употреба, необходима е проба именно от него и подходящ лабораторен
            анализ.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/monitoring"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Мониторинг
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
          официални данни и програми за химичен мониторинг на подземните води,
          планове за управление на речните басейни и утвърдени принципи за
          оценка на химичното състояние на подземните водни тела.
        </div>
      </article>
    </main>
  );
}