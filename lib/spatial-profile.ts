import "server-only";

import fs from "fs";
import path from "path";

type Feature = {
  geometry?: {
    type?: string;
    coordinates?: number[];
  };
  properties?: Record<string, any>;
};

function readGeoJson(filename: string) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    filename
  );

  return JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const r = 6371;
  const toRad = (v: number) => v * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * r * Math.asin(Math.sqrt(a));
}

function featureDistance(
  feature: Feature,
  lat: number,
  lng: number
) {
  const coords = feature.geometry?.coordinates;

  if (
    !Array.isArray(coords) ||
    coords.length < 2
  ) {
    return null;
  }

  const lon2 = Number(coords[0]);
  const lat2 = Number(coords[1]);

  if (
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  return distanceKm(
    lat,
    lng,
    lat2,
    lon2
  );
}

function nearest(
  features: Feature[],
  lat: number,
  lng: number
) {
  let best: any = null;

  for (const feature of features) {
    const distance = featureDistance(
      feature,
      lat,
      lng
    );

    if (distance === null) continue;

    if (
      !best ||
      distance < best.distanceKm
    ) {
      best = {
        distanceKm: distance,
        properties: feature.properties || {},
      };
    }
  }

  return best;
}

function countWithin(
  features: Feature[],
  lat: number,
  lng: number,
  radiusKm: number
) {
  return features.filter(feature => {
    const d = featureDistance(
      feature,
      lat,
      lng
    );

    return d !== null && d <= radiusKm;
  }).length;
}

export function getSpatialProfile(
  latValue: string | null,
  lngValue: string | null
) {
  const lat = Number(latValue);
  const lng = Number(lngValue);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  const facilitiesData =
    readGeoJson(
      "official_water_facilities.geojson"
    );

  const monitoringData =
    readGeoJson(
      "bd_ibr_monitoring_2019_2020.geojson"
    );

  const faultsData =
    readGeoJson(
      "gem_active_faults_bulgaria.geojson"
    );

  const facilities: Feature[] =
    facilitiesData.features || [];

  const monitoring: Feature[] =
    monitoringData.features || [];

  const faults: Feature[] =
    faultsData.features || [];

  const wells = facilities.filter(
    f =>
      String(
        f.properties?.display_category || ""
      ).trim().toLowerCase() === "минерален сондаж"
  );

  const springs = facilities.filter(
    f =>
      String(
        f.properties?.display_category || ""
      ).toLowerCase().includes("извор")
  );

  const mappedMonitoring =
    facilities.filter(
      f =>
        String(
          f.properties?.display_category || ""
        ).toLowerCase().includes("мониторингов")
    );


  function pointToSegmentDistanceKm(
    pointLat: number,
    pointLng: number,
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    const lat0 = pointLat * Math.PI / 180;

    const x =
      (pointLng - lng1) *
      111.320 *
      Math.cos(lat0);

    const y =
      (pointLat - lat1) *
      110.574;

    const sx =
      (lng2 - lng1) *
      111.320 *
      Math.cos(lat0);

    const sy =
      (lat2 - lat1) *
      110.574;

    const len2 = sx * sx + sy * sy;

    if (len2 === 0) {
      return Math.sqrt(x * x + y * y);
    }

    let t =
      (x * sx + y * sy) /
      len2;

    t = Math.max(0, Math.min(1, t));

    const dx = x - t * sx;
    const dy = y - t * sy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  function faultDistanceKm(
    feature: Feature
  ) {
    const geometry =
      feature.geometry as any;

    if (!geometry) {
      return null;
    }

    const lines =
      geometry.type === "LineString"
        ? [geometry.coordinates]
        : geometry.type === "MultiLineString"
          ? geometry.coordinates
          : [];

    let best = Infinity;

    for (const line of lines) {
      if (!Array.isArray(line)) continue;

      for (
        let i = 0;
        i < line.length - 1;
        i++
      ) {
        const a = line[i];
        const b = line[i + 1];

        if (
          !Array.isArray(a) ||
          !Array.isArray(b)
        ) {
          continue;
        }

        const d =
          pointToSegmentDistanceKm(
            lat,
            lng,
            Number(a[1]),
            Number(a[0]),
            Number(b[1]),
            Number(b[0])
          );

        if (d < best) {
          best = d;
        }
      }
    }

    return Number.isFinite(best)
      ? best
      : null;
  }

  let nearestFault: any = null;

  for (const feature of faults) {
    const distance =
      faultDistanceKm(feature);

    if (distance === null) {
      continue;
    }

    if (
      !nearestFault ||
      distance <
        nearestFault.distanceKm
    ) {
      nearestFault = {
        distanceKm: distance,
        properties:
          feature.properties || {},
      };
    }
  }

  return {
    nearestWell:
      nearest(wells, lat, lng),

    nearestSpring:
      nearest(springs, lat, lng),

    nearestOfficialMonitoring:
      nearest(monitoring, lat, lng),

    nearestMappedMonitoring:
      nearest(mappedMonitoring, lat, lng),

    nearestFault,

    counts: {
      wells: {
        km1: countWithin(
          wells, lat, lng, 1
        ),
        km5: countWithin(
          wells, lat, lng, 5
        ),
        km10: countWithin(
          wells, lat, lng, 10
        ),
      },

      springs: {
        km1: countWithin(
          springs, lat, lng, 1
        ),
        km5: countWithin(
          springs, lat, lng, 5
        ),
        km10: countWithin(
          springs, lat, lng, 10
        ),
      },

      monitoring: {
        km5: countWithin(
          monitoring, lat, lng, 5
        ),
        km10: countWithin(
          monitoring, lat, lng, 10
        ),
        km50: countWithin(
          monitoring, lat, lng, 50
        ),
      },
    },
  };
}
