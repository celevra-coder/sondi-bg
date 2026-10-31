
import "server-only";
import fs from "node:fs";
import path from "node:path";

export type NationalResearchEvidence = {
  intake_id: string;
  evidence_kind: string;
  original_id: string | null;
  source_file: string;
  json_pointer: string;
  source_ids: string[];
  intended_use:
    "REGIONAL_CONTEXT_REFERENCE" | "RESEARCH_REFERENCE_ONLY";
  depth_prediction_authorized: false;
  spatial_projection_authorized: false;
  record: Record<string, unknown>;
};

let cache: NationalResearchEvidence[] | null = null;

/**
 * Permanent nationwide documentary evidence catalog.
 * This loader never authorizes point lithology or depth forecasts.
 */
export function getNationalResearchEvidenceCatalog():
  NationalResearchEvidence[] {
  if(cache !== null)return cache;

  const file=path.join(
    process.cwd(),
    "data","soil-lithology","runtime",
    "national_research_evidence_catalog.json"
  );

  const data=JSON.parse(fs.readFileSync(file,"utf8")) as {
    automatic_depth_prediction_enabled?: boolean;
    regional_forecast_rules_imported?: boolean;
    records?: NationalResearchEvidence[];
  };

  if(
    data.automatic_depth_prediction_enabled!==false ||
    data.regional_forecast_rules_imported!==false ||
    !Array.isArray(data.records)
  )throw new Error("Unsafe national research catalog");

  const seen=new Set<string>();

  for(const record of data.records){
    if(
      record.depth_prediction_authorized!==false ||
      record.spatial_projection_authorized!==false ||
      ![
        "REGIONAL_CONTEXT_REFERENCE",
        "RESEARCH_REFERENCE_ONLY"
      ].includes(record.intended_use) ||
      seen.has(record.intake_id)
    )throw new Error("Invalid national research record");

    seen.add(record.intake_id);
  }

  cache=data.records;
  return cache;
}
