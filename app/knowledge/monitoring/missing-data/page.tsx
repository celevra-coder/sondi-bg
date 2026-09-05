import Link from "next/link";

export const metadata = {
  title: "Какво означава „няма данни“? | Sondi.bg",
  description:
    "Разбираемо обяснение как да се тълкува липсата на мониторингови данни в анализите на SONDI.BG и какво не може да се заключи от нея.",
};

export default function MissingMonitoringDataKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Какво означава „няма данни“
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            Когато в анализа пише „няма данни“ или „непълни данни“, това не
            означава автоматично, че няма подземна вода, че качеството е добро
            или че няма риск. Означава само, че за конкретния показател няма
            достатъчно обработена и налична официална информация.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо понякога липсват мониторингови данни
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Не всяко подземно водно тяло има еднакво гъста мониторингова мрежа.
            В някои райони има повече пунктове и по-дълги серии от измервания,
            а в други наблюденията са по-ограничени. Възможно е също определен
            тип данни да не е публикуван, да не е наличен за съответния период
            или все още да не е обработен в използвания официален източник.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            „Няма данни“ не означава „няма вода“
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Липсата на количествен мониторингов пункт или измерено водно ниво
            не означава, че в района няма подземна вода. Мониторинговата мрежа
            не е изградена с цел да показва всяко място, на което може да се
            направи сондаж. За наличие на вода трябва да се разглеждат
            геологията, водоносните хоризонти, близките съоръжения и останалите
            хидрогеоложки данни.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            „Няма химични данни“ не означава „водата е чиста“
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако липсва публикуван химичен резултат, не може да се направи
            заключение, че качеството на водата е добро. За такова заключение
            са необходими реални анализи. По същия начин липсата на отчетено
            превишение в наличните данни не доказва, че в конкретен сондаж няма
            проблем с качеството.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Разлика между „няма данни“ и „не е установен проблем“
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Това са две различни ситуации. „Няма данни“ означава, че липсва
            достатъчна информация за оценка. „Не е установен проблем“ означава,
            че има налични наблюдения и в тях не е отчетен съответният проблем.
            В PRO анализа тази разлика е важна, защото определя колко уверено
            може да бъде формулирано заключението.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означават непълните данни при няколко ПВТ
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато една координата попада в повече от едно подземно водно тяло,
            за едното може да има подробен мониторинг, а за друго да липсва част
            от информацията. В такъв случай не е правилно всички тела да бъдат
            обобщени с еднаква сигурност. Данните трябва да се разглеждат
            поотделно за всяко ПВТ.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Как SONDI.BG показва липсващата информация
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Когато няма достатъчно официални данни за даден показател, PRO
            анализът използва по-предпазливи формулировки като „няма данни“,
            „непълни данни“ или „няма достатъчно данни за ясно заключение“.
            Целта е липсата на информация да не бъде представяна погрешно като
            положителен или отрицателен резултат.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво да направиш, когато данните са недостатъчни
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При липса на мониторингови данни трябва да се използват другите
            налични източници: геоложка и хидрогеоложка информация, данни за
            близки сондажи и извори, официални регистри и локални проучвания.
            Ако въпросът е за качеството на вода от конкретен сондаж, най-надеждният
            отговор идва от лабораторен анализ на проба от самото съоръжение.
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
          официални мониторингови програми и регистри за подземните води,
          басейнови планове за управление на водите и утвърдени принципи за
          интерпретация на непълни мониторингови данни.
        </div>
      </article>
    </main>
  );
}