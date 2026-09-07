export const metadata = {
  alternates: { canonical: "/" },
};

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const heroFont = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function Home() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <video
        className="
          absolute inset-0 h-full w-full object-cover
          object-[52%_center]
          sm:object-center
        "
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/sondi-hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/60" />

      <section
        className="
          relative z-10 flex min-h-[100svh] items-center justify-center
          px-5 py-10
          sm:px-7
          md:px-10 md:py-14
          lg:px-12
        "
      >
        <div className="hero-content mx-auto w-full max-w-[1180px] text-center">

          <div
            className="
              mb-5 text-[10px] font-medium uppercase
              tracking-[0.34em] text-white/65
              sm:mb-6 sm:text-xs sm:tracking-[0.42em]
              md:text-sm
            "
          >
            Sondi.bg
          </div>

          <h1
            className={`
              ${heroFont.className}
              mx-auto max-w-[1150px]
              text-[42px] font-medium
              leading-[0.98] tracking-[-0.035em]
              text-white/95

              min-[390px]:text-[48px]

              sm:text-[58px]
              sm:leading-[0.98]

              md:text-[72px]
              md:leading-[0.96]

              lg:text-[88px]

              xl:text-[104px]

              2xl:text-[112px]
            `}
          >
            Добре дошли в тайнствения свят{" "}
            <span className="md:block">
              на подземните води
            </span>
          </h1>

          <p
            className="
              mx-auto mt-6 max-w-[760px]
              px-2 text-sm font-light leading-6
              text-white/70

              sm:mt-7 sm:text-base sm:leading-7

              md:mt-8 md:text-lg md:leading-8

              lg:text-xl
            "
          >
            Геология, водоносни тела, мониторинг, сондажи и
            професионални анализи на едно място.
          </p>

          <div className="mt-8 sm:mt-9 md:mt-11">
            <Link
              href="/explore"
              className="
                inline-flex min-w-[150px]
                items-center justify-center
                rounded-full border border-white/40
                bg-white/10
                px-7 py-3.5
                text-sm font-light tracking-[0.13em]
                backdrop-blur-md
                transition duration-500
                hover:bg-white hover:text-black

                sm:min-w-[165px]
                sm:px-9 sm:py-4
                sm:text-base
              "
            >
              {"\u0418\u0437\u0441\u043b\u0435\u0434\u0432\u0430\u0439"}
            </Link>
          </div>

        </div>
      </section>

      <section className="relative z-10 bg-[#081418] px-5 py-16 sm:px-7 sm:py-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[880px]">
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#a0c2ca]">
              SONDI.BG · ИНФОРМАЦИЯ ЗА ПОДЗЕМНИ ВОДИ
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Подземни води, геология и сондажи в България
            </h2>

            <p className="mt-6 max-w-[840px] text-base leading-8 text-white/65">
              SONDI.BG събира на едно място данни за подземните води,
              геологията, мониторинга, разломите и сондажите в България.
              Картата позволява да се съпоставят официални източници,
              геоложки и хидрогеоложки понятия в един пространствен контекст.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/map"
              className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25"
            >
              <strong className="block text-white">Карта на подземните води</strong>
              <span className="mt-2 block text-sm leading-6 text-white/55">
                Разгледай водни тела, геология, разломи и мониторинг.
              </span>
            </Link>

            <Link
              href="/knowledge"
              className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25"
            >
              <strong className="block text-white">База знания</strong>
              <span className="mt-2 block text-sm leading-6 text-white/55">
                Основни понятия и практически материали за подземните води.
              </span>
            </Link>

            <Link
              href="/drilling"
              className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25"
            >
              <strong className="block text-white">Сондажи за вода</strong>
              <span className="mt-2 block text-sm leading-6 text-white/55">
                Подготовка, дълбочина, дебит, водни нива и практически насоки.
              </span>
            </Link>

            <Link
              href="/services"
              className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25"
            >
              <strong className="block text-white">Сондажни услуги</strong>
              <span className="mt-2 block text-sm leading-6 text-white/55">
                Намери изпълнител или публикувай заявка за сондажна услуга.
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>

  );
}
