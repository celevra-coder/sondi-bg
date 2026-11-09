import "server-only";
import { getNationalResearchEvidenceCatalog } from "./sondi-national-research-evidence";

const normalize = (v: unknown): string =>
  String(v ?? "").toLocaleLowerCase("bg-BG").trim();

export function searchLunaNationalResearch(args: {
  query?: string;
  region?: string;
}) {
  const query = normalize(args.query).slice(0, 120);
  const region = normalize(args.region).slice(0, 100);

  if (!query && !region) {
    return {
      error: "QUERY_OR_REGION_REQUIRED",
      hint: "Search by geological term, material, settlement, municipality or region."
    };
  }

  const catalog = getNationalResearchEvidenceCatalog();

  // National document search:
  // declared primary oblast only, not arbitrary geographic mentions.
  const transliterate = (value: string): string => {
    const letters: Record<string, string> = {
      "а":"a","б":"b","в":"v","г":"g","д":"d",
      "е":"e","ж":"zh","з":"z","и":"i","й":"y",
      "к":"k","л":"l","м":"m","н":"n","о":"o",
      "п":"p","р":"r","с":"s","т":"t","у":"u",
      "ф":"f","х":"h","ц":"ts","ч":"ch","ш":"sh",
      "щ":"sht","ъ":"a","ь":"","ю":"yu","я":"ya"
    };
    return normalize(value)
      .split("")
      .map(c => letters[c] ?? c)
      .join("")
      .replace(/[^a-z0-9]/g, "");
  };

  const canonical = (value: unknown): string =>
    transliterate(String(value ?? ""));

  const requestedRegion = canonical(region);

  const primaryRegions = (record: Record<string, unknown>): string[] => {
    const result: string[] = [];

    const add = (value: unknown) => {
      if (typeof value === "string" && value.trim()) {
        result.push(value);
      }
    };

    add(record.oblast);
    add(record.region);

    const administrative = record.administrative_reference;
    if (administrative &&
        typeof administrative === "object" &&
        !Array.isArray(administrative)) {
      const a = administrative as Record<string, unknown>;
      add(a.oblast);
      add(a.region);
    }

    return [...new Set(result)];
  };

  // Explicit administrative metadata and source-file hints are
  // separate evidence classes. Neither verifies the target point.
  const regionAliases: Record<string, string[]> = {
    blagoevgrad:["blagoevgrad"], burgas:["burgas"],
    varna:["varna"], velikotarnovo:["veliko_tarnovo","veliko-tarnovo"],
    vidin:["vidin"], vratsa:["vratsa"], gabrovo:["gabrovo"],
    dobrich:["dobrich"], kardzhali:["kardzhali"],
    kyustendil:["kyustendil"], lovech:["lovech"],
    montana:["montana"], pazardzhik:["pazardzhik"],
    pernik:["pernik"], pleven:["pleven"], plovdiv:["plovdiv"],
    razgrad:["razgrad"], ruse:["ruse"], silistra:["silistra"],
    sliven:["sliven"], smolyan:["smolyan"], sofia:["sofia"],
    sofiacity:["sofia_city","sofia-city","sofia_grad"],
    starazagora:["stara_zagora","stara-zagora"],
    targovishte:["targovishte"], haskovo:["haskovo"],
    shumen:["shumen"], yambol:["yambol"]
  };

  // This is a documentary hint only, never spatial proof.
  const fileRegions = (sourceFile: string): string[] => {
    const p = sourceFile.toLowerCase().replace(/\\/g, "/");
    const base = p.split("/").pop() ?? "";
    const matches: string[] = [];

    for (const [regionKey, aliases] of Object.entries(regionAliases)) {
      for (const alias of aliases) {
        const inResearchDir = p.includes("/_research/" + alias + "/") ||
          p.startsWith("_research/" + alias + "/");

        const prefix = base.startsWith(alias + "_") ||
          base.startsWith(alias + "-");

        if (inResearchDir || prefix) {
          matches.push(regionKey);
          break;
        }
      }
    }

    return [...new Set(matches)];
  };

  const candidates = catalog.flatMap(item => {
    const r = item.record ?? {};
    const declared = primaryRegions(r);
    const declaredKeys = declared.map(canonical);
    const fileHints = fileRegions(item.source_file);

    const searchable = normalize(JSON.stringify({
      original_id: item.original_id,
      kind: item.evidence_kind,
      record: r
    }));

    if (query && !searchable.includes(query)) return [];

    const primaryMatch = !!region &&
      declaredKeys.includes(requestedRegion);

    const hintMatch = !!region &&
      fileHints.includes(requestedRegion);

    const conflictingFileRegion = primaryMatch &&
      fileHints.length > 0 &&
      !fileHints.includes(requestedRegion);

    if (region && (!primaryMatch && !hintMatch || conflictingFileRegion)) {
      return [];
    }

    const rank = region
      ? primaryMatch && hintMatch ? 3 :
        primaryMatch ? 2 :
        hintMatch && declaredKeys.length === 0 ? 1 : 0
      : 0;

    // Explicitly different primary geography is not overwritten
    // by a source filename.
    if (region && rank === 0) return [];

    const basis = !region
      ? "THEMATIC_SEARCH_NO_LOCATION_PROOF"
      : rank === 3
        ? "PRIMARY_METADATA_AND_SOURCE_FILE_AGREE"
        : rank === 2
          ? "PRIMARY_METADATA_ONLY_UNVERIFIED"
          : "SOURCE_FILE_HINT_ONLY_UNVERIFIED";

    return [{
      id: item.intake_id,
      kind: item.evidence_kind,
      original_id: item.original_id,
      intended_use: item.intended_use,
      source_ids: item.source_ids,
      source_file: item.source_file,
      declared_primary_regions: declared,
      source_file_region_hints: fileHints,
      geographic_match_basis: basis,
      geographic_rank: rank,
      geographic_metadata_present: declared.length > 0,
      searchable_record_preview: JSON.stringify(r).slice(0, 450),
      geological_interpretation_allowed: true,
      approximate_spatial_interpretation_allowed: true,
      exact_target_depth_measurement_verified: false,
      exact_target_spatial_match_verified: false
    }];
  });

  const matches = candidates
    .sort((a, b) => b.geographic_rank - a.geographic_rank)
    .slice(0, 15);
  return {
    query: args.query ?? null,
    region: args.region ?? null,
    total_catalog_records: catalog.length,
    returned_records: matches,
    returned_count: matches.length,
    limit: 15,
    warning:
      "Text matches are documentary references, not verified spatial matches. Check the original record and geographic precision before using geological conclusions."
  };
}

export function readLunaNationalResearch(id: string) {
  if (typeof id !== "string" || id.length > 150) {
    return { error: "INVALID_RESEARCH_ID" };
  }

  const item = getNationalResearchEvidenceCatalog()
    .find(x => x.intake_id === id);

  if (!item) return { error: "RESEARCH_RECORD_NOT_FOUND" };

  const serialized = JSON.stringify(item.record ?? {});
  const oversized = serialized.length > 12000;

  return {
    id: item.intake_id,
    kind: item.evidence_kind,
    original_id: item.original_id,
    source_file: item.source_file,
    json_pointer: item.json_pointer,
    source_ids: item.source_ids,
    intended_use: item.intended_use,
    geological_interpretation_allowed: true,
    approximate_spatial_interpretation_allowed: true,
    exact_target_depth_measurement_verified: false,
    exact_target_spatial_match_verified: false,
    record: oversized ? null : item.record,
    record_too_large_for_single_response: oversized,
    record_keys: oversized ? Object.keys(item.record ?? {}) : undefined,
    warning:
      "Research-only evidence. Geographic mentions and published thicknesses are not verified borehole contacts or measured intervals at the target coordinate."
  };
}