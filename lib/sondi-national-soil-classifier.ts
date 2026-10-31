// SONDI_78EL_NATIONAL_SOIL_CLASSIFIER
// SoilGrids values are modelled properties, not field measurements.
// Texture classes are based on the USDA texture triangle.

export type SoilGridValues = {
  clay_percent: number;
  sand_percent: number;
  silt_percent: number;
  ph: number;
  coarse_fragments_vol_percent: number;
};

export type SoilGridSummary = {
  texture_bg: string;
  texture_code: string;
  ph: number;
  clay_percent: number;
  sand_percent: number;
  silt_percent: number;
  coarse_fragments_vol_percent: number;
  sampling_scope: "TARGET_GRID_CELL" | "NEARBY_REGIONAL_ESTIMATE";
  distance_m: number;
  source: string;
  salinity: null;
  electrical_conductivity: null;
  magnetic_mineralization: null;
};

export function classifySoilTexture(
  sand: number,
  silt: number,
  clay: number
): {code: string; bg: string} | null {
  if (![sand,silt,clay].every(Number.isFinite)) return null;
  if ([sand,silt,clay].some(v => v < 0 || v > 100)) return null;
  if (Math.abs(sand+silt+clay-100) > 3) return null;

  let code: string;
  let bg: string;

  if (clay >= 40) {
    if (sand >= 45) {
      code = "sandy_clay";
      bg = "Песъчлива глина";
    } else if (silt >= 40) {
      code = "silty_clay";
      bg = "Праховита глина";
    } else {
      code = "clay";
      bg = "Глина";
    }
  } else if (clay >= 27) {
    if (sand >= 45) {
      code = "sandy_clay_loam";
      bg = "Песъчливо-глинеста почва";
    } else if (sand < 20) {
      code = "silty_clay_loam";
      bg = "Праховито-глинеста почва";
    } else {
      code = "clay_loam";
      bg = "Глинеста почва със смесен механичен състав";
    }
  } else if (silt >= 80 && clay < 12) {
    code = "silt";
    bg = "Праховита почва";
  } else if (silt >= 50 && clay < 27) {
    code = "silt_loam";
    bg = "Праховито-глинеста почва";
  } else if (
    clay >= 7 && clay < 27 &&
    silt >= 28 && silt < 50 &&
    sand <= 52
  ) {
    code = "loam";
    bg = "Почва със смесен песъчлив, праховит и глинест състав";
  } else if (sand >= 85 && clay < 10) {
    code = "sand";
    bg = "Песъчлива почва";
  } else if (
    sand >= 70 && clay < 15 &&
    silt < 30
  ) {
    code = "loamy_sand";
    bg = "Песъчлива почва с фини примеси";
  } else if (
    sand >= 43 && clay < 20
  ) {
    code = "sandy_loam";
    bg = "Песъчливо-глинеста почва";
  } else if (
    sand >= 45 && clay >= 20 && clay < 27
  ) {
    code = "sandy_clay_loam";
    bg = "Песъчливо-глинеста почва";
  } else {
    // The boundary cases require an exact texture-triangle
    // implementation rather than an invented classification.
    return null;
  }

  return {code,bg};
}

export function createSondiSoilGridSummary(
  values: SoilGridValues,
  scope: "TARGET_GRID_CELL" | "NEARBY_REGIONAL_ESTIMATE",
  distance_m: number
): SoilGridSummary | null {
  if (!values || !Number.isFinite(distance_m) ||
      distance_m < 0) return null;

  if (scope !== "TARGET_GRID_CELL" &&
      scope !== "NEARBY_REGIONAL_ESTIMATE") return null;

  if (scope === "NEARBY_REGIONAL_ESTIMATE" &&
      distance_m > 2000) return null;

  const {sand_percent,silt_percent,clay_percent,ph,
         coarse_fragments_vol_percent} = values;

  const texture = classifySoilTexture(
    sand_percent,silt_percent,clay_percent
  );

  if (!texture || !Number.isFinite(ph) ||
      ph < 3 || ph > 10 ||
      !Number.isFinite(coarse_fragments_vol_percent) ||
      coarse_fragments_vol_percent < 0 ||
      coarse_fragments_vol_percent > 100) return null;

  return {
    texture_bg:texture.bg,
    texture_code:texture.code,
    ph,
    clay_percent,
    sand_percent,
    silt_percent,
    coarse_fragments_vol_percent,
    sampling_scope:scope,
    distance_m,
    source:"ISRIC SoilGrids, modelled 0-5 cm",
    salinity:null,
    electrical_conductivity:null,
    magnetic_mineralization:null
  };
}
