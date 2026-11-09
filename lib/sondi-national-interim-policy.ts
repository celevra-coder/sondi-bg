import "server-only";
import fs from "node:fs";
import path from "node:path";
import {getNationalBoreholeIndex} from "./sondi-national-borehole-index";
import {getGeologyAtLocation} from "./geology-location";
import {getMappedGemFaultsBetweenPoints} from "./fault-spatial-profile";
import type {NationalDepthInput, NationalDepthResult} from "./sondi-national-depth-engine";

// National interim methodology: 2 km is an eligibility ceiling for precise,
// documented depth observations, NEVER proof of a shared lithological boundary.
export type LocatedDepthEvidence = {
  id: string;
  kind: "BOREHOLE" | "WELL" | "GEOLOGICAL_SECTION" | "DOCUMENTED_DEPTH_STUDY";
  latitude: number;
  longitude: number;
  coordinate_proof: "OFFICIAL_EXACT" | "SURVEYED" | "VERIFIED_GEOREFERENCE";
  from_m: number;
  to_m: number;
  material_bg: string;
  source_ids: string[];
  independent_source_id: string;
  interval_verified: boolean;
};

type SiteObservation = LocatedDepthEvidence & {distance_km: number; mapped_comparison: "SAME" | "DIFFERENT" | "UNKNOWN"};
const EARTH = 6371.0088;
function km(a:number,b:number,c:number,d:number):number {
  const rad = Math.PI/180, x=(c-a)*rad, y=(d-b)*rad;
  const h=Math.sin(x/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(y/2)**2;
  return 2*EARTH*Math.asin(Math.min(1,Math.sqrt(h)));
}
function validEvidence(e:LocatedDepthEvidence):boolean {
  return Boolean(e.id && e.independent_source_id && Array.isArray(e.source_ids) && e.source_ids.length && typeof e.material_bg==="string" && e.material_bg.trim() &&
    Number.isFinite(e.latitude) && e.latitude>=40 && e.latitude<=45 &&
    Number.isFinite(e.longitude) && e.longitude>=20 && e.longitude<=30 &&
    Number.isFinite(e.from_m) && Number.isFinite(e.to_m) &&
    e.from_m>=0 && e.to_m>e.from_m && e.interval_verified);
}
function mappedCode(v:ReturnType<typeof getGeologyAtLocation> | null):string|null {
  return v?.status === "DIRECT" && typeof v.unit?.code === "string" && v.unit.code.trim() ? v.unit.code : null;
}
function curatedLocatedEvidence(): LocatedDepthEvidence[] {
  // Exact well / geological-section / study records must be explicitly reviewed and
  // written to this shared national registry. No silent promotion of research files.
  const file=path.join(process.cwd(),"data","soil-lithology","national_verified_depth_sources.json");
  if(!fs.existsSync(file))return [];
  try {
    const parsed:unknown=JSON.parse(fs.readFileSync(file,"utf8"));
    if(!Array.isArray(parsed))return [];
    return parsed.filter((x):x is LocatedDepthEvidence=>Boolean(x && typeof x==="object" &&
      ["WELL","GEOLOGICAL_SECTION","DOCUMENTED_DEPTH_STUDY","BOREHOLE"].includes((x as LocatedDepthEvidence).kind) &&
      ["OFFICIAL_EXACT","SURVEYED","VERIFIED_GEOREFERENCE"].includes((x as LocatedDepthEvidence).coordinate_proof) &&
      validEvidence(x as LocatedDepthEvidence)));
  } catch { return []; }
}
function boreholeEvidence(): LocatedDepthEvidence[] {
  const out:LocatedDepthEvidence[]=[];
  for(const h of getNationalBoreholeIndex()) {
    // REGIONAL_DOCUMENTED is valuable regional evidence but NOT a surveyed mouth.
    if(h.coordinate_status!=="OFFICIAL_EXACT" || h.latitude===null || h.longitude===null) continue;
    for(const [i,x] of h.intervals.entries()) {
      if(x.from_m===null || x.to_m===null || x.interval_status!==null ||
        !["borehole_exact","documented_borehole_log"].includes(x.evidence_level??"")) continue;
      out.push({id:`${h.id}:${i}`,kind:"BOREHOLE",latitude:h.latitude,longitude:h.longitude,
        coordinate_proof:"OFFICIAL_EXACT",from_m:x.from_m,to_m:x.to_m,
        material_bg:x.material_bg, source_ids:x.source_ids,
        independent_source_id:h.id,interval_verified:true});
    }
  }
  return out;
}

/**
 * Provisional national rule. A window is the overlap of documented reference
 * observations, NOT a mapped subsurface contact under the selected point.
 * Two independent proven-position sources must agree, and no eligible source
 * at that depth may show a conflicting lithological family.
 */
export type NationalConditionalDepthWindow = {
  from_m: number;
  to_m: number;
  material: string;
  source_ids: string[];
  reference_ids: string[];
  independent_controls: number;
  evidence_kinds: LocatedDepthEvidence["kind"][];
  map_comparison: "DIRECT_CONFIRMED" | "MAP_UNKNOWN";
  contact_depths_proven_at_site: false;
  confidence: "LOW";
  scope: "CONDITIONAL_REFERENCE_SUPPORTED_WINDOW";
};

function lithologicalFamily(value:string):string|null {
  const text=value.toLocaleLowerCase("bg-BG");
  // Avoid promoting composite/ambiguous logs, or mistaking clasts for basement.
  if (!text.trim() || /(?:алтернаци|редуван|прослойки|преминава|неопредел|неизвестн)/u.test(text)) return null;
  if (/(?:алувиал|делувиал|кватернерни|наноси|валуни|чакъл)/u.test(text)) return "UNCONSOLIDATED";
  if (/гнайс/u.test(text)) return "GNEISS";
  if (/амфиболит/u.test(text)) return "AMPHIBOLITE";
  if (/гранит/u.test(text)) return "GRANITE";
  if (/варовик|варовици/u.test(text)) return "LIMESTONE";
  if (/мергел/u.test(text)) return "MARL";
  if (/аргилит/u.test(text)) return "ARGILLITE";
  if (/глин/u.test(text)) return "CLAY";
  if (/пясъчник/u.test(text)) return "SANDSTONE";
  if (/пясък|пясъци/u.test(text)) return "SAND";
  return null;
}
const familyLabels:Record<string,string>={
  UNCONSOLIDATED:"Несвързани алувиални или делувиални наслаги",
  GNEISS:"Гнайси (с променлива степен на напукване и изветряне)",
  AMPHIBOLITE:"Амфиболити",GRANITE:"Гранитни скали",
  LIMESTONE:"Варовици",MARL:"Мергели",ARGILLITE:"Аргилити",
  CLAY:"Глини",SANDSTONE:"Пясъчници",SAND:"Пясъци"
};
export function getNationalInterimConditionalWindows(latitude:number,longitude:number):NationalConditionalDepthWindow[] {
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<40||latitude>45||longitude<20||longitude>30)return [];
  const targetCode=mappedCode(getGeologyAtLocation(latitude,longitude));
  const obs=[...boreholeEvidence(),...curatedLocatedEvidence()]
    .filter(validEvidence)
    .map(e=>({e,d:km(latitude,longitude,e.latitude,e.longitude),code:mappedCode(getGeologyAtLocation(e.latitude,e.longitude))}))
    .filter(x=>x.d<=2 && x.d>0.001)
    .filter(x=>!(targetCode&&x.code&&targetCode!==x.code))
    .filter(x=>{
      const fault=getMappedGemFaultsBetweenPoints(latitude,longitude,x.e.latitude,x.e.longitude);
      // Absence of a mapped intersection is NOT proof of tectonic continuity.
      return Boolean(fault && !fault.intersects_mapped_gem_fault);
    });
  if(obs.length<2)return [];
  const edges=[...new Set(obs.flatMap(x=>[x.e.from_m,x.e.to_m]))].sort((a,b)=>a-b);
  const windows:NationalConditionalDepthWindow[]=[];
  for(let i=0;i<edges.length-1;i++){
    const from=edges[i],to=edges[i+1],mid=(from+to)/2;
    if(to<=from)continue;
    const active=obs.filter(x=>x.e.from_m<=mid&&mid<x.e.to_m);
    const sources=new Map<string,typeof active>();
    for(const x of active){
      const id=x.e.independent_source_id;
      const old=sources.get(id)??[];
      old.push(x);sources.set(id,old);
    }
    if(sources.size<2)continue;
    // One source with overlapping conflicting logs makes this depth unresolved.
    const representatives=([...sources.values()]).map(v=>{
      const families=[...new Set(v.map(x=>lithologicalFamily(x.e.material_bg)))];
      return families.length===1?{family:families[0],value:v[0]}:null;
    });
    if(representatives.some(x=>!x||!x.family))continue;
    const usable=representatives.filter((x):x is {family:string;value:(typeof active)[number]}=>Boolean(x&&x.family));
    if(usable.length<2||new Set(usable.map(x=>x.family)).size!==1)continue;
    // If known DIRECT reference units disagree, do not manufacture correlation.
    const codes=[...new Set(usable.map(x=>x.value.code).filter((x):x is string=>Boolean(x)))];
    if(codes.length>1)continue;
    const family=usable[0].family;
    const source_ids=[...new Set(active.flatMap(x=>x.e.source_ids))];
    const reference_ids=[...sources.keys()];
    const kinds=[...new Set(active.map(x=>x.e.kind))];
    const map_comparison:NationalConditionalDepthWindow["map_comparison"]=targetCode&&codes.length===1&&codes[0]===targetCode&&usable.every(x=>x.value.code===targetCode)?"DIRECT_CONFIRMED":"MAP_UNKNOWN";
    const prev=windows[windows.length-1];
    if(prev && prev.to_m===from && prev.material===familyLabels[family] && prev.map_comparison===map_comparison){
      // Merge contiguous supported windows; retain only sources independently
      // supporting the entire merged extent (otherwise do not merge).
      const common=prev.reference_ids.filter(id=>reference_ids.includes(id));
      if(common.length>=2){
        prev.to_m=to;
        prev.reference_ids=common;
        prev.independent_controls=common.length;
        prev.source_ids=[...new Set([...prev.source_ids,...source_ids])];
        prev.evidence_kinds=[...new Set([...prev.evidence_kinds,...kinds])];
        continue;
      }
    }
    windows.push({from_m:from,to_m:to,material:familyLabels[family],
      source_ids,reference_ids,independent_controls:reference_ids.length,evidence_kinds:kinds,
      map_comparison,contact_depths_proven_at_site:false,confidence:"LOW",scope:"CONDITIONAL_REFERENCE_SUPPORTED_WINDOW"});
  }
  return windows;
}

