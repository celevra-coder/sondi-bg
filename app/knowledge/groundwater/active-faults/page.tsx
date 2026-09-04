import fs from "fs";
import path from "path";
import Link from "next/link";

type FaultSource = {
  source_id?: string;
  title?: string;
  title_bg?: string;
  authors?: string[] | null;
  year?: number | string | null;
  institution?: string | null;
  publisher?: string | null;
  source_type?: string | null;
  url?: string | null;
  supports?: string[];
  limitations?: string[];
};

type FaultSourceRegistry = {
  source_count?: number;
  generated_date?: string;
  sources?: FaultSource[];
};

function loadFaultSourceRegistry(): FaultSourceRegistry {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "geology-map",
      "data",
      "active_faults_source_registry.json"
    );

    return JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as FaultSourceRegistry;
  } catch {
    return {
      source_count: 0,
      sources: [],
    };
  }
}

function sourceTypeLabel(value?: string | null) {
  switch (value) {
    case "official_gis_dataset":
      return "Официален GIS набор";

    case "international_fault_catalog":
      return "Международен разломен каталог";

    case "seismogenic_source_model":
      return "Сеизмогенен модел";

    case "scientific_paper":
    case "peer_reviewed_scientific_paper":
    case "peer_reviewed_scientific_publication":
      return "Научна публикация";

    case "scientific_conference_paper":
      return "Научна конференционна публикация";

    case "official_geological_map":
      return "Официална геоложка карта";

    case "scientific_geological_publication":
      return "Научна геоложка публикация";

    case "regional_scientific_context":
      return "Регионален научен източник";

    default:
      return value || "Източник";
  }
}

