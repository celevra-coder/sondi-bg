import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/sondi-hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="hero-content max-w-5xl text-center">
          <div className="mb-6 text-sm font-medium uppercase tracking-[0.45em] text-white/65">
            Sondi.bg
          </div>

          <h1 className="text-balance text-5xl font-light leading-[1.08] tracking-[-0.025em] text-white/95 sm:text-6xl md:text-7xl lg:text-8xl">
            Добре дошли в тайнствения свят
            <br className="hidden md:block" />
            {" "}на подземните води
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg font-light leading-relaxed text-white/70 md:text-xl">
            Геология, водоносни тела, мониторинг, сондажи и професионални
            анализи на едно място.
          </p>

          <div className="mt-10">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-10 py-4 text-base font-light tracking-[0.12em] backdrop-blur-md transition duration-500 hover:bg-white hover:text-black"
            >
              Изследвай
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}