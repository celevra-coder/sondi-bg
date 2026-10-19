import "server-only";

import fs from "node:fs";
import path from "node:path";

export type SondiRegionalReportCard = {
  id: string;
  title: string;
  informationType: string;
  paragraphs: string[];
  sources: string[];
};

type Point = [number, number];
type Polygon = Point[][];

type RegionEntry = {
  id: string;
  name_bg: string;
  zone_id: string;
  model_file: string;
  boundary_file: string;
};

type RegionRegistry = {
  regions: RegionEntry[];
};

type RegionalUnit = {
  unit?: string;
  regional_thickness_m?: string | number;
};

type RegionalContext = {
  area?: string;
  source_id?: string;
  regional_units?: RegionalUnit[];
  dominant_lithology_context?: string[];
};

type DepthPoint = {
  borehole_name?: string;
  depth_m?: number;
  unit?: string;
  source_id?: string;
};

type Borehole = {
  borehole_name?: string;
  site?: string;
  source_id?: string;
  published_graphic_depth_scale_m_approx?: number | null;
  verified_depth_points?: DepthPoint[];
  graphic_lithology_summary?: string[];
};

type RegionalZone = {
  regional_structural_context?: RegionalContext[];
  partial_borehole_profiles?: Borehole[];
  documented_sample_depth_points?: DepthPoint[];

  documented_reference_intervals?: Array<{
    borehole_id: string;
    latitude: number;
    longitude: number;
    intervals: Array<{
      from_m: number;
      to_m: number;
      material_bg: string;
    }>;
    source_ids: string[];
  }>;
  documented_well_depths?: Array<{
    name: string;
    depth_m: number;
    source_id: string;
    full_lithological_log: boolean;
  }>;

  wider_studies?: Array<{
    title: string;
    informationType: string;
    paragraphs: string[];
    source_ids: string[];
  }>;

  regional_evidence_notes?: Array<{
    title: string;
    informationType: string;
    paragraphs: string[];
    source_ids: string[];
  }>;
  source_ids?: string[];
};

type RegionalModel = {
  zones: Record<string, RegionalZone>;
};

type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Polygon | Polygon[];
};

const dataDir = path.join(
  process.cwd(),
  "data",
  "soil-lithology",
  "runtime",
  "regions"
);

function readJson<T>(file: string): T {
  if (!/^[a-zA-Z0-9_.-]+\.json$/.test(file)) {
    throw new Error("Invalid regional model filename");
  }
  return JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  ) as T;
}

function insideRing(
  lon: number,
  lat: number,
  ring: Point[]
): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];

    if (
      (a[1] > lat) !== (b[1] > lat) &&
      lon < ((b[0] - a[0]) * (lat - a[1])) /
        (b[1] - a[1]) + a[0]
    ) {
      inside = !inside;
    }
  }

  return inside;
}

function insidePolygon(
  lon: number,
  lat: number,
  polygon: Polygon
): boolean {
  if (!polygon.length) return false;
  if (!insideRing(lon, lat, polygon[0])) return false;

  return !polygon.slice(1).some(
    hole => insideRing(lon, lat, hole)
  );
}

function containsPoint(
  geometry: Geometry,
  lat: number,
  lon: number
): boolean {
  const polygons: Polygon[] =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates as Polygon[]
      : [geometry.coordinates as Polygon];

  return polygons.some(polygon =>
    insidePolygon(lon, lat, polygon)
  );
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(
    values.filter((value): value is string =>
      typeof value === "string" && value.trim().length > 0
    )
  )];
}

function formatThickness(value?: string | number): string {
  if (value == null) return "неуточнена";

  const raw = String(value).trim();

  const m = raw.match(
    /^(?:approximately\s+)?(\d+)(?:\s*[-–]\s*(\d+))?(\+)?(?:\s+depending on source\/model)?$/i
  );

  if (!m) return "неуточнена";

  const range = m[2] ? `${m[1]}–${m[2]}` : m[1];
  const prefix = /^approximately/i.test(raw) || !m[2]
    ? "около "
    : "";

  return `${prefix}${range}${m[3] ? " м и повече" : " м"}`;
}


