
import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import {
  getNationalResearchEvidenceCatalog,
  type NationalResearchEvidence
} from "./sondi-national-research-evidence";

export type NationalScopedResearch = {
  documentary_borehole_references: Array<{
    intake_id: string;
    borehole_id: string;
    source_file: string;
    json_pointer: string;
    source_ids: string[];
    usage: "DOCUMENTARY_REFERENCE_ONLY";
  }>;
  matched_point_references: NationalResearchEvidence[];
  unlocated_context_count: number;
  research_only_count: number;
  depth_prediction_authorized: false;
};

function validCoordinates(lat:number,lon:number):boolean {
 return Number.isFinite(lat) && Number.isFinite(lon) &&
   lat>=-90 && lat<=90 && lon>=-180 && lon<=180;
}

/**
 * National, source-grounded spatial applicability gate.
 * An administrative reference is NEVER geological coverage.
 * A nearby point is NEVER a validated depth model.
 */
export function resolveNationalResearchEvidenceScope(
 latitude:number,
 longitude:number
):NationalScopedResearch {
 const empty:NationalScopedResearch={
  matched_point_references:[],
  documentary_borehole_references:[],
  unlocated_context_count:0,
  research_only_count:0,
  depth_prediction_authorized:false
 };
 if(!validCoordinates(latitude,longitude))return empty;

 const catalog=getNationalResearchEvidenceCatalog();
 const matched:NationalResearchEvidence[]=[];
 let unlocated=0;
 let researchOnly=0;

 for(const evidence of catalog){
  if(evidence.intended_use==="RESEARCH_REFERENCE_ONLY"){
   researchOnly++;
   continue;
  }

  const r=evidence.record;

  // Explicit surveyed coordinate and affirmative point-evidence
  // status are both mandatory. Do not infer coordinates from names,
  // settlements, administrative identifiers or descriptions.
  const lat=r.latitude;
  const lon=r.longitude;
  const approved=
    r.is_exact_point_evidence===true &&
    r.coordinate_status==="OFFICIAL_EXACT" &&
    typeof lat==="number" &&
    typeof lon==="number" &&
    validCoordinates(lat,lon);

  if(!approved){
   unlocated++;
   continue;
  }

  const rad=(v:number)=>v*Math.PI/180;
  const dLat=rad(lat-latitude);
  const dLon=rad(lon-longitude);
  const a=Math.sin(dLat/2)**2+
    Math.cos(rad(latitude))*Math.cos(rad(lat))*
    Math.sin(dLon/2)**2;
  const d=6371*2*Math.atan2(
    Math.sqrt(a),Math.sqrt(Math.max(0,1-a))
  );

  // Coordinate coincidence only. No extrapolation.
  if(d<=0.001)matched.push(evidence);
 }

 return {
  matched_point_references:matched,
  documentary_borehole_references:
    findDocumentaryBoreholeReferences(latitude,longitude),
  unlocated_context_count:unlocated,
  research_only_count:researchOnly,
  depth_prediction_authorized:false
 };
}


function findDocumentaryBoreholeReferences(
 latitude:number,longitude:number
): NationalScopedResearch["documentary_borehole_references"] {
 const exactIds=new Set<string>();
 const rad=(x:number)=>x*Math.PI/180;

 for(const hole of getNationalBoreholeIndex()){
  if(hole.coordinate_status!=="OFFICIAL_EXACT" ||
     hole.latitude===null || hole.longitude===null)continue;

  const dLat=rad(hole.latitude-latitude);
  const dLon=rad(hole.longitude-longitude);
  const a=Math.sin(dLat/2)**2+
   Math.cos(rad(latitude))*Math.cos(rad(hole.latitude))*
   Math.sin(dLon/2)**2;
  const km=6371*2*Math.atan2(
   Math.sqrt(a),Math.sqrt(Math.max(0,1-a))
  );

  // Documentary linkage only at the surveyed borehole coordinate.
  if(km<=0.001)exactIds.add(hole.id);
 }
 if(!exactIds.size)return [];

 const result:NationalScopedResearch["documentary_borehole_references"]=[];
 const seen=new Set<string>();

 for(const evidence of getNationalResearchEvidenceCatalog()){
  const r=evidence.record;
  const ids=[
   r.borehole_id,r.national_id,r.record_id,r.id
  ].filter((v):v is string=>typeof v==="string");
  const matched=ids.find(id=>exactIds.has(id));
  if(!matched)continue;

  const key=evidence.intake_id+":"+matched;
  if(seen.has(key))continue;
  seen.add(key);

  result.push({
   intake_id:evidence.intake_id,
   borehole_id:matched,
   source_file:evidence.source_file,
   json_pointer:evidence.json_pointer,
   source_ids:[...evidence.source_ids],
   usage:"DOCUMENTARY_REFERENCE_ONLY"
  });
 }
 return result;
}
