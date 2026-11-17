/**
 * SONDI_LUNA_INDEPENDENT_EVIDENCE_V16
 * National independent geological evidence assessment.
 *
 * Research-only evidence is not authorization for numeric depth.
 * A mapped surface unit is not a measured subsurface boundary.
 */

type ContactEvidence = {
  upper_stratigraphy?: unknown;
  lower_stratigraphy?: unknown;
  documented_depth_range_m?: unknown;
  estimated_depth_m?: unknown;
  control_borehole_ids?: unknown;
  controls?: unknown;
  source_ids?: unknown;
  geological_block_verified?: unknown;
  depth_prediction_approved?: unknown;
  research_only?: unknown;
};

type SurfaceZone = {
  code?: unknown;
  original_description?: unknown;
};

export function evaluateIndependentEvidenceV16(input: {
  mappedUnit: string | null;
  mappedStatus: string;
  documentedContacts: ContactEvidence[];
  spatialContacts: ContactEvidence[];
  surfaceZones: SurfaceZone[];
}) {
  const documented=input.documentedContacts.map(c=>({
    upper_stratigraphy:c.upper_stratigraphy??null,
    lower_stratigraphy:c.lower_stratigraphy??null,
    documented_depth_range_m:c.documented_depth_range_m??null,
    source_ids:Array.isArray(c.source_ids)?c.source_ids:[],
    control_count:Array.isArray(c.controls)?c.controls.length:0,
    target_depth_verified:false,
    independent_projection_authorized:false,
    scope:"NEARBY_MEASURED_REFERENCE"
  }));

  const projected=input.spatialContacts.map(c=>({
    upper_stratigraphy:c.upper_stratigraphy??null,
    lower_stratigraphy:c.lower_stratigraphy??null,
    estimated_depth_m:c.estimated_depth_m??null,
    documented_depth_range_m:c.documented_depth_range_m??null,
    source_ids:Array.isArray(c.source_ids)?c.source_ids:[],
    control_borehole_ids:Array.isArray(c.control_borehole_ids)
      ?c.control_borehole_ids:[],
    geological_block_verified:c.geological_block_verified===true,
    depth_prediction_approved:c.depth_prediction_approved===true,
    research_only:c.research_only!==false,
    scope:"EXPLORATORY_SPATIAL_CONTACT"
  }));

  const eligible=projected.filter(c=>
    c.geological_block_verified &&
    c.depth_prediction_approved &&
    !c.research_only &&
    typeof c.estimated_depth_m==="number" &&
    Number.isFinite(c.estimated_depth_m)
  );

  return {
    version:"SONDI_LUNA_INDEPENDENT_EVIDENCE_V16",
    coordinate_scope:"TARGET_LOCATION",
    mapped_geological_unit:input.mappedUnit,
    mapped_geology_status:input.mappedStatus,
    mapped_engineering_zones:input.surfaceZones.map(z=>({
      code:z.code??null,
      description:z.original_description??null,
      vertical_boundary_measured:false
    })),
    documented_reference_contacts:documented,
    spatial_contact_hypotheses:projected,
    scientific_readiness:{
      documented_reference_count:documented.length,
      exploratory_contact_count:projected.length,
      mapped_surface_zone_count:input.surfaceZones.length,
      independently_approved_contact_count:eligible.length,
      numeric_depth_proof_available:eligible.length>0
    },
    interpretation_rules:[
      "Evaluate geology, stratigraphy and structural continuity together.",
      "Measured reference contacts are not automatically target contacts.",
      "Surface units alone do not establish numerical layer depths.",
      "Research-only spatial estimates are hypotheses, not approved depths.",
      "A numerical projection needs spatially applicable vertical evidence.",
      "Do not infer an aquifer solely from a lithological name.",
      "Return REGIONAL when defensible numerical depth evidence is absent."
    ]
  };
}

