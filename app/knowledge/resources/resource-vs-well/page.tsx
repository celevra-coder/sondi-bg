import Link from "next/link";

export const metadata = {
  title: "Как ресурсът на ПВТ се отнася към конкретен сондаж | Sondi.bg",
  description:
    "Разбираемо обяснение защо ресурсът на подземното водно тяло не е прогноза за дебита на конкретен сондаж и как правилно да се използва тази информация.",
};

export default function ResourceVsWellKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · ВОДОВЗЕМАНЕ И РЕСУРСИ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Как ресурсът на ПВТ се отнася към конкретен сондаж
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Ресурсът на подземното водно тяло показва общото количествено
            състояние на голяма водоносна система. Той е важен за оценката на
            устойчивостта и възможността за водовземане, но не показва директно
            колко вода ще даде сондаж в конкретен имот.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо ресурсът е регионален показател
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземното водно тяло може да обхваща десетки или стотици квадратни
            километри. В неговите граници могат да има различни пластове,
            различна пропускливост, различна дълбочина на водата и различни
            условия за подхранване. Затова ресурсните стойности се отнасят до
            системата като цяло, а не до всяка отделна координата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо свободният ресурс не е очакван дебит
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако едно ПВТ има свободен ресурс 20 l/s, това не означава, че
            конкретен сондаж може да даде 20 l/s. Свободният ресурс показва
            остатъка на ниво водно тяло след отчетеното натоварване. Реалният
            дебит на сондажа зависи от локалните хидрогеоложки условия.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво определя дебита на конкретния сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-важни са видът на водоносния хоризонт, неговата мощност,
            пропускливостта на скалите или седиментите, пукнатинността,
            подхранването и връзката с други водоносни структури. Значение имат
            и дълбочината, диаметърът, филтровата част и правилното изпълнение на
            самия сондаж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как помагат близките водовземни съоръжения
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Информацията за близки регистрирани сондажи е ценен локален ориентир.
            Ако са известни техните дълбочини, средни или максимални дебити и
            водоносни хоризонти, може да се получи по-добра представа за района.
            Но дори близък сондаж не е гаранция, че новото съоръжение ще има
            същия дебит.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво показват разрешителните на близките съоръжения
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Разрешителното може да съдържа данни за допустим дебит, годишен
            обем, предназначение и срок. Тези параметри са полезни за локалния
            контекст, но разрешеният дебит не винаги е равен на реално
            постигнатия дебит и не трябва автоматично да се пренася към друг
            сондаж.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG съчетава регионалните и локалните данни
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            PRO анализът разглежда ресурсните показатели на цялото ПВТ и ги
            комбинира с локалната информация около избраната координата —
            близки водовземни съоръжения, налични дебити, разрешителни, геология
            и водоносни хоризонти. Така регионалната оценка се поставя в
            практически контекст.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как правилно да използваш ресурсната оценка
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Най-добрият подход е ресурсът на ПВТ да се използва като проверка за
            общата устойчивост и натоварване, а локалните данни — за оценка на
            перспективата в конкретния имот. Благоприятният ресурс не гарантира
            успешен сондаж, а високото натоварване не означава автоматично
            липса на вода. Двете нива на информация трябва да се разглеждат
            заедно.
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
          официални ресурсни регистри, разрешителни и данни за водовземни
          съоръжения, планове за управление на речните басейни и
          хидрогеоложки принципи за оценка на локалната сондажна перспектива.
        </div>
      </article>
    </main>
  );
}