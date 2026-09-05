import Link from "next/link";

export const metadata = {
  title: "Мониторинг за питейни води и защитни зони | Sondi.bg",
  description:
    "Разбираемо обяснение какво представлява мониторингът на подземни води за питейни цели и как се тълкуват данните за защитни зони в анализите на SONDI.BG.",
};

export default function DrinkingWaterMonitoringKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Мониторинг за питейни води и защитни зони
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Част от мониторинговите пунктове са свързани с подземни води,
            използвани или предназначени за питейно водоснабдяване. Тези данни
            са особено важни, защото показват състоянието на водите в зони,
            където опазването на качеството има пряко значение за човешкото
            потребление.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава мониторинг за питейни води
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Това е наблюдение на подземни води, които имат значение за
            водоснабдяване за питейни цели. В тези пунктове се следят показатели,
            които могат да покажат промяна в качеството или риск за водата.
            Мониторингът помага да се установи дали състоянието се запазва
            стабилно и дали има признаци за неблагоприятно въздействие.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво е защитена зона
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Защитените зони се определят с цел опазване на водоизточници и
            водни ресурси, които са важни за питейното водоснабдяване. В тези
            райони се обръща по-голямо внимание на дейности, които могат да
            повлияят върху качеството или количеството на подземните води.
            Мониторинговите данни са част от контрола върху това състояние.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какви показатели могат да се следят
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В зависимост от конкретното водно тяло и програмата за мониторинг
            могат да се изследват нитрати, амоний, сулфати, хлориди,
            електропроводимост, метали и други вещества. Целта е да се открият
            промени, които могат да бъдат важни за качеството на водния ресурс
            и за необходимостта от допълнителни мерки.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Пункт за питейни води не означава автоматично питейна вода навсякъде
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Фактът, че в едно подземно водно тяло има мониторингов пункт,
            свързан с питейно водоснабдяване, не означава, че всяка вода в
            района е годна за пиене. Пунктът дава информация за конкретно място
            и конкретен водоносен хоризонт. За вода от отделен сондаж е необходим
            собствен лабораторен анализ.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо защитните зони са важни при оценка на конкретно място
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако дадена координата попада в или близо до защитена зона, това е
            важна информация за начина, по който се използва и опазва подземният
            воден ресурс. Възможно е да има допълнителни ограничения, контрол
            или изисквания към дейности, които могат да повлияят върху
            водоизточника. Затова защитените зони не трябва да се разглеждат само
            като линия на карта, а като част от режима на опазване на водите.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво виждаш в PRO анализа на SONDI.BG
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В PRO анализа могат да се показват пунктове, обозначени като
            свързани с питейни води или защитни зони. Тази информация се
            разглежда заедно с химичното състояние, установените превишения,
            проблемните показатели и останалите мониторингови данни за
            съответното подземно водно тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как правилно да използваш тази информация
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Мониторингът за питейни води е силен ориентир за значението и
            чувствителността на дадено подземно водно тяло. Той обаче не е
            заместител на анализ на конкретна проба. При оценка за сондаж трябва
            да се съчетаят данните за защитените зони, мониторинговите пунктове,
            геологията, водоносните хоризонти и предназначението на бъдещото
            водовземане.
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
          официални мониторингови програми, данни за подземни води за питейни
          цели, защитени зони и планове за управление на речните басейни.
        </div>
      </article>
    </main>
  );
}