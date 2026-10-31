import { resolveNationalResearchEvidenceScope } from "./sondi-national-research-scope";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import "server-only";

import {
  getNationalDynamicIntervals,
  getNationalReferenceColumns
} from "./sondi-national-dynamic-depths";

import {
  getNationalDocumentedContactContext,
  resolveNationalSpatialContacts
} from "./sondi-national-contact-spatial";

import { getGeologyAtLocation } from "./geology-location";
import { getFaultSpatialProfile } from "./fault-spatial-profile";

/**
 * Common national evidence entry point.
 * Applies identically to every GPS location.
 * Collecting evidence never authorizes spatial extrapolation.
 */
export function resolveNationalEvidence(
  latitude: number,
  longitude: number
) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      status: "INVALID_INPUT" as const,
      target: { latitude, longitude },
      geology: null,
      faults: null,
      intervals: [],
      references: [],
      documented_contacts: [],
      spatial_contact_research: [],
      spatial_prediction_approved: false as const
    };
  }

  const intervals = getNationalDynamicIntervals(
    latitude, longitude
  );

  const references = getNationalReferenceColumns(
    latitude, longitude
  );

  const documentedContacts =
    getNationalDocumentedContactContext(
      latitude, longitude
    );

  const spatialContacts =
    resolveNationalSpatialContacts(
      latitude, longitude
    );

  const geology = getGeologyAtLocation(
    latitude, longitude
  );

  const faults = getFaultSpatialProfile(
    latitude, longitude
  );

  return {
    status: "EVIDENCE_COLLECTED" as const,
    target: { latitude, longitude },
    geology,
    faults,
    intervals,
    references,
    documented_contacts: documentedContacts,
    spatial_contact_research: spatialContacts,
    spatial_prediction_approved: false as const,
    research_references:
      resolveNationalResearchEvidenceScope(
        latitude, longitude
      )
  };
}

/**
 * Single national entry for documented and spatial contact evidence.
 * This collects evidence; it does not approve spatial predictions.
 */
export function resolveNationalContactEvidence(
  latitude: number,
  longitude: number
) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return {
      documented_contacts: [],
      spatial_contact_research: []
    };
  }

  return {
    documented_contacts:
      getNationalDocumentedContactContext(
        latitude, longitude
      ),
    spatial_contact_research:
      resolveNationalSpatialContacts(
        latitude, longitude
      )
  };
}


/**
 * National documented material at the actual borehole coordinate.
 * No extrapolation to surrounding land.
 */
export function resolveNationalColocatedMaterial(
  evidence: import("./sondi-national-depth-engine")
    .NationalDepthResult["evidence"],
  depthM: number
) {
  const matching = evidence.filter(item =>
    item.type === "BOREHOLE" &&
    item.site_relation === "COLOCATED_COORDINATES" &&
    (
      item.coordinate_status === "OFFICIAL_EXACT" ||
      item.coordinate_status === "REGIONAL_DOCUMENTED"
    ) &&
    typeof item.distance_km === "number" &&
    item.distance_km <= 0.001 &&
    typeof item.interval_from_m === "number" &&
    typeof item.interval_to_m === "number" &&
    item.interval_from_m <= depthM &&
    depthM < item.interval_to_m &&
    item.interval_status === null &&
    (
      item.interval_evidence_level === "borehole_exact" ||
      item.interval_evidence_level === "documented_borehole_log" ||
      item.interval_evidence_level === "regional_documented_interval"
    ) &&
    typeof item.interval_material_bg === "string" &&
    item.interval_material_bg.trim().length > 0
  );

  return {
    materials: [...new Set(
      matching.map(item => item.interval_material_bg!.trim())
    )],
    source_ids: [...new Set(
      matching.flatMap(item => item.source_ids)
    )]
  };
}


/**
 * National selection of nearby documented reference intervals.
 * Evidence selection only; not an approval of spatial correlation.
 * No municipality or province routing.
 */
export function resolveNationalNearbyCandidates(
  evidence: import("./sondi-national-depth-engine")
    .NationalDepthResult["evidence"],
  depthM: number
) {
  return evidence
    .filter(item =>
      item.type === "BOREHOLE" &&
      typeof item.borehole_id === "string" &&
      item.coordinate_status === "OFFICIAL_EXACT" &&
      item.site_relation === "NEARBY_REFERENCE" &&
      typeof item.distance_km === "number" &&
      item.distance_km > 0.001 &&
      item.distance_km <= 1 &&
      item.surface_comparison === "SAME_MAPPED_UNIT" &&
      item.mapped_fault_intersection_count === 0 &&
      item.interval_status === null &&
      (
        item.interval_evidence_level === "borehole_exact" ||
        item.interval_evidence_level === "documented_borehole_log" ||
        item.interval_evidence_level ===
          "borehole_exact_partial_column"
      ) &&
      typeof item.interval_from_m === "number" &&
      typeof item.interval_to_m === "number" &&
      item.interval_from_m <= depthM &&
      depthM < item.interval_to_m &&
      typeof item.interval_material_bg === "string" &&
      item.interval_material_bg.trim().length > 0
    )
    .sort((a,b) =>
      (a.distance_km ?? Infinity) -
        (b.distance_km ?? Infinity) ||
      (a.borehole_id ?? "").localeCompare(b.borehole_id ?? "")
    );
}


