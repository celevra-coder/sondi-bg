import Link from "next/link";

export const metadata = {
  title: "Какво е възходяща тенденция? | Sondi.bg",
  description:
    "Разбираемо обяснение какво означава възходяща тенденция в мониторинга на подземните води и как да се тълкува в анализите на SONDI.BG.",
};

export default function UpwardTrendKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво е възходяща тенденция
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Възходяща тенденция означава, че при последователни наблюдения
            концентрацията на даден показател се увеличава с времето. Това е
            важен сигнал, защото проблемът може да се развива постепенно дори
            когато отделна измерена стойност все още не е над допустимия праг.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо една стойност не е достатъчна
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Едно лабораторно измерване показва състоянието на водата само в
            конкретния момент. За да се разбере дали даден показател се влошава,
            са необходими поредица от измервания през различни периоди. Когато
            стойностите системно се увеличават, може да се установи тенденция,
            която е невидима при разглеждане само на една проба.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как изглежда възходящата тенденция на практика
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Например даден показател може да бъде измерван в един и същ
            мониторингов пункт в продължение на години. Ако последователните
            резултати показват устойчиво увеличение, това може да бъде отчетено
            като възходяща тенденция. Важна е посоката на промяната, а не само
            дали последната стойност е над или под определен праг.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо тенденция може да има и без текущо превишение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Възможно е концентрацията на дадено вещество все още да е под
            приложимата прагова стойност, но да нараства устойчиво. В този
            случай водата може да не е оценена като проблемна към момента, но
            посоката показва риск от бъдещо влошаване. Именно затова тенденциите
            се наблюдават отделно от единичните превишения.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква е разликата между превишение и възходяща тенденция
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Превишението сравнява конкретна измерена стойност с определен праг.
            Тенденцията разглежда развитието на стойностите във времето. Възможно
            е да има превишение без ясно установена тенденция, както и възходяща
            тенденция без текущо превишение. Двете информации се допълват, но не
            означават едно и също.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво може да причини нарастване на даден показател
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Причините могат да бъдат различни: земеделски натиск, промишлени
            дейности, промени във водовземането, местни източници на замърсяване
            или естествени геохимични процеси. Самата тенденция показва, че има
            промяна, но причината трябва да се установи чрез допълнителен анализ
            на района и наличните данни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се показва възходящата тенденция в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            В SONDI.BG наличието на възходяща тенденция се разглежда като
            предупредителен показател. Дори когато общото химично състояние е
            оценено като добро, анализът може да посочи, че определен показател
            се увеличава и трябва да бъде проследяван. Това помага да се различи
            текущото състояние от посоката, в която то се развива.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за конкретен имот или сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Възходящата тенденция е регионална информация за наблюдаваното
            подземно водно тяло и неговите мониторингови пунктове. Тя не означава
            автоматично, че водата от конкретен сондаж има същата концентрация.
            Но ако за района е отчетена такава тенденция, съответният показател
            заслужава внимание при лабораторно изследване на вода от конкретното
            съоръжение.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/monitoring"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Мониторинг
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
          официални мониторингови данни и оценки на тенденциите в подземните
          води, планове за управление на речните басейни и утвърдени принципи за
          оценка на дългосрочните промени в химичното състояние.
        </div>
      </article>
    </main>
  );
}