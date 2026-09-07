import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WaterCityClarityTracker from "./WaterCityClarityTracker";

import {
  getIndexableSettlements,
  getSettlementBySlug,
} from "@/lib/settlements";

export function generateStaticParams() {
  return getIndexableSettlements().map((settlement) => ({
    slug: settlement.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const settlement = getSettlementBySlug(slug);

  if (!settlement) {
    return {};
  }

  const title =
    "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 " +
    settlement.name;

  const description =
    "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438, \u0433\u0435\u043e\u043b\u043e\u0436\u0438\u044f\u0442\u0430 \u0438 \u0432\u043e\u0434\u043d\u0438\u0442\u0435 \u043e\u0431\u0435\u043a\u0442\u0438 \u043e\u043a\u043e\u043b\u043e " +
    settlement.name +
    ".";

  return {
    title,
    description,
    alternates: {
      canonical: `/water/${settlement.slug}`,
    },
  };
}

function typeLabel(type: string) {
  if (type === "\u0433\u0440.") return "\u0433\u0440\u0430\u0434";
  if (type === "\u0441.") return "\u0441\u0435\u043b\u043e";
  if (type === "\u043c\u0430\u043d.")
    return "\u043c\u0430\u043d\u0430\u0441\u0442\u0438\u0440";
  return type;
}

function BerkovitsaPage({
  settlement,
  mapHref,
}: {
  settlement: ReturnType<typeof getSettlementBySlug> extends infer T
    ? Exclude<T, undefined>
    : never;
  mapHref: string;
}) {
  const t = {
    eyebrow:
      "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432\u044a\u0432 \u0432\u0430\u0448\u0435\u0442\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e",
    title:
      "\u0412\u043e\u0434\u0430\u0442\u0430 \u043e\u043a\u043e\u043b\u043e \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430",
    intro:
      "\u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0435 \u043c\u044f\u0441\u0442\u043e, \u0432 \u043a\u043e\u0435\u0442\u043e \u0432\u043e\u0434\u0430\u0442\u0430 \u0435 \u0447\u0430\u0441\u0442 \u0438 \u043e\u0442 \u043f\u0440\u0438\u0440\u043e\u0434\u043d\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430, \u0438 \u043e\u0442 \u0438\u0441\u0442\u043e\u0440\u0438\u044f\u0442\u0430 \u043d\u0430 \u0440\u0430\u0439\u043e\u043d\u0430. \u0422\u0443\u043a \u0441\u044a\u0431\u0438\u0440\u0430\u043c\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e \u0434\u043e\u0441\u0442\u044a\u043f\u043d\u0438 \u0444\u0430\u043a\u0442\u0438 \u0438 \u0433\u0438 \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043c\u0435 \u0441 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430 \u043d\u0430 SONDI.BG.",
    storyTitle:
      "\u0417\u0430\u0449\u043e \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0435 \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u0430 \u043e\u0442 \u0433\u043b\u0435\u0434\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430?",
    story:
      "\u0422\u0435\u0440\u0438\u0442\u043e\u0440\u0438\u044f\u0442\u0430 \u043d\u0430 \u043e\u0431\u0449\u0438\u043d\u0430\u0442\u0430 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u0417\u0430\u043f\u0430\u0434\u043d\u0430 \u0421\u0442\u0430\u0440\u0430 \u043f\u043b\u0430\u043d\u0438\u043d\u0430 \u0438 \u0417\u0430\u043f\u0430\u0434\u043d\u0438\u044f \u041f\u0440\u0435\u0434\u0431\u0430\u043b\u043a\u0430\u043d. \u0422\u043e\u0437\u0438 \u0440\u0435\u043b\u0435\u0444 \u0438 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430 \u0441\u0430 \u0432\u0430\u0436\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442, \u043a\u043e\u0433\u0430\u0442\u043e \u0441\u0435 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438. \u041e\u0441\u043e\u0431\u0435\u043d\u043e \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u0430 \u0435 \u0438 \u0432\u0440\u044a\u0437\u043a\u0430\u0442\u0430 \u043d\u0430 \u0433\u0440\u0430\u0434\u0430 \u0441 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u043e\u0442 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 \u0411\u044a\u0440\u0437\u0438\u044f.",
    mineralTitle:
      "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0430\u0442\u0430 \u0432\u043e\u0434\u0430 \u0435 \u0447\u0430\u0441\u0442 \u043e\u0442 \u0438\u0441\u0442\u043e\u0440\u0438\u044f\u0442\u0430 \u043d\u0430 \u0433\u0440\u0430\u0434\u0430",
    mineral:
      "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043d\u0430 \u041e\u0431\u0449\u0438\u043d\u0430 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u043f\u043e\u0441\u043e\u0447\u0432\u0430 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 \u0441. \u0411\u044a\u0440\u0437\u0438\u044f. \u041f\u0440\u0438 \u0421\u043e\u043d\u0434\u0430\u0436 \u21161 \u0435 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0430 \u0442\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430 32\u00b0C. \u041f\u0440\u0435\u0437 2019 \u0433. \u0435 \u043e\u0442\u043a\u0440\u0438\u0442 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u0432\u043e\u0434 \u043e\u0442 \u0411\u044a\u0440\u0437\u0438\u044f \u0434\u043e \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0441 \u0434\u044a\u043b\u0436\u0438\u043d\u0430 7 786,28 \u043c.",
    mapTitle:
      "\u041a\u0430\u043a\u0432\u043e \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u0435 \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430?",
    sourceTitle:
      "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438",
  };

  const cards = [
    {
      k: "32\u00b0C",
      title:
        "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u0430",
      text:
        "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0430 \u043e\u0442 \u041e\u0431\u0449\u0438\u043d\u0430 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0437\u0430 \u0421\u043e\u043d\u0434\u0430\u0436 \u21161 \u043f\u0440\u0438 \u0411\u044a\u0440\u0437\u0438\u044f.",
    },
    {
      k: "7.8 km",
      title:
        "\u0412\u0440\u044a\u0437\u043a\u0430 \u0441 \u0411\u044a\u0440\u0437\u0438\u044f",
      text:
        "\u041f\u0440\u0438\u0431\u043b\u0438\u0437\u0438\u0442\u0435\u043b\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u0436\u0438\u043d\u0430 \u043d\u0430 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d\u0438\u044f \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u0432\u043e\u0434 \u0434\u043e \u0433\u0440\u0430\u0434\u0430.",
    },
    {
      k: "\u0417\u0430\u043f\u0430\u0434\u043d\u0430 \u0421\u0442\u0430\u0440\u0430 \u043f\u043b\u0430\u043d\u0438\u043d\u0430",
      title:
        "\u0420\u0435\u043b\u0435\u0444 \u0438 \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f",
      text:
        "\u041e\u0431\u0449\u0438\u043d\u0430\u0442\u0430 \u043e\u0431\u0445\u0432\u0430\u0449\u0430 \u0447\u0430\u0441\u0442\u0438 \u043e\u0442 \u0417\u0430\u043f\u0430\u0434\u043d\u0430 \u0421\u0442\u0430\u0440\u0430 \u043f\u043b\u0430\u043d\u0438\u043d\u0430 \u0438 \u0417\u0430\u043f\u0430\u0434\u043d\u0438\u044f \u041f\u0440\u0435\u0434\u0431\u0430\u043b\u043a\u0430\u043d.",
    },
  ];

  const mapItems = [
    "\u0413\u0435\u043e\u043b\u043e\u0436\u043a\u0438\u0442\u0435 \u0435\u0434\u0438\u043d\u0438\u0446\u0438 \u043e\u043a\u043e\u043b\u043e \u0433\u0440\u0430\u0434\u0430",
    "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430",
    "\u0420\u0430\u0437\u043b\u043e\u043c\u0438 \u0438 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u043d\u0438 \u043b\u0438\u043d\u0438\u0438",
    "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u0438 \u043e\u0431\u0435\u043a\u0442\u0438 \u0438 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438 \u0432\u043e\u0434\u0438, \u043a\u043e\u0433\u0430\u0442\u043e \u0441\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 \u0432 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438\u0442\u0435",
  ];

  return (
    <main className="bg-white">
      <section className="border-b border-[#dbe8eb] bg-[#f6fbfc]">
        <div className="mx-auto max-w-[1320px] px-7 py-14 lg:px-10 lg:py-20">
          <Link
            href="/water"
            className="text-sm font-semibold text-[#657e84] hover:text-[#173f48]"
          >
            {"\u2190 \u0412\u0441\u0438\u0447\u043a\u0438 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430"}
          </Link>

          <div className="mt-10 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#657e84]">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#153d47] sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#526f76]">
              {t.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={mapHref}
                className="rounded-full bg-[#173f48] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                {"\u0412\u0438\u0436 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"}
              </Link>
              <Link
                href="/knowledge/groundwater"
                className="rounded-full border border-[#b8cdd1] bg-white px-6 py-3 text-sm font-bold text-[#173f48]"
              >
                {"\u041a\u0430\u043a \u0441\u0435 \u0434\u0432\u0438\u0436\u0430\u0442 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438"}
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[22px] border border-[#d9e7e9] bg-white p-6"
              >
                <p className="text-xl font-semibold text-[#173f48]">
                  {card.k}
                </p>
                <h2 className="mt-3 text-lg font-semibold text-[#244b55]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#657e84]">
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#657e84]">
              {"\u041c\u0435\u0441\u0442\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442"}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#153d47]">
              {t.storyTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[#526f76]">
              {t.story}
            </p>

            <div className="mt-10 rounded-[24px] border border-[#d9e7e9] bg-[#f7fbfc] p-7">
              <h3 className="text-2xl font-semibold text-[#173f48]">
                {t.mineralTitle}
              </h3>
              <p className="mt-4 leading-8 text-[#526f76]">
                {t.mineral}
              </p>
            </div>
          </div>

          <aside className="rounded-[26px] bg-[#153d47] p-7 text-white lg:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/60">
              {"\u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0432 \u0434\u0430\u043d\u043d\u0438"}
            </p>

            <dl className="mt-7 space-y-6">
              <div className="border-b border-white/15 pb-5">
                <dt className="text-sm text-white/60">
                  {"\u041e\u0431\u043b\u0430\u0441\u0442"}
                </dt>
                <dd className="mt-1 text-lg font-semibold">
                  {settlement.district}
                </dd>
              </div>
              <div className="border-b border-white/15 pb-5">
                <dt className="text-sm text-white/60">
                  {"\u041e\u0431\u0449\u0438\u043d\u0430"}
                </dt>
                <dd className="mt-1 text-lg font-semibold">
                  {settlement.municipality}
                </dd>
              </div>
              <div className="border-b border-white/15 pb-5">
                <dt className="text-sm text-white/60">
                  {"\u0415\u041a\u0410\u0422\u0422\u0415"}
                </dt>
                <dd className="mt-1 text-lg font-semibold">
                  {settlement.ekatte}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-white/60">
                  {"\u0422\u043e\u0447\u043a\u0430 \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"}
                </dt>
                <dd className="mt-1 text-base font-semibold">
                  {Number(settlement.lat).toFixed(5)},{" "}
                  {Number(settlement.lon).toFixed(5)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-y border-[#dbe8eb] bg-[#f6fbfc]">
        <div className="mx-auto max-w-[1320px] px-7 py-14 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#657e84]">
              {"SONDI.BG MAP"}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#153d47]">
              {t.mapTitle}
            </h2>
            <p className="mt-5 leading-8 text-[#526f76]">
              {
                "\u041a\u0430\u0440\u0442\u0430\u0442\u0430 \u043e\u0442\u0432\u0430\u0440\u044f \u0442\u043e\u0447\u043d\u043e \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430. \u041e\u0442\u0442\u0430\u043c \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0440\u0430\u0437\u0433\u043b\u0435\u0434\u0430\u0442\u0435 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0434\u0430\u043d\u043d\u0438."
              }
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {mapItems.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-[20px] border border-[#d9e7e9] bg-white p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f1f3] text-sm font-bold text-[#173f48]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-semibold leading-6 text-[#244b55]">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={mapHref}
            className="mt-9 inline-flex rounded-full bg-[#173f48] px-7 py-3.5 text-sm font-bold text-white"
          >
            {"\u041e\u0442\u0432\u043e\u0440\u0438 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u0432 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430"}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-7 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#153d47]">
              {t.sourceTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657e84]">
              {
                "\u041c\u0435\u0441\u0442\u043d\u0438\u0442\u0435 \u0444\u0430\u043a\u0442\u0438 \u0437\u0430 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0430\u0442\u0430 \u0432\u043e\u0434\u0430 \u0438 \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u0432\u043e\u0434\u0430 \u0441\u0430 \u043f\u043e \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043d\u0430 \u041e\u0431\u0449\u0438\u043d\u0430 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430."
              }
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm">
              <a
                href="https://www.berkovitsa.bg/%D0%BD%D0%B0%D1%82%D1%83%D1%80%D0%B0%D0%BB%D0%BD%D0%B0-%D0%BC%D0%B8%D0%BD%D0%B5%D1%80%D0%B0%D0%BB%D0%BD%D0%B0-%D0%B2%D0%BE%D0%B4%D0%B0-%D0%B2-%D0%B1%D0%B5%D1%80%D0%BA%D0%BE%D0%B2%D0%B8%D1%86%D0%B0/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#173f48] underline underline-offset-4"
              >
                {"\u041e\u0431\u0449\u0438\u043d\u0430 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u2014 \u041d\u0430\u0442\u0443\u0440\u0430\u043b\u043d\u0430 \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u0430"}
              </a>

              <a
                href="https://www.berkovitsa.bg/%D0%BE%D1%84%D0%B8%D1%86%D0%B8%D0%B0%D0%BB%D0%BD%D0%BE-%D0%BE%D1%82%D0%BA%D1%80%D0%B8%D0%B2%D0%B0%D0%BD%D0%B5-%D0%BD%D0%B0-%D0%BC%D0%B8%D0%BD%D0%B5%D1%80%D0%B0%D0%BB%D0%B5%D0%BD-%D0%B2%D0%BE%D0%B4/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#173f48] underline underline-offset-4"
              >
                {"\u041e\u0431\u0449\u0438\u043d\u0430 \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430 \u2014 \u041c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u0432\u043e\u0434"}
              </a>
            </div>
          </div>

       </div>
      </section>
    </main>
  );
}

export default async function SettlementWaterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settlement = getSettlementBySlug(slug);

  if (!settlement) {
    notFound();
  }


  const clarityTracker = (
    <WaterCityClarityTracker settlement={settlement.slug} />
  );
const mapParams = new URLSearchParams({
    lat: String(settlement.lat),
    lng: String(settlement.lon),
    label: settlement.name,
  });

  const mapHref = `/map?${mapParams.toString()}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "SONDI.BG",
        item: "https://www.sondi.bg/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u043f\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430",
        item: "https://www.sondi.bg/water",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: settlement.name,
        item: `https://www.sondi.bg/water/${settlement.slug}`,
      },
    ],
  };

  if (settlement.slug === "berkovitsa") {
    return (
      <>
        {clarityTracker}
        <script

          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
          }}
        />
        <BerkovitsaPage settlement={settlement} mapHref={mapHref} />
      </>
    );
  }

  return (
    <main className="bg-white">
      {clarityTracker}
      <script

        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />

      <section className="mx-auto max-w-[1320px] px-7 py-14 lg:px-10 lg:py-20">
        <Link
          href="/water"
          className="text-sm font-semibold text-[#657e84] hover:text-[#173f48]"
        >
          {"\u2190 \u041d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430"}
        </Link>

        <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-[#657e84]">
          {"\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f"}
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#153d47] sm:text-5xl">
          {"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 " + settlement.name}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#526f76]">
          {typeLabel(settlement.type) +
            " \u0432 \u043e\u0431\u0449\u0438\u043d\u0430 " +
            settlement.municipality +
            ", \u043e\u0431\u043b\u0430\u0441\u0442 " +
            settlement.district +
            "."}
        </p>

        <div className="mt-8">
          <Link
            href={mapHref}
            className="inline-flex rounded-full bg-[#173f48] px-6 py-3 text-sm font-bold text-white"
          >
            {"\u0412\u0438\u0436 \u0442\u043e\u0432\u0430 \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"}
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] p-6">
            <p className="text-sm text-[#657e84]">
              {"\u041e\u0431\u0449\u0438\u043d\u0430"}
            </p>
            <p className="mt-2 font-semibold text-[#173f48]">
              {settlement.municipality}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] p-6">
            <p className="text-sm text-[#657e84]">
              {"\u041e\u0431\u043b\u0430\u0441\u0442"}
            </p>
            <p className="mt-2 font-semibold text-[#173f48]">
              {settlement.district}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] p-6">
            <p className="text-sm text-[#657e84]">
              {"\u0415\u041a\u0410\u0422\u0422\u0415"}
            </p>
            <p className="mt-2 font-semibold text-[#173f48]">
              {settlement.ekatte}
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-3xl rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfc] p-7">
          <p className="text-sm leading-7 text-[#657e84]">
            {
              "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u0442\u0430 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043f\u0443\u0431\u043b\u0438\u0447\u0435\u043d \u043c\u0435\u0441\u0442\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442. \u0422\u044f \u043d\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430 \u043f\u043b\u0430\u0442\u0435\u043d PRO \u0430\u043d\u0430\u043b\u0438\u0437 \u0438 \u043d\u0435 \u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0434\u043e\u043a\u043b\u0430\u0434, \u0438\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u043e\u043d\u0435\u043d \u043f\u0440\u043e\u0435\u043a\u0442 \u0438\u043b\u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e."
            }
          </p>
        </div>
      </section>
    </main>
  );
}