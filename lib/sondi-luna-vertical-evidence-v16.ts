import "server-only";
import {
  getNationalDynamicIntervals,
  getNationalReferenceColumns
} from "./sondi-national-dynamic-depths";
import {
  assessNationalSpatialCorrelation
} from "./sondi-national-spatial-correlation";

/**
 * SONDI_LUNA_VERTICAL_EVIDENCE_V16_2
 * National vertical and structural evidence.
 *
 * All nearby borehole columns remain reference observations.
 * No geometric interpolation is automatically authorized.
 */
export function assessLunaVerticalEvidenceV16(
  latitude:number,
  longitude:number
){
  const result:{
    version:string;
    reference_columns:unknown[];
    observed_intervals:unknown[];
    structural_assessment:unknown;
    availability:string[];
    limitations:string[];
    independent_depth_prediction_approved:false;
  }={
    version:"SONDI_LUNA_VERTICAL_EVIDENCE_V16_2",
    reference_columns:[],
    observed_intervals:[],
    structural_assessment:null,
    availability:[],
    limitations:[
      "Nearby borehole intervals are not measurements at the target.",
      "Matching mapped surface units do not establish subsurface continuity.",
      "No mapped fault intersection does not prove structural clearance.",
      "A geometric triangle does not prove stratigraphic correlation.",
      "Research-only contacts cannot authorize a target depth.",
      "Compare lithology, stratigraphy, mapped structures and provenance.",
      "Do not assign numerical layer boundaries without vertical support.",
      "A lithological unit does not automatically prove an aquifer."
    ],
    independent_depth_prediction_approved:false
  };

  try {
    const columns=getNationalReferenceColumns(
      latitude,longitude,15,6
    );

    result.reference_columns=columns.map(c=>({
      borehole_id:c.borehole_id,
      distance_km:c.distance_km,
      observed_at:"REFERENCE_BOREHOLE_ONLY",
      intervals:c.intervals.slice(0,18).map(i=>({
        from_m:i.from_m,
        to_m:i.to_m,
        material:i.material,
        stratigraphy:i.stratigraphy,
        source_ids:i.source_ids
      })),
      intervals_truncated:c.intervals.length>18
    }));

    result.availability.push(
      "REFERENCE_COLUMNS="+columns.length
    );
  }catch{
    result.availability.push("REFERENCE_COLUMNS_UNAVAILABLE");
  }

  try {
    const intervals=getNationalDynamicIntervals(
      latitude,longitude,15
    );

    result.observed_intervals=intervals.slice(0,24).map(i=>({
      from_m:i.from_m,
      to_m:i.to_m,
      scope:i.scope,
      borehole_ids:i.borehole_ids,
      materials:i.materials,
      source_ids:i.source_ids,
      spatial_transfer_approved:false
    }));

    result.availability.push(
      "OBSERVED_INTERVALS="+intervals.length,
      "OBSERVED_INTERVALS_INCLUDED="+
        Math.min(intervals.length,24)
    );
  }catch{
    result.availability.push("OBSERVED_INTERVALS_UNAVAILABLE");
  }

  try {
    const s=assessNationalSpatialCorrelation(
      latitude,longitude
    );

    result.structural_assessment={
      mapped_target:s.target,
      exact_control_count:s.locally_mapped_exact_boreholes,
      inside_reference_triangle:
        s.target_inside_reference_triangle,
      enclosing_triangle:s.enclosing_triangle,
      structural_continuity:s.structural_continuity,
      mapped_fault_inventory:s.mapped_fault_inventory,
      pair_checks:s.pair_checks,
      triangle_observations:s.triangle_observations,
      descriptive_weighted_marker_m:
        s.descriptive_weighted_marker_m,
      marker_is_target_prediction:false,
      site_material_approved:false,
      site_depth_intervals_approved:false,
      scientific_caution:s.caution
    };

    result.availability.push(
      "SPATIAL_CORRELATION_AVAILABLE"
    );
  }catch{
    result.availability.push("SPATIAL_CORRELATION_UNAVAILABLE");
  }

  return result;
}