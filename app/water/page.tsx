import type { Metadata } from "next";
import Link from "next/link";
import WaterSearch from "./WaterSearch";
import {
  cleanDistrictName,
  getIndexableSettlements,
} from "@/lib/settlements";

export const metadata: Metadata = {
  title:
    "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432\u044a\u0432 \u0432\u0430\u0448\u0435\u0442\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e",
  description:
    "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438 \u0440\u0430\u0437\u0433\u043b\u0435\u0434\u0430\u0439\u0442\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u0438 \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u0430 \u0432\u0440\u044a\u0437\u043a\u0430 \u043a\u044a\u043c \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430 \u043d\u0430 SONDI.BG.",
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

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1320px] px-7 pb-16 pt-24 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#438594]">
              {"SONDI.BG \u00b7 \u041c\u0415\u0421\u0422\u041d\u0410 \u0418\u041d\u0424\u041e\u0420\u041c\u0410\u0426\u0418\u042f"}
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#153943] sm:text-5xl md:text-6xl">
              {"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432\u044a\u0432 \u0432\u0430\u0448\u0435\u0442\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e"}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
              {"\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0433\u0440\u0430\u0434 \u0438\u043b\u0438 \u0441\u0435\u043b\u043e, \u0437\u0430 \u0434\u0430 \u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0437\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u0438 \u0434\u0430 \u043f\u0440\u0435\u043c\u0438\u043d\u0435\u0442\u0435 \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u043e \u043a\u044a\u043c \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e \u0432 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430."}
            </p>
          </div>

          <div className="mt-10 max-w-2xl">
            <WaterSearch
              settlements={searchItems}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-16 lg:px-10">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-[#6595a0]">
            {"\u041f\u0423\u0411\u041b\u0418\u0427\u041d\u0410 \u0418\u041d\u0424\u041e\u0420\u041c\u0410\u0426\u0418\u042f"}
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#153943]">
            {"\u041a\u0430\u043a\u0432\u043e \u0449\u0435 \u043d\u0430\u043c\u0435\u0440\u0438\u0442\u0435 \u0432 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u0442\u0430 \u0437\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e"}
          </h2>

          <p className="mt-5 text-base leading-8 text-[#607980]">
            {"\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u0442 \u043e\u0441\u043d\u043e\u0432\u0435\u043d \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u0435\u043d \u0438 \u0433\u0435\u043e\u0433\u0440\u0430\u0444\u0441\u043a\u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u043e\u0442 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438 \u0438 \u0432\u0440\u044a\u0437\u043a\u0430 \u043a\u044a\u043c \u043a\u0430\u0440\u0442\u0430\u0442\u0430 \u043d\u0430 SONDI.BG. \u0422\u0435 \u043d\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u0442 \u043f\u043b\u0430\u0442\u0435\u043d\u0438 PRO \u0430\u043d\u0430\u043b\u0438\u0437\u0438 \u0438\u043b\u0438 \u0437\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u0435\u043d \u0438\u043c\u043e\u0442."}
          </p>
        </div>

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
