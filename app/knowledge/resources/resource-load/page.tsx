import Link from "next/link";

export const metadata = {
  title: "Какво означава натоварване на ресурса? | Sondi.bg",
  description:
    "Разбираемо обяснение какво означава ниско, умерено и високо натоварване на подземния воден ресурс и как се тълкува в SONDI.BG.",
};

export default function ResourceLoadKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво означава натоварване на ресурса
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Натоварването показва колко силно се използва разполагаемият ресурс
            на едно подземно водно тяло. То помага бързо да се разбере дали
            водовземането заема малка, значителна или много голяма част от
            наличния ресурс.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се определя натоварването
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Натоварването се извежда от съотношението между използвания или
            разрешен ресурс и разполагаемия ресурс на подземното водно тяло.
            Колкото по-голяма част от ресурса е ангажирана, толкова по-високо е
            натоварването.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава ниско натоварване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ниското натоварване означава, че сравнително малка част от
            разполагаемия ресурс е ангажирана. Това обикновено показва по-голям
            количествен резерв на ниво ПВТ, но не е гаранция за добър дебит във
            всяка конкретна точка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава умерено натоварване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При умерено натоварване значителна част от ресурса вече се използва.
            Това не означава непременно проблем, но показва, че водният баланс
            трябва да се разглежда по-внимателно, особено при планиране на ново
            водовземане.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава високо натоварване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Високото натоварване показва, че голяма част от разполагаемия ресурс
            вече е ангажирана. В SONDI.BG това се използва като предупредителен
            сигнал, защото допълнителното водовземане може да изисква по-внимателна
            ресурсна и административна проверка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Високо натоварване не означава автоматично липса на вода
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Натоварването е показател за цялото подземно водно тяло, а не за
            конкретен имот. Възможно е локално да има водоносен хоризонт с добри
            свойства, но общият ресурс на ПВТ вече да е силно ангажиран. Затова
            ресурсната оценка и локалната хидрогеоложка оценка са различни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG показва натоварването
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът може да показва натоварването като ниско, умерено или
            високо според експлоатационния индекс. То се разглежда заедно с
            разполагаемия ресурс, свободния ресурс, количественото състояние и
            риска, за да се получи по-пълна оценка на ресурсната ситуация.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за нов сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При ниско натоварване ресурсната ситуация обикновено е по-благоприятна,
            но пак трябва да се проверят локалните условия. При високо натоварване
            трябва да се обърне особено внимание на свободния ресурс,
            разрешителните и официалната количествена оценка още преди
            планирането на ново водовземане.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/resources"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Водовземане и ресурси
          </Link>

          <Link
            href="/map"
            className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white"
          >
            Към картата →
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] px-6 py-5 text-sm leading-6 text-[#637f87]">
          <strong className="text-[#173f48]">Източници и методична основа:</strong>{" "}
          официални водни баланси, регистри за ресурс и водовземане, планове за
          управление на речните басейни и оценки на количественото натоварване
          на подземните водни тела.
        </div>
      </article>
    </main>
  );
}