export default function ActiveFaultsKnowledgePage() {
  const registry =
    loadFaultSourceRegistry();

  const allSources =
    Array.isArray(registry.sources)
      ? registry.sources
      : [];

  const representativeIds = new Set([
    "SRC-MRRB-2025",
    "SRC-GEM-SONDI",
    "SRC-EFSM20",
    "SRC-GANAS-2005",
    "SRC-GEORGIEV-NAKOV-2014",
    "SRC-RADULOV-ET-AL-2015",
    "SRC-RADULOV-2023-NORTH-SOFIA",
    "SRC-WEST-PIRIN-FAULT-SCIENCE",
  ]);

  const representativeSources =
    allSources.filter(
      (source) =>
        source.source_id &&
        representativeIds.has(
          source.source_id
        )
    );

  const sourceCount =
    Number(
      registry.source_count ??
      allSources.length
    );

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
            Структурна геология · Разломи
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Активните разломи
            <br />
            и подземните води
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Разломите са едни от най-важните структурни
            елементи в земната кора. Те могат да влияят
            върху това къде се натрупва вода, по какви
            пътища се движи и къде могат да възникнат
            по-пропускливи или по-слабо пропускливи зони.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво всъщност е разлом?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Геоложкият разлом е зона, в която скалите
              са били разкъсани и части от земната кора
              са се разместили една спрямо друга.
              Разломът не е просто тънка линия.
              В природата той може да представлява
              сложна зона от основна разломна повърхност,
              вторични разклонения, напукване, раздробени
              скали и деформирани участъци.
            </p>

            <p>
              Ширината на тази структурно нарушена зона
              може да бъде различна. Именно затова върху
              регионална карта често е по-коректно да се
              говори за разломна зона или разломен
              коридор, а не за точна линия със сантиметрова
              географска точност.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава „активен разлом“?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              При активните разломи има геоложки,
              геоморфоложки, сеизмологични или други
              доказателства за сравнително млада
              деформация и възможност за продължаваща
              тектонична активност.
            </p>

            <p>
              Това не означава, че всеки активен разлом
              се измества постоянно или че около всяка
              негова част непременно има земетресение.
              „Активен“ е геоложка характеристика и трябва
              да се разглежда в контекста на конкретния
              източник, мащаба и използваната методика.
            </p>
          </div>
        </section>

        <div className="my-12 grid gap-px bg-[#dce8ea] md:grid-cols-3">
          {[
            {
              title: "Нормален разлом",
              text:
                "Свързан е с разтягане на земната кора. Единият блок се спуска спрямо другия.",
            },
            {
              title: "Обратен разлом",
              text:
                "Свързан е със съкращаване и натиск. Единият блок се придвижва нагоре спрямо другия.",
            },
            {
              title: "Отсед",
              text:
                "Преобладава хоризонтално движение на блоковете един спрямо друг.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white p-6"
            >
              <strong>{item.title}</strong>

              <p className="mt-3 text-sm leading-6 text-[#607b82]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо разломите са важни за подземните води?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Движението по един разлом може да напука,
              раздроби и деформира скалата. Когато тези
              пукнатини останат отворени и взаимно
              свързани, те могат да създадат вторична
              пропускливост — тоест вода да се движи по
              пътища, които не биха съществували в
              ненапуканата скала.
            </p>

            <p>
              Затова в масивни скали, които по принцип
              имат малка първична порьозност, разломните
              и пукнатинните зони могат локално да бъдат
              особено важни за движението и натрупването
              на подземни води.
            </p>

            <p>
              Разломите могат да свързват водоносни
              хоризонти на различни дълбочини, да
              улесняват вертикалната циркулация и при
              определени геоложки условия да бъдат
              свързани с изкачване на по-дълбоки,
              включително термални води.
            </p>
          </div>
        </section>

        <div className="mt-10 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>
            Разломът не означава автоматично „има вода“
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Разломната зона може да бъде добър проводник
            на подземна вода, но може да има и обратното
            поведение. Ако е запълнена с глини, фино
            раздробен материал или минерални отложения,
            тя може частично или изцяло да действа като
            хидравлична бариера.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Проводник, бариера или и двете?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Реалното хидрогеоложко поведение на една
            разломна зона зависи от литологията,
            степента на напукване, вида на разломното
            запълване, дълбочината, напреженията в
            скалите и геометрията на структурата.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border border-[#dce8ea] p-6">
              <strong>
                Когато разломът е по-пропусклив
              </strong>

              <p className="mt-3 text-sm leading-6 text-[#647e84]">
                Свързаната система от пукнатини може да
                улесни движението на вода и да концентрира
                подземен поток.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <strong>
                Когато разломът е по-слабо пропусклив
              </strong>

              <p className="mt-3 text-sm leading-6 text-[#647e84]">
                Глинести или силно минерализирани
                разломни материали могат да ограничат
                преминаването на вода между два блока.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо пресечните и напречните структури са интересни?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Когато основен разлом се пресича или
              разклонява с друга структура, локалната
              степен на напукване може да бъде по-висока.
              Такива зони могат да представляват
              предпочитани участъци за циркулация на
              подземна вода.
            </p>

            <p>
              Това обаче е само структурен фактор.
              Перспективността на една конкретна точка
              трябва да се разглежда едновременно с
              водоносния хоризонт, литологията,
              релефа, близките водни обекти, известните
              сондажи и при необходимост с локално
              геофизично проучване.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво показва SONDI.BG?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            В PRO анализа различаваме няколко различни
            вида информация. Те не се смесват, защото
            всеки източник има различен мащаб и различно
            предназначение.
          </p>

          <div className="mt-8 space-y-4">
            <div className="border border-[#dce8ea] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#739aa3]">
                GEM
              </div>

              <strong className="mt-3 block text-lg">
                Регионална активна разломна геометрия
              </strong>

              <p className="mt-3 leading-7 text-[#607b82]">
                GEM линиите се използват за регионалното
                положение на активните разломни структури
                и за наличните каталогови характеристики,
                например код и тип движение. Те не се
                представят като сантиметрово точна
                повърхностна следа.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6c50]">
                MRRB
              </div>

              <strong className="mt-3 block text-lg">
                Официален буфериран разломен коридор
              </strong>

              <p className="mt-3 leading-7 text-[#607b82]">
                Данните на МРРБ са полигонови коридори.
                Те показват официално определена зона,
                свързана с активен разлом, а не точната
                геометрична линия на разломната
                повърхност.
              </p>
            </div>

            <div className="border border-[#dce8ea] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#547f8a]">
                Crosswalk
              </div>

              <strong className="mt-3 block text-lg">
                Валидирано съответствие между източници
              </strong>

              <p className="mt-3 leading-7 text-[#607b82]">
                Когато MRRB запис и GEM структура са
                свързани чрез проверен BGCS код и
                допълнителна научна проверка, SONDI.BG
                показва това като валидирано каталогово
                съответствие. Пространствената близост
                сама по себе си не се приема за
                доказателство, че два записа са един и
                същ разлом.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как се изчислява резултатът за конкретната точка?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="bg-[#f5fafb] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-[#739aa3]">
                GEM разстояние
              </div>

              <strong className="mt-3 block">
                Геометрично разстояние до линията
              </strong>

              <p className="mt-3 text-sm leading-6 text-[#607b82]">
                Изчислява се минималното пространствено
                разстояние между анализираната координата
                и сегментите на GEM разломната геометрия.
              </p>
            </div>

            <div className="bg-[#f5fafb] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-[#739aa3]">
                MRRB попадане
              </div>

              <strong className="mt-3 block">
                Проверка точка в полигон
              </strong>

              <p className="mt-3 text-sm leading-6 text-[#607b82]">
                Твърдението „точката попада в разломен
                коридор“ се използва само когато
                координатата действително е вътре в
                официалната MRRB полигонова геометрия.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <strong className="text-lg">
            Близостта не е идентичност
          </strong>

          <p className="mt-3 leading-7 text-white/75">
            SONDI.BG не присвоява име, тип или научна
            идентичност на даден MRRB коридор само
            защото наблизо преминава GEM линия.
            Идентичност между източниците се показва
            само когато е подкрепена от валидирано
            каталогово или научно съответствие.
          </p>
        </div>

        <section className="mt-16">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
            Проследимост на данните
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Откъде идва разломната информация?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Разломният слой на SONDI.BG не е изграден
            от един-единствен източник. Използваме
            официални GIS данни, международни каталози,
            сеизмогенни модели, научни публикации и
            официални геоложки карти за структурна
            проверка.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            За всеки използван източник се поддържа
            отделен регистър с неговото заглавие,
            автори, година, институция, тип, каква
            информация подкрепя и какви са известните
            ограничения при използването му.
          </p>

          <div className="mt-8 border border-[#b9dce3] bg-[#edf8fa] p-7">
            <div className="text-xs uppercase tracking-[0.2em] text-[#608f9a]">
              Текущ регистър
            </div>

            <div className="mt-2 text-3xl font-semibold text-[#173d47]">
              {sourceCount > 0
                ? `${sourceCount} източника`
                : "Регистър на източниците"}
            </div>

            <p className="mt-3 leading-7 text-[#5b767d]">
              Регистърът се разширява при добавяне и
              валидиране на нови разломи, карти и
              научни публикации.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Основни източници и научна проверка
          </h2>

          <div className="mt-8 space-y-4">
            {representativeSources.map(
              (source) => (
                <div
                  key={source.source_id}
                  className="border border-[#dce8ea] p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#739aa3]">
                    <span>
                      {sourceTypeLabel(
                        source.source_type
                      )}
                    </span>

                    {source.year && (
                      <>
                        <span>·</span>
                        <span>
                          {source.year}
                        </span>
                      </>
                    )}
                  </div>

                  <strong className="mt-3 block text-lg text-[#173d47]">
                    {source.title_bg ||
                      source.title ||
                      source.source_id}
                  </strong>

                  {source.authors &&
                    source.authors.length > 0 && (
                      <p className="mt-2 text-sm leading-6 text-[#607b82]">
                        {source.authors.join(", ")}
                      </p>
                    )}

                  {(source.institution ||
                    source.publisher) && (
                    <p className="mt-2 text-sm leading-6 text-[#607b82]">
                      {source.institution ||
                        source.publisher}
                    </p>
                  )}

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-medium text-[#257589]"
                    >
                      Публичен източник ↗
                    </a>
                  )}
                </div>
              )
            )}
          </div>

          <p className="mt-6 text-sm leading-7 text-[#71888e]">
            Това са представителни основни източници.
            За отделни разломи и райони се използват и
            допълнителни специализирани публикации и
            листове от Геоложката карта на България
            1:100 000.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как използваме старите геоложки карти?
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Официалните геоложки карти на България
              в мащаб 1:100 000 са ценен източник за
              локалната и регионалната геоложка
              структура. Те показват картографирани
              разломи, граници и отношения между
              геоложките единици.
            </p>

            <p>
              Но наличието на разлом върху по-стара
              геоложка карта не е достатъчно само по
              себе си, за да бъде структурата обявена
              за съвременно активен разлом. Затова тези
              карти се използват като структурна
              проверка и контекст, а не като единствен
              критерий за активност.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Какво означава HIGH confidence?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Високата увереност означава, че връзката
            между записите е добре подкрепена от
            наличните каталогови, геометрични и/или
            научни данни. Тя не означава автоматично,
            че полигонът на MRRB и линията на GEM са
            една и съща геометрия метър по метър.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Когато няма доказана точна идентичност на
            повърхностната следа, SONDI.BG я запазва
            като отделно ограничение вместо да
            създава изкуствена точност.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#f3fafb] p-7">
          <strong>
            Как да тълкуваме „Разломна дейност“ в PRO анализа?
          </strong>

          <p className="mt-3 leading-7 text-[#5b767d]">
            Това е структурен слой от анализа, а не
            самостоятелна гаранция за вода. Най-силен
            е, когато се разглежда заедно с геологията,
            водоносния хоризонт, известните сондажи,
            изворите, водовземните съоръжения,
            релефа и останалите локални данни.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater"
            className="text-sm text-[#56818b]"
          >
            ← Подземни води
          </Link>

          <Link
            href="/knowledge/groundwater/map-limitations"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво не може да покаже картата? →
          </Link>
        </div>
      </article>
    </main>
  );
}