function makeReadableOverview(
  entry: RegionEntry,
  zone: RegionalZone,
  lithologies: string[],
  units: RegionalUnit[],
  boreholes: Borehole[],
  points: DepthPoint[],
  sources: string[]
): SondiRegionalReportCard {
  const paragraphs: string[] = [];
  const references = zone.documented_reference_intervals ?? [];
  const notes = zone.regional_evidence_notes ?? [];

  if (entry.id === "SOF-SVG") {
    paragraphs.push(
      "\u0412 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 \u0421\u0432\u043e\u0433\u0435 \u0441\u0430 \u043e\u043f\u0438\u0441\u0430\u043d\u0438 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u0438 \u0443\u0442\u0430\u0435\u0447\u043d\u0438 \u0441\u043a\u0430\u043b\u0438: \u043f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438, \u0430\u043b\u0435\u0432\u0440\u043e\u043b\u0438\u0442\u0438, \u0430\u0440\u0433\u0438\u043b\u0438\u0442\u0438, \u043a\u043e\u043d\u0433\u043b\u043e\u043c\u0435\u0440\u0430\u0442\u0438 \u0438 \u0432\u044a\u0433\u043b\u0438\u0449\u043d\u0438 \u043f\u043b\u0430\u0441\u0442\u043e\u0432\u0435. \u0422\u043e\u0432\u0430 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u0441\u043b\u043e\u0436\u0435\u043d \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u0442\u0440\u043e\u0435\u0436, \u043a\u043e\u0439\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u043c\u0435\u0436\u0434\u0443 \u043e\u0442\u0434\u0435\u043b\u043d\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u044a\u0446\u0438."
    );
  } else if (lithologies.length > 0) {
    paragraphs.push(
      `\u041f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438\u0442\u0435 \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0438\u044f \u0437\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 ${entry.name_bg} \u043e\u043f\u0438\u0441\u0432\u0430\u0442 \u0441\u043a\u0430\u043b\u0438 \u0438 \u043d\u0430\u0441\u043b\u0430\u0433\u0438, \u0441\u0440\u0435\u0434 \u043a\u043e\u0438\u0442\u043e ${lithologies.slice(0, 5).join(", ")}. \u0422\u043e\u0432\u0430 \u043f\u043e\u043c\u0430\u0433\u0430 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0431\u0435\u0440\u0435 \u043a\u0430\u043a\u044a\u0432 \u0435 \u043e\u0431\u0449\u0438\u044f\u0442 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u0442\u0440\u043e\u0435\u0436 \u0432 \u043f\u0440\u043e\u0443\u0447\u0435\u043d\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u0438 \u043d\u0430 \u043e\u0431\u0449\u0438\u043d\u0430\u0442\u0430.`
    );
  } else if (references.length > 0) {
    const first = references.find(r => r.intervals.length > 0);
    paragraphs.push(
      first
        ? `\u0417\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u0438\u043c\u0430 \u0440\u0435\u0430\u043b\u043d\u043e \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438\u0440\u0430\u043d\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438. \u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0441\u043e\u043d\u0434\u0430\u0436 ${first.borehole_id} \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043a\u0430\u043a\u0432\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438 \u0441\u0430 \u0441\u0440\u0435\u0449\u043d\u0430\u0442\u0438 \u043d\u0430 \u043d\u0435\u0433\u043e\u0432\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e.`
        : `\u0417\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 ${entry.name_bg} \u0438\u043c\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0441\u0432\u0435\u0434\u0435\u043d\u0438\u044f, \u043d\u043e \u043e\u0442 \u0442\u044f\u0445 \u043d\u0435 \u0441\u043b\u0435\u0434\u0432\u0430 \u0435\u0434\u0438\u043d \u043e\u0431\u0449 \u0440\u0430\u0437\u0440\u0435\u0437 \u0437\u0430 \u0432\u0441\u044f\u043a\u0430 \u0442\u043e\u0447\u043a\u0430.`
    );
  } else if (notes.length > 0 && notes[0].paragraphs.length > 0) {
    paragraphs.push(notes[0].paragraphs[0]);
  } else {
    paragraphs.push(
      `\u0417\u0430 \u0440\u0430\u0439\u043e\u043d\u0430 \u043d\u0430 ${entry.name_bg} \u0438\u043c\u0430 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u0432\u0435\u0434\u0435\u043d\u0438\u044f. \u041d\u0435 \u0435 \u0440\u0435\u0434\u043d\u043e \u043e\u0442 \u0442\u044f\u0445 \u0434\u0430 \u0441\u0435 \u043f\u0440\u0430\u0432\u0438 \u0442\u043e\u0447\u043d\u0430 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u0430 \u043f\u043e \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430.`
    );
  }

  if (references.length > 0 || boreholes.length > 0 || points.length > 0) {
    paragraphs.push(
      "\u0412 \u0440\u0430\u0439\u043e\u043d\u0430 \u0438\u043c\u0430 \u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0441\u0432\u0435\u0434\u0435\u043d\u0438\u044f. \u0422\u0435 \u0441\u0430 \u0432\u0430\u0436\u043d\u0438, \u0437\u0430\u0449\u043e\u0442\u043e \u043f\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u0440\u0435\u0430\u043b\u043d\u0438 \u043d\u0430\u0431\u043b\u044e\u0434\u0435\u043d\u0438\u044f, \u043d\u043e \u043d\u0435 \u0432\u0441\u0438\u0447\u043a\u0438 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u0442 \u043f\u044a\u043b\u043d\u0430 \u043e\u043f\u0438\u0441\u0430\u043d\u0430 \u043a\u043e\u043b\u043e\u043d\u043a\u0430."
    );
  }

  paragraphs.push(
    "\u0417\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0438\u0442\u0435 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438 \u0442\u0435\u0437\u0438 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438 \u0441\u0430\u043c\u0438 \u043f\u043e \u0441\u0435\u0431\u0435 \u0441\u0438 \u043d\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u043a\u043e\u0439 \u0442\u043e\u0447\u043d\u043e \u043f\u043b\u0430\u0441\u0442 \u0441\u0435 \u043d\u0430\u043c\u0438\u0440\u0430 \u043d\u0430 20, 50 \u0438\u043b\u0438 100 \u043c. \u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0442\u0435 \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0441\u0432\u0438\u0442\u0438\u0442\u0435 \u043d\u0435 \u0441\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438 \u043f\u043e\u0434 \u0438\u043c\u043e\u0442\u0430."
  );

  return {
    id: `${entry.id}-overview`,
    title: `\u041a\u0430\u043a\u0432\u043e \u043f\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0438\u044f\u0442\u0430 \u0437\u0430 ${entry.name_bg}`,
    informationType: "\u041e\u0431\u044f\u0441\u043d\u0435\u043d\u0438\u0435 \u043d\u0430 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u0435\u043c \u0435\u0437\u0438\u043a",
    paragraphs,
    sources,
  };
}


