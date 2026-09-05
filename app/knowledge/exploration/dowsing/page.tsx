import Link from "next/link";

export const metadata = {
  title: "Радиестезия при търсене на подземна вода | Sondi.bg",
  description:
    "Как се използва радиестезията като допълващ метод при търсене на подземна вода и защо резултатът трябва да се проверява с други независими данни.",
};

export default function DowsingKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Радиестезия при търсене на подземна вода
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Радиестезията се използва от някои практици като предварителен
            ориентир за избор на зони, които след това могат да бъдат проверени
            с геоложки, геофизични и други независими методи.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво представлява радиестезичният подход
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При радиестезията операторът използва багети или друг инструмент и
            проследява реакциите им при движение по терена. Практическият
            резултат обикновено е посочване на една или повече предполагаеми
            линии или точки, които се приемат за потенциално интересни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква може да бъде практическата ѝ роля
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Радиестезията може да се използва като първоначален метод за
            стесняване на зоната за последващо проучване. Вместо целият терен да
            се разглежда еднакво, могат да бъдат определени няколко точки за
            по-подробна проверка с инструментални методи.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо резултатът не трябва да се използва самостоятелно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Радиестезичната индикация сама по себе си не показва измерено
            физично свойство на подземната среда. Затова тя не трябва да се
            приема като достатъчно основание за определяне на дълбочина, дебит
            или конкретен водоносен хоризонт без допълнителна проверка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как се проверява една посочена точка
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Посочената зона може да се сравни с геоложката среда, известните
            разломни и пукнатинни структури, релефа, близките сондажи и извори.
            След това геофизично профилиране през същата зона може да покаже
            дали има измерима аномалия, която съвпада с първоначалния ориентир.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо контролното измерване е полезно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако една точка изглежда перспективна, проверка по втори профил или
            от различно направление може да помогне да се установи дали
            аномалията продължава като реална структура. Това намалява риска
            еднократна локална промяна да бъде приета за основна сондажна цел.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Кога съвпадението между методите е най-ценно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-интересна е ситуацията, когато радиестезично посочена точка
            съвпада с геофизична аномалия, подходяща геоложка среда и
            структурна или хидрогеоложка логика. Тогава различни независими
            наблюдения насочват към една и съща зона.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Мястото на радиестезията в комбинираното проучване
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-разумно е радиестезията да се използва като допълващ ориентир,
            а окончателната оценка да се основава на съвкупност от данни —
            геология, разломи, близки водоизточници, геофизични измервания и
            контролни проверки. Така силата на заключението идва от
            съвпадението между различни методи, а не от един единствен сигнал.
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
          <strong className="text-[#173f48]">Практически принцип:</strong>{" "}
          радиестезичната индикация се разглежда като допълващ ориентир и се
          съпоставя с независими геоложки, хидрогеоложки и геофизични данни
          преди избор на сондажна точка.
        </div>
      </article>
    </main>
  );
}