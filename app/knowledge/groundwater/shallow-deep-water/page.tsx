import KnowledgeArticleJsonLd from "@/components/KnowledgeArticleJsonLd";
export const metadata = {
  alternates: { canonical: "/knowledge/groundwater/shallow-deep-water" },

  title: "Плитки и дълбоки подземни води",
  description: "Дълбочината има значение, но не е единственият фактор. Плитките и дълбоките водоносни системи могат да се подхранват различно и да реагират различно на суша.",
};

import Link from "next/link";

export default function ShallowDeepWaterPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
        <KnowledgeArticleJsonLd
          title={metadata.title}
          description={metadata.description}
          path={metadata.alternates.canonical}
          sectionName="Подземни води"
          sectionPath="/knowledge/groundwater"
        />
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link href="/knowledge/groundwater" className="text-sm text-[#4e8795] hover:text-[#173d47]">
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как работят подземните води · 03
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Плитки и дълбоки
            <br />
            подземни води
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Дълбочината има значение, но не е единственият фактор.
            Плитките и дълбоките водоносни системи могат да се
            подхранват различно и да реагират различно на суша,
            замърсяване и водочерпене.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво наричаме „плитка“ вода?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Няма универсална дълбочина, която навсякъде да разделя
            плитките от дълбоките подземни води. Значението зависи
            от геологията и конкретната водоносна система.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Обикновено под „плитки“ се разбират води, които са
            по-близо до повърхността и имат по-пряка връзка с
            валежите, реките и сезонните промени.
          </p>
        </section>

        <div className="my-12 grid gap-5 md:grid-cols-2">
          <div className="border border-[#dce8ea] bg-[#f4fafb] p-7">
            <h3 className="text-xl font-semibold">Плитки води</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#607b82]">
              <li>• По-пряко се подхранват от валежи</li>
              <li>• По-често реагират на сезонни промени</li>
              <li>• По-уязвими са към замърсяване от повърхността</li>
              <li>• Нивото им може да се изменя по-бързо</li>
            </ul>
          </div>

          <div className="border border-[#dce8ea] bg-white p-7">
            <h3 className="text-xl font-semibold">По-дълбоки води</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#607b82]">
              <li>• Може да имат по-бавно подхранване</li>
              <li>• Често реагират по-бавно на валежи</li>
              <li>• Могат да бъдат по-добре защитени от повърхностни влияния</li>
              <li>• Понякога са под хидравличен напор</li>
            </ul>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            По-дълбоко не означава автоматично „по-добре“
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Дълбокият водоносен хоризонт може да бъде по-стабилен,
              но това не гарантира по-голям дебит или по-добро качество.
            </p>

            <p>
              В някои райони по-дълбоките води могат да бъдат
              по-минерализирани или да съдържат естествено повишени
              концентрации на определени вещества.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо един имот може да има повече от един водоносен хоризонт?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Геоложките пластове са разположени един над друг.
            Възможно е плитък водоносен слой да бъде отделен от
            по-дълбока водоносна система чрез глина или друга
            по-слабо пропусклива среда.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кое е по-важно при сондаж — дълбочината или водоносната среда?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Самата дълбочина не показва дали един водоносен хоризонт
              ще бъде подходящ за сондаж. По-важно е каква геоложка среда
              се пресича, каква е нейната пропускливост и дали може устойчиво
              да подава вода към сондажа.
            </p>

            <p>
              Плитък водоносен хоризонт може да има добър дебит, но да реагира
              по-бързо на суша, сезонни промени или повърхностни влияния.
              По-дълбок хоризонт може да бъде по-слабо зависим от краткосрочни
              промени, но това не означава автоматично по-голям ресурс.
            </p>

            <p>
              Затова при оценка на конкретно място е важно да се разглеждат
              заедно дълбочината, типът на водоносната среда, нивото на водата,
              геоложката структура и данните от близки сондажи.
            </p>

            <p>
              Виж още за{" "}
              <Link
                href="/knowledge/groundwater/aquifer"
                className="font-semibold text-[#257589]"
              >
                водоносните пластове
              </Link>
              {" "}и за{" "}
              <Link
                href="/knowledge/groundwater/water-level"
                className="font-semibold text-[#257589]"
              >
                разликата между водно ниво и дълбочина на водоносния хоризонт
              </Link>.
            </p>
          </div>
        </section>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <h2 className="text-xl font-semibold">
            Източници и допълнително четене
          </h2>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-[#607b82]">
            <li>
              <a
                href="https://www.usgs.gov/water-science-school/science/aquifers-and-groundwater"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                USGS — Aquifers and Groundwater
              </a>
            </li>
            <li>
              <a
                href="https://www.usgs.gov/water-science-school/groundwater"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                USGS — Groundwater
              </a>
            </li>
          </ul>
        </section>
        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Важно за сондажите</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Решението дали да се търси плитък или по-дълбок хоризонт
            трябва да се основава на геологията, предназначението
            на водата, нужния дебит и данните от конкретния район.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link href="/knowledge/groundwater/how-groundwater-moves" className="text-sm text-[#56818b]">
            ← Как се движи водата?
          </Link>

          <Link href="/knowledge/groundwater/artesian-water" className="text-right text-sm font-semibold text-[#257589]">
            Какво е артезианска вода? →
          </Link>
        </div>
      </article>
    </main>
  );
}