export type InterimNationalResult = {
  methodology: "NATIONAL_INTERIM_2KM";
  baseline: NationalDepthResult;
  baseline_unchanged: true;
  target: {latitude:number; longitude:number; depth_m:number};
  evidence_used: SiteObservation[];
  corroborated_materials: Array<{material_bg:string; independent_controls:number; source_ids:string[]; common_reference_interval_m:[number,number]|null}>;
  material_scope: "DOCUMENTED_AT_TARGET" | "CONDITIONAL_NEARBY_REFERENCE" | "REGIONAL_LOCAL_CONTEXT";
  site_depth_interval_authorized: false;
  site_contacts_proven: false;
  conditional_depth_windows: NationalConditionalDepthWindow[];
  map_status: string;
  local_regional_context: Array<{id:string; distance_km:number|null; material_bg:string; scope:"NEARBY_REFERENCE"|"UNLOCATED_REGIONAL"}>;
  warnings: string[];
};
export function resolveNationalInterimPolicy(
  input:NationalDepthInput, baseline:NationalDepthResult,
  additionalEvidence:readonly LocatedDepthEvidence[]=[]
):InterimNationalResult {
  const target={latitude:input.latitude,longitude:input.longitude,depth_m:input.depthM};
  const valid=Number.isFinite(input.latitude)&&Number.isFinite(input.longitude)&&Number.isFinite(input.depthM)&&
    input.latitude>=40&&input.latitude<=45&&input.longitude>=20&&input.longitude<=30&&input.depthM>=0;
  const targetMap=valid?getGeologyAtLocation(input.latitude,input.longitude):null;
  const targetCode=mappedCode(targetMap);
  const all=valid?[...boreholeEvidence(),...curatedLocatedEvidence(),...additionalEvidence.filter(validEvidence)]:[];
  const evidence_used:SiteObservation[]=all.filter(e=>validEvidence(e)&&e.from_m<=input.depthM&&input.depthM<e.to_m)
    .map(e=>{
      const distance_km=km(input.latitude,input.longitude,e.latitude,e.longitude);
      const c=mappedCode(getGeologyAtLocation(e.latitude,e.longitude));
      const mapped_comparison:SiteObservation["mapped_comparison"]=targetCode&&c?(targetCode===c?"SAME":"DIFFERENT"):"UNKNOWN";
      return {...e,distance_km,mapped_comparison};
    }).filter(e=>e.distance_km<=2).sort((a,b)=>a.distance_km-b.distance_km);
  // Evidence of a different DIRECT geological unit cannot support the target analogue.
  const eligible=evidence_used.filter(e=>e.mapped_comparison!=="DIFFERENT");
  const groups=new Map<string,SiteObservation[]>();
  for(const e of eligible){ const key=e.material_bg.trim().toLocaleLowerCase("bg"); groups.set(key,[...(groups.get(key)??[]),e]); }
  const corroborated_materials=[...groups.values()].map(g=>{
    const controls=new Map<string,SiteObservation>();
    for(const e of g) {
      const key=`${e.independent_source_id}|${e.latitude.toFixed(7)}:${e.longitude.toFixed(7)}`;
      if(!controls.has(key))controls.set(key,e);
    }
    const items=[...controls.values()];
    return {material_bg:g[0].material_bg,independent_controls:items.length,
      source_ids:[...new Set(g.flatMap(e=>e.source_ids))],
      common_reference_interval_m:items.length>=2&&Math.max(...items.map(e=>e.from_m))<Math.min(...items.map(e=>e.to_m))
        ?[Math.max(...items.map(e=>e.from_m)),Math.min(...items.map(e=>e.to_m))] as [number,number]:null};
  }).sort((a,b)=>b.independent_controls-a.independent_controls);
  // Local context MUST NOT silently fall back to the eight nearest NATIONAL
  // records. A 55–80 km reference is not "nearby" at an arbitrary point.
  // Regional-documentation coordinates are useful for locality context only:
  // never present their approximate distance as a measured mouth location.
  const vicinity=valid?getNationalBoreholeIndex()
    .filter(h=>h.latitude!==null&&h.longitude!==null)
    .map(h=>({h,d:km(input.latitude,input.longitude,h.latitude!,h.longitude!)}))
    .filter(x=>x.d<=2)
    .sort((a,b)=>a.d-b.d).slice(0,8):[];
  const local_regional_context:InterimNationalResult["local_regional_context"]=vicinity.map(({h,d})=>({
    id:h.id,
    distance_km:h.coordinate_status==="OFFICIAL_EXACT"?Math.round(d*100)/100:null,
    material_bg:[...new Set(h.intervals.map(x=>x.material_bg))].filter(Boolean).slice(0,3).join("; "),
    scope:h.coordinate_status==="OFFICIAL_EXACT"?"NEARBY_REFERENCE" as const:"UNLOCATED_REGIONAL" as const
  }));
  const colocated=eligible.some(e=>e.distance_km<=0.001);
  const warnings:string[]=[];
  if(local_regional_context.length===0) warnings.push("Няма близки геореферирани сондажни наблюдения; регионалният анализ трябва да се извежда от останалите геоложки източници, без далечни сондажи да се представят като местни.");
  if(!targetCode) warnings.push("Картографската единица е непотвърдена; това не е доказано геоложко съвпадение.");
  if(evidence_used.some(e=>e.mapped_comparison==="DIFFERENT")) warnings.push("Изключени са референции с доказано различна картографска единица.");
  if(eligible.length>0) warnings.push("2 км е обхват за оценка, не доказателство за едни и същи пластови граници.");
  warnings.push("Интервалите на източниците са наблюдения в източниците, не прогнозни граници под имота.");
  return {methodology:"NATIONAL_INTERIM_2KM",baseline,baseline_unchanged:true,target,evidence_used,
    corroborated_materials,material_scope:colocated?"DOCUMENTED_AT_TARGET":eligible.length?"CONDITIONAL_NEARBY_REFERENCE":"REGIONAL_LOCAL_CONTEXT",
    site_depth_interval_authorized:false,site_contacts_proven:false,
    conditional_depth_windows:getNationalInterimConditionalWindows(input.latitude,input.longitude),
    map_status:targetMap?.status??"UNAVAILABLE",local_regional_context,warnings};
}


