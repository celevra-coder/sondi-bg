import Link from "next/link";

export const metadata = {
  title: "Мониторинг при няколко подземни водни тела | Sondi.bg",
  description:
    "Разбираемо обяснение как се тълкуват мониторинговите данни, когато една координата попада в повече от едно подземно водно тяло.",
};

export default function MultipleGroundwaterBodiesMonitoringPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f929d]">
            ЗНАНИЯ · МОНИТОРИНГ
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#173f48] sm:text-5xl">
            Мониторинг при няколко подземни водни тела
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#58747c]">
            На една и съща координата може да се припокриват две или повече
            подземни водни тела. Това не означава, че те са едно и също. Всяко
            може да има различна дълбочина, геология, химично състояние,
            количествено състояние и собствена мониторингова мрежа.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо на една точка може да има повече от едно ПВТ
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Подземните води са разположени в различни водоносни хоризонти и
            геоложки пластове. Един по-плитък водоносен комплекс може да лежи
            над по-дълбок, а отделните тела могат пространствено да се
            припокриват. Затова една координата на повърхността може да попада
            едновременно в няколко официално определени подземни водни тела.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Всяко водно тяло има собствен мониторинг
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Мониторинговите пунктове не се отнасят просто към координатата на
            картата, а към конкретно подземно водно тяло. Едното ПВТ може да има
            няколко химични и количествени пункта, а друго да има по-малко или
            изобщо да няма достатъчно публикувани данни. Затова мониторинговата
            информация трябва да се чете поотделно за всяко тяло.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо химичното състояние може да е различно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Две припокриващи се ПВТ могат да имат различен химичен състав и
            различна степен на уязвимост. По-плиткото тяло например може да бъде
            по-силно повлияно от земеделие или локално замърсяване, докато
            по-дълбокият хоризонт да е по-добре защитен. Възможна е и обратната
            ситуация в зависимост от геоложките условия и произхода на водата.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава „смесено“ в PRO анализа
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако една координата попада в няколко ПВТ и официалните им оценки са
            различни, SONDI.BG може да покаже общ резултат „смесено“. Това не
            означава, че водата физически е смесена. Означава, че за една и съща
            координата са приложими няколко официални оценки и те не са еднакви.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Защо проблемното ПВТ трябва да се посочи отделно
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            Ако само едно от припокриващите се тела е с лошо химично състояние
            или има проблемен показател, не е правилно цялата координата да се
            описва просто като „лоша“. По-точно е да се посочи кое ПВТ е
            проблемно и какъв е установеният показател. Така потребителят вижда
            откъде идва предупреждението и може да го свърже с конкретния
            водоносен хоризонт.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво виждаш в PRO анализа на SONDI.BG
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При припокриващи се водни тела PRO анализът може да покаже за всяко
            ПВТ поотделно химичното и количественото състояние, броя на химичните
            и количествените мониторингови пунктове, пунктовете за питейни води,
            установените превишения и проблемните показатели. Това позволява
            общото заключение да бъде по-точно и да не смесва различни водоносни
            системи в една оценка.
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            Какво означава това за бъдещ сондаж
          </h2>

          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            При сондиране е важно кой от припокриващите се водоносни хоризонти
            реално ще бъде достигнат и използван. Ако единият има благоприятни
            показатели, а другият е проблемен, това може да има значение за
            избора на дълбочина и за последващото изследване на водата. Затова
            мониторинговите данни трябва да се комбинират с геологията и
            очакваната дълбочина на конкретния водоносен хоризонт.
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
          официални данни за подземните водни тела и техния мониторинг, планове
          за управление на речните басейни и принципи за пространствена и
          хидрогеоложка интерпретация на припокриващи се водоносни системи.
        </div>
      </article>
    </main>
  );
}