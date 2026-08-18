import Link from "next/link";

export default function GwbOverlapPage() {
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
            Как да четем картата · 02
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Защо няколко ПВТ
            <br />
            могат да се припокриват?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Картата е двуизмерна, но подземната геология е
            триизмерна. На една и съща координата могат да
            съществуват различни водоносни системи на различна дълбочина.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">
        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Представи си няколко пласта един върху друг
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Под една точка може да има плитък водоносен комплекс,
            под него по-слабо пропусклив пласт, а още по-дълбоко
            друга водоносна система.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            Когато всички тези системи се покажат върху една плоска
            карта, техните очертания могат да попаднат едно върху друго.
          </p>
        </section>

        <div className="my-12 bg-[#153d47] p-8 text-white">
          <div className="text-sm uppercase tracking-[0.18em] text-[#8ac7d3]">
            Пример
          </div>

          <div className="mt-6 space-y-4">
            <div className="border-b border-white/15 pb-4">
              <strong>Повърхност</strong>
              <p className="mt-1 text-sm text-white/65">
                Избраната координата на картата
              </p>
            </div>

            <div className="border-b border-white/15 pb-4">
              <strong>По-плитка система</strong>
              <p className="mt-1 text-sm text-white/65">
                Едно подземно водно тяло
              </p>
            </div>

            <div>
              <strong>По-дълбока система</strong>
              <p className="mt-1 text-sm text-white/65">
                Второ подземно водно тяло
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Кое от двете ПВТ е „правилното“?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Не е задължително едното да е грешно. Ако официалните
            геопространствени данни показват припокриване, и двете
            тела могат да бъдат част от хидрогеоложкия контекст
            на точката.
          </p>

          <p className="mt-5 text-[17px] leading-8 text-[#536f76]">
            За да се определи към коя система е свързан конкретен
            сондаж или мониторингов пункт, трябва да се разглеждат
            и неговата дълбочина, геоложкият хоризонт и официалната
            му принадлежност.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Защо Sondi.bg показва всички съвпадения?
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Автоматичното избиране на едно ПВТ би могло да скрие
            важна информация. Затова при реално пространствено
            припокриване картата може да покаже повече от едно тяло.
          </p>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>Припокриване не означава грешка в картата</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            То може да е естествен резултат от представянето
            на триизмерни подземни системи върху двуизмерна карта.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/gwb-vs-aquifer"
            className="text-sm text-[#56818b]"
          >
            ← ПВТ и водоносен пласт
          </Link>

          <Link
            href="/knowledge/groundwater/official-maps"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво показват официалните карти? →
          </Link>
        </div>
      </article>
    </main>
  );
}