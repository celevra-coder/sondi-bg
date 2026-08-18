import Link from "next/link";

export default function SpringsPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link href="/knowledge/groundwater" className="text-sm text-[#4e8795] hover:text-[#173d47]">
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Как работят подземните води · 05
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Как възникват
            <br />
            естествените извори?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Изворът е място, където подземната вода достига
            естествено до земната повърхност.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Подземният поток среща повърхността
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако водоносният пласт пресече склон, долина или друга
            част от релефа, подземната вода може да излезе естествено
            на повърхността. Така се образува извор.
          </p>
        </section>

        <div className="my-12 space-y-4">
          <div className="border-l-4 border-[#5c9eac] bg-[#f5fafb] p-6">
            <strong>Контактен извор</strong>
            <p className="mt-2 leading-7 text-[#5d777e]">
              Водоносен пласт лежи върху по-слабо пропусклива
              среда и водата се насочва странично към повърхността.
            </p>
          </div>

          <div className="border-l-4 border-[#5c9eac] bg-[#f5fafb] p-6">
            <strong>Разломен извор</strong>
            <p className="mt-2 leading-7 text-[#5d777e]">
              Пукнатина или разлом създава път, по който водата
              достига до земната повърхност.
            </p>
          </div>

          <div className="border-l-4 border-[#5c9eac] bg-[#f5fafb] p-6">
            <strong>Карстов извор</strong>
            <p className="mt-2 leading-7 text-[#5d777e]">
              Вода от карстова система излиза чрез развити
              пукнатини, кухини или подземни канали.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо някои извори пресъхват през лятото?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Ако изворът е свързан с плитка водоносна система,
            неговият дебит може силно да зависи от валежите
            и сезонното подхранване.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            При продължителна суша нивото на подземните води може
            да падне под мястото, където водоносният пласт пресича
            повърхността, и изворът временно да спре.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Голям извор означава ли голям подземен запас?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Не непременно. Дебитът зависи от размера на зоната
            на подхранване, геологията, сезона и начина,
            по който водата се събира и насочва към извора.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Изворът е естествен прозорец към подземната система</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Неговото положение и поведение могат да дадат ценна
            информация за движението на подземните води в района.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link href="/knowledge/groundwater/artesian-water" className="text-sm text-[#56818b]">
            ← Артезианска вода
          </Link>

          <Link href="/knowledge/groundwater/rain-recharge" className="text-right text-sm font-semibold text-[#257589]">
            Как валежите подхранват водите? →
          </Link>
        </div>
      </article>
    </main>
  );
}