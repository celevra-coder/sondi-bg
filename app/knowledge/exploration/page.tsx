import Link from "next/link";

const articles = [
  {
    category: "ОСНОВИ",
    title: "Какво представлява проучването за подземна вода",
    description: "Какви данни се събират преди сондиране и защо проучването намалява несигурността при избора на точка.",
    href: "/knowledge/exploration/groundwater-investigation",
  },
  {
    category: "ИЗБОР НА ТОЧКА",
    title: "Как се избира място за сондаж",
    description: "Как се съчетават геология, релеф, водоносни хоризонти, близки сондажи и локални измервания.",
    href: "/knowledge/exploration/selecting-drilling-point",
  },
  {
    category: "ГЕОФИЗИКА",
    title: "Какво показва геофизичното проучване",
    description: "Как геофизичните измервания помагат да се откриват промени в строежа и потенциални водоносни зони.",
    href: "/knowledge/exploration/geophysical-investigation",
  },
  {
    category: "РАДИЕСТЕЗИЯ",
    title: "Радиестезия при търсене на подземна вода",
    description: "Как се използва като допълващ ориентир и защо резултатът трябва да се проверява с други методи.",
    href: "/knowledge/exploration/dowsing",
  },
  {
    category: "КОМБИНИРАН ПОДХОД",
    title: "Комбиниране на методи за по-надеждно проучване",
    description: "Защо най-добрата оценка идва от съпоставяне на независими източници и различни методи.",
    href: "/knowledge/exploration/combined-methods",
  },
  {
    category: "ГЕОЛОГИЯ И РАЗЛОМИ",
    title: "Как се съчетават геология, разломи и геофизични данни",
    description: "Как структурите, пукнатинността и геоложката среда се използват при оценка на сондажна перспектива.",
    href: "/knowledge/exploration/geology-faults-geophysics",
  },
  {
    category: "ДЪЛБОЧИНА",
    title: "Как се оценяват дълбочина и водоносни хоризонти",
    description: "Как се използват геология, близки съоръжения и геофизични аномалии за оценка на целеви дълбочини.",
    href: "/knowledge/exploration/depth-and-aquifers",
  },
  {
    category: "ГРАНИЦИ НА МЕТОДА",
    title: "Какво може и какво не може да предвиди едно проучване",
    description: "Какви изводи са разумни преди сондиране и кои параметри могат да се потвърдят едва след изпълнение на сондажа.",
    href: "/knowledge/exploration/limitations",
  },
];

export default function ExplorationKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Проучване за вода
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            Как се съчетават геология, геофизика, структурни данни, локални наблюдения и допълващи методи при избора на перспективна точка за сондаж.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group border border-[#dce8eb] bg-white p-7 transition hover:border-[#a9cfd6] hover:shadow-[0_16px_45px_rgba(23,63,72,.08)]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c969f]">
                {article.category}
              </div>
              <h2 className="mt-4 text-xl font-bold leading-7 text-[#173f48]">
                {article.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6c8187]">
                {article.description}
              </p>
              <div className="mt-6 text-sm font-semibold text-[#177f98]">
                Прочети →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/knowledge" className="text-sm font-semibold text-[#177f98]">
            ← Към всички теми
          </Link>
        </div>
      </section>
    </main>
  );
}