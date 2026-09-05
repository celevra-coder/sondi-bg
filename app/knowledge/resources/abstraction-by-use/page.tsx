import Link from "next/link";

export const metadata = {
  title: "Водовземане по предназначение | Sondi.bg",
  description:
    "Разбираемо обяснение как се разпределя водовземането по предназначение и как се тълкуват категориите в анализите на SONDI.BG.",
};

export default function AbstractionByUseKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Водовземане по предназначение
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Подземната вода се използва за различни цели и всяка от тях участва
            в общото натоварване на водното тяло. Разпределението по
            предназначение показва кои дейности използват най-голяма част от
            ресурса и помага да се разбере структурата на водовземането.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо водовземането се разделя по предназначение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Общото количество вода показва колко е натоварен ресурсът, но не
            показва кой го използва. Разделянето по предназначение позволява да
            се види дали основният натиск идва от питейно водоснабдяване,
            земеделие, промишленост, самоснабдяване или друга дейност.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Питейно и обществено водоснабдяване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Тази категория обхваща водовземането, свързано с общественото
            водоснабдяване и използването на подземни води за населението.
            В райони, където голяма част от ресурса се използва за тези цели,
            водното тяло има особено значение за сигурността на водоснабдяването.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Земеделие
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водовземането за земеделие включва използване на подземна вода за
            напояване и други селскостопански нужди. То може да бъде силно
            сезонно и в определени райони да се увеличава значително през
            сухите месеци, когато естественото подхранване е по-слабо.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Промишленост и стопански дейности
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземни води могат да се използват за производствени процеси,
            охлаждане, технологични нужди и други промишлени дейности. Значението
            на тази категория зависи от концентрацията на предприятия и
            разрешените количества във водното тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Самоснабдяване, туризъм и други цели
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В официалните данни могат да се срещат още битово самоснабдяване,
            туризъм и рекреация, аквакултури и други предназначения. Поотделно
            тези категории могат да изглеждат малки, но общият им принос също
            участва в натоварването на ресурса.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG показва водовземането по предназначение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато официалните данни позволяват, PRO анализът може да показва
            отделни количества за обществено водоснабдяване, земеделие,
            промишленост, аквакултури, битово самоснабдяване, туризъм и други
            цели. Така потребителят може да види не само общото водовземане, а и
            структурата му.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за конкретен район
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Доминиращото предназначение може да даде важен контекст за
            натоварването на водното тяло. Силното земеделско водовземане
            например може да води до сезонно натоварване, а голямото обществено
            водоснабдяване може да означава постоянна зависимост от ресурса.
            Тази информация трябва да се разглежда заедно със свободния ресурс,
            експлоатационния индекс и количественото състояние.
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
          официални регистри и водни баланси за подземните води, разрешителни за
          водовземане и планове за управление на речните басейни.
        </div>
      </article>
    </main>
  );
}