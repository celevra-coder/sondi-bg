import type { Metadata } from "next";
import Link from "next/link";
import WaterSearch from "./WaterSearch";
import {
  cleanDistrictName,
  getIndexableSettlements,
} from "@/lib/settlements";

export const metadata: Metadata = {
  title:
    "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f \u2013 \u043a\u0430\u0440\u0442\u0430 \u0438 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043f\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430",
  description:
    "\u041a\u0430\u0440\u0442\u0430 \u0438 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438 \u0432\u043e\u0434\u0438 \u0438 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043f\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430.",
  alternates: {
    canonical: "/water",
  },
};

export default function WaterPage() {
  const settlements =
    getIndexableSettlements();

  const grouped = new Map<
    string,
    typeof settlements
  >();

  for (const item of settlements) {
    const district =
      cleanDistrictName(item.district);

    if (!grouped.has(district)) {
      grouped.set(district, []);
    }

    grouped.get(district)!.push(item);
  }

  const districts = Array.from(
    grouped.entries(),
  ).sort(([a], [b]) =>
    a.localeCompare(b, "bg"),
  );

  const searchItems = settlements.map(
    (item) => ({
      name: item.name,
      slug: item.slug,
      municipality: item.municipality,
      district: item.district,
    }),
  );

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.sondi.bg/water#webpage",
    url: "https://www.sondi.bg/water",
    name: "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
    description:
      "\u041a\u0430\u0440\u0442\u0430 \u0438 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f \u0438 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438\u0442\u0435 \u043c\u0435\u0441\u0442\u0430.",
    inLanguage: "bg-BG",
    isPartOf: {
      "@type": "WebSite",
      name: "SONDI.BG",
      url: "https://www.sondi.bg/",
    },
    about: {
      "@type": "Thing",
      name: "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 pb-16 pt-24 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#438594]">
              {"SONDI.BG \u00b7 \u041c\u0415\u0421\u0422\u041d\u0410 \u0418\u041d\u0424\u041e\u0420\u041c\u0410\u0426\u0418\u042f"}
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#153943] sm:text-5xl md:text-6xl">
              {"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f"}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
              {"\u0420\u0430\u0437\u0433\u043b\u0435\u0434\u0430\u0439\u0442\u0435 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u043f\u043e \u0440\u0430\u0439\u043e\u043d\u0438, \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438\u044f \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442, \u0432\u043e\u0434\u043d\u0438\u0442\u0435 \u0442\u0435\u043b\u0430 \u0438 \u0434\u0440\u0443\u0433\u0430 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f. \u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u043b\u0438 \u043e\u0442\u0432\u043e\u0440\u0435\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430 \u043d\u0430 SONDI.BG."}
            </p>
          </div>

          <div className="mt-10 max-w-2xl">
            <WaterSearch
              settlements={searchItems}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#e1ecee] bg-white">
        <div className="mx-auto max-w-[1320px] px-7 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#6595a0]">
                {"\u041f\u041e\u0414\u0417\u0415\u041c\u041d\u0418 \u0412\u041e\u0414\u0418 \u0412 \u0411\u042a\u041b\u0413\u0410\u0420\u0418\u042f"}
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#173d47] sm:text-4xl">
                {"\u041a\u0430\u043a\u0432\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u043a\u044a\u0434\u0435 \u0438 \u043a\u0430\u043a \u0441\u0435 \u0441\u0440\u0435\u0449\u0430\u0442 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438?"}
              </h2>

              <p className="mt-6 max-w-3xl text-base leading-8 text-[#58747b]">
                {"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0441\u0435 \u043d\u0430\u0442\u0440\u0443\u043f\u0432\u0430\u0442 \u0438 \u0441\u0435 \u0434\u0432\u0438\u0436\u0430\u0442 \u0432 \u043f\u043e\u0440\u0438\u0442\u0435, \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438\u0442\u0435 \u0438 \u0440\u0430\u0437\u043b\u043e\u043c\u0438\u0442\u0435 \u043d\u0430 \u0441\u043a\u0430\u043b\u0438\u0442\u0435 \u0438 \u0432 \u043d\u0430\u0441\u0438\u043f\u043d\u0438\u0442\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438. \u041f\u043e\u0440\u0430\u0434\u0438 \u0440\u0430\u0437\u043d\u043e\u043e\u0431\u0440\u0430\u0437\u043d\u0430\u0442\u0430 \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f \u043d\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u0442\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f\u0442 \u0441\u0438\u043b\u043d\u043e \u043c\u0435\u0436\u0434\u0443 \u043e\u0442\u0434\u0435\u043b\u043d\u0438\u0442\u0435 \u0440\u0430\u0439\u043e\u043d\u0438."}
              </p>

              <p className="mt-4 max-w-3xl text-base leading-8 text-[#58747b]">
                {"\u0417\u0430\u0442\u043e\u0432\u0430 \u043e\u0446\u0435\u043d\u043a\u0430\u0442\u0430 \u043d\u0430 \u0435\u0434\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u0437\u0438\u0441\u043a\u0432\u0430 \u0441\u044a\u043f\u043e\u0441\u0442\u0430\u0432\u044f\u043d\u0435 \u043d\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430, \u0432\u043e\u0434\u043d\u0438\u0442\u0435 \u0442\u0435\u043b\u0430, \u0440\u0435\u043b\u0435\u0444\u0430, \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0438\u0442\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438 \u0438 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u043d\u043e\u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0434\u0430\u043d\u043d\u0438. SONDI.BG \u0441\u044a\u0431\u0438\u0440\u0430 \u0442\u0435\u0437\u0438 \u0441\u043b\u043e\u0435\u0432\u0435 \u0432 \u0435\u0434\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u043a\u0430\u0440\u0442\u0430."}
              </p>

              <Link
                href="/map"
                className="mt-8 inline-flex rounded-full bg-[#173f48] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245b67]"
              >
                {"\u041e\u0442\u0432\u043e\u0440\u0438 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430 \u2192"}
              </Link>
            </div>

            <div className="grid gap-4">
              <Link href="/knowledge/geology" className="rounded-[22px] border border-[#dce9ec] bg-[#f7fbfb] p-6 transition hover:bg-white">
                <h3 className="text-lg font-semibold text-[#173f48]">{"\u0413\u0435\u043e\u043b\u043e\u0433\u0438\u044f"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u0421\u043a\u0430\u043b\u0438, \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0435\u0434\u0438\u043d\u0438\u0446\u0438 \u0438 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438, \u043a\u043e\u0438\u0442\u043e \u0432\u043b\u0438\u044f\u044f\u0442 \u0432\u044a\u0440\u0445\u0443 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0438 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430."}</p>
              </Link>

              <Link href="/knowledge/groundwater/groundwater-body" className="rounded-[22px] border border-[#dce9ec] bg-[#f7fbfb] p-6 transition hover:bg-white">
                <h3 className="text-lg font-semibold text-[#173f48]">{"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u041a\u0430\u043a\u0432\u043e \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u044f\u0432\u0430\u0442 \u0438 \u043a\u0430\u043a \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442 \u043f\u0440\u0438 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438."}</p>
              </Link>

              <Link href="/drilling" className="rounded-[22px] border border-[#dce9ec] bg-[#f7fbfb] p-6 transition hover:bg-white">
                <h3 className="text-lg font-semibold text-[#173f48]">{"\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u0437\u0430 \u0432\u043e\u0434\u0430"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u041a\u0430\u043a \u0441\u0435 \u043f\u043e\u0434\u0433\u043e\u0442\u0432\u044f \u0441\u043e\u043d\u0434\u0430\u0436 \u0438 \u043a\u0430\u043a\u0432\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0435 \u043f\u043e\u043b\u0435\u0437\u043d\u0430 \u043f\u0440\u0435\u0434\u0438 \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u0442\u043e\u0447\u043a\u0430."}</p>
              </Link>
            </div>
          </div>

          <div className="mt-16 border-t border-[#e1ecee] pt-12">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#173d47]">
              {"\u041a\u0430\u0440\u0442\u0430 \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0438 \u043c\u0435\u0441\u0442\u043d\u0438\u044f\u0442 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442"}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="font-semibold text-[#244b55]">{"\u0412\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0441\u0435 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0438\u0440\u0430\u0442 \u0438 \u043e\u0446\u0435\u043d\u044f\u0432\u0430\u0442 \u0438 \u0447\u0440\u0435\u0437 \u043e\u0431\u043e\u0441\u043e\u0431\u0435\u043d\u0438 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430."}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#244b55]">{"\u0420\u0430\u0437\u043b\u043e\u043c\u0438 \u0438 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u043c\u043e\u0433\u0430\u0442 \u0434\u0430 \u0438\u043c\u0430\u0442 \u0432\u0430\u0436\u043d\u0430 \u0440\u043e\u043b\u044f \u0437\u0430 \u043f\u0440\u043e\u043d\u0438\u0446\u0430\u0435\u043c\u043e\u0441\u0442\u0442\u0430 \u0438 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438."}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#244b55]">{"\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438 \u0432\u043e\u0434\u0438"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657e84]">{"\u0412 \u0440\u0435\u0434\u0438\u0446\u0430 \u0440\u0430\u0439\u043e\u043d\u0438 \u043d\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438\u0442\u0435 \u0438\u0437\u0432\u043e\u0440\u0438 \u0438 \u043d\u0430\u0445\u043e\u0434\u0438\u0449\u0430 \u0441\u0430 \u0432\u0430\u0436\u043d\u0430 \u0447\u0430\u0441\u0442 \u043e\u0442 \u043c\u0435\u0441\u0442\u043d\u0430\u0442\u0430 \u0432\u043e\u0434\u043d\u0430 \u0438\u0441\u0442\u043e\u0440\u0438\u044f."}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/knowledge/water-quality/quantitative-status" className="text-sm font-semibold text-[#23788a] hover:text-[#173f48]">
                {"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u2192"}
              </Link>
              <Link href="/knowledge/exploration/selecting-drilling-point" className="text-sm font-semibold text-[#23788a] hover:text-[#173f48]">
                {"\u0418\u0437\u0431\u043e\u0440 \u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 \u2192"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-16 lg:px-10">

        <div className="mt-12">
          <div className="text-xs uppercase tracking-[0.24em] text-[#6595a0]">
            {"\u041d\u0410\u0421\u0415\u041b\u0415\u041d\u0418 \u041c\u0415\u0421\u0422\u0410 \u041f\u041e \u041e\u0411\u041b\u0410\u0421\u0422"}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {districts.map(
              ([district, items]) => (
                <section
                  key={district}
                  className="rounded-[24px] border border-[#dce9ec] bg-white p-6"
                >
                  <h2 className="text-xl font-semibold text-[#173d47]">
                    {district}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {items
                      .slice()
                      .sort((a, b) =>
                        a.name.localeCompare(
                          b.name,
                          "bg",
                        ),
                      )
                      .map((item) => (
                        <Link
                          key={item.slug}
                          href={`/water/${item.slug}`}
                          className="rounded-full border border-[#d8e7e9] bg-[#f7fbfb] px-3 py-1.5 text-sm text-[#35636d] transition hover:border-[#9fcbd5] hover:bg-white"
                        >
                          {item.name}
                        </Link>
                      ))}
                  </div>
                </section>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
