import Link from "next/link";

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'ГЕОЛОЖКИ КАРТИ'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Как се чете геоложка карта'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Геоложката карта показва какви скали и геоложки единици изграждат дадена територия, каква е тяхната възраст, как се разполагат една спрямо друга и къде са основните структурни граници.'}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво всъщност показва една геоложка карта'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Геоложката карта не показва само „каква скала има отдолу“. Тя представя геоложки единици, техните граници, възраст, литоложки състав и структурни отношения. Чрез нея може да се разбере дали дадено място попада върху речни наслаги, варовици, пясъчници, гранити, метаморфни скали или по-сложна комбинация от няколко геоложки тела.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво означават цветовете'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Различните цветове разграничават отделни геоложки единици. Цветът обаче не трябва да се чете самостоятелно — той обикновено е свързан с легенда, код и описание. Една оцветена площ може да представлява конкретна скала, но може и да включва цяла формация с няколко различни литоложки типа. Затова правилното тълкуване винаги започва от легендата.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как се четат кодовете и означенията'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Кратките буквено-цифрови кодове върху картата обикновено обозначават геоложка възраст, стратиграфска единица или конкретен литоложки комплекс. Самият код рядко е достатъчен за разбиране на водоносността. Необходимо е да се провери какъв скален състав стои зад него и дали единицата съдържа пясъци, чакъли, варовици, мергели, вулканити, гранити или други материали.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Какво означават линиите на картата'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Линиите могат да показват граници между геоложки единици, разломи, навлаци, оси на гънки и други структурни елементи. При анализ за подземни води тези линии са особено важни, защото контактите между различни скали и разломните зони могат да влияят върху движението на водата. Важно е обаче да се различава обикновена литоложка граница от действителен разлом.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо мащабът на картата има значение'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Карта в мащаб 1:100 000 е много полезна за регионална оценка, но не може да показва всички малки пукнатини, локални промени на пластовете и структури в рамките на конкретен имот. Колкото по-дребен е мащабът, толкова повече детайли са обобщени. Затова геоложката карта е силна основа за анализ, но не заменя локалните данни и теренната проверка.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как картата помага при търсене на подземна вода'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'От геоложката карта може да се получи първа представа за типа водоносна среда. Пясъци и чакъли насочват към порест водоносен хоризонт, варовиците могат да бъдат свързани с карст, а гранити и гнайси — с пукнатинна водоносност. Контактите, разломите и речните наслаги допълнително помагат да се откроят участъци, които заслужават по-задълбочено изследване.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как се използва геоложката карта в SONDI.BG'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'В SONDI.BG геоложката карта е един от основните слоеве на професионалната интерпретация, но не се разглежда самостоятелно. Информацията за геоложката единица се комбинира с литологията, водоносните хоризонти, разломната мрежа, подземните водни тела и наличните данни за близки сондажи и водовземни съоръжения. Така картата се превръща от общо геоложко изображение в част от практическа оценка на конкретното място.'}
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