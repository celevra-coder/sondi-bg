import Link from "next/link";

export default function GeologyKnowledgePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#dce8eb] bg-[#e9f6f8]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#5b8d97]">
            {'ЗНАНИЯ · ГЕОЛОГИЯ'}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[#103e49] sm:text-5xl">
            {'Геология и хидрогеология'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#637f87]">
            {'Как скалите, литологията, геоложките структури и водоносните среди определят движението и натрупването на подземната вода.'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="mb-9">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a9299]">
            {'10 МАТЕРИАЛА'}
          </div>
          <h2 className="mt-3 text-3xl font-bold text-[#173f48]">
            {'Основи на геоложката и хидрогеоложката интерпретация'}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/knowledge/geology/reading-geological-map"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'ГЕОЛОЖКИ КАРТИ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Как се чете геоложка карта'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Геоложката карта показва скалите, геоложките единици, възрастта и структурните граници.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/lithology"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'ЛИТОЛОГИЯ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Какво е литология и защо е важна за подземните води'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Как съставът на скалите и седиментите влияе на съхранението и движението на водата.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/rock-types-water-bearing"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'СКАЛИ И ВОДА'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Основни видове скали и тяхната водоносност'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Седиментни, магмени и метаморфни скали и типичното им хидрогеоложко поведение.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/porosity-permeability"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'ХИДРОГЕОЛОЖКИ СВОЙСТВА'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Порьозност и пропускливост'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Защо един материал може да съдържа вода, но да не я пропуска лесно.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/aquifer-aquitard"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'ХИДРОГЕОЛОГИЯ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Водоносен хоризонт, водоупор и водоносен комплекс'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Как различните геоложки слоеве задържат, пропускат и ограничават подземната вода.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/sediments-quaternary"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'СЕДИМЕНТИ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Седименти и кватернерни наслаги'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Речните, алувиалните и други млади наслаги и ролята им за плитките подземни води.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/karst"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'КАРСТ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Карст и карстови води'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Как разтворимите скали създават канали, каверни и водоносни системи.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/faults-fractures-groundwater"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'СТРУКТУРНА ГЕОЛОГИЯ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Разломи, пукнатини и движението на подземните води'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Кога разломната зона може да бъде път за водата и кога може да действа като бариера.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/stratigraphy-geological-age"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'СТРАТИГРАФИЯ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Геоложка възраст и стратиграфия'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Какво означават цветовете, кодовете и геоложките периоди в картата.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
          <Link
            href="/knowledge/geology/geology-drilling-assessment"
            className="group rounded-[24px] border border-[#d9e7e9] bg-white p-7 transition hover:border-[#9fcbd2] hover:shadow-[0_14px_40px_rgba(20,63,73,.08)]"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
              {'ПРАКТИЧЕСКА ИНТЕРПРЕТАЦИЯ'}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-7 text-[#173f48]">
              {'Как геологията участва в оценката на място за сондаж'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6a8187]">
              {'Как литологията, разломите, водоносните хоризонти и локалните данни се събират в една оценка.'}
            </p>
            <div className="mt-6 text-sm font-semibold text-[#177f98]">
              {'Прочети →'}
            </div>
          </Link>
        </div>

        <div className="mt-12">
          <Link href="/knowledge" className="text-sm font-semibold text-[#177f98]">
            {'← Към всички теми'}
          </Link>
        </div>
      </section>
    </main>
  );
}