/**
 * National documentary-borehole candidate collection.
 * This function DOES NOT approve spatial transfer.
 * Existing source-specific exceptions are preserved
 * for regression compatibility pending evidence review.
 */
export function getNationalDocumentaryCandidates(
  latitude: number,
  longitude: number,
  depthM: number,
  expectedRegion: string
) {
    const radians = (value: number) => value * Math.PI / 180;

    const distanceBetween = (
      lat1: number, lon1: number,
      lat2: number, lon2: number
    ) => {
      const dLat = radians(lat2 - lat1);
      const dLon = radians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(radians(lat1)) *
        Math.cos(radians(lat2)) *
        Math.sin(dLon / 2) ** 2;
      return 6371 * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(Math.max(0, 1 - a))
      );
    };

    const candidates = getNationalBoreholeIndex()
      .filter(hole =>
        hole.origin === "NATIONAL" &&
        (
          hole.coordinate_status === "OFFICIAL_EXACT" ||
          (
            expectedRegion === "Blagoevgrad" &&
            (
              (hole.id === "PLD-Z040" &&
               hole.coordinate_status === "official_documented") ||
              (hole.id === "PLD-Z067" &&
               hole.coordinate_status === "official_documented") ||
              (hole.id === "PLD-Z068" &&
               hole.coordinate_status === "official_documented") ||
              (hole.id === "PLD-Z070" &&
               hole.coordinate_status === "official_documented_external")
            )
          )
        ) &&
        expectedRegion !== null &&
          hole.region_code === expectedRegion &&
        hole.latitude !== null &&
        hole.longitude !== null
      )
      .flatMap(hole => {
        const distance = distanceBetween(
          latitude, longitude,
          hole.latitude!, hole.longitude!
        );

        if (distance > 30) return [];

        return hole.intervals
          .filter(interval =>
            interval.from_m !== null &&
            interval.to_m !== null &&
            interval.from_m <= depthM &&
            depthM < interval.to_m &&
            !interval.interval_status &&
            (
              interval.evidence_level === "borehole_exact" ||
              interval.evidence_level === "documented_borehole_log"
            ) &&
            interval.material_bg.trim().length > 0
          )
          .map(interval => ({
            id: hole.id,
            distance,
            material: interval.material_bg.trim(),
            sources: interval.source_ids
          }));
      })
      .sort((a, b) => a.distance - b.distance);


    return candidates;
}


/**
 * National interpretation of documentary borehole analogues.
 *
 * The evidence is documentary until independently approved.
 * Geographic eligibility remains an explicit input policy.
 * No region names or identifiers are required here.
 */
export function resolveNationalDocumentaryDecision(args: {
  latitude: number;
  longitude: number;
  depthM: number;
  expectedRegion: string;
  requireLocalAnalogue: boolean;
  evidence: import("./sondi-national-depth-engine")
    .NationalDepthResult["evidence"];
  isSpatialMaterialCandidate: (material: string) => boolean;
}) {
  const candidates=getNationalDocumentaryCandidates(
    args.latitude,
    args.longitude,
    args.depthM,
    args.expectedRegion
  );

  const close=candidates.filter(c=>c.distance<=15);
  const distinct=new Set(candidates.map(c=>c.id));

  const eligible=args.requireLocalAnalogue
    ? close.length>0
    : close.length>0 || distinct.size>=2;

  if(!eligible || candidates.length===0)return null;

  const primary=close[0]??candidates[0];

  const matchingEvidence=args.evidence.find(item=>
    item.type==="BOREHOLE" &&
    item.borehole_id===primary.id &&
    item.site_relation==="NEARBY_REFERENCE" &&
    item.coordinate_status==="OFFICIAL_EXACT" &&
    item.surface_comparison==="SAME_MAPPED_UNIT" &&
    item.mapped_fault_intersection_count===0 &&
    item.interval_status===null &&
    typeof item.distance_km==="number" &&
    item.distance_km>0.001 &&
    item.distance_km<=1 &&
    typeof item.interval_from_m==="number" &&
    typeof item.interval_to_m==="number" &&
    item.interval_from_m<=args.depthM &&
    args.depthM<item.interval_to_m &&
    item.interval_material_bg?.trim()===primary.material
  );

  if(
    !matchingEvidence ||
    !args.isSpatialMaterialCandidate(primary.material)
  ) {
    return {
      kind:"DOCUMENTARY_ONLY" as const,
      material:null,
      alternatives:[primary.material],
      source_ids:primary.sources
    };
  }

  const alternatives=[...new Set(
    candidates
      .filter(c=>c.id!==primary.id)
      .map(c=>c.material)
      .filter(m=>m!==primary.material)
  )].slice(0,5);

  return {
    kind:"SPATIAL_CONDITIONAL" as const,
    material:primary.material,
    alternatives,
    source_ids:candidates.flatMap(c=>c.sources)
  };
}


