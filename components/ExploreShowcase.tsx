export default function ExploreShowcase() {
  return (
    <div className="relative hidden min-h-[430px] md:block">
      <div className="absolute right-[2%] top-[6%] h-[400px] w-[80%] rotate-[6deg] overflow-hidden rounded-[18px] border-[12px] border-white bg-[#eaf7fa] shadow-[0_28px_60px_rgba(29,76,88,.18)]">
        <div className="absolute left-6 top-5 z-20 rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2d7382] shadow-sm backdrop-blur">
          Карта на България
        </div>

        <iframe
          src="/geology-map/index.html"
          title="Карта на България"
          className="h-full w-full scale-[1.24]"
          style={{ pointerEvents: "none", transformOrigin: "center center" }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.36),transparent_28%),linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.03))]" />
      </div>

      <div className="absolute left-[18%] top-[19%] z-10 h-[350px] w-[48%] -rotate-[7deg] overflow-hidden rounded-[18px] border-[10px] border-white bg-[#f7f8f6] shadow-[0_24px_60px_rgba(29,76,88,.16)]">
        <div className="absolute inset-x-0 top-0 h-[31%] bg-[linear-gradient(180deg,#97c793_0%,#7fae7d_100%)]" />
        <div className="absolute inset-x-0 top-[31%] h-[23%] bg-[linear-gradient(180deg,#9f7650_0%,#906746_100%)]" />
        <div className="absolute inset-x-0 top-[54%] h-[22%] bg-[linear-gradient(180deg,#7b5c42_0%,#674d38_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(180deg,#4f6d7d_0%,#355362_100%)]" />

        <div className="absolute left-6 top-5 rounded-full bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffffff] shadow-sm">
          Сондаж и терен
        </div>

        <div className="absolute left-[27%] top-[18%] h-[63%] w-[10px] rounded-full bg-white/90 shadow-[0_0_14px_rgba(255,255,255,.22)]" />
        <div className="absolute left-[25.2%] top-[15%] h-[40px] w-[24px] rounded-[8px] bg-[#eaf1f4] shadow-md" />
        <div className="absolute left-[29.5%] top-[42%] h-[5px] w-[60px] rotate-[20deg] rounded-full bg-[#dbe7ec]" />
        <div className="absolute left-[24%] top-[71%] h-[40px] w-[52px] rounded-[6px] bg-[#173f4a] shadow-lg" />

        <div className="absolute left-[63%] top-[28%] h-5 w-5 rounded-full border-4 border-[#6fe1ff]/50 bg-[#8eeeff] shadow-[0_0_18px_rgba(111,225,255,.45)]" />
        <div className="absolute left-[54%] top-[43%] h-5 w-5 rounded-full border-4 border-[#6fe1ff]/45 bg-[#93ecff] shadow-[0_0_18px_rgba(111,225,255,.35)]" />
        <div className="absolute left-[68%] top-[61%] h-5 w-5 rounded-full border-4 border-[#6fe1ff]/45 bg-[#93ecff] shadow-[0_0_18px_rgba(111,225,255,.35)]" />
        <div className="absolute left-[49%] top-[77%] h-5 w-5 rounded-full border-4 border-[#6fe1ff]/45 bg-[#93ecff] shadow-[0_0_18px_rgba(111,225,255,.35)]" />

        <div className="absolute bottom-5 right-5 rounded-[14px] bg-white/88 px-4 py-3 text-[12px] text-[#315460] shadow-[0_14px_30px_rgba(21,57,67,.12)] backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#7b9ba5]">
            Полево проучване
          </div>
          <div className="mt-1 font-semibold text-[#153943]">
            Сондаж · терен · водоносни нива
          </div>
        </div>
      </div>

      <div className="absolute bottom-[2%] left-[34%] z-20 w-[365px] rounded-[18px] bg-white/95 p-6 shadow-[0_18px_50px_rgba(26,72,84,.18)] backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#70929b]">
          Анализ на местоположение
        </div>

        <div className="mt-3 text-[18px] font-semibold text-[#153943]">
          42.1354, 24.7453
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#eaf7fa] px-3 py-1 text-[11px] text-[#2f7180]">
            Геология
          </span>
          <span className="rounded-full bg-[#eaf7fa] px-3 py-1 text-[11px] text-[#2f7180]">
            Водни тела
          </span>
          <span className="rounded-full bg-[#eaf7fa] px-3 py-1 text-[11px] text-[#2f7180]">
            Мониторинг
          </span>
        </div>
      </div>

      <div className="absolute right-[16%] top-[8%] h-14 w-14 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute right-[35%] top-[40%] h-12 w-12 rounded-full bg-[#9fe8f6]/35 blur-2xl" />
    </div>
  );
}
