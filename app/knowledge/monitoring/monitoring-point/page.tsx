import Link from "next/link";

export const metadata = {
  title: "Какво е мониторингов пункт? | Sondi.bg",
  description:
    "Разбираемо обяснение какво представлява мониторинговият пункт, какви данни се събират от него и как да се тълкува в анализите на SONDI.BG.",
};

export default function MonitoringPointKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво е мониторингов пункт
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Мониторинговият пункт е конкретно място, от което се събират
            официални наблюдения за подземните води. Той може да дава информация
            за водно ниво, химичен състав, промени във времето или други
            показатели, но резултатите винаги трябва да се тълкуват спрямо
            водното тяло, дълбочината и местните условия.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво представлява мониторинговият пункт
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Това е наблюдателна точка, включена в официална мониторингова мрежа.
            Най-често тя е сондаж, кладенец, каптиран извор или друго съоръжение,
            от което могат надеждно да се вземат проби или да се измерва водното
            ниво. Пунктът има определено местоположение и е свързан с конкретно
            подземно водно тяло или водоносен хоризонт.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какви данни могат да се събират
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В зависимост от предназначението на пункта могат да се измерват
            различни характеристики. При количествения мониторинг се следят
            водните нива и тяхното изменение. При химичния мониторинг се вземат
            водни проби и се изследват определени вещества и показатели. Някои
            пунктове са свързани и с наблюдение на води за питейни цели или със
            защитени зони.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Един пункт не представлява цялото подземно водно тяло
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземното водно тяло може да обхваща много голяма площ и да включва
            различни геоложки условия, дълбочини и водоносни хоризонти. Един
            мониторингов пункт показва какво е измерено на конкретното място.
            Затова единичен резултат не трябва автоматично да се пренася върху
            цялото водно тяло или върху всеки имот в него.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо близки пунктове могат да показват различни резултати
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Дори два пункта на сравнително малко разстояние могат да наблюдават
            различни части на водоносната система. Единият може да е по-плитък,
            другият по-дълбок, единият да е в пясъчно-чакълест пласт, а другият
            в пукнатинна скала. Различни източници на подхранване или локално
            замърсяване също могат да доведат до различни резултати.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава разстоянието до мониторингов пункт
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Близкият пункт обикновено е по-полезен за локална ориентировъчна
            оценка, но само разстоянието не е достатъчно. По-важно е дали пунктът
            наблюдава същото подземно водно тяло и същия водоносен хоризонт.
            Понякога по-далечен пункт в същата хидрогеоложка система може да е
            по-представителен от по-близък пункт, който наблюдава друга дълбочина.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се използва пунктът в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В SONDI.BG мониторинговите пунктове се разглеждат като част от
            официалната информация за подземното водно тяло. PRO анализът може
            да показва броя на химичните и количествените пунктове, налични
            превишения, проблемни показатели и други данни. Когато в избраната
            координата се припокриват няколко ПВТ, пунктовете се разглеждат
            отделно за всяко от тях.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво може и какво не може да се заключи
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Мониторинговият пункт може да даде много полезен ориентир за
            състоянието на подземните води в района и за измененията във времето.
            Той обаче не доказва какъв ще бъде дебитът, нивото или химичният
            състав на вода от бъдещ сондаж в конкретен имот. За такава оценка
            трябва да се съчетаят мониторинговите данни с геологията,
            дълбочината на водоносните хоризонти, близките сондажи и локалните
            условия.
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
          официални мониторингови програми и регистри за подземните води,
          басейнови планове за управление на водите и утвърдени принципи за
          хидрогеоложка интерпретация.
        </div>
      </article>
    </main>
  );
}