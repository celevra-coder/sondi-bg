import "server-only";
import fs from "node:fs";
import path from "node:path";
import { resolveGroundwaterBodiesAtPoint } from "./gwb-spatial-resolver";

// SONDI_NATIONAL_GWB_GEOLOGY_CONTEXT_65V
// Groundwater-body membership is regional context, not proof
// of borehole lithology, depth, yield or water availability.

type RawProfile = {
  code?: unknown;
  name?: unknown;
  basin_district?: unknown;
  aquifer_type_name?: unknown;
  water_type?: unknown;
  hydrogeological_horizon?: unknown;
  vertical_horizons?: unknown;
  lithology?: unknown;
  lithostratigraphic_units?: unknown;
  tectonic_unit?: unknown;
  aquifer_thickness_m?: unknown;
  source?: unknown;
};

export type NationalGwbGeologyContext = {
  code: string;
  name: string;
  basin: string;
  aquifer_type: string | null;
  water_type: string | null;
  horizon: string | null;
  vertical_horizons: string | null;
  lithology: string | null;
  lithostratigraphic_units: string | null;
  tectonic_unit: string | null;
  aquifer_thickness_m: string | null;
  source: string | null;
  interpretation_scope: "REGIONAL_GROUNDWATER_BODY";
};

const value = (item: unknown): string | null =>
  typeof item === "string" && item.trim()
    ? item.trim()
    : typeof item === "number" && Number.isFinite(item)
      ? String(item)
      : null;

let profileCache: Map<string, RawProfile> | null = null;

function getProfileIndex(): Map<string, RawProfile> {
  if (profileCache !== null) return profileCache;

  const file = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    "groundwater_geology_profiles.json"
  );

  const parsed: unknown = JSON.parse(
    fs.readFileSync(file, "utf8")
  );

  const profiles =
    parsed &&
    typeof parsed === "object" &&
    "profiles" in parsed &&
    Array.isArray(parsed.profiles)
      ? parsed.profiles
      : [];

  const index = new Map<string, RawProfile>();

  for (const item of profiles) {
    if (!item || typeof item !== "object") continue;

    const profile = item as RawProfile;
    const code = value(profile.code)?.toUpperCase();

    if (code && !index.has(code)) {
      index.set(code, profile);
    }
  }

  profileCache = index;
  return index;
}

export function getNationalGwbGeologyContext(
  latitude: number,
  longitude: number
): NationalGwbGeologyContext[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 40 || latitude > 45 ||
    longitude < 20 || longitude > 30
  ) return [];

  const index = getProfileIndex();
  const bodies = resolveGroundwaterBodiesAtPoint(
    latitude,
    longitude
  );

  const result: NationalGwbGeologyContext[] = [];
  const seen = new Set<string>();

  for (const body of bodies) {
    const code = body.code.trim().toUpperCase();

    if (!code || seen.has(code)) continue;
    seen.add(code);

    // Exact identifier matching only. No municipal or
    // proximity-based borrowing of another body's profile.
    const profile = index.get(code);

    if (!profile) continue;

    const basin = value(profile.basin_district);

    if (
      basin &&
      basin.toUpperCase() !== body.basin
    ) continue;

    result.push({
      code,
      name: value(profile.name) ?? code,
      basin: body.basin,
      aquifer_type: value(profile.aquifer_type_name),
      water_type: value(profile.water_type),
      horizon: value(profile.hydrogeological_horizon),
      vertical_horizons: value(profile.vertical_horizons),
      lithology: value(profile.lithology),
      lithostratigraphic_units:
        value(profile.lithostratigraphic_units),
      tectonic_unit: value(profile.tectonic_unit),
      aquifer_thickness_m:
        value(profile.aquifer_thickness_m),
      source: value(profile.source),
      interpretation_scope: "REGIONAL_GROUNDWATER_BODY"
    });
  }

  return result;
}
