import Link from "next/link";

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#eaf6f8]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'КАРСТ'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Карст и карстови води'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Карстът се развива главно в разтворими карбонатни скали и може да създаде много продуктивни, но силно нееднородни водоносни системи, в които водата се движи по пукнатини, канали и кухини.'}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как възниква карстът'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Дъждовната и инфилтриралата се вода съдържа разтворен въглероден диоксид и може постепенно да разтваря варовици и други карбонатни скали. Процесът започва по естествени пукнатини, пластови повърхности и разломи. С течение на времето тези първоначално малки отвори могат да се разширят и да се превърнат в канали, каверни и сложни подземни дренажни системи.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Как се движи водата в карстова среда'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'За разлика от пясъчния водоносен хоризонт, където водата преминава през множество малки пори, в развит карст значителна част от потока може да се концентрира в отделни пукнатини и канали. Това означава, че движението може да бъде бързо и силно насочено. Водата не е разпределена равномерно във целия скален масив, а често следва конкретни проводящи структури.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Карстови извори и подземни водосбори'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Карстовите извори могат да дренират много по-голяма територия от непосредствената зона около самия извор. Подземният водосбор невинаги съвпада с повърхностния релеф, защото водата може да преминава през дълбоки канали от една долина към друга. Затова голям карстов извор често е крайна точка на сложна подземна система, а не просто резултат от местното просмукване на вода.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо дебитът може да се променя силно'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Добре развитите карстови системи могат да реагират бързо на валежи и снеготопене. След обилни валежи дебитът на извори и нивото на подземната вода могат да нараснат рязко, а през сух период да спаднат значително. Това поведение се различава от по-бавно реагиращите порести водоносни хоризонти, в които движението на водата обикновено е по-равномерно.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Защо сондажът в карст е труден за прогнозиране'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'В карстова среда малка хоризонтална промяна в мястото на сондажа може да има голямо значение. Един сондаж може да пресече широка водопроводяща пукнатина или карстов канал и да даде висок дебит, а друг, разположен сравнително близо, да попадне в плътен варовик с много по-слаба водоносност. Това е една от причините локалната структура да бъде особено важна при оценката на карстов терен.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Карстът и уязвимостта на водата'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'Бързото движение през широки пукнатини и канали означава, че естественото филтриране може да бъде ограничено. Замърсител, попаднал в понор, пукнатинна зона или силно пропусклива част от карста, може сравнително бързо да достигне подземната система. Затова карстовите води могат едновременно да бъдат много ценен воден ресурс и силно чувствителни към замърсяване от повърхността.'}
          </p>
        </section>

        <section className="border-t border-[#dce8eb] py-8 first:border-t-0 first:pt-0">
          <h2 className="text-2xl font-bold text-[#173f48]">
            {'Практическо значение при оценка за сондаж'}
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#58747c]">
            {'При карст не е достатъчно само да се установи, че в района има варовици. Важно е да се оцени степента на напукване и карстификация, близостта до разломи, контакти и зони на концентриран дренаж. Данните за извори, съществуващи сондажи, релеф и геоложки структури могат да помогнат да се разграничат по-перспективните участъци от масивни и слабо водоносни части на същата карбонатна формация.'}
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