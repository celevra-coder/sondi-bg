import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import { assessNationalSpatialCorrelation } from "./sondi-national-spatial-correlation";

/** Local, leave-one-borehole-out control. Never used as a depth approval gate. */
export function validateNationalObservedContact(latitude: number, longitude: number) {
  const spatial = assessNationalSpatialCorrelation(latitude, longitude);
  const holes = new Map(getNationalBoreholeIndex().map(h => [h.id, h]));
  const observations = spatial.pair_checks.flatMap(p => {
    const marker = p.first_fractured_gneiss;
    const hole = holes.get(p.borehole_id);
    if (!marker || typeof marker.first_observed_fractured_gneiss_m !== "number" ||
        marker.transition_bracket_m !== null ||
        !hole || hole.coordinate_status !== "OFFICIAL_EXACT" ||
        typeof hole.latitude !== "number" || typeof hole.longitude !== "number") return [];
    return [{ id:p.borehole_id, lat:hole.latitude, lon:hole.longitude,
      depth:marker.first_observed_fractured_gneiss_m }];
  });
  const earthRadiusKm = 6371;
  function distanceKm(a:{lat:number;lon:number},b:{lat:number;lon:number}) {
    const rad=Math.PI/180, dLat=(a.lat-b.lat)*rad, dLon=(a.lon-b.lon)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
    return 2*earthRadiusKm*Math.asin(Math.min(1,Math.sqrt(x)));
  }
  // This is a leave-one-out *diagnostic*, not geological interpolation.
  const validation = observations.map(target => {
    const donors=observations.filter(o=>o.id!==target.id);
    if (!donors.length) return {borehole_id:target.id, observed_m:target.depth,
      estimated_from_other_logs_m:null as number|null, absolute_error_m:null as number|null,
      donor_count:0};
    let sum=0, weights=0;
    for(const d of donors){
      const km=Math.max(distanceKm(target,d),0.001);
      const weight=1/(km*km);
      sum+=d.depth*weight; weights+=weight;
    }
    const estimated=Math.round(sum/weights*100)/100;
    return {borehole_id:target.id, observed_m:target.depth,
      estimated_from_other_logs_m:estimated, absolute_error_m:Math.round(Math.abs(target.depth-estimated)*100)/100,
      donor_count:donors.length};
  });
  const valid=validation.filter(v=>v.absolute_error_m!==null);
  const errors=valid.map(v=>v.absolute_error_m as number);
  return {
    observed_contacts:observations.length,
    leave_one_out:validation,
    mean_abs_error_m:errors.length?Math.round(errors.reduce((a,b)=>a+b,0)/errors.length*100)/100:null,
    max_abs_error_m:errors.length?Math.max(...errors):null,
    mapped_geology_status:spatial.target.mapped_status,
    structural_continuity:spatial.structural_continuity,
    observed_contact_is_site_prediction:false as const,
    approved_site_depth_interval:false as const,
    method:"INVERSE_DISTANCE_SQUARED_LEAVE_ONE_OUT_DIAGNOSTIC_ONLY" as const,
    caution:"LOO валидира само сходство между документирани сондажи. Не установява структурна непрекъснатост, коти, водни хоризонти или дълбочина под имота.",
  };
}
