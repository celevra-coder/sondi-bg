import Link from "next/link";

export const metadata = {
  title: "Как се съчетават геология, разломи и геофизични данни | Sondi.bg",
  description:
    "Как геоложкият строеж, разломните структури и геофизичните измервания се използват заедно при оценка на сондажна перспектива.",
};

export default function GeologyFaultsGeophysicsKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Как се съчетават геология, разломи и геофизични данни
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Геологията показва средата, разломите показват структурния контрол,
            а геофизиката проверява как тази среда се променя локално. Когато
            трите източника се разглеждат заедно, оценката за сондажна
            перспектива става значително по-смислена.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Геологията показва в каква среда се търси вода
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Първо трябва да се разбере какъв е геоложкият строеж — насипни
            седименти, карбонатни скали, вулканити, кристалинни скали или друга
            среда. От това зависи дали водата се очаква основно в пори,
            пукнатини, каверни или определени водоносни пластове.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Разломите могат да контролират движението на водата
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разломните зони често са придружени от пукнатини и раздробяване на
            скалата. Това може да увеличи вторичната пропускливост и да създаде
            предпочитани пътища за движение на подземните води. В други случаи
            разломът може да има и бариерен ефект, ако зоната е запълнена с
            слабо пропусклив материал.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо близостта до разлом не е достатъчна
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Самото наличие на разлом наблизо не означава автоматично, че
            конкретната точка е подходяща за сондаж. Важно е какъв е типът на
            скалите, как е ориентирана структурата, дали има съпътстваща
            пукнатинност и дали има други признаци за водоносност.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как геофизиката проверява структурната хипотеза
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако по картни или геоложки данни се предполага разломна или
            пукнатинна зона, геофизично профилиране през нея може да покаже дали
            на терена действително се наблюдава контраст. Това е особено важно,
            когато структурата не е видима на повърхността.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Най-важни са зоните на съвпадение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Силна предварителна цел е зона, в която геоложката среда е
            благоприятна, има структурен контрол и геофизиката отчита съответна
            аномалия. Ако към това има и близки сондажи или извори със сходна
            хидрогеоложка връзка, оценката става още по-убедителна.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означават пресичанията на структури
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Местата, където основна разломна зона се пресича с напречни
            пукнатини или друга структурна линия, могат да бъдат особено
            интересни. Такива пресичания понякога създават по-развита
            пукнатинност и по-добра хидравлична свързаност от единична линейна
            структура.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG използва тази комбинация
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът съпоставя официалната геоложка и хидрогеоложка
            информация с известните разломни структури и локалните данни около
            избраната точка. Тази рамка може да се използва за по-добро
            планиране на теренно геофизично проучване и за избор на профили,
            които пресичат най-интересните структури.
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
          геологията определя възможната водоносна среда, структурните данни
          показват потенциалните пътища за движение на водата, а геофизиката
          проверява дали на конкретното място има измерим контраст.
        </div>
      </article>
    </main>
  );
}