function explainRegionalRock(rock: string): string {
  const t = rock.toLocaleLowerCase("bg");
  let meaning: string;

  if (t.includes("\u0431\u0440\u0435\u043a\u0447\u043e\u043a\u043e\u043d\u0433\u043b\u043e\u043c\u0435\u0440\u0430\u0442")) {
    meaning = "\u0421\u043a\u0430\u043b\u0430 \u043e\u0442 \u0435\u0434\u0440\u0438 \u043a\u0430\u043c\u0435\u043d\u043d\u0438 \u043a\u044a\u0441\u043e\u0432\u0435, \u0447\u0430\u0441\u0442 \u043e\u0442 \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u0440\u044a\u0431\u0435\u0441\u0442\u0438.";
  } else if (t.includes("\u043a\u043e\u043d\u0433\u043b\u043e\u043c\u0435\u0440\u0430\u0442")) {
    meaning = "\u0421\u043a\u0430\u043b\u0430 \u043e\u0442 \u0437\u0430\u043e\u0431\u043b\u0435\u043d\u0438 \u043a\u0430\u043c\u044a\u0447\u0435\u0442\u0430 \u0438 \u0447\u0430\u043a\u044a\u043b, \u0441\u043f\u043e\u0435\u043d\u0438 \u0437\u0430\u0435\u0434\u043d\u043e.";
  } else if (t.includes("\u043f\u044f\u0441\u044a\u0447\u043d\u0438\u0446")) {
    meaning = "\u0412\u0442\u0432\u044a\u0440\u0434\u0435\u043d \u043f\u044f\u0441\u044a\u043a, \u0447\u0438\u0438\u0442\u043e \u043f\u0435\u0441\u044a\u0447\u0438\u043d\u043a\u0438 \u0441\u0430 \u0441\u043f\u043e\u0435\u043d\u0438 \u0432 \u0442\u0432\u044a\u0440\u0434\u0430 \u0441\u043a\u0430\u043b\u0430.";
  } else if (t.includes("\u0430\u043b\u0435\u0432\u0440\u043e\u043b\u0438\u0442")) {
    meaning = "\u0423\u043f\u043b\u044a\u0442\u043d\u0435\u043d\u0430 \u043c\u043d\u043e\u0433\u043e \u0441\u0438\u0442\u043d\u043e\u0437\u044a\u0440\u043d\u0435\u0441\u0442\u0430 \u0443\u0442\u0430\u0439\u043a\u0430, \u043f\u043e-\u0444\u0438\u043d\u0430 \u043e\u0442 \u043f\u044f\u0441\u044a\u0447\u043d\u0438\u043a\u0430.";
  } else if (t.includes("\u0430\u0440\u0433\u0438\u043b\u0438\u0442")) {
    meaning = "\u0421\u0438\u043b\u043d\u043e \u0443\u043f\u043b\u044a\u0442\u043d\u0435\u043d\u0430 \u0438 \u0432\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u0433\u043b\u0438\u043d\u0430.";
  } else if (t.includes("\u0432\u044a\u0433\u043b\u0438\u0449")) {
    meaning = "\u0421\u043b\u043e\u0439 \u043e\u0442 \u043f\u0440\u0435\u043e\u0431\u0440\u0430\u0437\u0443\u0432\u0430\u043d\u0430 \u0434\u0440\u0435\u0432\u043d\u0430 \u0440\u0430\u0441\u0442\u0438\u0442\u0435\u043b\u043d\u0430 \u043c\u0430\u0442\u0435\u0440\u0438\u044f.";
  } else {
    return rock;
  }
  return `${rock}: ${meaning}`;
}

