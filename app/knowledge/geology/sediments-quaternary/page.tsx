import Link from "next/link";

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'СЕДИМЕНТИ'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Седименти и кватернерни наслаги'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Младите наслаги в речни долини, котловини и подножия често са едни от най-важните среди за плитките подземни води, но тяхната водоносност може да се изменя силно на малко разстояние.'}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво представляват кватернерните наслаги'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Кватернерните наслаги са сравнително млади седименти, натрупани през най-новия етап от геоложката история. Те включват пясъци, чакъли, валуни, глини, прахови материали и смесени наслаги. Срещат се широко по речни долини, тераси, котловини, подножия на планини и равнинни части.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Алувиални наслаги по речните долини'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Алувиалните наслаги се образуват от материал, пренесен и отложен от реките. Пясъците и чакълите в тях често имат добра пропускливост и могат да образуват продуктивни плитки водоносни хоризонти. По-едрите и добре промити чакъли обикновено пропускат вода по-лесно от фините пясъци и глинестите прослойки.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо тези наслаги са силно нееднородни'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Реките постоянно променят своето русло и енергията на потока си. Затова на едно място могат да отлагат едър чакъл, а съвсем наблизо фин пясък или глина. В един сондажен профил често се редуват няколко различни слоя. Това означава, че дебелината и продуктивността на водоносната зона могат да се променят значително дори между близки точки.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Връзка между подземните води и реките'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'В алувиалните наслаги подземните води често имат пряка хидравлична връзка с близката река. В зависимост от сезона и нивата реката може да подхранва водоносния хоризонт или обратно — подземните води да се оттичат към речното корито. Затова водното ниво в близост до реки може да се изменя по-бързо от това в по-дълбоки и изолирани водоносни системи.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Наслаги в котловини и подножия'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Не всички кватернерни наслаги са речни. В котловини и в подножията на планините могат да се натрупват пролувиални и делувиални материали, пренесени от временни потоци, склонови процеси и поройни води. Те често са слабо сортирани и съдържат смес от едри късове, пясък, прах и глина. Водоносността им зависи от това кои фракции преобладават и дали между тях има добре свързани пропускливи зони.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Уязвимост към замърсяване'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Плитките водоносни хоризонти в пропускливи пясъци и чакъли могат да се подхранват бързо от повърхността. Това е предимство за възстановяването на запасите, но ги прави и по-уязвими към замърсяване. Земеделие, септични системи, промишлени площадки и други повърхностни източници могат да повлияят качеството на водата, ако защитният почвен и глинест слой е слаб.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Практическо значение при сондаж'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'При сондаж в кватернерни наслаги е важно да се оцени не само дали районът е покрит с пясък и чакъл, а каква е тяхната дебелина, зърнометрия и връзка с глинести прослойки. Един дебел чакълест пласт може да осигури добър дебит, докато близък участък, доминиран от фин материал, може да бъде значително по-слабо продуктивен. Данните от близки сондажи, речните тераси, геоморфологията и геоложката карта са особено полезни при такава оценка.'}
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-[#dce8eb] pt-8">
          <Link href="/knowledge/geology" className="rounded-full border border-[#bfdde3] px-5 py-3 text-sm font-semibold text-[#177f98]">
            {'← Към Геология'}
          </Link>
          <Link href="/map" className="rounded-full bg-[#173f48] px-5 py-3 text-sm font-semibold text-white">
            {'Към картата →'}
          </Link>
        </div>

        <div className="mt-10 rounded-[22px] border border-[#dbe8ea] bg-[#f7fbfc] p-6 text-sm leading-7 text-[#617b82]">
          <strong className="text-[#173f48]">
            {'Източници и методична основа: '}
          </strong>
          {'геоложки и хидрогеоложки карти на България, официални данни за подземните водни тела и утвърдени принципи на геоложката и хидрогеоложката интерпретация.'}
        </div>
      </article>
    </main>
  );
}