import KnowledgeArticleJsonLd from "@/components/KnowledgeArticleJsonLd";
import Link from "next/link";

export const metadata = {
  alternates: { canonical: "/knowledge/practice/before-drilling" },

  title: "Какво трябва да се провери преди сондаж",
  description:
    "Кратък практически списък с основните проверки преди сондаж за подземна вода.",
};

export default function BeforeDrillingKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
        <KnowledgeArticleJsonLd
          title={metadata.title}
          description={metadata.description}
          path={metadata.alternates.canonical}
          sectionName="Практика и регулации"
          sectionPath="/knowledge/practice"
        />
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

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            В какъв ред е разумно да се направят проверките преди сондаж?
          </h2>

          <div className="mt-4 max-w-4xl space-y-5 text-base leading-8 text-[#58747c]">
            <p>
              Добра отправна точка е първо да се установи местоположението
              спрямо подземните водни тела, след което да се прегледат
              ресурсът, състоянието, близките водовземни съоръжения и
              приложимите ограничения.
            </p>

            <p>
              След регионалната проверка трябва да се разгледат локалните
              фактори — геология, водоносни хоризонти, разломи, релеф и
              налични данни от близки сондажи. Те са по-пряко свързани
              с избора на конкретна сондажна точка.
            </p>

            <p>
              Когато има противоречие между различни източници или когато
              се засягат разрешителни, защитени зони или друг специален режим,
              актуалната информация трябва да се потвърди в съответния
              официален регистър или компетентна институция.
            </p>

            <p>
              Виж още за{" "}
              <Link
                href="/knowledge/practice/official-check"
                className="font-semibold text-[#177f98]"
              >
                проверката в официални източници
              </Link>
              {" "}и за{" "}
              <Link
                href="/knowledge/practice/property-conclusions"
                className="font-semibold text-[#177f98]"
              >
                изводите за конкретен имот
              </Link>.
            </p>
          </div>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-xl font-bold text-[#173f48]">
            Източници и допълнително четене
          </h2>

          <ul className="mt-4 max-w-4xl space-y-2 text-sm leading-6 text-[#607b82]">
            <li>
              <a
                href="https://www.moew.government.bg/bg/vodi/planove-za-upravlenie/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#177f98] underline"
              >
                МОСВ — Планове за управление на водите
              </a>
            </li>
            <li>
              <a
                href="https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=celex%3A32000L0060"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#177f98] underline"
              >
                EUR-Lex — Water Framework Directive
              </a>
            </li>
          </ul>
        </section>
        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Свързани теми
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-[#637f87]">
            Продължете с практическите проверки, които са важни преди решение за сондаж или водовземане.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link
              href="/knowledge/practice/permits-and-registers"
              className="rounded-[18px] border border-[#dce8eb] bg-white px-5 py-4 text-sm font-semibold leading-6 text-[#177f98] transition hover:border-[#a9cfd6] hover:shadow-[0_10px_30px_rgba(23,63,72,.06)]"
            >
              Разрешителни и официални регистри →
            </Link>
            <Link
              href="/knowledge/practice/protection-zones"
              className="rounded-[18px] border border-[#dce8eb] bg-white px-5 py-4 text-sm font-semibold leading-6 text-[#177f98] transition hover:border-[#a9cfd6] hover:shadow-[0_10px_30px_rgba(23,63,72,.06)]"
            >
              Защитени и санитарно-охранителни зони →
            </Link>
            <Link
              href="/knowledge/practice/property-conclusions"
              className="rounded-[18px] border border-[#dce8eb] bg-white px-5 py-4 text-sm font-semibold leading-6 text-[#177f98] transition hover:border-[#a9cfd6] hover:shadow-[0_10px_30px_rgba(23,63,72,.06)]"
            >
              Какво може да се заключи за конкретен имот →
            </Link>
          </div>
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