function makeCards(
  entry: RegionEntry,
  zone: RegionalZone
): SondiRegionalReportCard[] {
  const contexts = zone.regional_structural_context ?? [];
  const units = contexts.flatMap(c => c.regional_units ?? []);
  const lithologies = unique(
    contexts.flatMap(c => c.dominant_lithology_context ?? [])
  );
  const boreholes = zone.partial_borehole_profiles ?? [];
  const points = zone.documented_sample_depth_points ?? [];

  const sources = unique([
    ...(zone.source_ids ?? []),
    ...contexts.map(c => c.source_id),
    ...boreholes.map(b => b.source_id),
    ...points.map(p => p.source_id),
  ]);

  const cards: SondiRegionalReportCard[] = [];
  const contextName = contexts.find(c => c.area)?.area
    ?? `община ${entry.name_bg}`;

  if (units.length) {
    cards.push({
      id: `${entry.id}-formations`,
      title: `${contextName} — геоложки единици`,
      informationType: "Регионален стратиграфски анализ",
      paragraphs: [
        ...(entry.id === "SOF-SVG"
          ? [
              "Свогенският антрацитен басейн има сложен геоложки строеж. В него са разграничени няколко геоложки свити — групи скални пластове, образувани при различни условия през геоложката история на района.",
              "Сред тях са Царичинската, Свиденската, Дръмшанската, Свогенската, Беровдолската и Чибаовската свита. Различните свити показват, че скалният строеж не е еднообразен, а включва отделни комплекси с различен състав и дебелина."
            ]
          : [
              `В проучванията за ${contextName} са разграничени различни геоложки свити — групи скални пластове със сходен произход и строеж.`,
              `Сред описаните геоложки единици са ${units.map(u => u.unit).filter(Boolean).join(", ")}. Те отразяват геоложката история и разнообразието на скалите в проучения район.`
            ]),
      ],
      sources
    });
  }

  if (lithologies.length) {
    cards.push({
      id: `${entry.id}-lithology`,
      title: `${contextName} — скални материали`,
      informationType: "Документирана регионална литология",
      paragraphs: entry.id === "SOF-SVG"
        ? [
            "В Свогенския антрацитен басейн са описани пясъчници (втвърдени песъчливи утайки), алевролити (по-ситнозърнести скали), аргилити (силно уплътнени глинести скали), конгломерати (скали от споени камъчета) и въглищни пластове, образувани от древна растителност.",
            "Тези различни скали показват, че геоложката среда се е променяла във времето. При сондиране могат да се срещат по-едрозърнести и по-финозърнести скални пластове, както и въглищни прослойки. Подредбата им се влияе от местния геоложки строеж и евентуални размествания на пластовете."
          ]
        : [
            `В проучванията за ${contextName} са описани следните скали и наслаги: ${lithologies.join(", ")}. Това дава представа за материалите, които изграждат проучените части на района.`,
            "Различните скални пластове могат да се редуват или да преминават един в друг. Техният характер и последователност зависят от местните геоложки условия."
          ],
      sources
    });
  }


  for (const reference of zone.documented_reference_intervals ?? []) {
    const lines = reference.intervals
      .filter(x => Number.isFinite(x.from_m) &&
        Number.isFinite(x.to_m) && x.to_m > x.from_m)
      .map(x => `${x.from_m}-${x.to_m} м: ${x.material_bg}.`);

    if (lines.length) {
      cards.push({
        id: `${entry.id}-reference-intervals`,
        title: `\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438\u0440\u0430\u043d \u0441\u043e\u043d\u0434\u0430\u0436 ${reference.borehole_id}`,
        informationType: "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0430 \u043a\u043e\u043b\u043e\u043d\u043a\u0430",
        paragraphs: [
          `\u0422\u043e\u0447\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u0432 \u0441\u043e\u043d\u0434\u0430\u0436\u0430:`,
          ...lines,
          "\u0422\u0435\u0437\u0438 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438 \u0441\u0430 \u0434\u043e\u043a\u0430\u0437\u0430\u043d\u0438 \u0441\u0430\u043c\u043e \u0432 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436. \u041d\u0435 \u0441\u0435 \u043f\u0440\u0435\u043d\u0430\u0441\u044f\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u043f\u043e\u0434 \u0434\u0440\u0443\u0433 \u0438\u043c\u043e\u0442."
        ],
        sources: reference.source_ids
      });
    }
  }

  const wellDepths = zone.documented_well_depths ?? [];
  if (wellDepths.length) {
    cards.push({
      id: `${entry.id}-well-depths`,
      title: `\u0414\u0440\u0443\u0433\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438\u0440\u0430\u043d\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0438`,
      informationType: "\u0421\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0441\u0432\u0435\u0434\u0435\u043d\u0438\u044f",
      paragraphs: [
        ...wellDepths.map(w =>
          `${w.name}: \u043e\u0431\u0449\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 ${w.depth_m} \u043c.`
        ),
        "\u0417\u0430 \u0442\u0435\u0437\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u043d\u044f\u043c\u0430 \u043f\u044a\u043b\u043d\u0438 \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u043a\u043e\u043b\u043e\u043d\u043a\u0438. \u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u043d\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u043f\u043b\u0430\u0441\u0442 \u043d\u0430 \u0441\u044a\u0449\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430."
      ],
      sources: unique(wellDepths.map(w => w.source_id))
    });
  }


  for (const [index, note] of (zone.regional_evidence_notes ?? []).entries()) {
    cards.push({
      id: `${entry.id}-evidence-${index}`,
      title: note.title,
      informationType: note.informationType,
      paragraphs: note.paragraphs,
      sources: unique(note.source_ids),
    });
  }


  return cards;
}