// SONDI_LUNA_INDEPENDENT_VALIDATION_V16_3
// Optional alternative to borehole-interval matching.
// This path requires TWO independently approved stratigraphic
// boundaries that bracket the proposed geological interval.
export function validateIndependentWindowV163(
  window:{
    from_m:number;
    to_m:number;
    material:string; stratigraphy?:string;
    source_ids:string[];
  },
  evidence:unknown
):boolean {
  if(!evidence || typeof evidence!=="object")return false;

  const root=evidence as Record<string,unknown>;

  if(!Array.isArray(root.spatial_contact_hypotheses)){
    return false;
  }

  const contacts=root.spatial_contact_hypotheses
    .filter((value):value is Record<string,unknown>=>
      !!value && typeof value==="object" &&
      !Array.isArray(value))
    .filter(c=>{
      const d=c.estimated_depth_m;
      const range=c.documented_depth_range_m;
      const holes=c.control_borehole_ids;
      const sources=c.source_ids;

      return c.geological_block_verified===true &&
        c.depth_prediction_approved===true &&
        c.research_only===false &&
        typeof d==="number" &&
        Number.isFinite(d) &&
        d>=0 &&
        Array.isArray(range) &&
        range.length===2 &&
        range.every(x=>typeof x==="number"&&
          Number.isFinite(x)) &&
        range[0]<=d && d<=range[1] &&
        Array.isArray(holes) &&
        new Set(holes.filter(x=>typeof x==="string"&&x.length>0))
          .size>=2 &&
        Array.isArray(sources) &&
        sources.some(id=>typeof id==="string" &&
          window.source_ids.includes(id));
    });

  const normalize=(v:unknown)=>
    typeof v==="string"
      ?v.trim().toLocaleLowerCase("bg-BG")
      :"";

  const material=normalize(window.stratigraphy);

  if(!material || !Number.isFinite(window.from_m) ||
     !Number.isFinite(window.to_m) ||
     window.from_m<0 || window.to_m<=window.from_m){
    return false;
  }

  // SONDI_LUNA_LITHOLOGY_PROOF_V16_6
  // Independent stratigraphic contacts do not identify lithology.
  // Accept only separate, server-provided, verified lithology support.
  const lithology=normalize(window.material);
  const stratigraphy=normalize(window.stratigraphy);

  const proofs=Array.isArray(root.verified_lithology_support)
    ?root.verified_lithology_support:[];

  const lithologySupported=proofs.some(value=>{
    if(!value||typeof value!=="object"||
       Array.isArray(value))return false;

    const p=value as Record<string,unknown>;
    const from=p.from_m;
    const to=p.to_m;

    if(p.verification_status!=="VERIFIED" ||
       p.target_applicability_verified!==true ||
       p.structural_continuity_verified!==true ||
       p.numeric_depth_approved!==true ||
       normalize(p.material)!==lithology ||
       normalize(p.stratigraphy)!==stratigraphy ||
       typeof from!=="number" ||
       typeof to!=="number" ||
       !Number.isFinite(from) ||
       !Number.isFinite(to) ||
       from<0 || to<=from ||
       from>window.from_m ||
       to<window.to_m ||
       !Array.isArray(p.source_ids))return false;

    const sources=p.source_ids.filter(
      (x):x is string=>
        typeof x==="string"&&x.trim().length>0
    );

    return sources.length>0 &&
      sources.some(id=>window.source_ids.includes(id));
  });

  if(!lithology || !stratigraphy || !lithologySupported){
    return false;
  }
  // A proposed layer can be a subset of a verified interval.
  // The upper contact must bound the same stratigraphic unit
  // that the lower contact terminates.
  for(const upper of contacts){
    const top=upper.estimated_depth_m as number;

    if(top>window.from_m ||
       normalize(upper.lower_stratigraphy)!==material){
      continue;
    }

    for(const lower of contacts){
      if(lower===upper)continue; // SONDI_LUNA_STRATIGRAPHY_VALIDATION_V16_4

      const bottom=lower.estimated_depth_m as number;

      if(bottom<window.to_m || bottom<=top ||
         normalize(lower.upper_stratigraphy)!==material){
        continue;
      }

      const upperSources=Array.isArray(upper.source_ids)
        ?upper.source_ids.filter((x):x is string=>typeof x==="string"):[];
      const lowerSources=Array.isArray(lower.source_ids)
        ?lower.source_ids.filter((x):x is string=>typeof x==="string"):[];

      const citedUpper=upperSources.some(id=>
        window.source_ids.includes(id));
      const citedLower=lowerSources.some(id=>
        window.source_ids.includes(id));

      if(!citedUpper || !citedLower)continue;
      if(normalize(upper.upper_stratigraphy)===
         normalize(upper.lower_stratigraphy))continue;
      if(normalize(lower.upper_stratigraphy)===
         normalize(lower.lower_stratigraphy))continue;

      return true;
    }
  }

  return false;
}