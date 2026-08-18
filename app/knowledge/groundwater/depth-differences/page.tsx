import Link from "next/link";

export default function DepthDifferencesPage() {
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
            Практически въпроси · 02
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Защо водата може да е на 15 m тук,
            <br />
            а на 60 m съвсем наблизо?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Подземните води не образуват идеално равна хоризонтална
            повърхност. Геологията, релефът и разположението на
            водоносните пластове могат да се променят дори на
            сравнително малко разстояние.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Под земята няма равни и еднакви пластове
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Геоложките пластове могат да се накланят, изтъняват,
              удебеляват или постепенно да преминават в друг материал.
            </p>

            <p>
              Пясъчно-чакълест водоносен пласт например може да бъде
              сравнително плитък в една точка, а само няколкостотин
              метра по-нататък да потъва значително по-дълбоко.
            </p>
          </div>
        </section>

        <div className="my-12 grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Релеф",
              text: "Ниските и високите части на терена променят разстоянието от повърхността до един и същ геоложки хоризонт.",
            },
            {
              title: "Наклон на пластовете",
              text: "Водоносният пласт може да потъва в определена посока и постепенно да става по-дълбок.",
            },
            {
              title: "Промяна на геологията",
              text: "Пясък, чакъл, глина и скала могат да се заменят странично на сравнително малко разстояние.",
            },
            {
              title: "Пукнатини и разломи",
              text: "При скални терени водата може да бъде концентрирана в локални пукнатинни зони.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-[#dce8ea] bg-[#f6fbfc] p-6"
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
            Съседният сондаж е полезен, но не е гаранция
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Данните от близък успешен сондаж са много ценни,
            защото показват какви условия са срещнати в района.
            Но те не означават, че същият пласт ще бъде достигнат
            на абсолютно същата дълбочина в съседния имот.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Особено при пукнатинни и карстови води разликата между
            две близки точки може да бъде значителна.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            И нивото на водата не е същото като дълбочината на пласта
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Сондажът може да пресече водоносен пласт на определена
            дълбочина, но след това водата да се установи на по-високо
            ниво в сондажната тръба. Това е особено важно при
            напорни водоносни хоризонти.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Затова няма „универсална дълбочина за района“</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Може да има характерен диапазон, но конкретната точка
            зависи от локалната геология и разположението на
            водоносните структури.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/water-in-well"
            className="text-sm text-[#56818b]"
          >
            ← Водата в сондажа
          </Link>

          <Link
            href="/knowledge/groundwater/why-wells-dry"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Защо сондажът може да пресъхне? →
          </Link>
        </div>
      </article>
    </main>
  );
}