// SONDI_BLG_LOCAL_SOURCE_SELECTION_V5
// Location anchors are approximations for selecting nearby studies.
// They are not boundaries of geological formations or study footprints.
type BlgStudySelection = {
  id: string;
  title: string;
  informationType: string;
  paragraphs: string[];
  sources: string[];
  summary: string;
  distanceKm: number;
};

function blgApproxDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function selectBlgNearbyStudies(
  latitude: number,
  longitude: number,
  zone: RegionalZone
): BlgStudySelection[] {
  const definitions = [
    {
      source: "BLG-RES-KRESNA-ERT-2025",
      lat: 41.72, lng: 23.16,
      title: "Крупник–Кресна — гранитен скален масив",
      summary: "В проучените участъци край Крупник и Кресна са "
        + "описани изветрели и напукани гранити. Гранитът е "
        + "твърда магмена скала, но близо до повърхността "
        + "и по разломи може да бъде силно разрушен. "
        + "Това е важно за условията при сондиране.",
      paragraphs: [
        "Проучването използва електросъпротивителни измервания "
          + "и сондажни сведения за участъци от трасето на "
          + "автомагистрала Струма в района Крупник–Кресна.",
        "Описани са зони с изветрял, раздробен и напукан гранит. "
          + "Те показват, че състоянието на скалния масив "
          + "може да се променя на малки разстояния.",
        "Това е сравнителна информация за проучения район, "
          + "а не установен пласт на конкретна дълбочина "
          + "под избраните координати."
      ]
    },
    {
      source: "BLG-RES-MESTA-GROUNDWATER-2024",
      lat: 41.885, lng: 23.467,
      title: "Разложки басейн — карстифицирани мрамори",
      summary: "Регионалните изследвания на Разложкия басейн "
        + "описват карстифицирани мрамори и силикатни скали "
        + "в Северен Пирин. Мраморът е преобразувана "
        + "карбонатна скала, в която пукнатини и разтворени "
        + "участъци могат да създават пътища за водата.",
      paragraphs: [
        "Изследването разглежда подземните води в басейна "
          + "на Места, включително карстовия Разложки басейн.",
        "В Северен Пирин е описан регионален контекст "
          + "с карстифицирани мрамори и прослойки от "
          + "силикатни скали.",
        "Тези данни помагат за разбирането на подземното "
          + "вододвижение, но не доказват точен сондажен "
          + "разрез под избраната точка."
      ]
    },
    {
      source: "Razlog-Bansko EIA, App 2.1 - Geology.pdf",
      lat: 41.859, lng: 23.479,
      title: "Разлог–Банско — инженерно-геоложки проучвания",
      summary: "По трасето между Разлог и Банско са описани "
        + "геоложки участъци, които показват разнообразието "
        + "на земните материали в проучената зона. "
        + "Промените по трасето не означават, че същите "
        + "пластове лежат непосредствено под избраната точка.",
      paragraphs: [
        "Публикуваната инженерно-геоложка документация "
          + "съдържа описания на 148 сегмента по "
          + "проученото трасе Разлог–Банско.",
        "Сведенията са полезни за сравнение на "
          + "местните геоложки условия, но не представляват "
          + "доказана вертикална сондажна колонка.",
        "Точните пространствени граници на сегментите "
          + "не са цифрово установени в този модел."
      ]
    },
    {
      source: "BLG-GOTSE-MITEV-YANEVA-2013",
      lat: 41.573, lng: 23.730,
      title: "Гоце Делчев — геофизично изследване",
      summary: "За района на Гоце Делчев е публикувано "
        + "електросъпротивително проучване на геоложки тела. "
        + "Подобни измервания помагат да се проследяват "
        + "разлики между подземните материали, но "
        + "сами по себе си не доказват точния вид "
        + "и дълбочина на всеки пласт.",
      paragraphs: [
        "В изследването е приложено двумерно "
          + "електросъпротивително профилиране за "
          + "разграничаване на геоложки тела.",
        "Резултатите дават сравнителен геофизичен "
          + "контекст за проучените участъци около "
          + "Гоце Делчев.",
        "Интерпретациите не се представят като "
          + "доказани сондажни интервали."
      ]
    }
  ];

  const available = zone.wider_studies ?? [];

  return definitions.flatMap(def => {
    const original = available.find(study =>
      study.source_ids.includes(def.source)
    );
    if (!original) return [];

    const distanceKm = blgApproxDistanceKm(
      latitude, longitude, def.lat, def.lng
    );

    // Conservative locality-proximity filter.
    // Do not fill missing studies with faraway regional records.
    if (distanceKm > 35) return [];

    return [{
      id: "BLG-V5-" + def.source,
      title: def.title,
      informationType: original.informationType,
      paragraphs: def.paragraphs,
      sources: original.source_ids,
      summary: def.summary,
      distanceKm
    }];
  })
  .sort((a, b) => a.distanceKm - b.distanceKm)
  .slice(0, 3);
}

