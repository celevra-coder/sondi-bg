import Link from "next/link";

export const metadata = {
  title:
    "Какво означава трансгранично подземно водно тяло? | Sondi.bg",
  description:
    "Какво представляват трансграничните подземни води, защо България обменя информация с Гърция и Турция и как това се отразява на управлението на водните ресурси.",
};

export default function TransboundaryGroundwaterKnowledgePage() {
  const cooperationTopics = [
    {
      title: "Граници на водните тела",
      text:
        "Съседните държави обменят информация за разположението и характеристиките на водните тела около държавната граница.",
      tone: "bg-[#edf8fa]",
    },
    {
      title: "Химично и количествено състояние",
      text:
        "Обсъждат се оценките за качеството на водата, наличния ресурс и възможните промени във водните запаси.",
      tone: "bg-[#eef8f2]",
    },
    {
      title: "Натиск и риск от замърсяване",
      text:
        "Разглеждат се влиянието на населени места, промишленост, земеделие и водовземане върху общите водни ресурси.",
      tone: "bg-[#fff8e8]",
    },
    {
      title: "Мониторинг и мерки",
      text:
        "Обменът на данни може да подпомогне координирано наблюдение и планиране на действия за опазване на водите.",
      tone: "bg-[#f3f1fa]",
    },
  ];

  const riverBasins = [
    {
      title: "Марица",
      text:
        "Речният басейн има трансграничен характер и е предмет на координация между България, Гърция и Турция.",
    },
    {
      title: "Арда",
      text:
        "Басейнът се обсъжда в рамките на сътрудничеството между България и Гърция.",
    },
    {
      title: "Тунджа",
      text:
        "По въпросите на трансграничното управление се осъществява координация между България и Турция.",
    },
  ];

  const practicalClarifications = [
    "Държавната граница не е задължително геоложка граница.",
    "Не всяко водно тяло близо до границата е официално определено като трансгранично.",
    "Необходим е обмен на информация между компетентните институции.",
    "Решенията се основават на официални данни, граници и оценки.",
    "Трансграничният характер не показва сам по себе си качеството на конкретен сондаж.",
    "За конкретен имот са необходими местни данни и при необходимост лабораторна проба.",
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
            Трансгранични води · Раздел 10
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво означава
            <br />
            трансгранично подземно водно тяло?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Защо подземните води невинаги следват
            държавните граници и как съседните страни
            координират тяхното опазване.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[920px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво представляват трансграничните подземни води?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Подземните води се движат през геоложки
              пластове и водоносни хоризонти, които не
              е задължително да съвпадат с държавните
              граници.
            </p>

            <p>
              Когато водоносна система или подземно водно
              тяло се простира към територията на съседна
              държава, възниква необходимост от обмен на
              информация и координация между съответните
              институции.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо е необходима координация?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Натискът върху водите, замърсяването или
              интензивното водовземане могат да имат
              значение за по-широка водоносна система.
              Затова съседните държави обменят налични
              данни и обсъждат общи подходи за оценка.
            </p>

            <p>
              Координацията помага за по-добро разбиране
              на границите на водните тела, състоянието
              на водите и възможните мерки за опазване.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Каква информация обменят държавите?
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {cooperationTopics.map((topic) => (
              <div
                key={topic.title}
                className={
                  `border border-[#dce8ea] p-6 ${topic.tone}`
                }
              >
                <h3 className="text-lg font-semibold text-[#244b55]">
                  {topic.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {topic.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кои речни басейни са засегнати?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              В Източнобеломорския район трансграничната
              координация обхваща основните поречия,
              които се споделят със съседните държави.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {riverBasins.map((basin) => (
              <div
                key={basin.title}
                className="border border-[#dce8ea] bg-white p-6"
              >
                <h3 className="text-xl font-semibold text-[#244b55]">
                  {basin.title}
                </h3>

                <p className="mt-3 leading-7 text-[#637c82]">
                  {basin.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Всяко водно тяло до границата ли е трансгранично?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Не. Близостта до държавната граница сама
              по себе си не е достатъчна, за да бъде
              дадено подземно водно тяло определено
              като трансгранично.
            </p>

            <p>
              Необходими са данни за разположението
              на водоносните пластове, границите на
              водните тела и информация от съседната
              държава.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-[#d8a445] bg-[#fff8e8] p-6">
            <strong>
              Трансграничният характер трябва да бъде
              установен с официални данни.
            </strong>

            <p className="mt-2 leading-7 text-[#68757a]">
              Местоположението до границата не доказва
              автоматично наличието на общо подземно
              водно тяло.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава това за конкретен имот?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Трансграничната координация е важна за
              управлението на водните ресурси на
              регионално и международно равнище.
            </p>

            <p>
              Тя обаче не показва сама по себе си
              дълбочината, дебита или качеството на
              водата в конкретен имот.
            </p>

            <p>
              За практическа оценка значение имат
              местната геология, данните за конкретното
              подземно водно тяло, мониторингът и
              резултатите от реални проучвания.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво е важно да запомниш?
          </h2>

          <div className="mt-8 grid gap-px bg-[#dce8ea] md:grid-cols-2">
            {practicalClarifications.map((clarification) => (
              <div
                key={clarification}
                className="bg-white p-6 text-[#536f76]"
              >
                <span className="mr-3 text-[#2c8498]">
                  ✓
                </span>

                {clarification}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Най-важното
          </div>

          <p className="mt-5 text-lg leading-8 text-white/80">
            Подземните води могат да преминават отвъд
            държавните граници. Затова България обменя
            информация с Гърция и Турция, но конкретните
            изводи за даден имот трябва да се основават
            на местни и надеждно установени данни.
          </p>
        </div>

        <section className="mt-14 border-t border-[#dce8ea] pt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6d969f]">
            Източник
          </div>

          <p className="mt-3 text-sm leading-7 text-[#6b8187]">
            ПУРБ 2022–2027, Раздел 10: трансгранична
            координация при актуализацията на плана
            за управление на речните басейни в
            Източнобеломорски район.
          </p>
        </section>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/water-quality/environmental-objectives-exemptions"
            className="text-sm text-[#56818b]"
          >
            ← Екологични цели и срокове
          </Link>

          <Link
            href="/knowledge/water-quality"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Всички материали →
          </Link>
        </div>
      </article>
    </main>
  );
}