import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import { assessNationalSequenceCorrelation } from "./sondi-national-sequence-correlation";

/** Local research-only contact semantics. Not a site-depth prediction. */
type ContactKind = "COVER_TO_CRYSTALLINE" | "WEATHERED_GNEISS_TO_FRACTURED_GNEISS" | "FRACTURED_GNEISS_TO_COMPACT_GNEISS";
type Contact = {
  borehole_id: string;
  kind: ContactKind;
  interval_from_m: number;
  interval_to_m: number;
  observed_boundary_m: number | null;
  bracket_m: [number, number] | null;
  description_before: string;
  description_after: string;
  source_ids: string[];
  coordinate_status: string;
  distance_km: number;
  quality: "OBSERVED_ADJACENT_CONTACT" | "BRACKETED_UNKNOWN_CONTACT";
};
function isGneiss(s:string) { return /гнайс|gneiss/iu.test(s); }
function isWeathered(s:string) { return isGneiss(s) && /изветр|weather/iu.test(s); }
function isFractured(s:string) { return isGneiss(s) && /напукан|раздроб|fractur/iu.test(s); }
function isCompact(s:string) { return isGneiss(s) && /плътен|ненапукан|massive|compact|unfractur/iu.test(s); }
function isCover(s:string) {
  // Unconsolidated deposits containing gneiss clasts remain COVER, not bedrock.
  // Explicit depositional labels outrank incidental fragments of crystalline rock.
  if (/алуви|делуви|кватернер|валун|чакъл|alluv|diluv|quatern|boulder|gravel/iu.test(s)) return true;
  // Sandstone is lithified rock, not loose sand / superficial cover.
  if (/пясъчниц|sandstone/iu.test(s)) return false;
  if (isGneiss(s)) return false;
  return /пясък|пясъци|песъчлив|глин|sand|clay/iu.test(s);
}
function kinds(a:string,b:string):ContactKind[] {
  const result:ContactKind[]=[];
  if (isCover(a) && isGneiss(b)) result.push("COVER_TO_CRYSTALLINE");
  if (isWeathered(a) && isFractured(b) && !isWeathered(b)) result.push("WEATHERED_GNEISS_TO_FRACTURED_GNEISS");
  if (isFractured(a) && isCompact(b)) result.push("FRACTURED_GNEISS_TO_COMPACT_GNEISS");
  return result;
}
function haversine(a:number,b:number,c:number,d:number) {
  const r=Math.PI/180, dl=(c-a)*r, dn=(d-b)*r;
  const h=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dn/2)**2;
  return 12742*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
/** Only contacts of the SAME independently described type may enter LOO checks. */
export function validateNationalContactTypes(latitude:number,longitude:number) {
  const seq=assessNationalSequenceCorrelation(latitude,longitude,[]);
  const byId=new Map(getNationalBoreholeIndex().map(x=>[x.id,x]));
  const local=seq.boreholes.filter(x=>x.diagnostic_group==="LOCAL_DISTANCE_CLUSTER");
  const contacts:Contact[]=[];
  for (const log of local) {
    const intervals=[...log.documented_intervals].sort((a,b)=>(a.from_m??0)-(b.from_m??0));
    for(let i=1;i<intervals.length;i++) {
      const before=intervals[i-1],after=intervals[i];
      if (before.to_m===null || after.from_m===null || before.from_m===null || after.to_m===null) continue;
      const difference=after.from_m-before.to_m;
      // Negative overlaps: not a resolved unique contact. A positive gap is bracketed, never an exact boundary.
      if (difference < -0.000001) continue;
      for (const kind of kinds(before.material,after.material)) {
        contacts.push({borehole_id:log.borehole_id,kind,interval_from_m:before.to_m,
          interval_to_m:after.from_m,observed_boundary_m:Math.abs(difference)<0.000001?after.from_m:null,
          bracket_m:difference>0?[before.to_m,after.from_m]:null,
          description_before:before.material,description_after:after.material,
          source_ids:[...new Set([...before.source_ids,...after.source_ids])],
          coordinate_status:log.coordinate_status ?? "UNKNOWN",distance_km:log.distance_km,
          quality:difference>0?"BRACKETED_UNKNOWN_CONTACT":"OBSERVED_ADJACENT_CONTACT"});
      }
    }
  }
  const categories:ContactKind[]=["COVER_TO_CRYSTALLINE","WEATHERED_GNEISS_TO_FRACTURED_GNEISS","FRACTURED_GNEISS_TO_COMPACT_GNEISS"];
  const validation=categories.map(kind=>{
    const records=contacts.filter(c=>c.kind===kind);
    const observations=records.filter(c=>c.observed_boundary_m!==null && c.coordinate_status==="OFFICIAL_EXACT");
    const leave_one_out=observations.map(o=>{
      const target=byId.get(o.borehole_id);
      const donors=observations.filter(x=>x.borehole_id!==o.borehole_id).flatMap(x=>{
        const h=byId.get(x.borehole_id);
        return h && typeof h.latitude==="number" && typeof h.longitude==="number" ? [{x,h}]:[];
      });
      if (!target || typeof target.latitude!=="number" || typeof target.longitude!=="number" || donors.length<2) return {borehole_id:o.borehole_id,observed_m:o.observed_boundary_m,estimated_m:null as number|null,
        error_m:null as number|null,donors:donors.length,assessment:"INSUFFICIENT_SAME_TYPE_DONORS" as const};
      let weighted=0,total=0;
      for(const {x,h} of donors){
        const km=Math.max(haversine(target.latitude!,target.longitude!,h.latitude!,h.longitude!),0.001);
        const weight=1/(km*km);weighted+=(x.observed_boundary_m as number)*weight;total+=weight;
      }
      const estimate=Math.round(weighted/total*100)/100;
      return {borehole_id:o.borehole_id,observed_m:o.observed_boundary_m,estimated_m:estimate,
        error_m:Math.round(Math.abs((o.observed_boundary_m as number)-estimate)*100)/100,donors:donors.length,
        assessment:"DESCRIPTIVE_SAME_TYPE_LOO_ONLY" as const};
    });
    const values=leave_one_out.map(x=>x.error_m).filter((x):x is number=>x!==null);
    return {kind,observed_adjacent_contacts:observations.length,bracketed_contacts:records.filter(c=>c.bracket_m!==null).length,
      mean_abs_error_m:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*100)/100:null,
      max_error_m:values.length?Math.max(...values):null,leave_one_out};
  });
  return {
    target:{latitude,longitude},local_references:local.length,
    contacts,contact_type_validations:validation,
    method:"EXPLICIT_CONTACT_SEMANTICS_AND_SAME_TYPE_LEAVE_ONE_OUT" as const,
    reference_contacts_are_site_prediction:false as const,
    structural_continuity_established:false as const,
    site_material_approved:false as const,
    site_depth_intervals_approved:false as const,
    limitations:"Изследователска класификация на контактите. Алувиалните наслаги с гнайсови късове не са гнайсова основа; пясъчникът не е рохкав пясък. Пропуски дават интервал, припокривания се изключват. Без коти, структурна корелация и независим геоложки контрол няма разрешена прогноза за имота." as const,
  };
}
