import Link from "next/link";

export const metadata = {
  title:
    "Какво означава химично състояние на подземните води? | Sondi.bg",
  description:
    "Разбираемо обяснение на доброто и лошото химично състояние на подземните водни тела и правилното тълкуване на официалната оценка.",
};

export default function ChemicalStatusKnowledgePage() {
  const assessmentTests = [
    {
      title: "Обща химична оценка",
      text:
        "Обобщава резултатите за наблюдаваните вещества и показва дали водното тяло изпълнява изискванията за добро състояние.",
    },
    {
      title: "Солено или замърсяващо навлизане",
      text:
        "Проверява има ли навлизане на солени или други замърсени води, което променя естественото качество.",
    },
    {
      title: "Въздействие върху повърхностни води",
      text:
        "Оценява дали състоянието на подземните води създава проблеми за свързани реки, езера и други повърхностни води.",
    },
    {
      title: "Въздействие върху зависими екосистеми",
      text:
        "Проследява дали промените в подземните води засягат екосистеми, които зависят от тях.",
    },
    {
      title: "Влошаване на води за питейни нужди",
      text:
        "Проверява дали качеството на използваните подземни води се влошава и изисква по-сериозно третиране.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link
            href="/knowledge/water-quality"
            className="text-sm text-[#4e8795] hover:text-[#173d47]"
          >
            ← Качество и състояние
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Официална оценка · Раздел 4
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво означава
            <br />
            химично състояние?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Химичното състояние показва дали качеството
            на едно подземно водно тяло отговаря на
            официалните изисквания за добро състояние.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Това е оценка за цялото водно тяло
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подземното водно тяло може да обхваща
              голяма територия, множество населени места
              и различни водоносни пластове. Затова
              химичното състояние е регионална оценка,
              а не резултат от една конкретна проба.
            </p>

            <p>
              Оценката се основава на мониторингови
              пунктове, изследвани показатели, установени
              превишения и възможното въздействие върху
              водите, екосистемите и питейното
              водоснабдяване.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Добро и лошо химично състояние
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            <div className="bg-[#eef8f2] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#31805b]">
                Добро
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#245640]">
                Изискванията са изпълнени
              </h3>

              <p className="mt-3 leading-7 text-[#58746a]">
                Наличните данни не показват значим
                химичен проблем за водното тяло според
                използваните официални тестове.
              </p>
            </div>

            <div className="bg-[#fff1f1] p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b24a4a]">
                Лошо
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#833838]">
                Установен е химичен проблем
              </h3>

              <p className="mt-3 leading-7 text-[#785858]">
                Един или повече тестове показват
                превишения, отрицателно въздействие или
                друг проблем, който не позволява общата
                оценка да бъде добра.
              </p>
            </div>
          </div>
        </section>

        <div className="my-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Лошо състояние не означава, че всяка точка
            в района има еднакъв проблем
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Превишенията може да са установени само в
            част от мониторинговите пунктове или за
            определени показатели. Регионалната оценка
            предупреждава, че проблемът съществува в
            рамките на водното тяло и трябва да бъде
            взет предвид.
          </p>
        </div>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Официални тестове
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Какво се проверява?
          </h2>

          <div className="mt-8 grid gap-4">
            {assessmentTests.map((test, index) => (
              <div
                key={test.title}
                className="grid gap-3 border border-[#dce8ea] p-6 md:grid-cols-[48px_1fr]"
              >
                <div className="text-sm font-semibold text-[#6b9aa5]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#244b55]">
                    {test.title}
                  </h3>

                  <p className="mt-2 leading-7 text-[#637c82]">
                    {test.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Каква е ролята на проблемните показатели?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато състоянието е лошо, официалната
              оценка може да посочва показатели като
              нитрати, сулфати, амониеви йони, метали,
              обща алфа-активност или други вещества.
            </p>

            <p>
              Те показват какъв тип проблем е установен,
              но трябва да се разглеждат заедно с
              мониторинговите пунктове, измерените
              стойности, праговете и тенденциите.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Състояние и риск не са едно и също
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            <div className="bg-white p-6">
              <strong className="text-[#173d47]">
                Химично състояние
              </strong>

              <p className="mt-2 leading-7 text-[#637c82]">
                Показва официалната оценка на наличните
                данни за разглеждания период.
              </p>
            </div>

            <div className="bg-white p-6">
              <strong className="text-[#173d47]">
                Химичен риск
              </strong>

              <p className="mt-2 leading-7 text-[#637c82]">
                Показва опасността водното тяло да не
                постигне или запази добро състояние.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Какво означава за конкретен имот?
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Химичното състояние дава важен регионален
            контекст. То показва какви проблеми са
            установени в по-голямата подземна система,
            но не определя автоматично качеството на
            водата в конкретен кладенец или сондаж.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 4 – оценка на
            химичното състояние на подземните водни
            тела и свързаните приложения.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality"
            className="text-sm text-[#56818b]"
          >
            ← Качество и състояние
          </Link>

          <Link
            href="/knowledge/water-quality/chemical-risk"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво означава „в риск“? →
          </Link>
        </div>
      </article>
    </main>
  );
}