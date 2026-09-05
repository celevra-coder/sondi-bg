import Link from "next/link";

export const metadata = {
  title: "Как се избира място за сондаж | Sondi.bg",
  description:
    "Разбираемо обяснение как се избира перспективно място за сондаж чрез геология, близки водоизточници, разломи и локално проучване.",
};

export default function SelectingDrillingPointKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ПРОУЧВАНЕ ЗА ВОДА
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Как се избира място за сондаж
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Добрата точка за сондаж не се избира само по удобство или по една
            отделна индикация. Най-надеждният подход е да се съчетаят
            регионалната геология, водоносните хоризонти, близките сондажи и
            извори, структурите и локалното геофизично проучване.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Първо се определя водоносната среда
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Преди избор на конкретна точка трябва да се разбере какъв тип
            водоносна среда се очаква в района. В насипни седименти водата може
            да се движи през порите между зърната, докато в скални терени
            перспективата често зависи от пукнатини, разломни зони и други
            вторично пропускливи структури.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Близките сондажи дават важен ориентир
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Съществуващите регистрирани сондажи могат да покажат на каква
            дълбочина е достигната вода, какво статично водно ниво е измерено и
            какви дебити са публикувани. Най-полезни са съоръженията, които са
            свързани със същия водоносен хоризонт и сходна геоложка среда.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Релефът също има значение
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Релефът влияе върху движението и подхранването на подземните води.
            Долини, тераси, подножия на склонове и понижени участъци могат да
            бъдат свързани с натрупване или движение на вода, но значението им
            винаги трябва да се разглежда заедно с геоложкия строеж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Каква е ролята на разломите
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разломите и пукнатинните системи могат да създават зони с повишена
            вторична пропускливост и да улесняват движението на подземни води.
            Най-перспективни често са не просто големите разломи, а участъците,
            където те се пресичат с други структури или преминават през подходяща
            водоносна среда.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как геофизиката помага за избора между няколко точки
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато на терена има няколко възможни места, геофизичното
            профилиране може да покаже контрасти в подземния строеж и да
            открои аномални зони. Особено полезно е, когато измерването пресича
            предполагаемата структура, вместо да се прави само по едно
            направление без геоложки контекст.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо една индикация не е достатъчна
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Добрата точка се подкрепя от повече от един независим признак.
            Например геофизична аномалия е много по-убедителна, ако съвпада с
            подходяща геология, известна структурна зона и данни от близки
            водоизточници. Колкото повече независими данни сочат към една и
            съща зона, толкова по-силна е предварителната оценка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG подпомага избора
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът може да покаже водоносната среда, близки сондажи и
            извори, разстояние до известни разломни структури, ресурсната
            ситуация и други локални данни. Тази предварителна картина помага
            теренното проучване да бъде насочено към най-смислените участъци,
            вместо точката да се избира на случаен принцип.
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
          геоложка и хидрогеоложка оценка, пространствени данни за съществуващи
          водоизточници, структурна геология и локални геофизични измервания.
        </div>
      </article>
    </main>
  );
}