import Link from "next/link";

export default function WhyWellsDryPage() {
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
            Практически въпроси · 03
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Защо сондаж или кладенец
            <br />
            може да пресъхне?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            „Пресъхнал“ водоизточник не винаги означава, че водата
            под земята е изчезнала. Причината може да бъде спад на
            нивото, недостатъчно подхранване, прекомерно водочерпене
            или проблем със самото съоръжение.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Водният баланс може да се промени
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Един водоносен хоризонт получава вода чрез подхранване
            и губи вода чрез естествен отток и водочерпене.
            Когато за определен период загубите са по-големи
            от подхранването, нивото може да започне да спада.
          </p>
        </section>

        <div className="my-12 space-y-4">
          {[
            {
              title: "Продължителна суша",
              text: "По-малко валежи могат да намалят подхранването, особено при плитки водоносни системи.",
            },
            {
              title: "Прекомерно изпомпване",
              text: "Ако от сондажа се черпи повече вода, отколкото пластът може устойчиво да подава, нивото пада.",
            },
            {
              title: "Много сондажи в района",
              text: "Няколко водовземни съоръжения могат да влияят върху едно и също водоносно тяло.",
            },
            {
              title: "Сезонни промени",
              text: "Някои плитки кладенци работят добре през влажния сезон, но отслабват през сухите месеци.",
            },
            {
              title: "Проблем със сондажа",
              text: "Запушен филтър, натрупани отложения или повредена конструкция могат да намалят притока.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border-l-4 border-[#5c9eac] bg-[#f5fafb] p-6"
            >
              <strong>{item.title}</strong>
              <p className="mt-2 leading-7 text-[#5d777e]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Възможно е водата просто да е паднала под помпата
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако водното ниво се понижи, но водоносният пласт
            продължава да съдържа вода, помпата може вече да не
            бъде достатъчно дълбоко разположена.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            В такъв случай съоръжението изглежда „пресъхнало“,
            въпреки че проблемът може да бъде в работното ниво,
            а не в пълното изчезване на водата.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Как се разбира какъв е проблемът?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Полезно е да се сравнят статичното и динамичното водно
            ниво, времето за възстановяване след изпомпване и
            действителният дебит. Тези измервания дават много повече
            информация от простото наблюдение „има или няма вода“.
          </p>
        </section>

        <div className="mt-14 bg-[#153d47] p-8 text-white">
          <strong className="text-lg">
            По-дълбок сондаж не винаги решава проблема
          </strong>
          <p className="mt-3 leading-7 text-white/75">
            Ако причината е прекомерно водочерпене, лоша конструкция
            или слаб водоносен пласт, допълнителната дълбочина сама
            по себе си може да не увеличи устойчивия дебит.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/depth-differences"
            className="text-sm text-[#56818b]"
          >
            ← Разлики в дълбочината
          </Link>

          <Link
            href="/knowledge/groundwater/water-level"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво е водно ниво? →
          </Link>
        </div>
      </article>
    </main>
  );
}