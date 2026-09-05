import Link from "next/link";

export const metadata = {
  title: "Какво показва геофизичното проучване | Sondi.bg",
  description:
    "Как геофизичните измервания помагат да се откриват контрасти в подземния строеж, възможни водоносни зони и структурни изменения.",
};

export default function GeophysicalInvestigationKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво показва геофизичното проучване
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Геофизичното проучване не вижда директно подземната вода като
            изображение. То измерва физични свойства на подземната среда и
            показва промени, контрасти и аномалии, които могат да бъдат свързани
            с различни пластове, пукнатинни зони и водонаситени участъци.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво всъщност измерва геофизиката
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Различните геофизични методи измерват различни свойства на
            подземната среда — например електрическо съпротивление,
            проводимост или други физични контрасти. Резултатът показва как тези
            свойства се променят по профила и в дълбочина.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се разпознават потенциални водоносни зони
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Водонасищането може да промени физичните характеристики на
            пластовете, но подобна аномалия може да бъде причинена и от глина,
            минерализация или промяна в скалния състав. Затова геофизичната
            аномалия е индикация, която трябва да се интерпретира в контекста на
            геологията.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показва профилирането
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При профилиране измерванията се правят по линия през терена. Това
            позволява да се проследят странични промени и да се сравнят
            отделните точки по един и същ профил. Така могат да се откроят
            участъци, които се различават от съседните и заслужават по-подробен
            анализ.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показва изследването в дълбочина
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Вертикалното изменение на сигнала помага да се разграничат
            различни слоеве и целеви интервали. По този начин могат да се
            определят дълбочини, на които има промяна в подземния строеж или
            потенциално по-благоприятни условия за водоносност.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се разпознават пукнатинни и разломни зони
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разуплътнени и напукани участъци могат да създадат отчетлив
            геофизичен контраст спрямо по-масивната скала. Когато подобна зона
            съвпада с известна или предполагаема структурна линия, това е важен
            аргумент при избора на място за допълнително проучване.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо един цвят или една аномалия не са достатъчни
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Цветовата карта е визуализация на измерени стойности, а не директна
            карта на водата. Една и съща стойност може да има различно
            значение в различни геоложки среди. Надеждната интерпретация
            изисква сравнение между формата на аномалията, дълбочината,
            съседните точки и геоложкия контекст.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как геофизиката се използва при реален избор на сондажна точка
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-полезна е, когато резултатът се съпостави с геологията,
            водоносните хоризонти, разломите, релефа и близките водоизточници.
            Тогава геофизиката помага да се сравнят няколко възможни точки и да
            се избере тази, при която най-много независими признаци съвпадат.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#dce8eb] pt-8">
          <Link
            href="/knowledge/exploration"
            className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]"
          >
            ← Към Проучване за вода
          </Link>

          <Link
            href="/map"
            className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white"
          >
            Към картата →
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] px-6 py-5 text-sm leading-6 text-[#637f87]">
          <strong className="text-[#173f48]">Методична основа:</strong>{" "}
          геофизично профилиране и сондиране, електрически методи,
          хидрогеоложка интерпретация и съпоставяне с геоложки и структурни
          данни.
        </div>
      </article>
    </main>
  );
}