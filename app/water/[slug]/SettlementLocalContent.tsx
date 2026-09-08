import localContentRaw from "@/data/settlements_local_content.json";
import waterContentRaw from "@/data/settlements_water_content.json";

type LocalSource = {
  provider?: string;
  title?: string;
  url?: string;
  pageid?: number;
};

type LocalImage = {
  title?: string;
  local_path?: string;
  source_url?: string;
  width?: number;
  height?: number;
  author?: string;
  license?: string;
  license_url?: string | null;
};

type LocalContent = {
  slug: string;
  name: string;
  municipality?: string;
  district?: string;
  status?: string;
  history?: string;
  source?: LocalSource;
  image?: LocalImage | null;
};

type WaterContent = {
  slug: string;
  name: string;
  municipality?: string;
  district?: string;
  evidence_quality?: string;
  water_story?: string;
  interesting_water_fact?: string;
  generated_with?: string;
};

const localContent = localContentRaw as LocalContent[];
const waterContent = waterContentRaw as WaterContent[];

function shortenHistory(value?: string) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let result = "";

  for (const sentence of sentences.slice(0, 3)) {
    const next = (result + " " + sentence).trim();
    if (next.length > 720) break;
    result = next;
  }

  if (!result) {
    result = text.slice(0, 700).trim();
    const lastSpace = result.lastIndexOf(" ");

    if (text.length > result.length && lastSpace > 500) {
      result = result.slice(0, lastSpace) + "...";
    }
  }

  return result;
}

export default function SettlementLocalContent({
  slug,
}: {
  slug: string;
}) {
  const item = localContent.find(entry => entry.slug === slug);
  const water = waterContent.find(entry => entry.slug === slug);

  if (!item || item.status !== "matched") {
    return null;
  }

  const history = shortenHistory(item.history);
  const story = String(water?.water_story || history).trim();
  const fact = String(water?.interesting_water_fact || "").trim();
  const image = item.image;
  const source = item.source;

  if (!story && !fact && !image) {
    return null;
  }

  return (
    <section className="border-t border-[#dbe8eb] bg-white">
      <div className="mx-auto max-w-[1320px] px-7 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#657e84]">
              {"\u041c\u0435\u0441\u0442\u0435\u043d \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442"}
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#153d47] md:text-4xl">
              {"\u0412\u043e\u0434\u0430\u0442\u0430 \u0438 "}
              {item.name}
            </h2>

            {story && (
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#4f6970] md:text-lg">
                {story}
              </p>
            )}

            {fact && (
              <div className="mt-7 rounded-[22px] border border-[#dbe8eb] bg-[#f6fbfc] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#657e84]">
                  {"\u0418\u043d\u0442\u0435\u0440\u0435\u0441\u0435\u043d \u0444\u0430\u043a\u0442"}
                </p>
                <p className="mt-2 text-base font-semibold leading-7 text-[#244b55]">
                  {fact}
                </p>
              </div>
            )}

            {source?.url && (
              <div className="mt-6 text-sm leading-6 text-[#657e84]">
                <span className="font-bold text-[#244b55]">
                  {"\u0418\u0437\u0442\u043e\u0447\u043d\u0438\u043a: "}
                </span>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-[#9bbbc1] underline-offset-4 hover:text-[#153d47]"
                >
                  {source.title || source.provider || "Wikipedia"}
                </a>
              </div>
            )}
          </div>

          {image?.local_path ? (
            <figure className="overflow-hidden rounded-[22px] border border-[#dbe8eb] bg-[#f6fbfc]">
              <img
                src={image.local_path}
                alt={item.name}
                className="aspect-[16/10] w-full object-cover"
                loading="lazy"
              />

              <figcaption className="px-5 py-4 text-xs leading-5 text-[#657e84]">
                {image.author && (
                  <>
                    <span className="font-semibold text-[#244b55]">
                      {"\u0421\u043d\u0438\u043c\u043a\u0430: "}
                    </span>
                    {image.author}
                  </>
                )}

                {image.license && (
                  <>
                    {image.author ? " \u00b7 " : ""}
                    {image.license_url ? (
                      <a
                        href={image.license_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-3"
                      >
                        {image.license}
                      </a>
                    ) : (
                      image.license
                    )}
                  </>
                )}
              </figcaption>
            </figure>
          ) : (
            <div className="rounded-[22px] border border-[#dbe8eb] bg-[#f6fbfc] p-7">
              <p className="text-sm leading-7 text-[#657e84]">
                {"\u0417\u0430 \u0442\u043e\u0432\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0432 \u043c\u043e\u043c\u0435\u043d\u0442\u0430 \u043d\u044f\u043c\u0430 \u043f\u043e\u0434\u0431\u0440\u0430\u043d\u0430 \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u0430 \u0441\u043d\u0438\u043c\u043a\u0430."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}