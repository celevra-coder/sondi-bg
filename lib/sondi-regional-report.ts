import { getNationalGwbGeologyContext } from "./sondi-national-gwb-geology-context";
import { getGeologyAtLocation } from "./geology-location";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
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
  // SONDI_REGIONAL_GEOJSON_FEATURE_SUPPORT_64T
  // GeoJSON wrappers are supported without changing
  // the original Polygon/MultiPolygon point-in-ring logic.
  const input = geometry as unknown as {
    type?: string;
    coordinates?: unknown;
    geometry?: unknown;
    features?: unknown;
  };

  if (!input || typeof input !== "object") {
    throw new Error("Invalid regional boundary");
  }

  if (input.type === "Feature") {
    if (!input.geometry) {
      throw new Error("Regional GeoJSON Feature has no geometry");
    }
    return containsPoint(input.geometry as Geometry, lat, lon);
  }

  if (input.type === "FeatureCollection") {
    if (!Array.isArray(input.features)) {
      throw new Error("Invalid regional FeatureCollection");
    }
    return input.features.some(feature =>
      containsPoint(feature as Geometry, lat, lon)
    );
  }

  if (
    input.type !== "Polygon" &&
    input.type !== "MultiPolygon"
  ) {
    throw new Error(
      "Unsupported regional geometry: " + String(input.type)
    );
  }

  if (!Array.isArray(input.coordinates)) {
    throw new Error("Regional geometry has no coordinates");
  }

  const polygons: Polygon[] =
    input.type === "MultiPolygon"
      ? input.coordinates as Polygon[]
      : [input.coordinates as Polygon];

  return polygons.some(polygon =>
    Array.isArray(polygon) &&
    polygon.length > 0 &&
    Array.isArray(polygon[0]) &&
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


  // SONDI_NATIONAL_READER_OVERVIEW_63CL
  // Source data is preserved; only public prose is simplified.
  if (entry.id === "SOF-CITY" || entry.id === "SOF-SVG") {
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



  } else {
    const cleanRegionalTerm = (raw: string): string =>
      raw
        .replace(/Картографирана категория:/gi, "")
        .replace(/;?\s*\d+\s*полигона?/gi, "")
        .replace(/Пространствено различна в рамките на общината;?/gi, "")
        .replace(/не представлява единна дълбочинна колонка\.?/gi, "")
        .replace(/\s+/g, " ")
        .replace(/\s+([,.])/g, "$1")
        .replace(/^[\s,;.]+|[\s,;.]+$/g, "")
        .trim();

    const unitNames = unique(
      units
        .map(item => cleanRegionalTerm(item.unit ?? ""))
        .filter(Boolean)
    );

    const rockDescriptions = unique(
      lithologies
        .map(item => cleanRegionalTerm(item))
        .filter(Boolean)
    );

    const paragraphs: string[] = [];

    if (unitNames.length) {
      paragraphs.push(
        `В проучванията за ${contextName} са установени ` +
        `геоложки единици и скални комплекси с различна ` +
        `възраст и произход. Сред описаните са: ` +
        unitNames.join("; ") + "."
      );
    }

    if (rockDescriptions.length) {
      paragraphs.push(
        `Скалните материали и наслагите, установени ` +
        `в проучените части на района, включват: ` +
        rockDescriptions.join("; ") + "."
      );
    }

    if (paragraphs.length) {
      paragraphs.push(
        "Геоложките материали могат да се редуват, " +
        "да променят дебелината си и да преминават един " +
        "в друг. Подредбата им зависи от конкретното " +
        "местоположение и геоложкия строеж."
      );

      paragraphs.push(
        "Практическо значение за сондирането: " +
        "различните материали се отличават по здравина, " +
        "устойчивост и пропускливост. Глинестите пластове " +
        "обикновено пропускат вода по-трудно, докато " +
        "пясъчните и чакълестите могат да бъдат " +
        "по-пропускливи. При твърдите скали значение " +
        "имат изветрянето и напукаността. " +
        "Тези регионални сведения не доказват " +
        "конкретен пласт на определена дълбочина " +
        "под избраната точка."
      );

      cards.push({
        id: `${entry.id}-reader-overview`,
        title: `Регионален геоложки анализ — ${entry.name_bg}`,
        informationType:
          "Геоложки строеж и практическо значение",
        paragraphs,
        sources
      });
    }
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


  // SONDI_DOCUMENTED_DEPTH_REFERENCE_67CY
  // The depths are measured in reference boreholes, NOT at the clicked site.
  const depthReferenceNotes = (zone.regional_evidence_notes ?? [])
    .filter(note =>
      note.informationType.startsWith(
        "SONDI_REGIONAL_BOREHOLE_ANALOGUE_67CC:"
      )
    );

  if (depthReferenceNotes.length > 0) {
    const targetDepths = [20, 50, 100, 200, 500];
    const depthParagraphs: string[] = [
      "Документирани литоложки материали на конкретни дълбочини в сондажи от проучения район. Точните координати на тези сондажи не са потвърдени. Данните НЕ представляват измерване или доказана прогноза за избрания имот."
    ];

    const intervalPattern =
      /^(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*м:\s*(.+)$/u;

    for (const depth of targetDepths) {
      const matching: string[] = [];

      for (const note of depthReferenceNotes) {
        const boreholeName = note.title.replace(
          /^Регионален сондажен аналог\s*—\s*/u,
          ""
        );

        for (const paragraph of note.paragraphs) {
          const match = paragraph.trim().match(intervalPattern);
          if (!match) continue;

          const from = Number(match[1].replace(",", "."));
          const to = Number(match[2].replace(",", "."));
          const material = match[3].trim();

          if (
            Number.isFinite(from) &&
            Number.isFinite(to) &&
            from <= depth &&
            depth < to &&
            material.length > 0
          ) {
            matching.push(
              `${boreholeName} (${from}–${to} м): ${material}`
            );
          }
        }
      }

      if (matching.length) {
        depthParagraphs.push(
          `${depth} м — документирано в ${matching.length} ` +
          `сондажни интервала: ${matching.join(" | ")}`
        );
      } else {
        depthParagraphs.push(
          `${depth} м — няма документиран интервал на тази ` +
          "дълбочина сред включените регионални сондажни аналози."
        );
      }
    }

    depthParagraphs.push(
      "Различните материали между сондажите са реални локални " +
      "различия или ограничения на проучванията, а не единна " +
      "литоложка колонка. Данните не доказват наличие на вода."
    );

    cards.push({
      id: `${entry.id}-documented-depth-67CY`,
      title: "Документирани сондажни материали по дълбочина",
      informationType: "SONDI_DEPTH_REFERENCE_67CY",
      paragraphs: depthParagraphs,
      sources: unique(
        depthReferenceNotes.flatMap(note => note.source_ids)
      )
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



  // SONDI_NATIONAL_READER_OVERVIEW_63CN
  // Build a readable overview only from evidence in this municipality.
  // Do not extrapolate the logged depths to the selected property.
  const needsReferenceOverview = new Set([
    "SOF-SFO17",
    "SOF-SFO25",
    "SOF-SFO39",
    "SOF-SFO59"
  ]);

  const needsContextOverview = new Set([
    "SOF-SFO54",
    "SOF-SFO55"
  ]);

  if (needsReferenceOverview.has(entry.id)) {
    const references = zone.documented_reference_intervals ?? [];

    const describedMaterials = unique(
      references
        .flatMap(reference => reference.intervals)
        .map(interval => interval.material_bg)
        .filter(Boolean)
        .map(material => material.trim())
    );

    if (describedMaterials.length > 0) {
      const examples = describedMaterials
        .slice(0, 7)
        .map(material => material.replace(/[.;]+$/, ""))
        .join("; ");

      const materialText = describedMaterials
        .join(" ")
        .toLocaleLowerCase("bg");

      const drillingNotes: string[] = [];

      if (/глин|алевролит/.test(materialText)) {
        drillingNotes.push(
          "Глинестите материали обикновено са по-слабопропускливи " +
          "и поведението им зависи от влажността и уплътняването."
        );
      }

      if (/пяс|чакъл|валун|грав/.test(materialText)) {
        drillingNotes.push(
          "Пясъчните и чакълестите наслаги могат да бъдат " +
          "по-пропускливи, но рохкавите участъци могат да " +
          "изискват укрепване на сондажа."
        );
      }

      if (/варовик|доломит/.test(materialText)) {
        drillingNotes.push(
          "При карбонатните скали значение имат " +
          "напукаността и евентуалните кухини."
        );
      }

      if (/шист|гнайс|гранит|пясъчник/.test(materialText)) {
        drillingNotes.push(
          "При по-здравите скали важни са твърдостта, " +
          "изветрянето и наличието на пукнатини."
        );
      }

      const paragraphs = [
        `За община ${entry.name_bg} са налични документирани ` +
        "сондажни описания, които дават сведения за част " +
        "от геоложкия строеж на района.",
        `Сред действително описаните материали в тези ` +
        `сондажи са: ${examples}.`,
        "Тези материали отразяват условията в конкретните " +
        "проучени места. Те не означават, че всички " +
        "изброени пластове се срещат под всеки имот " +
        "в общината или на еднакви дълбочини.",
        "Практическо значение за сондирането: " +
        (
          drillingNotes.length > 0
            ? drillingNotes.join(" ")
            : "Условията зависят от здравината, " +
              "уплътняването и напукаността на материалите."
        )
      ];

      cards.unshift({
        id: `${entry.id}-reader-overview`,
        title: `Регионален геоложки анализ — ${entry.name_bg}`,
        informationType: "Геоложки строеж и значение за сондирането",
        paragraphs,
        sources: unique(
          references.flatMap(reference => reference.source_ids)
        )
      });
    }
  }

  if (needsContextOverview.has(entry.id)) {
    const paragraphs = entry.id === "SOF-SFO54"
      ? [
          "Община Антон се намира в подбалканска геоложка " +
          "обстановка, където строежът на скалните комплекси " +
          "зависи от местните структурни условия.",
          "Наличните регионални сведения не установяват " +
          "конкретна последователност и дълбочина на " +
          "скалните пластове под избрания имот. " +
          "Сондажни данни от съседната община Златица " +
          "не се пренасят автоматично тук.",
          "Практическо значение за сондирането: " +
          "твърдостта, напукаността и характерът на " +
          "пластовете трябва да се оценяват спрямо " +
          "местния геоложки контекст."
        ]
      : [
          "В района на Пирдоп са документирани " +
          "хидрогеоложки наблюдателни сондажи, " +
          "свързани с наблюдение на подземните води.",
          "Наличните публични сведения за тези " +
          "наблюдения не представляват пълни " +
          "литоложки колонки. Поради това от тях " +
          "не следва конкретна последователност " +
          "или дълбочина на скалните пластове " +
          "под избрания имот.",
          "Практическо значение за сондирането: " +
          "наблюденията на подземни води и " +
          "описанието на скалния строеж са " +
          "различни видове информация. " +
          "Не приемаме наличие на наблюдателен " +
          "сондаж за доказателство за определена " +
          "литология на друга точка."
        ];

    const contextSources = unique(
      (zone.regional_evidence_notes ?? [])
        .flatMap(note => note.source_ids)
    );

    cards.unshift({
      id: `${entry.id}-reader-overview`,
      title: `Регионален геоложки анализ — ${entry.name_bg}`,
      informationType: "Регионален геоложки контекст",
      paragraphs,
      sources: contextSources
    });

    // Avoid repeating the technical note in a second card.
    // Its source record remains untouched in the model.
    for (let index = cards.length - 1; index >= 0; index--) {
      if (cards[index].id.startsWith(`${entry.id}-evidence-`)) {
        cards.splice(index, 1);
      }
    }
  }


  // SONDI_SHARED_REGIONAL_READER_63DJ
  // Build one source-based regional reader report where a
  // specialist overview has not already been prepared.
  // This is explanatory prose, never a depth prediction.
  if (
    entry.id !== "SOF-CITY" &&
    entry.id !== "BLG" &&
    !cards.some(card => card.id.endsWith("-reader-overview"))
  ) {
    const names = unique(
      units.map(unit => (unit.unit ?? "").trim()).filter(Boolean)
    );

    const rocks = unique(
      lithologies.map(rock => rock.trim()).filter(Boolean)
    );

    const searchText = [
      ...names,
      ...rocks
    ].join(" ").toLocaleLowerCase("bg");

    const contains = (pattern: RegExp) => pattern.test(searchText);

    const report: string[] = [];

    const hasRockEvidence = rocks.length > 0;
    const hasUnitEvidence = names.length > 0;

    if (hasRockEvidence || hasUnitEvidence) {
      report.push(
        `Геоложките проучвания за района на ${entry.name_bg} ` +
        "показват, че местният скален строеж трябва да " +
        "се разглежда чрез установените геоложки единици " +
        "и описаните в тях материали. " +
        "Сведенията характеризират проучени части на района, " +
        "а не еднаква вертикална колонка под всеки имот."
      );
    }

    if (hasUnitEvidence) {
      report.push(
        "В регионалните материали са разграничени " +
        "следните геоложки единици и комплекси: " +
        names.slice(0, 14).join("; ") + ". " +
        "Геоложката свита представлява съвкупност от " +
        "скални пластове с определени характеристики. " +
        "Наличието на няколко свити не означава, " +
        "че всяка от тях се среща под избраните координати."
      );
    }

    if (hasRockEvidence) {
      report.push(
        "Документираните скални материали в района включват: " +
        rocks.slice(0, 14).join("; ") + ". " +
        "Това са сведения за състава на проучените " +
        "геоложки комплекси. От тях не може автоматично " +
        "да се определи редът или точната дълбочина " +
        "на пластовете в избраното местоположение."
      );
    }

    const sedimentary = contains(
      /пясъчниц|алевролит|аргилит|конгломерат|мергел/
    );

    const loose = contains(
      /пясъц|пясък|чакъл|чакълест|алувиал|льос|кватернер/
    );

    const clay = contains(
      /глин|аргилит|мергел/
    );

    const hard = contains(
      /гранит|гнайс|диорит|амфиболит|кварцит|шист/
    );

    const carbonate = contains(
      /варовик|доломит|мрамор|карст/
    );

    const coal = contains(/въглищ|антрацит/);

    if (sedimentary) {
      report.push(
        "Сред описаните материали има уплътнени " +
        "седиментни скали. Пясъчниците са образувани " +
        "от споени песъчинки; алевролитите са " +
        "по-ситнозърнести; аргилитите представляват " +
        "силно уплътнени глинести скали, а " +
        "конгломератите съдържат споени по-едри " +
        "скални късове. Тези обяснения се отнасят " +
        "само до действително посочените в " +
        "регионалните сведения видове скали."
      );
    }

    if (loose) {
      report.push(
        "В описаните райони с пясъчни, чакълести " +
        "или други рохкави наслаги поведението " +
        "на материала при пробиване може да се " +
        "различава значително от това на твърдите скали. " +
        "Неустойчивите участъци могат да изискват " +
        "укрепване на сондажните стени. Това е " +
        "общо инженерно-геоложко следствие, " +
        "не доказателство за такъв пласт на конкретна дълбочина."
      );
    }

    if (clay && !sedimentary) {
      report.push(
        "Глинестите и финозърнестите материали " +
        "обикновено се различават по пластичност, " +
        "уплътняване и водопропускливост. " +
        "При сондиране устойчивостта им зависи " +
        "от конкретното състояние и условията в пласта."
      );
    }

    if (hard) {
      report.push(
        "При описаните по-твърди скални комплекси " +
        "съществено значение за пробиването имат " +
        "здравината, изветрянето и напукаността. " +
        "Нарушените части на скалния масив могат " +
        "да се държат различно от здравите участъци. " +
        "Самото наименование на скалата не доказва " +
        "наличието или дълбочината на разлом."
      );
    }

    if (carbonate) {
      report.push(
        "При карбонатните скали е важно да се " +
        "различават плътни, напукани и евентуално " +
        "карстифицирани участъци. Разтварянето " +
        "и пукнатините могат да променят скалната " +
        "структура, но конкретна кухина или " +
        "водоносен хоризонт не се доказва " +
        "само от регионалното описание."
      );
    }

    if (coal) {
      report.push(
        "В регионалните сведения се споменават " +
        "и въглищни образувания. Те са част " +
        "от историята на натрупване и преобразуване " +
        "на седиментите. Тяхното регионално наличие " +
        "не означава, че въглищен пласт се намира " +
        "непосредствено под избрания имот."
      );
    }

    if (hasRockEvidence || hasUnitEvidence) {
      report.push(
        "Практическо значение за сондирането: " +
        "различните материали могат да се отличават " +
        "по твърдост, напуканост, устойчивост и " +
        "водопропускливост. Изборът на сондажна " +
        "технология и обсаждане зависи от " +
        "реално установените условия по време " +
        "на пробиването, а не само от регионалната карта."
      );

      report.push(
        "Надеждност на анализа: настоящото описание " +
        "е регионална геоложка интерпретация. " +
        "То не представлява измерена сондажна " +
        "колонка в избраната точка и не определя " +
        "точни граници между пластовете по метри."
      );

      cards.unshift({
        id: `${entry.id}-reader-overview`,
        title: `Регионален геоложки анализ — ${entry.name_bg}`,
        informationType: "Геоложки строеж и практическо значение",
        paragraphs: report,
        sources
      });

      // These source-derived descriptions are represented in
      // the reader report. Preserve all other evidence cards.
      return cards.filter(card =>
        card.id !== `${entry.id}-formations` &&
        card.id !== `${entry.id}-lithology`
      );
    }
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

// SONDI_BLG_READER_OVERVIEW_63CS
// Preserve the existing geographic selection and source provenance.
function blgLocalOverview(
  latitude: number,
  longitude: number,
  zone: RegionalZone
): SondiRegionalReportCard[] {
  const selected = selectBlgNearbyStudies(latitude, longitude, zone);
  if (!selected.length) return [];

  const primary = selected[0];
  const context = primary.summary.toLocaleLowerCase("bg");

  const practicalNotes: string[] = [];

  if (/гранит|гнайс|скален масив/.test(context)) {
    practicalNotes.push(
      "При твърдите скали важни за пробиването са " +
      "здравината, изветрянето и разпространението на пукнатини."
    );
  }

  if (/мрамор|карст/.test(context)) {
    practicalNotes.push(
      "При карбонатните скали напукаността и карстовите " +
      "кухини могат да променят условията на сондиране."
    );
  }

  if (/седимент|глин|пяс|чакъл/.test(context)) {
    practicalNotes.push(
      "Седиментните материали могат да се различават " +
      "по уплътняване, устойчивост и пропускливост."
    );
  }

  if (!practicalNotes.length) {
    practicalNotes.push(
      "Условията за сондиране зависят от действителния " +
      "скален състав, здравината и местните структурни особености."
    );
  }

  const paragraphs = [
    primary.summary,
    ...primary.paragraphs
      .filter(paragraph => paragraph.trim().length > 0)
      .slice(0, 3),
    "Практическо значение за сондирането: " +
      practicalNotes.join(" "),
    "Това са сведения от конкретни проучени участъци " +
      "на областта. Не определят автоматично последователността " +
      "или точните дълбочини на скалните пластове под избрания имот."
  ];

  return [{
    id: "BLG-reader-overview",
    title: "Регионален геоложки анализ — " + primary.title,
    informationType: "Геоложки строеж и значение за сондирането",
    paragraphs,
    sources: primary.sources
  }];
}

/**
 * National, data-driven regional geological reporting.
 * Uses registered source-backed regional models and boundaries.
 * It does not override existing local depth modelling.
 */

// SONDI_AUTOMATIC_GEOLOGICAL_OVERVIEW_65J
// Shared, evidence-based geological overview.
// Surface map units are not interpreted as measured depth logs.
function buildAutomaticGeologicalOverview(
  latitude: number,
  longitude: number,
  title: string,
  cardId: string
): SondiRegionalReportCard {
  const surface = getGeologyAtLocation(latitude, longitude);
  const mappedUnit =
    (surface.status === "DIRECT" ||
      surface.status === "GAP_FILL") &&
    surface.unit?.name_bg?.trim()
      ? surface.unit.name_bg.trim()
      : null;

  const rad = Math.PI / 180;
  const distanceKm = (
    lat2: number,
    lon2: number
  ): number => {
    const dLat = (lat2 - latitude) * rad;
    const dLon = (lon2 - longitude) * rad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(latitude * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) ** 2;
    return 6371 * 2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  };

  // Only nearby mapped-unit comparisons may provide local context.
  // Research-only coordinates remain excluded from this selector.
  const neighbours = getNationalBoreholeIndex()
    .filter(hole =>
      hole.latitude !== null &&
      hole.longitude !== null &&
      hole.intervals.length > 0
    )
    .map(hole => ({
      hole,
      distance: distanceKm(hole.latitude!, hole.longitude!)
    }))
    .filter(item => item.distance <= 5)
    .filter(item => {
      const holeSurface = getGeologyAtLocation(
        item.hole.latitude!,
        item.hole.longitude!
      );
      return (
        surface.status === "DIRECT" &&
        holeSurface.status === "DIRECT" &&
        !!surface.unit?.code &&
        surface.unit.code === holeSurface.unit?.code
      );
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const paragraphs: string[] = [];
  const sources: string[] = [];

  // SONDI_NATIONAL_GWB_GEOLOGY_CONTEXT_65V
  // Spatial groundwater bodies are regional hydrogeological
  // context. They are not borehole depth predictions.
  const gwbProfiles = getNationalGwbGeologyContext(
    latitude,
    longitude
  );

  if (gwbProfiles.length > 0) {
    paragraphs.push(
      "Регионални хидрогеоложки условия: " +
      "за избраната GPS точка са установени " +
      gwbProfiles.length +
      " пространствено обхващащи подземни " +
      "водни тела, за които има публикувани " +
      "регионални профили. Припокриващите " +
      "се територии не доказват сами по себе " +
      "си последователност на пластове по метри."
    );

    for (const body of gwbProfiles) {
      const details: string[] = [];

      if (body.aquifer_type) {
        details.push("Геоложка среда: " + body.aquifer_type);
      }

      if (body.water_type) {
        details.push("Характер на водите: " + body.water_type);
      }

      if (body.horizon) {
        details.push(
          "Регионален хидрогеоложки хоризонт: " +
          body.horizon
        );
      }

      if (body.vertical_horizons) {
        details.push(
          "Обозначени хоризонти в източника: " +
          body.vertical_horizons
        );
      }

      if (body.lithology) {
        details.push(
          "Описана регионална литология: " +
          body.lithology
        );
      }

      if (body.lithostratigraphic_units) {
        details.push(
          "Литостратиграфски единици: " +
          body.lithostratigraphic_units
        );
      }

      if (body.tectonic_unit) {
        details.push(
          "Тектонска принадлежност: " +
          body.tectonic_unit
        );
      }

      if (body.aquifer_thickness_m) {
        details.push(
          "Публикувана регионална мощност на " +
          "водоносния комплекс: " +
          body.aquifer_thickness_m +
          " м. Това не е дълбочина до вода " +
          "под избрания имот"
        );
      }

      paragraphs.push(
        "Подземно водно тяло " + body.code +
        " — " + body.name + ". " +
        details.join(". ") + ". " +
        "Тези характеристики описват " +
        "регионалния комплекс, а не " +
        "измерена сондажна колонка на точката."
      );

      if (body.source) sources.push(body.source);
    }
  }




  // SONDI_READABLE_SOURCE_AWARE_OVERVIEW_65P_R
  if (mappedUnit) {
    const mapName =
      surface.source?.trim() ||
      "използвания геоложки картен източник";

    const isQuaternary = /кватернер/i.test(mappedUnit);

    paragraphs.push(
      "Геоложки строеж в района: картният източник „" +
      mapName + "“ обозначава избраната точка с " +
      "геоложка единица „" + mappedUnit + "“. " +
      (
        isQuaternary
          ? "Кватернерът означава геоложка възраст " +
            "на наслагите, а не конкретен вид скала. " +
            "Кватернерните наслаги могат да включват " +
            "пясъци, чакъли, глини и други материали. " +
            "Това са възможни разновидности, " +
            "а не доказани пластове под имота. "
          : "Това е геоложка класификация " +
            "на картографирания район, " +
            "а не измерен сондажен разрез. "
      ) +
      "Геоложката карта не определя сама по себе си " +
      "границите на пластовете на 20–500 м."
    );

    if (surface.source) sources.push(surface.source);
  }

  const materials = [...new Set(
    neighbours.flatMap(item =>
      item.hole.intervals
        .filter(interval =>
          interval.from_m !== null &&
          interval.to_m !== null &&
          interval.material_bg.trim().length > 0
        )
        .map(interval => interval.material_bg.trim())
    )
  )].slice(0, 6);

  if (materials.length > 0) {
    paragraphs.push(
      "В близки документирани сондажи, разположени " +
      "в същата картографирана повърхностна единица, " +
      "са описани: " + materials.join("; ") + "."
    );
    paragraphs.push(
      "Тези сондажни материали са сравнителни данни " +
      "от съответните сондажни позиции, а не " +
      "измерена колонка под избраната точка."
    );
    for (const item of neighbours) {
      for (const interval of item.hole.intervals) {
        sources.push(...interval.source_ids);
      }
    }
  }


  // SONDI_AUTOMATIC_NEARBY_DOCUMENTED_INTERVALS_65N
  // Use documented complete intervals as comparative evidence,
  // never as depth predictions for the selected GPS coordinate.
  if (materials.length === 0) {
    const comparative = getNationalBoreholeIndex()
      .filter(hole =>
        hole.latitude !== null &&
        hole.longitude !== null &&
        hole.intervals.some(interval =>
          interval.from_m !== null &&
          interval.to_m !== null &&
          interval.to_m > interval.from_m &&
          interval.material_bg.trim().length > 0 &&
          (
            interval.interval_status === null ||
            interval.interval_status === "EXACT_DOCUMENTED_INTERVAL"
          )
        )
      )
      .map(hole => ({
        hole,
        distance: distanceKm(
          hole.latitude!,
          hole.longitude!
        )
      }))
      .filter(item =>
        item.distance > 0.01 &&
        item.distance <= 10
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    for (const item of comparative) {
      const validIntervals = item.hole.intervals
        .filter(interval =>
          interval.from_m !== null &&
          interval.to_m !== null &&
          interval.to_m > interval.from_m &&
          interval.material_bg.trim().length > 0 &&
          (
            interval.interval_status === null ||
            interval.interval_status === "EXACT_DOCUMENTED_INTERVAL"
          )
        )
        .slice(0, 5);

      if (validIntervals.length === 0) continue;

      const intervalText = validIntervals
        .map(interval =>
          interval.from_m + "–" + interval.to_m +
          " м: " + interval.material_bg.trim().replace(/[.!?]+$/u, "")
        )
        .join("; ");

      const holeSurface = getGeologyAtLocation(
        item.hole.latitude!,
        item.hole.longitude!
      );

      const sameMappedSurface =
        surface.status === "DIRECT" &&
        holeSurface.status === "DIRECT" &&
        !!surface.unit?.code &&
        surface.unit.code === holeSurface.unit?.code;


      paragraphs.push(
        "Какво показват действителните сондажи? " +
        "На приблизително " +
        item.distance.toFixed(1) +
        " км от избраната точка се намира " +
        "документиран сондаж " +
        item.hole.id + ". " +
        "В него са описани следните " +
        "литоложки интервали: " +
        intervalText + ". " +
        (
          sameMappedSurface
            ? "При двете позиции е установена " +
              "една и съща картографирана " +
              "повърхностна геоложка единица. " +
              "Това подпомага регионалното " +
              "сравнение, но не доказва еднакви " +
              "пластове в дълбочина. "
            : "Не е потвърдена еднаква " +
              "повърхностна геоложка единица " +
              "при двете позиции, затова " +
              "сравнението е допълнително ограничено. "
        ) +
        "Какво означава за сондирането? " +
        "Описаните материали са действително " +
        "наблюдавани при сравнителния сондаж. " +
        "Различните материали могат да изискват " +
        "различен подход при пробиване и " +
        "укрепване на сондажния ствол. " +
        "Точните дълбочини и условия под " +
        "избрания имот остават предмет на " +
        "отделна геоложка оценка."
      );

      for (const interval of validIntervals) {
        sources.push(...interval.source_ids);
      }
    }
  }

  if (!mappedUnit && materials.length === 0) {
    paragraphs.push(
      "За избраната точка няма картографирана " +
      "геоложка единица с потвърден разчет в " +
      "използвания слой. Наличните регионални " +
      "източници не определят локална литоложка " +
      "последователност."
    );
  } else if (materials.length === 0) {
    paragraphs.push(
      "Важно ограничение: повърхностната геология " +
      "описва геоложката среда, но не определя " +
      "сама по себе си последователността на " +
      "пластовете на 20–500 м."
    );
  }


  // SONDI_CONCISE_AUTOMATIC_OVERVIEW_65X
  // Plain-language summary based on this exact GPS location.
  // No borehole interval is transferred to the target site.
  const conciseParagraphs: string[] = [];

  const regionalTypes = [...new Set(
    gwbProfiles
      .map(body => body.aquifer_type)
      .filter((value): value is string => !!value)
  )];

  const regionalLithologies = [...new Set(
    gwbProfiles
      .map(body => body.lithology)
      .filter((value): value is string => !!value)
  )];

  const geologyParts: string[] = [];

  if (mappedUnit) {
    geologyParts.push(
      /кватернер/i.test(mappedUnit)
        ? "Повърхностните наслаги са от кватернерна " +
          "възраст. В такива наслаги могат да се " +
          "срещат пясъци, чакъли и глини."
        : "За повърхността е картографирана " +
          "геоложка единица „" + mappedUnit + "“."
    );
  }

  if (gwbProfiles.length > 0) {
    geologyParts.push(
      "В района са описани " +
      gwbProfiles.length +
      " регионални подземни водни " +
      (gwbProfiles.length === 1 ? "тела." : "тела.")
    );
  }

  if (regionalTypes.length > 0) {
    geologyParts.push(
      "Те са свързани с " +
      regionalTypes
        .map(s => s.toLocaleLowerCase("bg"))
        .join(" и ") + "."
    );
  }

  if (regionalLithologies.length > 0) {
    geologyParts.push(
      "В регионалните профили са описани " +
      regionalLithologies.join("; ") + "."
    );
  }

  if (geologyParts.length > 0) {
    conciseParagraphs.push(
      "Геоложки строеж: " + geologyParts.join(" ")
    );
  }

  const toRadians = (v: number) => v * Math.PI / 180;

  const kmBetween = (a: number, b: number) => {
    const dLat = toRadians(a - latitude);
    const dLon = toRadians(b - longitude);
    const v =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(latitude)) *
      Math.cos(toRadians(a)) *
      Math.sin(dLon / 2) ** 2;
    return 6371 * 2 *
      Math.atan2(Math.sqrt(v), Math.sqrt(Math.max(0, 1 - v)));
  };

  // One nearest documented and spatially comparable borehole.
  const shortReferences = getNationalBoreholeIndex()
    .filter(hole =>
      hole.coordinate_status === "OFFICIAL_EXACT" &&
      hole.latitude !== null &&
      hole.longitude !== null
    )
    .map(hole => ({
      hole,
      distance: kmBetween(hole.latitude!, hole.longitude!)
    }))
    .filter(item => item.distance <= 10)
    .filter(item => {
      const observedSurface = getGeologyAtLocation(
        item.hole.latitude!,
        item.hole.longitude!
      );

      return surface.status === "DIRECT" &&
        observedSurface.status === "DIRECT" &&
        !!surface.unit?.code &&
        surface.unit.code === observedSurface.unit?.code;
    })
    .map(item => ({
      ...item,
      intervals: item.hole.intervals.filter(interval =>
        interval.from_m !== null &&
        interval.to_m !== null &&
        interval.to_m > interval.from_m &&
        interval.material_bg.trim().length > 0 &&
        (
          interval.interval_status === null ||
          interval.interval_status === "EXACT_DOCUMENTED_INTERVAL"
        )
      )
    }))
    .filter(item => item.intervals.length > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 1);

  if (shortReferences.length > 0) {
    const item = shortReferences[0];

    const intervals = item.intervals
      .slice(0, 3)
      .map(interval =>
        interval.from_m + "–" +
        interval.to_m + " м — " +
        interval.material_bg.trim().replace(/[.!?]+$/u, "")
      );

    conciseParagraphs.push(
      "Близки сондажи: " +
      "в документиран сондаж " + item.hole.id +
      " на около " + item.distance.toFixed(1) +
      " км са установени: " +
      intervals.join("; ") + "."
    );

    for (const interval of item.intervals.slice(0, 3)) {
      sources.push(...interval.source_ids);
    }
  }

  conciseParagraphs.push(
    "Практическо значение: " +
    "различните геоложки материали могат да " +
    "изискват различен подход при сондиране. " +
    "Регионалните сведения и близките сондажи " +
    "помагат за предварителната оценка, но " +
    "не доказват точната последователност " +
    "и дълбочина на пластовете под избрания имот."
  );


  return {
    id: cardId,
    title,
    informationType: "Автоматичен регионален геоложки анализ",
    paragraphs: conciseParagraphs,
    sources: [...new Set(sources.filter(Boolean))]
  };
}

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
      // SONDI_BLG_REGIONAL_FALLBACK_63DR
      const localCards = blgLocalOverview(latitude, longitude, zone);
      const contextCards = makeCards(entry, scopedZone);

      if (localCards.length > 0 || contextCards.length > 0) {
        return [...localCards, ...contextCards];
      }

      // The oblast-wide inventory provides context only.
      // Its observations are NOT an exact local geological log.
      const inventory = (zone.regional_evidence_notes ?? [])
        .find(note => note.paragraphs.some(p => p.trim().length > 0));

      const paragraphs: string[] = [
        "За избраната точка няма достатъчно близко " +
        "документирано геоложко проучване в локалния " +
        "модел. Затова следва областен геоложки обзор, " +
        "а не прогноза за конкретни скални пластове " +
        "или техните дълбочини.",
      ];

      if (inventory) {
        const recorded = inventory.paragraphs
          .filter(p => p.trim().length > 0);

        if (recorded.length > 0) {
          paragraphs.push(recorded[0]);
        }

        const examples = recorded
          .slice(1, 5)
          .map(p => p.replace(
            /Това са сведения за конкретните сондажи, а не за цялата област\.?/g,
            ""
          ).trim())
          .filter(Boolean);

        if (examples.length > 0) {
          paragraphs.push(
            "В различни документирани части на областта " +
            "са описани следните геоложки условия. " +
            "Тези примери показват регионалното разнообразие " +
            "и не се пренасят към избраната точка."
          );
          paragraphs.push(...examples);
        }
      }

      paragraphs.push(
        "Практическо значение за сондирането: " +
        "различните материали могат да имат различна " +
        "здравина, устойчивост и напуканост. " +
        "Реалните условия трябва да се установят " +
        "от местни сондажни или геофизични сведения."
      );

      paragraphs.push(
        "Надеждност: областен сравнителен контекст. " +
        "Няма доказана литоложка последователност " +
        "на определени дълбочини под избрания имот. " +
        "Отдалечените проучвания не се използват " +
        "като доказателство за местен пласт."
      );

      return [{
        id: "BLG-reader-overview",
        title: "Регионален геоложки анализ — област Благоевград",
        informationType: "Областен геоложки контекст",
        paragraphs,
        sources: inventory
          ? unique(inventory.source_ids)
          : []
      }];
    }

    // SONDI_PLD_AUTOMATIC_OVERVIEW_65J
    // Pilot activation of the shared automatic interpreter.
    // SONDI_PAZARDZHIK_CLEAN_REGIONAL_REPORT_67DZ
    // Keep substantive regional interpretations, not the
    // raw list of every borehole and technical evidence card.
    if (entry.id.startsWith("PZ-")) {
      const automatic = buildAutomaticGeologicalOverview(
        latitude,
        longitude,
        `Геоложка основа и по-широк регионален контекст — ${entry.name_bg}`,
        `${entry.id}-automatic-overview`
      );

      const sourceCards = makeCards(entry, zone);

      const regionalOverview = sourceCards.find(card =>
        card.id.endsWith("-reader-overview") &&
        card.paragraphs.some(p =>
          typeof p === "string" && p.trim().length > 80
        )
      );

      // Two readable sections at most. Existing regional data,
      // documented boreholes and their source records are untouched.
      return regionalOverview
        ? [regionalOverview, automatic]
        : [automatic];
    }
    if (entry.id.startsWith("PLD-M-")) {
      const overview = buildAutomaticGeologicalOverview(
        latitude,
        longitude,
        "Регионален геоложки анализ",
        entry.id + "-automatic-overview"
      );

      // SONDI_PLD_REGIONAL_BOREHOLE_CARDS_67CF
      // Preserve the automatic regional overview.
      // Append documented regional analogues only.
      // These boreholes have no verified exact coordinates
      // and must not imply lithology at the clicked property.
      const analogueCards = makeCards(entry, zone).filter(
        card =>
          card.informationType.startsWith(
            "SONDI_REGIONAL_BOREHOLE_ANALOGUE_67CC:"
          ) ||
          (
            card.informationType ===
              "Документирано регионално геоложко сведение" ||
            card.informationType === "SONDI_DEPTH_REFERENCE_67CY"
          )
      );

      return [overview, ...analogueCards];
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
