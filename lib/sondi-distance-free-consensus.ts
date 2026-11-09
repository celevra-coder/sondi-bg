import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import type { NationalDepthResult } from "./sondi-national-depth-engine";

/**
 * Experimental, local-only spatial consensus.
 * There is deliberately no radius or distance cutoff. Inclusion in a
 * 3-borehole enclosing triangle, mapped-unit agreement and no mapped
 * fault intersections are mandatory. Distance is only used for ranking.
 * This is NOT a verified stratigraphic boundary interpolator.
 */
function familyOf(raw: string): string | null {
  const s = raw.toLocaleLowerCase("bg");
  const types: Array<[string, RegExp]> = [
    ["SANDSTONE", /пясъчниц/],
    ["CONGLOMERATE", /конгломерат/],
    ["ARGILLITE", /аргилит/],
    ["MARL", /мергел/],
    ["LIMESTONE", /варовик/],
    ["GRANITE", /гранит/],
    ["CLAY", /глин/],
    ["GRAVEL", /чакъл|грави/],
    ["SAND", /пясък|пясъц/],
  ];
  const matched = types.filter(([, re]) => re.test(s));
  // Composite and alternating strata are NOT safe to extrapolate as one rock.
  if (matched.length !== 1 ||
      /редуван|алтернац|прослой|с включени|с късове/.test(s)) {
    return null;
  }
  return matched[0][0];
}

function containsStrictly(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): boolean {
  const cross = (
    u: { x: number; y: number },
    v: { x: number; y: number },
    w: { x: number; y: number }
  ) => (v.x - u.x) * (w.y - u.y) -
       (v.y - u.y) * (w.x - u.x);
  const area = cross(a, b, c);
  if (Math.abs(area) < 1e-10) return false;
  const x = cross(a, b, p) / area;
  const y = cross(b, c, p) / area;
  const z = cross(c, a, p) / area;
  // Avoid ambiguous points at triangle edges.
  return x > 1e-6 && y > 1e-6 && z > 1e-6;
}

export function resolveNationalDistanceFreeConsensus(
  evidence: NationalDepthResult["evidence"],
  latitude: number,
  longitude: number,
  depthM: number
): { material: string; source_ids: string[]; borehole_ids: string[] } | null {
  if (!Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(depthM) || depthM < 0) return null;

  const indexed = new Map(getNationalBoreholeIndex()
    .filter(h => h.origin === "NATIONAL" &&
      h.coordinate_status === "OFFICIAL_EXACT" &&
      h.latitude !== null && h.longitude !== null)
    .map(h => [h.id, h] as const));

  const byId = new Map<string, {
    id: string;
    family: string;
    material: string;
    source_ids: string[];
    distance: number;
    x: number;
    y: number;
  }>();

  const cos = Math.cos(latitude * Math.PI / 180);
  for (const item of evidence) {
    if (item.type !== "BOREHOLE" ||
        item.site_relation !== "NEARBY_REFERENCE" ||
        item.coordinate_status !== "OFFICIAL_EXACT" ||
        item.surface_comparison !== "SAME_MAPPED_UNIT" ||
        item.mapped_fault_intersection_count !== 0 ||
        item.interval_status !== null ||
        !(item.interval_evidence_level === "borehole_exact" ||
          item.interval_evidence_level === "documented_borehole_log") ||
        typeof item.interval_from_m !== "number" ||
        typeof item.interval_to_m !== "number" ||
        depthM < item.interval_from_m || depthM >= item.interval_to_m ||
        typeof item.interval_material_bg !== "string" ||
        typeof item.borehole_id !== "string" ||
        typeof item.distance_km !== "number" ||
        item.distance_km <= 0.001) continue;

    const hole = indexed.get(item.borehole_id);
    if (!hole || hole.latitude === null || hole.longitude === null) continue;
    const family = familyOf(item.interval_material_bg);
    if (!family) continue;

    const previous = byId.get(hole.id);
    if (previous && previous.family !== family) return null;

    byId.set(hole.id, {
      id: hole.id, family,
      material: item.interval_material_bg.trim(),
      source_ids: [...new Set([
        ...(previous?.source_ids ?? []), ...item.source_ids
      ])],
      distance: item.distance_km,
      x: (hole.longitude - longitude) * cos,
      y: hole.latitude - latitude
    });
  }

  const controls = [...byId.values()]
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
    .slice(0, 30);

  if (controls.length < 3) return null;

  // Explicit conflicting lithologies prevent ungrounded family selection.
  if (new Set(controls.map(c => c.family)).size !== 1) return null;

  const p = { x: 0, y: 0 };
  for (let i = 0; i < controls.length - 2; i++) {
    for (let j = i + 1; j < controls.length - 1; j++) {
      for (let k = j + 1; k < controls.length; k++) {
        const a = controls[i], b = controls[j], c = controls[k];
        if (!containsStrictly(p, a, b, c)) continue;

        const labels: Record<string, string> = {
          SANDSTONE: "Пясъчници", CONGLOMERATE: "Конгломерати",
          ARGILLITE: "Аргилити", MARL: "Мергели",
          LIMESTONE: "Варовици", GRANITE: "Гранитни скали",
          CLAY: "Глинести материали", GRAVEL: "Чакълести материали",
          SAND: "Пясъчни материали"
        };

        const material = labels[a.family];
        if (!material) return null;
        return {
          material,
          source_ids: [...new Set([
            ...a.source_ids, ...b.source_ids, ...c.source_ids
          ])],
          borehole_ids: [a.id, b.id, c.id]
        };
      }
    }
  }

  return null;
}
