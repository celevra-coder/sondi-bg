import Link from "next/link";
import ExploreCards from "@/components/ExploreCards";

export default function ExplorePage() {
  return (
    <main className="overflow-hidden bg-white">

      <section className="relative min-h-[690px] bg-[#dff2f7]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-[12%] top-[8%] text-[150px] font-bold tracking-[-0.08em] text-[#c8e8ef]/45">
            WATER
          </div>
          <div className="absolute right-[4%] top-[7%] text-[130px] font-bold tracking-[-0.08em] text-white/30">
            GEOLOGY
          </div>
        </div>

        <div className="relative mx-auto grid max-w-[1540px] gap-10 px-7 pb-[170px] pt-16 lg:grid-cols-[.92fr_1.08fr] lg:px-10">
          <div className="relative z-20 pt-5">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#387f91]">
              Подземни води · България
            </div>

            <h1 className="mt-7 max-w-[720px] text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#153943] md:text-6xl xl:text-[72px]">
              Подземният свят
              <br />
              вече е видим.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#426a74]">
              Карти, официални данни и професионални инструменти за
              подземните води, геологията и сондажите.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="rounded-full bg-[#153943] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#1f6170]"
              >
                Провери място
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[430px] md:block">

            {/* ЗАДНА КАРТА — реалната Sondi.bg карта */}
            <div className="absolute right-[0%] top-[5%] h-[385px] w-[76%] rotate-[6deg] overflow-hidden rounded-[18px] border-[11px] border-white bg-[#dceff4] shadow-[0_28px_70px_rgba(25,72,84,.18)]">

              <div className="absolute left-5 top-5 z-30 rounded-full bg-white/95 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.20em] text-[#397887] shadow-md">
                Геоложка карта
              </div>

              <div className="absolute inset-0 overflow-hidden bg-[#d7edf2]">

                <img
                  src="/geology-map/data/bd_ibr_geology_2024_affine.png"
                  alt="Геоложка карта"
                  className="absolute inset-0 h-full w-full scale-[1.18] object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[#0e5262]/15" />

                <div className="absolute left-[58%] top-[47%] z-20">
                  <div className="h-3 w-3 rounded-full bg-[#0b839e] shadow-[0_0_0_8px_rgba(11,131,158,.18)]" />
                </div>
              </div>

              <div className="absolute bottom-5 right-5 z-30 rounded-[14px] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#75959d]">
                  Пространствени данни
                </div>
                <div className="mt-1 text-xs font-semibold text-[#173e48]">
                  Водни тела · Геология · Мониторинг
                </div>
              </div>
            </div>


            {/* СРЕДНА КАРТА — реалното видео на Sondi.bg */}
            <div className="absolute left-[4%] top-[19%] z-10 h-[325px] w-[57%] -rotate-[7deg] overflow-hidden rounded-[18px] border-[10px] border-white bg-[#173f49] shadow-[0_28px_70px_rgba(25,72,84,.20)]">

              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="/videos/sondi-hero.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-[#082d36]/65 via-transparent to-black/10" />

              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  От терена до анализа
                </div>

                <div className="mt-1 text-lg font-medium text-white">
                  Вода · Геофизика · Сондажи
                </div>
              </div>
            </div>


            {/* ПРЕДНА КАРТА — анализ */}
            <div className="absolute bottom-[0%] left-[27%] z-20 w-[365px] rounded-[18px] border border-white/45 bg-[#b9e3ec]/45 p-6 shadow-[0_22px_60px_rgba(24,82,96,.18)] backdrop-blur-xl">

              <div className="flex items-center justify-between border border-white/40">
                <div className="text-[10px] uppercase tracking-[0.20em] text-[#70929b]">
                  Анализ на местоположение
                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-[#39a5bc] shadow-[0_0_0_6px_rgba(57,165,188,.10)]" />
              </div>

              <div className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-[#153943]">
                42.1354, 24.7453
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/30 bg-white/35 px-3 py-1.5 text-[11px] text-[#174f5d]">
                  Геология
                </span>

                <span className="rounded-full border border-white/30 bg-white/35 px-3 py-1.5 text-[11px] text-[#174f5d]">
                  Водни тела
                </span>

                <span className="rounded-full border border-white/30 bg-white/35 px-3 py-1.5 text-[11px] text-[#174f5d]">
                  Мониторинг
                </span>
              </div>

              <div className="mt-5 border-t border-white/35 pt-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#78939a]">
                    Пространствен контекст
                  </span>

                  <span className="font-medium text-[#1c7488]">
                    Пространствен анализ
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-white [clip-path:polygon(0_62%,17%_78%,38%_46%,61%_70%,78%_38%,100%_58%,100%_100%,0_100%)]" />
      </section>

      <section className="relative z-20 mx-auto -mt-[115px] max-w-[1320px] px-7 lg:px-10">
        <ExploreCards />
      </section>

      <section className="mx-auto max-w-[1320px] px-7 pb-20 pt-20 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-[#2a5d68]/45 bg-[#153d47] p-10 text-white shadow-[0_22px_65px_rgba(24,70,82,.16)] transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_30px_85px_rgba(24,70,82,.24)]">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[42px] border-white/5 transition duration-700 group-hover:scale-110" />            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 shadow-[0_0_14px_rgba(255,255,255,.75)] transition-all duration-700 ease-out group-hover:translate-y-[329px] group-hover:opacity-90" />

            <div className="relative">
              <div className="text-xs uppercase tracking-[0.25em] text-[#8ac7d3]">
                Sondi EXPERT
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em]">
                От координатите до професионалния анализ.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-white/60">
                След избор на точка SONDI EXPERT свързва наличните данни
                за геология, подземни водни тела, ресурс, мониторинг,
                разломи и пространствен контекст в един подробен анализ.
              </p>

              <div className="mt-8 border-t border-white/15 pt-5 text-sm leading-6 text-white/50">
                SONDI EXPERT се създава след избор на конкретна точка от картата.
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[28px] border border-[#d2e6eb] bg-[#edf8fa] p-9 shadow-[0_22px_65px_rgba(24,70,82,.12)] transition duration-500 ease-out hover:-translate-y-1 hover:border-[#a8d3dc] hover:shadow-[0_30px_85px_rgba(24,70,82,.18)]">
            <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#8ed3df]/15 blur-2xl transition duration-700 group-hover:scale-150" />            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 shadow-[0_0_12px_rgba(255,255,255,.85)] transition-all duration-700 ease-out group-hover:translate-y-[329px] group-hover:opacity-90" />            <div className="relative text-xs uppercase tracking-[0.25em] text-[#5d909c]">
              Знания
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
              Водата под земята, обяснена ясно.
            </h2>

            <p className="mt-5 leading-7 text-[#607b82]">
              Практични материали за подземните води, геологията,
              мониторинга, проучванията и сондажите.
            </p>

            <Link
              href="/knowledge"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#1d788f] transition hover:gap-3"
            >
              Разгледай знанията <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-[#d7e8eb] bg-[#f4fafb] px-8 py-9 sm:px-10">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[34px] border-[#8ecbd7]/10" />

          <div className="relative max-w-3xl">
            <div className="text-xs uppercase tracking-[0.25em] text-[#5d909c]">
              Източници и прозрачност
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#153943]">
              Данни с проследим произход.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[#607b82]">
              SONDI.BG обединява официални публични данни, геоложки карти,
              научни публикации и европейски пространствени източници,
              като източникът и интерпретацията се разграничават.
            </p>

            <Link
              href="/sources"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#1d788f] transition hover:gap-3"
            >
              Източници на данни <span>→</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}