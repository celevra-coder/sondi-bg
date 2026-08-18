import Link from "next/link";

export default function HowGroundwaterFormsPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
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