function blgLocalOverview(
  latitude: number,
  longitude: number,
  zone: RegionalZone
): SondiRegionalReportCard[] {
  const selected = selectBlgNearbyStudies(latitude, longitude, zone);
  if (!selected.length) return [];

  const primary = selected[0];
  return [{
    id: "BLG-V5-local-overview",
    title: primary.title,
    informationType: "Документиран регионален геоложки контекст",
    paragraphs: [
      primary.summary,
      "Информацията описва проучвания от близкия район. "
        + "Точните пластове и дълбочини под избраната "
        + "GPS точка не се приемат за доказани "
        + "само от тези регионални сведения."
    ],
    sources: primary.sources
  }];
}

/**
 * National, data-driven regional geological reporting.
 * Uses registered source-backed regional models and boundaries.
 * It does not override existing local depth modelling.
 */
export function getSondiRegionalReport(
  latitude: number,
  longitude: number
): SondiRegionalReportCard[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) return [];

  const registry = readJson<RegionRegistry>("regional_registry.json");

  for (const entry of registry.regions) {
    const geometry = readJson<Geometry>(entry.boundary_file);

    if (!containsPoint(geometry, latitude, longitude)) {
      continue;
    }

    const model = readJson<RegionalModel>(entry.model_file);
    const zone = model.zones[entry.zone_id];

    if (!zone) continue;

    if (entry.id === "BLG") {
      // Exclude V4's all-oblast borehole inventory from public cards.
      const scopedZone: RegionalZone = {
        ...zone,
        regional_evidence_notes: []
      };
      return [
        ...blgLocalOverview(latitude, longitude, zone),
        ...makeCards(entry, scopedZone)
      ];
    }

    return makeCards(entry, zone);
  }

  return [];
}