/**
 * Reader-facing point-specific evidence, independent from site-depth approval.
 * Nearby exact intervals are reference OBSERVATIONS, never site forecasts.
 * Regional-documentation coordinates are not displayed as measured distances.
 */
export function getNationalInterimLocalReader(latitude:number,longitude:number): {
  precise_reference_count:number;
  regional_documented_count:number;
  other_depth_source_count:number;
  paragraphs:string[];
} {
  const empty={precise_reference_count:0,regional_documented_count:0,other_depth_source_count:0,paragraphs:[] as string[]};
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<40||latitude>45||longitude<20||longitude>30)return empty;
  const near=getNationalBoreholeIndex().filter(h=>h.latitude!==null&&h.longitude!==null)
    .map(h=>({h,d:km(latitude,longitude,h.latitude!,h.longitude!)}))
    .filter(({d})=>d<=2).sort((a,b)=>a.d-b.d);
  const precise=near.filter(({h})=>h.coordinate_status==="OFFICIAL_EXACT"&&h.intervals.some(x=>
    x.interval_status===null&&x.from_m!==null&&x.to_m!==null&&x.to_m>x.from_m&&
    ["borehole_exact","documented_borehole_log"].includes(x.evidence_level??"")&&x.material_bg.trim()&&x.source_ids.length>0));
  const regional=near.filter(({h})=>h.coordinate_status==="REGIONAL_DOCUMENTED");
  const other=curatedLocatedEvidence().filter(e=>e.kind!=="BOREHOLE"&&km(latitude,longitude,e.latitude,e.longitude)<=2);
  const paragraphs:string[]=[];
  if(precise.length){
    const details=precise.slice(0,4).map(({h,d})=>{
      const types=[...new Set(h.intervals.filter(x=>x.interval_status===null&&x.from_m!==null&&x.to_m!==null)
        .map(x=>x.material_bg.trim()).filter(Boolean))].slice(0,2);
      return `${h.id} (около ${Math.round(d*100)/100} км): ${types.join("; ")}`;
    });
    paragraphs.push(`В близост до избраната точка (до 2 км) са налични ${precise.length} сондажни колонки с проверени координати и документирани дълбочинни наблюдения. Примери: ${details.join(". ")}. Това са данни от съседни обекти, а не доказани пластове и контакти под избраните координати.`);
  }
  if(other.length){
    const kind:Record<LocatedDepthEvidence["kind"],string>={BOREHOLE:"сондаж",WELL:"кладенец",GEOLOGICAL_SECTION:"геоложки разрез",DOCUMENTED_DEPTH_STUDY:"дълбочинно изследване"};
    const byKind=[...new Set(other.map(x=>kind[x.kind]))];
    paragraphs.push(`В рамките на 2 км има и ${other.length} проверени геореферирани интервала от ${byKind.join(", ")}. Те участват като допълнителни наблюдения; точните им граници не се пренасят автоматично към избрания терен.`);
  }
  if(regional.length){
    const sampled=regional.slice(0,4).map(({h})=>h.id);
    paragraphs.push(`За района са документирани ${regional.length} допълнителни сондажни колонки с ориентировъчно местоположение (${sampled.join(", ")}). Те се използват единствено като регионален геоложки контекст, без да се посочва точна дистанция или да се пренасят техните дълбочини под имота.`);
  }
  return {precise_reference_count:precise.length,regional_documented_count:regional.length,
    other_depth_source_count:other.length,paragraphs};
}
