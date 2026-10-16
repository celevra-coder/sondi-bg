import "server-only";
import fs from "node:fs";
import path from "node:path";

type Control = {
  borehole_id: string;
  latitude: number;
  longitude: number;
  quaternary_base_m: number;
  neogene_base_m: number | null;
  contact_evidence: string;
};

type Group = {
  group_id: string;
  status: string;
  geological_block_verified: boolean;
  fault_crossing_approved: boolean;
  controls: Control[];
};

type Registry = {
  runtime_approved: boolean;
  groups: Group[];
};

export type StratigraphicResearchResult = {
  status: "RESEARCH_ONLY";
  group_id: string;
  depth_m: number;
  interpretation:
    | "QUATERNARY"
    | "QUATERNARY_NEOGENE_TRANSITION"
    | "NEOGENE"
    | "NEOGENE_OLDER_TRANSITION"
    | "OLDER_ROCKS_UNSPECIFIED"
    | "UNRESOLVED";
  probable_lithology: string | null;
  borehole_ids: string[];
  quaternary_contact_range_m: [number,number];
  neogene_contact_range_m: [number,number] | null;
  external_validation: false;
};

function cross(
  a: [number,number],
  b: [number,number],
  c: [number,number]
): number {
  return (b[0]-a[0])*(c[1]-a[1]) -
    (b[1]-a[1])*(c[0]-a[0]);
}

function hull(points: [number,number][]): [number,number][] {
  const sorted = [...points].sort(
    (a,b)=>a[0]-b[0] || a[1]-b[1]
  );
  const unique = sorted.filter((p,i) =>
    i===0 || p[0]!==sorted[i-1][0] ||
    p[1]!==sorted[i-1][1]
  );
  if (unique.length < 3) return [];
  const lower: [number,number][] = [];
  for (const p of unique) {
    while (lower.length>=2 &&
      cross(lower[lower.length-2],lower[lower.length-1],p)<=0)
      lower.pop();
    lower.push(p);
  }
  const upper: [number,number][] = [];
  for (const p of [...unique].reverse()) {
    while (upper.length>=2 &&
      cross(upper[upper.length-2],upper[upper.length-1],p)<=0)
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0,-1).concat(upper.slice(0,-1));
}

function contains(
  p: [number,number],
  polygon: [number,number][]
): boolean {
  if (polygon.length<3) return false;
  const signs = polygon.map((a,i) =>
    cross(a,polygon[(i+1)%polygon.length],p)
  );
  return signs.every(v=>v>=-1e-10) ||
    signs.every(v=>v<=1e-10);
}

function range(values: number[]): [number,number] {
  return [Math.min(...values),Math.max(...values)];
}

export function resolveStratigraphicResearch(
  latitude: number,
  longitude: number,
  depthM: number
): StratigraphicResearchResult | null {
  if (![latitude,longitude,depthM].every(Number.isFinite) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180 ||
      depthM < 0) return null;

  const filename = path.join(
    process.cwd(),
    "data/soil-lithology/runtime/regions/" +
    "national_stratigraphic_control_groups.json"
  );
  const registry = JSON.parse(
    fs.readFileSync(filename,"utf8")
  ) as Registry;

  const candidates: StratigraphicResearchResult[] = [];

  for (const group of registry.groups ?? []) {
    if (group.status !== "RESEARCH_ONLY" ||
        !Array.isArray(group.controls) ||
        group.controls.length < 3) continue;

    const controls = group.controls;
    if (controls.some(c =>
      !Number.isFinite(c.latitude) ||
      !Number.isFinite(c.longitude) ||
      !Number.isFinite(c.quaternary_base_m) ||
      c.quaternary_base_m <= 0 ||
      (c.neogene_base_m !== null &&
       (!Number.isFinite(c.neogene_base_m) ||
        c.neogene_base_m <= c.quaternary_base_m))
    )) continue;

    const polygon = hull(controls.map(c =>
      [c.longitude,c.latitude] as [number,number]
    ));
    if (!contains([longitude,latitude],polygon)) continue;

    const qRange = range(
      controls.map(c=>c.quaternary_base_m)
    );

    const deepControls = controls.filter(c =>
      c.neogene_base_m !== null
    );
    const nRange = deepControls.length >= 3
      ? range(deepControls.map(c=>c.neogene_base_m!))
      : null;

    const deepHull = hull(deepControls.map(c =>
      [c.longitude,c.latitude] as [number,number]
    ));
    const insideDeep = contains(
      [longitude,latitude],deepHull
    );

    let interpretation:
      StratigraphicResearchResult["interpretation"] =
        "UNRESOLVED";
    let material: string | null = null;

    if (depthM < qRange[0]) {
      interpretation = "QUATERNARY";
      material = "Кватернерни наслаги";
    } else if (depthM <= qRange[1]) {
      interpretation = "QUATERNARY_NEOGENE_TRANSITION";
      material = "Преход между кватернер и неоген";
    } else if (nRange === null || depthM < nRange[0]) {
      interpretation = "NEOGENE";
      material = "Неогенски седименти";
    } else if (insideDeep && depthM <= nRange[1]) {
      interpretation = "NEOGENE_OLDER_TRANSITION";
      material = "Преход към по-стара скална основа";
    } else if (insideDeep && depthM > nRange[1]) {
      interpretation = "OLDER_ROCKS_UNSPECIFIED";
      material = "По-стара скална основа — неопределен състав";
    }

    candidates.push({
      status: "RESEARCH_ONLY",
      group_id: group.group_id,
      depth_m: depthM,
      interpretation,
      probable_lithology: material,
      borehole_ids: controls.map(c=>c.borehole_id),
      quaternary_contact_range_m: qRange,
      neogene_contact_range_m: nRange,
      external_validation: false
    });
  }

  // Overlapping research groups require an explicit
  // geological resolution, never nearest-group selection.
  return candidates.length === 1 ? candidates[0] : null;
}
