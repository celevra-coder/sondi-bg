import fs from "node:fs";
import path from "node:path";

export type Settlement = {
  ekatte: string;
  name: string;
  name_en: string;
  type: string;
  municipality: string;
  municipality_code: string;
  district: string;
  district_code: string;
  category: number | string;
  altitude: number | string | null;
  nuts1: string;
  nuts2: string;
  nuts3: string;
  slug: string;
  lat: number;
  lon: number;
  seo_indexable: boolean;
  seo_reasons: string[];
  municipality_centre_for?: Array<{
    municipality_code: string;
    municipality_name: string;
  }>;
};

let cache: Settlement[] | null = null;

export function getIndexableSettlements(): Settlement[] {
  if (cache) return cache;

  const filePath = path.join(
    process.cwd(),
    "data",
    "settlements_indexable.json",
  );

  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw) as Settlement[];

  cache = data;
  return data;
}

export function getSettlementBySlug(
  slug: string,
): Settlement | undefined {
  return getIndexableSettlements().find(
    (item) => item.slug === slug,
  );
}

export function cleanDistrictName(
  value: string,
): string {
  return value
    .replace(/^\u043e\u0431\u043b\.\s*/i, "")
    .trim();
}