/**
 * Source-backed comparative geological studies.
 * Available to every registered regional model.
 * A study does not establish exact lithology at target coordinates.
 */
export function getSondiWiderStudies(
  latitude: number,
  longitude: number
): SondiRegionalReportCard[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) return [];

  const registry = readJson<RegionRegistry>(
    "regional_registry.json"
  );

  for (const entry of registry.regions) {
    const geometry = readJson<Geometry>(
      entry.boundary_file
    );
    if (!containsPoint(geometry, latitude, longitude)) {
      continue;
    }

    const model = readJson<RegionalModel>(
      entry.model_file
    );
    const zone = model.zones[entry.zone_id];
    if (!zone) return [];

    if (entry.id === "BLG") {
      return selectBlgNearbyStudies(latitude, longitude, zone)
        .map(study => ({
          id: study.id,
          title: study.title,
          informationType: study.informationType,
          paragraphs: study.paragraphs,
          sources: study.sources
        }));
    }

    return (zone.wider_studies ?? [])
      .filter(study =>
        study.title.trim().length > 0 &&
        study.paragraphs.length > 0 &&
        study.source_ids.length > 0
      )
      .map((study, index) => ({
        id: `${entry.id}-wider-study-${index}`,
        title: study.title,
        informationType: study.informationType,
        paragraphs: study.paragraphs,
        sources: study.source_ids
      }));
  }

  return [];
}
