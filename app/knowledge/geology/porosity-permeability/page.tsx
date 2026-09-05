import Link from "next/link";

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'ХИДРОГЕОЛОЖКИ СВОЙСТВА'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Порьозност и пропускливост'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Порьозността показва колко празно пространство има в една скала или седимент, а пропускливостта — доколко тези пространства са свързани и позволяват движение на вода.'}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво е порьозност'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Порьозността описва каква част от обема на даден материал е заета от празни пространства. В пясък и чакъл това са пространствата между отделните зърна, а в плътните скали могат да бъдат малки кухини и пукнатини. Колкото по-голям е общият обем на тези празнини, толкова повече вода може потенциално да се съхранява в материала.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво е пропускливост'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Пропускливостта е свързана не само с наличието на пори, а с това дали те са свързани помежду си. Ако празните пространства образуват непрекъснати пътища, водата може да се движи сравнително лесно. Ако са дребни, изолирани или прекъснати, материалът може да задържа вода, но да я отдава много бавно.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо порьозност и пропускливост не са едно и също'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Материал с висока порьозност не е задължително добър водоносен хоризонт. Класически пример е глината: тя може да съдържа значително количество вода в множество микроскопични пори, но водата преминава през тях много трудно. За един продуктивен водоносен пласт е важно да има не само място за вода, но и добра връзка между порите или пукнатините.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Пясък и чакъл като пример за пореста среда'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Добре сортираните пясъци и чакъли често имат свързани пори и могат да пропускат вода ефективно. Затова речните тераси, алувиалните наслаги и някои котловинни седименти могат да образуват продуктивни плитки водоносни хоризонти. Ако обаче пространствата между по-едрите зърна са запълнени с глина или фин прах, пропускливостта може да спадне значително.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Пукнатинна пропускливост при твърдите скали'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Гранити, гнайси и други плътни скали обикновено имат малка първична порьозност. Там водата се движи основно по пукнатини, изветрели зони и разломни структури. Това се нарича вторична или пукнатинна пропускливост. Един масивен, ненапукан гранит може да е почти безводен, докато същият тип скала на няколко десетки метра разстояние може да бъде значително по-водоносен, ако е силно напукан.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво означава това за дебита на един сондаж'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Сондажът не се нуждае просто от пласт, в който има вода. Необходимо е водата да може да постъпва към сондажната колона с достатъчна скорост. Затова два сондажа, които пресичат на пръв поглед еднакви материали, могат да имат съвсем различен дебит. Разликата често е в зърнометрията, степента на уплътняване, количеството глина, напукването и връзката на конкретната зона с по-голяма водоносна система.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Практическо значение при оценка на място за сондаж'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'При предварителна оценка за сондаж порьозността и пропускливостта се разглеждат заедно с литологията, геоложката структура и очакваната дебелина на водоносната зона. Пясъчно-чакълест пласт с добра хидравлична връзка, карстова зона или силно напукана скала могат да бъдат перспективни по различни причини. Затова само обозначението на скалата върху карта не е достатъчно — важно е как конкретната геоложка среда може реално да приема, съхранява и предава вода към сондажа.'}
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