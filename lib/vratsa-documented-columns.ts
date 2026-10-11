import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { LithologyProfile } from "./lithology-profile";

type ResearchInterval = {
  from_m: number;
  to_m: number | null;
  material: string;
  evidence_kind?: string;
};
type ResearchControl = {
  record_id: string;
  borehole_name: string;
  site?: string | null;
  municipality?: string | null;
  location?: { latitude?: number | null; longitude?: number | null; status?: string };
  source_ids?: string[];
  lithology?: { documented_intervals?: ResearchInterval[] };
};

export type VratsaDocumentedColumn = {
  record_id: string;
  name: string;
  site: string;
  municipality: string;
  location_status: string;
  source_ids: string[];
  intervals: ResearchInterval[];
  basis: "REGIONAL_COMPARISON" | "LOCAL_SITE_COMPARISON";
  applicability_note: string | null;
};

// VRA-LEAD-005 remains in the source database; its regional applicability is not verified.
const marichinIds = new Set(["VRA-CTX-002", "VRA-CTX-003", "VRA-CTX-004"]);

export function getVratsaDocumentedColumns(
  profile: Pick<LithologyProfile, "target_spatial_depth_model" | "marichin_local_context">
): VratsaDocumentedColumn[] {
  const zone = profile.target_spatial_depth_model[0]?.zone.zone_id ?? null;
  const marichin = profile.marichin_local_context != null;
  if (!zone?.startsWith("VRA-Z") && !marichin) return [];

  const source = path.join(
    process.cwd(),
    "data", "soil-lithology", "research", "vratsa_borehole_controls_draft.json"
  );
  const parsed = JSON.parse(fs.readFileSync(source, "utf8")) as {
    controls?: ResearchControl[];
  };

  const selectedIds = new Set<string>();
  // No unverified borehole is assigned to every Vratsa zone.
  if (marichin) marichinIds.forEach(id => selectedIds.add(id));

  return (parsed.controls ?? [])
    .filter(record => selectedIds.has(record.record_id))
    .filter(record => Array.isArray(record.lithology?.documented_intervals) &&
      record.lithology!.documented_intervals!.length > 0)
    .filter(record => record.location?.latitude == null && record.location?.longitude == null)
    .map(record => ({
      record_id: record.record_id,
      name: record.borehole_name,
      site: record.site || "",
      municipality: record.municipality || "\u041d\u0435\u0443\u0442\u043e\u0447\u043d\u0435\u043d\u0430",
      location_status: record.location?.status || "UNRESOLVED",
      source_ids: record.source_ids || [],
      intervals: record.lithology!.documented_intervals!.filter(item =>
        Number.isFinite(item.from_m) &&
        (item.to_m === null || (Number.isFinite(item.to_m) && item.to_m > item.from_m)) &&
        typeof item.material === "string"),
      basis: marichinIds.has(record.record_id)
        ? "LOCAL_SITE_COMPARISON" as const
        : "REGIONAL_COMPARISON" as const,
      applicability_note:
        !marichinIds.has(record.record_id) && zone !== "VRA-Z01"
          ? "Архивен разрез от друг район. Геоложката му приложимост към избраната точка не е потвърдена."
          : null,
    }))
    .filter(record => record.intervals.length > 0);
}