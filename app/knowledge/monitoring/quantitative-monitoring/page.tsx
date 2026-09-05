import Link from "next/link";

export const metadata = {
  title: "Количествен мониторинг и водни нива | Sondi.bg",
  description:
    "Разбираемо обяснение какво показва количественият мониторинг на подземните води, как се следят водните нива и как да се тълкуват тези данни в SONDI.BG.",
};

export default function QuantitativeMonitoringKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Количествен мониторинг и водни нива
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Количественият мониторинг проследява как се променя наличното
            количество подземна вода във времето. Основният наблюдаван показател
            обикновено е водното ниво, но оценката включва и връзката между
            подхранването, водовземането и състоянието на водния ресурс.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показва количественият мониторинг
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Този вид мониторинг има за цел да покаже дали подземният воден ресурс
            се запазва устойчив или постепенно се изчерпва. Наблюдава се как
            реагира водното ниво при сезонни промени, суша, валежи и интензивно
            водовземане. Така може да се установи дали водоносната система се
            възстановява нормално или е под продължителен натиск.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава водно ниво
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водното ниво е положението на подземната вода в наблюдавания пункт
            към момента на измерването. То може да се отчита като дълбочина под
            терена или като абсолютна кота спрямо определена височинна система.
            Самата стойност има смисъл само ако се знае къде е пунктът, каква е
            неговата конструкция и кой водоносен хоризонт наблюдава.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо водното ниво се променя
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземните води реагират на валежите, снеготопенето, речните нива,
            сезонното подхранване и водовземането от сондажи и кладенци. В някои
            райони нивото може да се променя бързо, а в по-дълбоки водоносни
            системи реакцията може да бъде по-бавна. Затова еднократното
            измерване не е достатъчно за оценка на дългосрочното състояние.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо нивото в мониторингов пункт не е дълбочината до вода навсякъде
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водно ниво, измерено в един пункт, не може директно да се използва
            като прогноза за бъдещ сондаж в друг имот. Релефът, геологията,
            дълбочината на водоносния пласт и конструкцията на съоръжението могат
            да бъдат различни. Два близки сондажа могат да имат различни водни
            нива, особено ако черпят от различни хоризонти.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава добро или лошо количествено състояние
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Оценката на количественото състояние разглежда дали използването на
            подземната вода е съвместимо с естественото възстановяване на
            ресурса и дали няма трайни неблагоприятни изменения. Добро състояние
            означава, че според официалната оценка водното тяло не показва
            недопустим количествен натиск. Лошото състояние показва наличие на
            значим проблем, който трябва да се разглежда по-внимателно.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво виждаш в PRO анализа на SONDI.BG
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В PRO анализа може да видиш броя на количествените мониторингови
            пунктове, официалното количествено състояние и информация за риска
            и натоварването на ресурса. За някои райони са налични и конкретни
            пунктове за наблюдение на водните нива. Тези данни се използват като
            част от общата оценка, а не като директна прогноза за нивото в
            конкретен бъдещ сондаж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как правилно да тълкуваш количествените данни
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-полезна е не една отделна стойност, а общата картина: как се
            променят нивата във времето, колко е натоварен ресурсът, има ли
            количествен риск и какво е официалното състояние на ПВТ. При оценка
            на конкретно място тези данни трябва да се съчетаят с геологията,
            водоносните хоризонти, релефа и наличната информация от близки
            сондажи.
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
          официални програми и данни за количествен мониторинг на подземните
          води, планове за управление на речните басейни и утвърдени принципи за
          оценка на количественото състояние на подземните водни тела.
        </div>
      </article>
    </main>
  );
}