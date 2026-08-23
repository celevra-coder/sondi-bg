import fs from "node:fs";
import path from "node:path";

function readData(filename: string): any {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "public",
        "geology-map",
        "data",
        filename
      ),
      "utf8"
    )
  );
}

function pointInRing(
  longitude: number,
  latitude: number,
  ring: number[][]
): boolean {
  let inside = false;

  for (
    let current = 0, previous = ring.length - 1;
    current < ring.length;
    previous = current++
  ) {
    const x1 = Number(ring[current]?.[0]);
    const y1 = Number(ring[current]?.[1]);
    const x2 = Number(ring[previous]?.[0]);
    const y2 = Number(ring[previous]?.[1]);

    const intersects =
      y1 > latitude !== y2 > latitude &&
      longitude <
        ((x2 - x1) * (latitude - y1)) /
          ((y2 - y1) || 1e-12) +
          x1;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(
  longitude: number,
  latitude: number,
  rings: number[][][]
): boolean {
  if (
    !rings.length ||
    !pointInRing(
      longitude,
      latitude,
      rings[0]
    )
  ) {
    return false;
  }

  return !rings
    .slice(1)
    .some(
      ring =>
        pointInRing(
          longitude,
          latitude,
          ring
        )
    );
}

function pointInGeometry(
  longitude: number,
  latitude: number,
  geometry: any
): boolean {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(
      longitude,
      latitude,
      geometry.coordinates || []
    );
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates || []).some(
      (polygon: number[][][]) =>
        pointInPolygon(
          longitude,
          latitude,
          polygon
        )
    );
  }

  return false;
}

export function getBlackSeaGisAnalysis(
  groundwaterBodyCode: string,
  latitudeValue: string | number | null,
  longitudeValue: string | number | null
) {
  const code = String(
    groundwaterBodyCode || ""
  ).trim().toUpperCase();

  if (!code.startsWith("BG2G")) {
    return {
      regionalGeology: null,
      protectionZonesAtPoint: [] as any[],
      isInsideProtectionZone: false,
    };
  }

  const geologyData = readData(
    "bd_bs_regional_geology_profiles.json"
  );

  const regionalGeology =
    geologyData
      ?.profiles_by_groundwater_body_code
      ?.[code] || null;

  const hasCoordinates =
    latitudeValue !== null &&
    longitudeValue !== null &&
    Number.isFinite(
      Number(latitudeValue)
    ) &&
    Number.isFinite(
      Number(longitudeValue)
    );

  const protectionZonesAtPoint: any[] =
    hasCoordinates
      ? (
          readData(
            "bd_bs_sanitary_protection_zones.geojson"
          )?.features || []
        ).filter(
          (feature: any) =>
            feature.properties?.basin_code ===
              "BG2" &&
            pointInGeometry(
              Number(longitudeValue),
              Number(latitudeValue),
              feature.geometry
            )
        )
      : [];

  return {
    regionalGeology,
    protectionZonesAtPoint,
    isInsideProtectionZone:
      protectionZonesAtPoint.length > 0,
  };
}
