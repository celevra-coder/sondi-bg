import "server-only";

export type GlimSurfaceResult = {
  status: "OK" | "UNAVAILABLE" | "DISABLED";
  source: "GLiM";
  polygon_id: number | null;
  lithology_code: string | null;
  material_bg: string | null;
  detail_bg: string | null;
  limitation: string;
};

const endpoint =
  "https://services8.arcgis.com/4KhTMTZ1x0f76DSg/ArcGIS/rest/services/GLiM_Niveau_I/FeatureServer/1/query";

const materials: Record<string, string> = {
  sc: "Карбонатни седиментни скали",
  ss: "Теригенни седиментни скали",
  sm: "Смесени седиментни скали",
};

const details: Record<string, string> = {
  pu: "Преимуществено карбонатен състав",
  mx: "Смесен зърнометричен състав",
};

const limitation =
  "GLiM представя общия тип повърхностна геоложка основа. " +
  "Не доказва конкретна формация, непрекъснат пласт или " +
  "дълбочината на геоложките контакти под избраната точка.";

export async function getGlimSurface(
  latitude: number,
  longitude: number
): Promise<GlimSurfaceResult> {
  const unavailable: GlimSurfaceResult = {
    status: "UNAVAILABLE",
    source: "GLiM",
    polygon_id: null,
    lithology_code: null,
    material_bg: null,
    detail_bg: null,
    limitation,
  };

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return unavailable;
  }

  const geometry = JSON.stringify({
    x: longitude,
    y: latitude,
    spatialReference: { wkid: 4326 },
  });

  const body = new URLSearchParams({
    f: "json",
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "OBJECTID,Litho,xx,yy",
    returnGeometry: "false",
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return unavailable;

    const data = await response.json();
    if (data.error) return unavailable;

    const features = Array.isArray(data.features)
      ? data.features
      : [];

    // Ambiguous polygon intersection must not be resolved arbitrarily.
    if (features.length !== 1) return unavailable;

    const a = features[0]?.attributes;
    if (!a || typeof a.Litho !== "string") {
      return unavailable;
    }

    const primary = typeof a.xx === "string"
      ? a.xx
      : a.Litho.slice(0, 2);

    const secondary = typeof a.yy === "string"
      ? a.yy
      : a.Litho.slice(2, 4);

    return {
      status: "OK",
      source: "GLiM",
      polygon_id:
        typeof a.OBJECTID === "number" ? a.OBJECTID : null,
      lithology_code: a.Litho,
      material_bg: materials[primary] ?? "Друг тип геоложка основа",
      detail_bg: details[secondary] ?? null,
      limitation,
    };
  } catch {
    return unavailable;
  }
}
