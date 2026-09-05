import Link from "next/link";

export const metadata = {
  title: "Какво означава превишение в мониторингов пункт? | Sondi.bg",
  description:
    "Разбираемо обяснение как се тълкуват превишенията в мониторинговите пунктове и какво означават те за подземното водно тяло и конкретния имот.",
};

export default function MonitoringExceedancesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво означава превишение в мониторингов пункт
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Превишение означава, че при официално измерване даден показател е
            отчетен над приложимата стандартна или прагова стойност. Това е важен
            сигнал, но не означава автоматично, че цялото подземно водно тяло или
            всеки сондаж в района има същия проблем.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се установява превишение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            От мониторинговия пункт се взема проба, която се изследва за
            определени показатели. Получената стойност се сравнява с приложима
            норма, стандарт или прагова стойност. Ако измереното количество е
            по-високо от допустимото за съответната оценка, резултатът се отчита
            като превишение.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо е важно къде е отчетено
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Всеки мониторингов резултат е свързан с конкретен пункт, определена
            дълбочина и конкретно подземно водно тяло. Локален източник на
            замърсяване, различна геология или различен водоносен хоризонт могат
            да повлияят на резултата. Затова местоположението на пункта е също
            толкова важно, колкото и самата измерена стойност.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Едно превишение не означава автоматично лошо състояние на цялото ПВТ
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Официалното химично състояние на подземното водно тяло се определя
            чрез по-широка оценка. Разглеждат се резултатите от различни пунктове,
            пространственото разпространение на проблема, повторяемостта на
            отклоненията и значението им за водното тяло като цяло. Поради това
            отделно превишение и официална оценка „лошо химично състояние“ не са
            едно и също понятие.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означават проблемните показатели
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато в официалната оценка са посочени проблемни показатели, това
            показва кои вещества или характеристики са свързани с установения
            проблем. Това могат да бъдат например нитрати, сулфати или други
            показатели. Те помагат да се разбере какъв тип отклонение е
            регистрирано и към какво трябва да се насочи вниманието.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо повторяемостта има значение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Единичен резултат дава информация за конкретния момент. Ако
            превишението се отчита многократно в един или повече пунктове,
            значението му става по-голямо. Последователните измервания могат да
            покажат устойчив проблем или тенденция, която не би могла да се
            установи само от една проба.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се показват превишенията в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            SONDI.BG може да показва броя на мониторинговите пунктове, в които
            са отчетени проблеми, както и основните показатели с превишения.
            Тази информация се разглежда заедно с химичното състояние, риска и
            наличието на възходяща тенденция. Ако една координата попада в
            няколко ПВТ, резултатите се разглеждат поотделно за всяко тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за конкретен сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Превишение в близък мониторингов пункт е важна информация и е причина
            да се обърне внимание на съответния показател. То обаче не е
            лабораторен резултат за конкретния сондаж. Водата в него може да
            идва от друг хоризонт или дълбочина. За сигурно заключение относно
            качеството на вода от конкретно съоръжение е необходима проба именно
            от него.
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
          официални мониторингови данни за подземните води, прагови и стандартни
          стойности, планове за управление на речните басейни и утвърдени
          принципи за оценка на химичното състояние.
        </div>
      </article>
    </main>
  );
}