import Link from "next/link";

export default function WhatIsGroundwaterPage() {
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
            Основи · 01
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е
            <br />
            подземна вода?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Подземната вода е вода, която се намира под земната
            повърхност и запълва порите, пукнатините и кухините
            в почвите и скалите.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Водата не стои в огромна празна кухина
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато говорим за подземни води, често си представяме
              подземно езеро или река. В действителност в много
              райони водата се намира в малките пространства
              между зърната на пясък и чакъл или в пукнатините
              на скалите.
            </p>

            <p>
              Тези пространства могат да бъдат свързани помежду си,
              което позволява на водата постепенно да се движи
              през подземната среда.
            </p>
          </div>
        </section>

        <div className="my-12 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Най-просто казано</strong>

          <p className="mt-2 leading-7 text-[#5b767d]">
            Представи си съд, пълен с чакъл. Между камъчетата
            има празни пространства. Ако налеем вода, тя запълва
            тези пространства. Подобен принцип действа и в много
            естествени водоносни пластове.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Откъде идва подземната вода?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Основен източник е водата от валежите и снеготопенето.
              Част от нея прониква в почвата и при подходящи условия
              продължава надолу.
            </p>

            <p>
              Това подхранване може да бъде допълвано и от реки,
              езера или други повърхностни води, когато геоложките
              условия позволяват връзка между тях и подземния
              водоносен пласт.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Ненаситена и наситена зона
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border border-[#dce8ea] p-7">
              <div className="text-xl font-semibold">
                Ненаситена зона
              </div>
              <p className="mt-3 leading-7 text-[#607b82]">
                Порите съдържат едновременно въздух и вода.
                Водата може да се просмуква надолу през тази зона.
              </p>
            </div>

            <div className="border border-[#dce8ea] bg-[#f4fafb] p-7">
              <div className="text-xl font-semibold">
                Наситена зона
              </div>
              <p className="mt-3 leading-7 text-[#607b82]">
                Свързаните пори и пукнатини са запълнени
                преимуществено с вода. Именно тук говорим
                за подземни води в хидрогеоложки смисъл.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Подземната вода може да бъде плитка или много дълбока
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Няма една универсална дълбочина, на която „започва“
            подземната вода. Тя зависи от релефа, геологията,
            валежите, сезона, водочерпенето и конкретната
            водоносна система.
          </p>
        </section>

        <div className="mt-16 border-t border-[#dce8ea] pt-8">
          <div className="text-sm text-[#78949b]">
            Следваща тема от Основи
          </div>

          <Link
            href="/knowledge/groundwater/aquifer"
            className="mt-2 inline-block text-xl font-semibold text-[#257589]"
          >
            Какво е водоносен пласт? →
          </Link>
        </div>
      </article>
    </main>
  );
}