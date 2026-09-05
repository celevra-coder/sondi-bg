import Link from "next/link";

export const metadata = {
  title: "Какво трябва да се провери преди сондаж | Sondi.bg",
  description:
    "Кратък практически списък с основните проверки преди сондаж за подземна вода.",
};

export default function BeforeDrillingKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРАКТИКА И РЕГУЛАЦИИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво трябва да се провери преди сондаж
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Преди сондаж е добре да се направят няколко основни проверки, за да
            се избегнат решения само по една отделна информация.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка на местоположението
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Първо трябва да се установи към кое подземно водно тяло принадлежи
            избраната точка и какви основни характеристики са известни за района.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка на ресурса и състоянието
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Полезно е да се прегледат наличният ресурс, натоварването,
            количественото и химичното състояние на водното тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка на близките съоръжения
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Данните за близки сондажи, извори и други водовземни съоръжения
            могат да дадат полезен ориентир за местните условия.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка за защитени зони
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако мястото попада в защитена или санитарно-охранителна зона, трябва
            да се провери какъв режим е приложим за конкретната точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка на официалните регистри
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешителните и регистрите помагат да се разбере какви дейности и
            съоръжения вече са официално отчетени в района.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Проверка на геологията и сондажната перспектива
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Геологията, водоносните хоризонти, разломите и локалното проучване
            са важни за избора на реалната сондажна точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Кога е нужна допълнителна проверка
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато има защитени зони, противоречиви данни, специален режим или
            неяснота в регистрите, информацията трябва да се потвърди чрез
            актуален официален източник.
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