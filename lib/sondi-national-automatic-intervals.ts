import "server-only";
import { getSpatialLithologyKey } from "./sondi-lithology-semantic";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import { getGeologyAtLocation } from "./geology-location";
import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";

export type AutomaticPredictedInterval = {
  from_m: number;
  to_m: number;
  material: string;
  borehole_ids: string[];
  source_ids: string[];
  confidence: "LOW";
  scope: "CONDITIONAL_SPATIAL_INTERVAL";
  boundary_uncertainty_m: number;
};

type Column = {
  id: string;
  lat: number;
  lng: number;
  from: number;
  to: number;
  material: string;
  sources: string[];
};

function distanceKm(
  a: number,b: number,c: number,d: number
): number {
  const rad = Math.PI/180;
  const dy=(c-a)*rad, dx=(d-b)*rad;
  const h=Math.sin(dy/2)**2+
    Math.cos(a*rad)*Math.cos(c*rad)*
    Math.sin(dx/2)**2;
  return 12742.0176*Math.asin(Math.min(1,Math.sqrt(h)));
}

function independent(a:Column,b:Column):boolean {
  return distanceKm(a.lat,a.lng,b.lat,b.lng)>=0.03;
}

function insideTriangle(
  x:number,y:number,
  a:Column,b:Column,c:Column
):boolean {
  const cross=(
    x1:number,y1:number,
    x2:number,y2:number,
    x3:number,y3:number
  ) => (x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);

  const d1=cross(a.lng,a.lat,b.lng,b.lat,x,y);
  const d2=cross(b.lng,b.lat,c.lng,c.lat,x,y);
  const d3=cross(c.lng,c.lat,a.lng,a.lat,x,y);
  const area=cross(a.lng,a.lat,b.lng,b.lat,c.lng,c.lat);

  const tolerance=1e-12;
  const hasNegative=[d1,d2,d3].some(v=>v < -tolerance);
  const hasPositive=[d1,d2,d3].some(v=>v > tolerance);

  return Math.abs(area)>1e-10 &&
    !(hasNegative && hasPositive);
}

function median(values:number[]):number {
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
}

/**
 * Conservative national rule.
 *
 * A predicted interval requires three independent documented
 * columns in the same mapped geological unit, with no mapped
 * fault intersection along any target-to-column connection.
 *
 * The point must lie inside the triangle of those columns.
 * Both interval contacts must agree within the tolerance.
 *
 * Agreement is an eligibility screen, not proof of continuity.
 * Output must always be labelled conditional.
 */
export function getNationalAutomaticPredictedIntervals(
  latitude:number,
  longitude:number
):AutomaticPredictedInterval[] {
  if(!Number.isFinite(latitude) ||
     !Number.isFinite(longitude) ||
     latitude < -90 || latitude > 90 ||
     longitude < -180 || longitude > 180) return [];

  const target=getGeologyAtLocation(latitude,longitude);
  if(target.status!=="DIRECT" || !target.unit?.code)
    return [];

  const columns:Column[]=[];

  for(const hole of getNationalBoreholeIndex()) {
    if(hole.origin!=="NATIONAL" ||
       hole.coordinate_status!=="OFFICIAL_EXACT" ||
       hole.latitude===null ||
       hole.longitude===null ||
       !Number.isFinite(hole.latitude) ||
       !Number.isFinite(hole.longitude) ||
       distanceKm(latitude,longitude,
         hole.latitude,hole.longitude)>1)
      continue;

    // This function predicts only outside borehole coordinates.
    if(Math.abs(hole.latitude-latitude)<=0.000001 &&
       Math.abs(hole.longitude-longitude)<=0.000001)
      return [];

    const geology=getGeologyAtLocation(
      hole.latitude,hole.longitude
    );

    if(geology.status!=="DIRECT" ||
       geology.unit?.code!==target.unit.code)
      continue;

    const faults=getMappedGemFaultsBetweenPoints(
      latitude,longitude,
      hole.latitude,hole.longitude
    );

    if(!faults || faults.intersects_mapped_gem_fault)
      continue;

    for(const interval of hole.intervals) {
      if(interval.from_m===null ||
         interval.to_m===null ||
         !Number.isFinite(interval.from_m) ||
         !Number.isFinite(interval.to_m) ||
         interval.to_m<=interval.from_m ||
         interval.interval_status!==null ||
         !["borehole_exact","documented_borehole_log"]
           .includes(interval.evidence_level ?? "") ||
         !interval.material_bg.trim())
        continue;

      columns.push({
        id:hole.id,
        lat:hole.latitude,
        lng:hole.longitude,
        from:interval.from_m,
        to:interval.to_m,
        material:interval.material_bg.trim(),
        sources:interval.source_ids
      });
    }
  }

  const groups=new Map<string,Column[]>();

  // SONDI_78CI_CONSERVATIVE_EQUIVALENCE
  for(const col of columns) {
    const key = getSpatialLithologyKey(col.material);
    if(!key) continue;
    const group=groups.get(key)??[];
    group.push(col);
    groups.set(key,group);
  }

  const proposals:AutomaticPredictedInterval[]=[];

  for(const [materialKey,group] of groups) {
    if(group.length<3) continue;
    // Preserve an original documented description in the output.
    const material = group[0].material;

    // Never accept a proposed contact with more than 5 m
    // disagreement among the three witness columns.
    const tolerance=5;

    outer:
    for(let i=0;i<group.length-2;i++) {
      for(let j=i+1;j<group.length-1;j++) {
        for(let k=j+1;k<group.length;k++) {
          const triple=[group[i],group[j],group[k]];
          const [a,b,c]=triple;

          if(new Set(triple.map(v=>v.id)).size!==3 ||
             !independent(a,b) ||
             !independent(a,c) ||
             !independent(b,c) ||
             !insideTriangle(longitude,latitude,a,b,c))
            continue;

          const starts=triple.map(v=>v.from);
          const ends=triple.map(v=>v.to);

          const spreadStart=Math.max(...starts)-Math.min(...starts);
          const spreadEnd=Math.max(...ends)-Math.min(...ends);

          if(spreadStart>tolerance || spreadEnd>tolerance)
            continue;

          const from=median(starts);
          const to=median(ends);

          if(to<=from) continue;

          // Reject material conflicts within the same candidate
          // interval at another eligible documented column.
          const conflict=columns.some(v=>
            !triple.some(t=>t.id===v.id) &&
            getSpatialLithologyKey(v.material)!==materialKey &&
            v.from<to && v.to>from &&
            insideTriangle(longitude,latitude,a,b,c) &&
            distanceKm(latitude,longitude,v.lat,v.lng)<=1
          );

          if(conflict) continue;

          proposals.push({
            from_m:from,
            to_m:to,
            material,
            borehole_ids:triple.map(v=>v.id),
            source_ids:[...new Set(
              triple.flatMap(v=>v.sources)
            )],
            confidence:"LOW",
            scope:"CONDITIONAL_SPATIAL_INTERVAL",
            boundary_uncertainty_m:Math.max(
              spreadStart,spreadEnd
            )
          });

          break outer;
        }
      }
    }
  }

  // Conflicting predicted materials must not appear together
  // as if they formed a verified local succession.
  return proposals.filter((p,i,all)=>
    !all.some((other,j)=>
      i!==j &&
      other.material!==p.material &&
      other.from_m<p.to_m &&
      other.to_m>p.from_m
    )
  ).sort((a,b)=>a.from_m-b.from_m);
}
