import "server-only";

import {
  getNationalBoreholeIndex,
  type IndexedBorehole
} from "./sondi-national-borehole-index";
import { getGeologyAtLocation } from "./geology-location";
import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";

type Age = "QUATERNARY" | "NEOGENE" | "OLDER";

type Control = {
  hole: IndexedBorehole;
  lat: number;
  lon: number;
  age: Age | null;
  sources: string[];
};

export type NationalCorrelationResult = {
  material_bg: string;
  borehole_ids: string[];
  source_ids: string[];
  confidence: "LOW";
  method: "STRATIGRAPHIC_SPATIAL_CONSENSUS";
};

function ageOf(
  stratigraphy: string | null,
  material: string
): Age | null {
  const s = (stratigraphy ?? "").trim().toUpperCase();
  const m = material.toLocaleLowerCase("bg");

  if (s === "Q" || /^Q[0-9]/.test(s) ||
      m.includes("кватернер")) return "QUATERNARY";

  if (s === "N" || /^N[0-9]/.test(s) ||
      m.includes("неоген")) return "NEOGENE";

  if (/^(T|J|K|P|D|S|O|C)[0-9]?$/.test(s) ||
      m.includes("триас") ||
      m.includes("юрск") ||
      m.includes("кредн") ||
      m.includes("палеозой")) return "OLDER";

  return null;
}

function cross(
  a: [number,number],
  b: [number,number],
  c: [number,number]
): number {
  return (b[0]-a[0])*(c[1]-a[1]) -
    (b[1]-a[1])*(c[0]-a[0]);
}

function hull(
  points: [number,number][]
): [number,number][] {
  const sorted = [...points].sort(
    (a,b)=>a[0]-b[0] || a[1]-b[1]
  );

  const unique = sorted.filter((p,i) =>
    i === 0 ||
    p[0] !== sorted[i-1][0] ||
    p[1] !== sorted[i-1][1]
  );

  if (unique.length < 3) return [];

  const lower: [number,number][] = [];
  for (const p of unique) {
    while (
      lower.length >= 2 &&
      cross(
        lower[lower.length-2],
        lower[lower.length-1],
        p
      ) <= 0
    ) lower.pop();
    lower.push(p);
  }

  const upper: [number,number][] = [];
  for (const p of [...unique].reverse()) {
    while (
      upper.length >= 2 &&
      cross(
        upper[upper.length-2],
        upper[upper.length-1],
        p
      ) <= 0
    ) upper.pop();
    upper.push(p);
  }

  return [
    ...lower.slice(0,-1),
    ...upper.slice(0,-1)
  ];
}

function inside(
  point: [number,number],
  polygon: [number,number][]
): boolean {
  if (polygon.length < 3) return false;

  const signs = polygon.map((p,i) =>
    cross(
      p,
      polygon[(i+1)%polygon.length],
      point
    )
  );

  return signs.every(v=>v>=-1e-10) ||
    signs.every(v=>v<=1e-10);
}

const labels: Record<Age,string> = {
  QUATERNARY: "Кватернерни наслаги",
  NEOGENE: "Неогенски седименти",
  OLDER: "По-стара скална основа — неопределен състав"
};