/**
 * Transitional routing for legacy documentary analogue coverage.
 * This is a compatibility policy, NOT a national geological model.
 * It does not authorize any spatial correlation.
 *
 * Later replaced by spatially verified evidence coverage.
 */
export function resolveNationalDocumentaryCompatibilityPolicy(
  regionId: string | null
): {
  expectedRegion: string;
  requireLocalAnalogue: boolean;
} | null {
  if (regionId === "BLG") {
    return {
      expectedRegion: "Blagoevgrad",
      requireLocalAnalogue: false
    };
  }

  if (regionId === "SOF-CITY") {
    return {
      expectedRegion: "Sofia-city",
      requireLocalAnalogue: true
    };
  }

  if (regionId?.startsWith("SOF-")) {
    return {
      expectedRegion: "Sofia",
      requireLocalAnalogue: true
    };
  }

  return null;
}


/**
 * National presentation of documentary analogue evidence.
 * Documentary-only material is NEVER a predicted site layer.
 */
export function applyNationalDocumentaryDecision(
  base: import("./sondi-national-depth-engine").NationalDepthResult,
  decision: NonNullable<
    ReturnType<typeof resolveNationalDocumentaryDecision>
  >
): import("./sondi-national-depth-engine").NationalDepthResult {
  if(decision.kind==="DOCUMENTARY_ONLY") {
    return {
      ...base,
      status:"CONDITIONAL",
      evidence_tier:"REGIONAL_CONTEXT",
      probable_lithology:null,
      alternative_lithologies:decision.alternatives,
      confidence:"UNRESOLVED",
      interpretation_scope:"NEARBY_BOREHOLE_ANALOG_UNVERIFIED",
      source_ids:[...new Set([
        ...base.source_ids,
        ...decision.source_ids
      ])]
    };
  }

  return {
    ...base,
    status:"CONDITIONAL",
    evidence_tier:"GEOLOGICAL_CORRELATION",
    probable_lithology:decision.material,
    alternative_lithologies:decision.alternatives,
    confidence:"LOW",
    interpretation_scope:"SPATIAL_CORRELATION_CONDITIONAL",
    source_ids:[...new Set([
      ...base.source_ids,
      ...decision.source_ids
    ])]
  };
}


/**
 * Nationwide documentary comparison.
 * Never authorizes a material prediction at the requested site.
 * Geographic distance supplies context, not stratigraphic proof.
 */
export function getNationalDocumentaryFallback(
 latitude:number,
 longitude:number,
 depthM:number
): {
 material:string;
 source_ids:string[];
 borehole_id:string;
 distance_km:number;
} | null {
 if(!Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(depthM) ||
    depthM<0 ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180)
  return null;

 const rad=(v:number)=>v*Math.PI/180;
 const nearby=getNationalBoreholeIndex()
  .filter(h=>
   h.origin==="NATIONAL" &&
   h.coordinate_status==="OFFICIAL_EXACT" &&
   typeof h.latitude==="number" &&
   typeof h.longitude==="number"
  )
  .flatMap(h=>{
   const dlat=rad(h.latitude!-latitude);
   const dlon=rad(h.longitude!-longitude);
   const a=Math.sin(dlat/2)**2+
    Math.cos(rad(latitude))*Math.cos(rad(h.latitude!))*
    Math.sin(dlon/2)**2;
   const distance=6371*2*Math.atan2(
    Math.sqrt(a),Math.sqrt(Math.max(0,1-a))
   );

   if(distance<=0.001 || distance>15)return [];

   return h.intervals.filter(i=>
    typeof i.from_m==="number" &&
    typeof i.to_m==="number" &&
    i.from_m<=depthM &&
    depthM<i.to_m &&
    !i.interval_status &&
    (
     i.evidence_level==="borehole_exact" ||
     i.evidence_level==="documented_borehole_log"
    ) &&
    typeof i.material_bg==="string" &&
    i.material_bg.trim().length>0
   ).map(i=>({
    material:i.material_bg.trim(),
    source_ids:i.source_ids,
    borehole_id:h.id,
    distance_km:distance
   }));
  })
  .sort((a,b)=>
   a.distance_km-b.distance_km ||
   a.borehole_id.localeCompare(b.borehole_id)
  );

 return nearby[0]??null;
}

// National research evidence intake — documentary records only.
export { getNationalResearchEvidenceCatalog } from "./sondi-national-research-evidence";
