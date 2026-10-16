import "server-only";
import fs from "node:fs";
import path from "node:path";

type Control = {
  id: string;
  latitude: number;
  longitude: number;
  depth_classes: Record<string, string | null>;
  material_families: Record<string, string[]>;
  documented_intervals: Record<string, Array<{
    from_m: number;
    to_m: number;
    material: string;
    evidence_level: string;
  }>>;
};

type PilotData = {
  controls: Control[];
  depths_m: number[];
};

export type RavnoPolePilotResult = {
  status: "CONDITIONAL_RESEARCH_PROJECTION";
  rows: Array<{
    depth: number;
    material: string;
    controlCount: number;
    materialDetails: string | null;
    referenceInterval: {
      boreholeId: string;
      from_m: number;
      to_m: number;
      material: string;
    } | null;
  }>;
};

function cross(
  a: [number, number],
  b: [number, number],
  c: [number, number]
): number {
  return (b[0]-a[0])*(c[1]-a[1]) -
    (b[1]-a[1])*(c[0]-a[0]);
}

function hull(points: Array<[number,number]>): Array<[number,number]> {
  const p = [...points].sort((a,b) => a[0]-b[0] || a[1]-b[1]);
  if (p.length < 3) return [];
  const lower: Array<[number,number]> = [];
  for (const v of p) {
    while (lower.length >= 2 &&
      cross(lower[lower.length-2],lower[lower.length-1],v) <= 0) lower.pop();
    lower.push(v);
  }
  const upper: Array<[number,number]> = [];
  for (const v of [...p].reverse()) {
    while (upper.length >= 2 &&
      cross(upper[upper.length-2],upper[upper.length-1],v) <= 0) upper.pop();
    upper.push(v);
  }
  return lower.slice(0,-1).concat(upper.slice(0,-1));
}

function inside(
  target: [number,number],
  polygon: Array<[number,number]>
): boolean {
  if (polygon.length < 3) return false;
  const signs = polygon.map((point,i) =>
    cross(point,polygon[(i+1)%polygon.length],target));
  return signs.every(v=>v>=-1e-10) ||
    signs.every(v=>v<=1e-10);
}

const names: Record<string,string> = {
  QUATERNARY: "Кватернерни наслаги",
  NEOGENE: "Неогенски седименти",
  OLDER_ROCKS: "По-стара скална основа — неопределен състав"
};

export function getRavnoPolePilot(
  latitude: number,
  longitude: number
): RavnoPolePilotResult | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const filename = path.join(
    process.cwd(),
    "data/soil-lithology/runtime/regions/ravno_pole_depth_pilot.json"
  );
  const data = JSON.parse(fs.readFileSync(filename,"utf8")) as PilotData;
  const points = data.controls.map(c =>
    [c.longitude,c.latitude] as [number,number]
  );

  if (!inside([longitude,latitude],hull(points))) return null;

  const rows = data.depths_m.map(depth => {
    const values = data.controls.map(c => c.depth_classes[String(depth)]);
    const known = values.filter((v):v is string => typeof v === "string");
    const agreed = known.length === data.controls.length &&
      known.every(v => v === known[0]);

    // SONDI_PHASE72_MATERIAL_EVIDENCE
    // Counts describe borehole observations, not proven
    // continuity of individual layers below the target.
    const materialCounts = new Map<string, number>();
    for (const control of data.controls) {
      const unique = new Set(
        control.material_families[String(depth)] ?? []
      );
      for (const name of unique) {
        materialCounts.set(
          name,
          (materialCounts.get(name) ?? 0) + 1
        );
      }
    }

    const materialDetails = agreed
      ? [...materialCounts.entries()]
          .sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))
          .slice(0,5)
          .map(([name,count]) =>
            `${name.toLowerCase()} — ${count} от ${data.controls.length} сондажа`
          ).join("; ")
      : "";

    const documentedCandidates = data.controls.flatMap(control =>
      (control.documented_intervals[String(depth)] ?? [])
        .filter(interval => interval.material.trim().length > 0)
        .map(interval => ({
          boreholeId: control.id,
          from_m: interval.from_m,
          to_m: interval.to_m,
          material: interval.material
        }))
    ).sort((a,b) =>
      (a.to_m-a.from_m)-(b.to_m-b.from_m)
      || a.boreholeId.localeCompare(b.boreholeId)
    );

    const referenceInterval = documentedCandidates[0] ?? null;

    return {
      depth,
      referenceInterval,
      material: agreed && names[known[0]]
        ? names[known[0]]
        : "Нееднозначен или недоказан геоложки преход",
      controlCount: known.length,
      materialDetails: materialDetails || null
    };
  });

  return {status:"CONDITIONAL_RESEARCH_PROJECTION",rows};
}