export function resolveNationalCorrelation(
  latitude: number,
  longitude: number,
  depthM: number
): NationalCorrelationResult | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(depthM) ||
    depthM < 0
  ) return null;

  const target = getGeologyAtLocation(
    latitude,longitude
  );

  if (
    target.status !== "DIRECT" ||
    !target.unit?.code
  ) return null;

  // SONDI_NATIONAL_CONSENSUS_67DJ2
  // Conditional spatial interpretation, never an exact site log.
  const categoryOf = (text: string): string | null => {
    const s = text.toLocaleLowerCase("bg");
    if (/гранитогнайс/.test(s)) return "Гранитогнайси";
    if (/гранит/.test(s)) return "Гранити";
    if (/гнайс/.test(s)) return "Гнайси";
    if (/мергел/.test(s)) return "Мергели";
    if (/варовик/.test(s)) return "Варовици";
    if (/пясъчник/.test(s)) return "Пясъчници";
    return null;
  };

  if (target.status === "DIRECT" && target.unit?.code) {
    const controls: Array<{
      hole: IndexedBorehole;
      material: string;
      sources: string[];
      distance: number;
    }> = [];

    let ambiguous = false;

    for (const hole of getNationalBoreholeIndex()) {
      if (
        hole.origin !== "NATIONAL" ||
        hole.coordinate_status !== "OFFICIAL_EXACT" ||
        hole.latitude === null ||
        hole.longitude === null
      ) continue;

      const rad = Math.PI / 180;
      const dy = (hole.latitude - latitude) * rad;
      const dx = (hole.longitude - longitude) * rad;

      const hav =
        Math.sin(dy / 2) ** 2 +
        Math.cos(latitude * rad) *
        Math.cos(hole.latitude * rad) *
        Math.sin(dx / 2) ** 2;

      const distance = 6371 * 2 * Math.atan2(
        Math.sqrt(hav),
        Math.sqrt(Math.max(0, 1 - hav))
      );

      if (distance > 1) continue;

      const surface = getGeologyAtLocation(
        hole.latitude, hole.longitude
      );

      if (
        surface.status !== "DIRECT" ||
        surface.unit?.code !== target.unit.code
      ) continue;

      const faults = getMappedGemFaultsBetweenPoints(
        latitude, longitude,
        hole.latitude, hole.longitude
      );

      if (!faults || faults.intersects_mapped_gem_fault)
        continue;

      const intervals = hole.intervals.filter(x =>
        x.from_m !== null &&
        x.to_m !== null &&
        x.from_m <= depthM &&
        depthM < x.to_m &&
        !x.interval_status &&
        (
          x.evidence_level === "borehole_exact" ||
          x.evidence_level === "documented_borehole_log"
        )
      );

      if (!intervals.length) continue;

      if (intervals.length !== 1) {
        ambiguous = true;
        continue;
      }

      const material = categoryOf(intervals[0].material_bg);

      if (!material) {
        ambiguous = true;
        continue;
      }

      controls.push({
        hole,
        material,
        sources: intervals[0].source_ids,
        distance
      });
    }

    const categories = new Set(
      controls.map(x => x.material)
    );

    if (!ambiguous && categories.size === 1) {
      controls.sort((a,b) => a.distance - b.distance);

      const independent: typeof controls = [];

      for (const candidate of controls) {
        const distinct = independent.every(existing => {
          const north =
            (candidate.hole.latitude! -
             existing.hole.latitude!) * 111.2;

          const east =
            (candidate.hole.longitude! -
             existing.hole.longitude!) *
            111.2 * Math.cos(latitude * Math.PI / 180);

          return Math.hypot(north,east) >= 0.03;
        });

        if (distinct) independent.push(candidate);
      }

      if (independent.length >= 3) {
        const polygon = hull(
          independent.map(x => [
            x.hole.longitude!,
            x.hole.latitude!
          ])
        );

        if (
          polygon.length >= 3 &&
          inside([longitude,latitude],polygon)
        ) {
          return {
            material_bg: independent[0].material,
            borehole_ids: independent.map(x => x.hole.id),
            source_ids: [
              ...new Set(
                independent.flatMap(x => x.sources)
              )
            ],
            confidence: "LOW",
            method: "STRATIGRAPHIC_SPATIAL_CONSENSUS"
          };
        }
      }
    }
  }
  const groups = new Map<string,Control[]>();

  for (const hole of getNationalBoreholeIndex()) {
    if (
      hole.origin !== "NATIONAL" ||
      hole.coordinate_status !== "OFFICIAL_EXACT" ||
      hole.latitude === null ||
      hole.longitude === null ||
      !hole.region_code ||
      !hole.zone_type
    ) continue;

    const surface = getGeologyAtLocation(
      hole.latitude,hole.longitude
    );

    if (
      surface.status !== "DIRECT" ||
      surface.unit?.code !== target.unit.code
    ) continue;

    const faults = getMappedGemFaultsBetweenPoints(
      latitude,longitude,
      hole.latitude,hole.longitude
    );

    if (
      !faults ||
      faults.intersects_mapped_gem_fault
    ) continue;

    const intervals = hole.intervals.filter(x =>
      x.from_m !== null &&
      x.to_m !== null &&
      x.from_m <= depthM &&
      depthM < x.to_m &&
      (
        x.evidence_level === "borehole_exact" ||
        x.evidence_level === "documented_borehole_log"
      ) &&
      !x.interval_status
    );

    if (intervals.length !== 1) continue;

    const interval = intervals[0];

    // An unclassified documented interval can support
    // geometry but cannot cast a stratigraphic vote.
    const age = ageOf(
      interval.stratigraphy,
      interval.material_bg
    );

    const key = [
      hole.region_code,
      hole.zone_type
    ].join("|");

    const group = groups.get(key) ?? [];

    group.push({
      hole,
      lat: hole.latitude,
      lon: hole.longitude,
      age,
      sources: interval.source_ids
    });

    groups.set(key,group);
  }

  const eligible: Array<{
    group: Control[];
    age: Age;
  }> = [];

  for (const group of groups.values()) {
    if (group.length < 3) continue;

    const polygon = hull(group.map(c =>
      [c.lon,c.lat] as [number,number]
    ));

    if (!inside([longitude,latitude],polygon)) {
      continue;
    }

    const votes = group.filter(
      (c): c is Control & {age:Age} =>
        c.age !== null
    );

    if (votes.length < 3) continue;

    const ages = new Set(votes.map(c=>c.age));

    // A mixed stratigraphic vote is a transition,
    // not a proven single geological complex.
    if (ages.size !== 1) continue;

    const age = votes[0].age;

    // Require independently positioned classified
    // controls; duplicate coordinates are not votes.
    const positions = new Set(votes.map(c =>
      `${c.lat.toFixed(7)}:${c.lon.toFixed(7)}`
    ));

    if (positions.size < 3) continue;

    eligible.push({group,age});
  }

  // Never choose between competing eligible groups
  // by proximity alone.
  if (eligible.length !== 1) return null;

  const winner = eligible[0];

  return {
    material_bg: labels[winner.age],
    borehole_ids: winner.group.map(c=>c.hole.id),
    source_ids: [...new Set(
      winner.group.flatMap(c=>c.sources)
    )],
    confidence: "LOW",
    method: "STRATIGRAPHIC_SPATIAL_CONSENSUS"
  };
}
