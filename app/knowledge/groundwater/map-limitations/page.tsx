import KnowledgeArticleJsonLd from "@/components/KnowledgeArticleJsonLd";
export const metadata = {
  alternates: { canonical: "/knowledge/groundwater/map-limitations" },

  title: "Какво не може да се определи само от картата?",
  description: "Картата може да даде много ценен контекст, но има въпроси, за които регионалните данни не са достатъчни.",
};

import Link from "next/link";

export default function MapLimitationsPage() {
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
          <Link
            href="/knowledge/groundwater"
            className="text-sm text-[#4e8795] hover:text-[#173d47]"
          >
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как да четем картата · 04
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво не може да се определи
            <br />
            само от картата?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Картата може да даде много ценен контекст, но има
            въпроси, за които регионалните данни не са достатъчни.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Няма карта, която да „вижда“ всеки метър под имота
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Регионалните слоеве обобщават информация за големи площи.
            Те не показват директно всички локални промени в
            дебелината на пластовете, пукнатините или водоносните зони.
          </p>
        </section>

        <div className="my-12 space-y-3">
          {[
            "Точната дълбочина, на която ще бъде достигната вода",
            "Точният дебит на бъдещ сондаж",
            "Точната дебелина на водоносния пласт под имота",
            "Литологията метър по метър",
            "Точното качество на водата в бъдещия сондаж",
            "Точното статично и динамично ниво на бъдещото съоръжение",
            "Гаранция за успешен сондаж",
          ].map((item) => (
            <div
              key={item}
              className="flex gap-4 border-b border-[#dce8ea] py-4"
            >
              <span className="font-bold text-[#a36858]">×</span>
              <span className="text-[#536f76]">{item}</span>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как тогава се стига до по-точна оценка?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Регионалната информация трябва да се комбинира с
            по-локални данни – близки сондажи, релеф, геоложка
            информация, теренно наблюдение и при необходимост
            геофизични измервания.
          </p>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="bg-[#f5fafb] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-[#739aa3]">
              Стъпка 1
            </div>
            <strong className="mt-3 block">Регионален контекст</strong>
            <p className="mt-2 text-sm leading-6 text-[#607b82]">
              ПВТ, геология, мониторинг и разломи.
            </p>
          </div>

          <div className="bg-[#f5fafb] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-[#739aa3]">
              Стъпка 2
            </div>
            <strong className="mt-3 block">Локални данни</strong>
            <p className="mt-2 text-sm leading-6 text-[#607b82]">
              Съседни сондажи, терен и известни водни обекти.
            </p>
          </div>

          <div className="bg-[#f5fafb] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-[#739aa3]">
              Стъпка 3
            </div>
            <strong className="mt-3 block">Теренен анализ</strong>
            <p className="mt-2 text-sm leading-6 text-[#607b82]">
              Измервания и професионална интерпретация.
            </p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            А какво все пак може да каже картата?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Тя може да покаже дали точката е в район с картографирани
            подземни води, каква е общата геоложка среда, къде са
            най-близките официални наблюдения и какви структурни
            особености има около координатата.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Това не е малко – просто трябва да се използва за
            правилния тип заключения.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо регионалните данни имат ограничения?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Геоложките, хидрогеоложките и мониторинговите карти обобщават
              информация за определен мащаб. Това означава, че една карта може
              да показва правилно регионалната среда и едновременно с това да не
              улавя малка локална промяна под конкретен имот.
            </p>

            <p>
              Подземните водни тела също са регионални единици за оценка и
              управление. Данните за тях са много полезни за статуса, ресурсите,
              мониторинга и общия хидрогеоложки контекст, но не представляват
              директно измерване във всяка отделна точка.
            </p>

            <p>
              Затова при оценка на конкретен имот е важно да се разграничават
              регионалните факти от локалната интерпретация. Колкото повече
              независими данни съвпадат около една точка, толкова по-добре може
              да се оцени геоложката и хидрогеоложката обстановка.
            </p>

            <p>
              Виж още{" "}
              <Link
                href="/knowledge/groundwater/groundwater-body"
                className="font-semibold text-[#257589]"
              >
                какво е подземно водно тяло
              </Link>
              {" "}и{" "}
              <Link
                href="/knowledge/practice/property-conclusions"
                className="font-semibold text-[#257589]"
              >
                какви изводи могат да се правят за конкретен имот
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
                href="https://water.europa.eu/freshwater/europe-freshwater/water-framework-directive/characterisation-of-water-bodies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                WISE Freshwater — Characterisation of water bodies
              </a>
            </li>
            <li>
              <a
                href="https://environment.ec.europa.eu/topics/water/groundwater_en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#257589] underline"
              >
                European Commission — Groundwater
              </a>
            </li>
          </ul>
        </section>
        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <strong className="text-lg">
            Регионалната карта и теренното проучване не са конкуренти.
          </strong>
          <p className="mt-3 leading-7 text-white/75">
            Те работят на различни нива. Картата дава широкия контекст,
            а локалното проучване помага този контекст да бъде
            приложен към конкретната точка.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/official-maps"
            className="border border-[#b7d5dc] px-6 py-3 text-sm font-medium text-[#27697a]"
          >
            ← Официалните карти
          </Link>

          <Link
            href="/map"
            className="bg-[#153d47] px-6 py-3 text-sm font-medium text-white"
          >
            Отвори картата →
          </Link>
        </div>
      </article>
    </main>
  );
}