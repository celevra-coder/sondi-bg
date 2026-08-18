import Link from "next/link";

export default function RainRechargePage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link href="/knowledge/groundwater" className="text-sm text-[#4e8795] hover:text-[#173d47]">
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как работят подземните води · 06
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как валежите стигат
            <br />
            до подземните води?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Валежът е важен източник на подхранване, но само част
            от падналата вода достига до водоносните хоризонти.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Къде отива дъждовната вода?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            След валеж водата може да се изпари, да бъде използвана
            от растенията, да се оттече по повърхността или да проникне
            в почвата. Само част от инфилтриралата вода продължава
            достатъчно надълбоко, за да подхрани подземните води.
          </p>
        </section>

        <div className="my-12 bg-[#edf8fa] p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#438594]">
            От облака до водоносния хоризонт
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["01", "Валеж", "Водата достига земната повърхност."],
              ["02", "Инфилтрация", "Част от нея прониква в почвата."],
              ["03", "Просмукване", "Водата преминава през ненаситената зона."],
              ["04", "Подхранване", "Част от водата достига наситената зона."],
              ["05", "Подземно движение", "Водата се включва в подземния поток."],
            ].map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[45px_1fr] gap-4 border-b border-[#cfe3e7] pb-4">
                <span className="text-sm text-[#6f9ba5]">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p className="mt-1 text-sm leading-6 text-[#637d84]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Повече дъжд не винаги означава повече подхранване
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Много силен кратък дъжд може да причини значително
              повърхностно оттичане и сравнително малка инфилтрация.
            </p>

            <p>
              По-продължителните валежи могат в определени условия
              да проникнат по-дълбоко, но резултатът зависи от почвата,
              скалите, растителността, релефа и началната влажност.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Колко бързо реагират подземните води?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Плитка водоносна система може да реагира сравнително
            бързо на влажни или сухи периоди. По-дълбока система,
            отделена от повърхността чрез по-слабо пропускливи
            пластове, може да реагира значително по-бавно.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Затова един дъждовен месец не решава дълга суша</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Подземните водни ресурси зависят от натрупания баланс
            между подхранване и водочерпене за по-дълъг период,
            а не само от последния валеж.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-[#dce8ea] pt-8">
          <Link href="/knowledge/groundwater/springs" className="border border-[#b7d5dc] px-6 py-3 text-sm font-medium text-[#27697a]">
            ← Естествени извори
          </Link>

          <Link href="/knowledge/groundwater" className="bg-[#153d47] px-6 py-3 text-sm font-medium text-white">
            Всички теми →
          </Link>
        </div>
      </article>
    </main>
  );
}