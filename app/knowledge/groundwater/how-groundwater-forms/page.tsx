import KnowledgeArticleJsonLd from "@/components/KnowledgeArticleJsonLd";
export const metadata = {
  alternates: { canonical: "/knowledge/groundwater/how-groundwater-forms" },

  title: "Как се образуват подземните води?",
  description: "Как се образуват подземните води? Валежите проникват в почвата, просмукват се през пропускливи пластове и подхранват зоната на насищане и водоносните хоризонти.",
};

import Link from "next/link";

export default function HowGroundwaterFormsPage() {
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
            Образователна статия
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как се образуват
            <br />
            подземните води?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Водата под земята е част от естествения воден кръговрат.
            Тя започва пътя си най-често като дъжд или сняг,
            преминава през почвата и постепенно достига до
            водопропускливи пластове под повърхността.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Всичко започва на повърхността
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато вали, част от водата се оттича по повърхността
              към реки и езера, част се изпарява, а друга част
              прониква в почвата.
            </p>

            <p>
              Това проникване се нарича <strong className="text-[#173d47]">
                инфилтрация
              </strong>.
              Ако условията позволяват, водата продължава надолу
              през почвата и скалите.
            </p>
          </div>
        </section>

        <div className="my-12 bg-[#edf8fa] p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#438594]">
            Пътят на водата
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["01", "Валеж", "Дъжд или топящ се сняг достига земната повърхност."],
              ["02", "Инфилтрация", "Част от водата прониква в почвата."],
              ["03", "Просмукване", "Водата продължава надолу през пропускливите материали."],
              ["04", "Натрупване", "Достига зона, в която порите и пукнатините са запълнени с вода."],
              ["05", "Подземен поток", "Водата започва бавно да се движи през водоносната среда."],
            ].map(([n, title, text]) => (
              <div
                key={n}
                className="grid grid-cols-[45px_1fr] gap-4 border-b border-[#cfe3e7] pb-4"
              >
                <div className="text-sm text-[#6f9ba5]">{n}</div>
                <div>
                  <strong>{title}</strong>
                  <p className="mt-1 text-sm leading-6 text-[#637d84]">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Не всяка вода стига до голяма дълбочина
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Колко вода ще проникне надолу зависи от почвата,
              скалите, растителността, релефа, количеството валежи
              и вече наличната влага.
            </p>

            <p>
              Пясъците и чакълите например обикновено пропускат
              водата по-лесно от плътни глини. При напукани скали
              водата може да прониква по отделни пукнатини на
              значителна дълбочина.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е зона на насищане?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            На определена дълбочина може да се достигне среда,
            в която свободните пространства в почвата или скалата
            са запълнени с вода. Това е
            <strong className="text-[#173d47]"> наситената зона</strong>.
            Горната ѝ граница при свободен водоносен хоризонт
            е свързана с нивото на подземните води.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#f3fafb] p-7">
          <strong>Важно:</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Силен дъжд днес не означава непременно, че утре нивото
            на дълбоките подземни води ще се повиши. Пътят на водата
            до по-дълбоките хоризонти може да бъде бавен и да отнема
            значително време.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            От какво зависи подхранването на подземните води?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подхранването не зависи само от количеството валежи.
              Важни са пропускливостта на почвата и скалите,
              наклонът на терена, растителността и наличието на
              път към по-дълбоки водоносни зони.
            </p>

            <p>
              Затова два близки района с еднакво количество валежи
              могат да имат различно подхранване. При порести
              материали водата се просмуква през пространствата
              между зърната, а при напукани скали движението може
              да бъде концентрирано по пукнатини.
            </p>

            <p>
              Скоростта също е различна. Част от водата може да
              достигне плитка наситена зона сравнително бързо,
              докато попълването на по-дълбок водоносен хоризонт
              може да бъде много по-бавен процес.
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
                href="/knowledge/groundwater/rain-recharge"
                className="font-semibold text-[#257589]"
              >
                връзката между валежите и подхранването
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
                USGS Water Science School — Groundwater
              </a>
            </li>
          </ul>
        </section>

        <div className="mt-16 border-t border-[#dce8ea] pt-8">
          <div className="text-sm text-[#78949b]">
            Следваща статия
          </div>

          <Link
            href="/knowledge/groundwater/how-groundwater-moves"
            className="mt-2 inline-block text-xl font-semibold text-[#257589]"
          >
            Как се движи водата под земята? →
          </Link>
        </div>
      </article>
    </main>
  );
}