import Link from "next/link";

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'СТРАТИГРАФИЯ'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Геоложка възраст и стратиграфия'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Стратиграфията подрежда геоложките единици във времето и помага да се разбере кои пластове са по-стари, кои са по-млади и как са се натрупвали или променяли един спрямо друг.'}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво означава геоложка възраст'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Геоложката възраст показва кога приблизително са се образували дадени скали или седименти. Тя се изразява чрез геоложки ери, периоди и по-малки времеви единици. На геоложките карти възрастта често е част от кода и цвета на дадена единица, но сама по себе си не показва дали скалата е водоносна.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Геоложката възраст не е водоносност'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Две скали на еднаква възраст могат да имат напълно различно поведение спрямо подземните води. Например едната може да бъде пропусклив пясъчник, а другата плътен мергел. Затова възрастта трябва да се използва като част от геоложкия контекст, а не като пряк показател за наличие или количество на вода.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво представляват формациите и свитите'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Геоложките карти често групират скалите в именувани стратиграфски единици — например формации и свити. Една такава единица може да включва повече от един вид скала и да се разпознава по характерна последователност от пластове, състав и възраст. Затова името на формацията не трябва автоматично да се приема като име на конкретна литология.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво показва последователността на пластовете'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Стратиграфската последователност показва как различни геоложки единици се разполагат една спрямо друга. В ненарушени седиментни последователности по-младите пластове обикновено лежат върху по-старите. Разломи, гънки и ерозия обаче могат да разместят или премахнат части от тази последователност, затова реалният строеж на терена може да бъде много по-сложен.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо контактите между различни единици са важни'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Контактът между две стратиграфски или литоложки единици може да съвпада с рязка промяна в порьозността и пропускливостта. Например пропусклив пясъчник може да лежи върху слабопропусклив мергел. Такава граница може да влияе върху движението на подземната вода и при определени условия да насочва потока по самия контакт.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как стратиграфията помага да се проследят водоносни пластове'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Ако даден водоносен пласт е част от ясно разпознаваема геоложка единица, стратиграфията помага той да бъде проследен и извън конкретната точка на наблюдение. Данни от сондажи, разкрития и геоложки карти могат да покажат на каква дълбочина се очаква същата единица и как се изменя дебелината й в пространството.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Практическо значение при оценка за сондаж'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'При оценка на място за сондаж стратиграфията помага да се разбере кои геоложки единици могат да бъдат пресечени в дълбочина и в каква последователност. Тази информация е особено полезна, когато се комбинира с литологията, данни от близки сондажи, разломи и хидрогеоложки карти. Така може по-добре да се оцени дали на определена дълбочина се очаква водоносен пласт, слабопропусклив слой или контакт между различни среди.'}
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