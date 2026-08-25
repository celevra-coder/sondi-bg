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
  if (
    latValue == null ||
    lngValue == null ||
    String(latValue).trim() === "" ||
    String(lngValue).trim() === ""
  ) {
    return null;
  }

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

  const eastOrdinaryData =
    readGeoJson(
      "bd_ibr_ordinary_groundwater_wells.geojson"
    );

  const blackSeaOrdinaryData =
    readGeoJson(
      "bd_bs_ordinary_groundwater_wells.geojson"
    );

  const westernAegeanActiveGroundwaterData =
    readGeoJson(
      "bd_wabd_active_groundwater_facilities.geojson"
    );

  const westernAegeanChemicalMonitoringData =
    readGeoJson(
      "bd_wabd_chemical_monitoring.geojson"
    );

  const westernAegeanQuantitativeMonitoringData =
    readGeoJson(
      "bd_wabd_quantitative_monitoring.geojson"
    );

  const westernAegeanHgpData =
    readGeoJson(
      "bd_wabd_hydrogeological_investigations.geojson"
    );

  const westernAegeanMineralFacilitiesData =
    readGeoJson(
      "bd_wabd_mineral_water_facilities.geojson"
    );

  const eastOrdinaryFacilities: Feature[] =
    (eastOrdinaryData.features || []).filter(
      (feature: Feature) =>
        [
          "ordinary_borehole",
          "combined_well",
          "shaft_well",
        ].includes(
          String(feature.properties?.category || "")
            .trim()
            .toLowerCase()
        )
    );

  const blackSeaOrdinaryFacilities: Feature[] =
    blackSeaOrdinaryData.features || [];

  const westernAegeanActiveGroundwaterFacilities: Feature[] =
    westernAegeanActiveGroundwaterData.features || [];

  const ordinaryFacilities: Feature[] = [
    ...eastOrdinaryFacilities,
    ...blackSeaOrdinaryFacilities,
    ...westernAegeanActiveGroundwaterFacilities,
  ];

  const westernAegeanChemicalMonitoring: Feature[] =
    westernAegeanChemicalMonitoringData.features || [];

  const westernAegeanQuantitativeMonitoring: Feature[] =
    westernAegeanQuantitativeMonitoringData.features || [];

  const westernAegeanHgpInvestigations: Feature[] =
    westernAegeanHgpData.features || [];

  const westernAegeanMineralWaterFacilities: Feature[] =
    westernAegeanMineralFacilitiesData.features || [];

  const westernAegeanActiveNearby =
    westernAegeanActiveGroundwaterFacilities
      .map((feature: Feature) => ({
        distanceKm: featureDistance(feature, lat, lng),
        properties: feature.properties || {},
      }))
      .filter(
        (item) =>
          item.distanceKm !== null &&
          Number.isFinite(item.distanceKm)
      )
      .map((item) => ({
        distanceKm: Number(item.distanceKm),
        properties: item.properties,
      }))
      .sort(
        (first, second) =>
          first.distanceKm - second.distanceKm
      );

  const westernAegeanActiveWithin5Km =
    westernAegeanActiveNearby.filter(
      (item) => item.distanceKm <= 5
    );

  const ordinaryNearby = ordinaryFacilities
    .map((feature: Feature) => ({
      distanceKm: featureDistance(feature, lat, lng),
      properties: feature.properties || {},
    }))
    .filter(
      (item) =>
        item.distanceKm !== null &&
        Number.isFinite(item.distanceKm)
    )
    .map((item) => ({
      distanceKm: Number(item.distanceKm),
      properties: item.properties,
    }))
    .sort(
      (first, second) =>
        first.distanceKm - second.distanceKm
    );

  const ordinaryWithin5Km = ordinaryNearby.filter(
    (item) => item.distanceKm <= 5
  );

  const ordinaryDepths = ordinaryWithin5Km
    .map((item) => item.properties?.depth_m)
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0
    )
    .map((value) => Number(value));

  const ordinaryStaticLevels = ordinaryWithin5Km
    .map(
      (item) =>
        item.properties?.static_water_level_m
    )
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0
    )
    .map((value) => Number(value));

  const ordinaryStatistics = {
    depthMin:
      ordinaryDepths.length > 0
        ? Math.min(...ordinaryDepths)
        : null,

    depthMax:
      ordinaryDepths.length > 0
        ? Math.max(...ordinaryDepths)
        : null,

    staticLevelMin:
      ordinaryStaticLevels.length > 0
        ? Math.min(...ordinaryStaticLevels)
        : null,

    staticLevelMax:
      ordinaryStaticLevels.length > 0
        ? Math.max(...ordinaryStaticLevels)
        : null,

    depthCount:
      ordinaryDepths.length,

    staticLevelCount:
      ordinaryStaticLevels.length,
  };

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
    nearestOrdinaryWell:
      ordinaryNearby[0] ?? null,

    nearbyOrdinaryWells:
      ordinaryWithin5Km.slice(0, 10),

    ordinaryStatistics,

    nearestWell:
      nearest(wells, lat, lng),

    nearestSpring:
      nearest(springs, lat, lng),

    nearestOfficialMonitoring:
      nearest(monitoring, lat, lng),

    nearestMappedMonitoring:
      nearest(mappedMonitoring, lat, lng),

    nearestWesternAegeanActiveGroundwaterFacility:
      nearest(
        westernAegeanActiveGroundwaterFacilities,
        lat,
        lng
      ),

    nearbyWesternAegeanActiveGroundwaterFacilities:
      westernAegeanActiveWithin5Km.slice(0, 10),

    nearestWesternAegeanChemicalMonitoring:
      nearest(
        westernAegeanChemicalMonitoring,
        lat,
        lng
      ),

    nearestWesternAegeanQuantitativeMonitoring:
      nearest(
        westernAegeanQuantitativeMonitoring,
        lat,
        lng
      ),

    nearestWesternAegeanHydrogeologicalInvestigation:
      nearest(
        westernAegeanHgpInvestigations,
        lat,
        lng
      ),

    nearestWesternAegeanMineralWaterFacility:
      nearest(
        westernAegeanMineralWaterFacilities,
        lat,
        lng
      ),

    nearestFault,

    counts: {
      ordinaryWells: {
        km1: countWithin(
          ordinaryFacilities, lat, lng, 1
        ),

        km3: countWithin(
          ordinaryFacilities, lat, lng, 3
        ),

        km5: countWithin(
          ordinaryFacilities, lat, lng, 5
        ),
      },

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

      westernAegeanActiveGroundwaterFacilities: {
        km1: countWithin(
          westernAegeanActiveGroundwaterFacilities,
          lat,
          lng,
          1
        ),
        km3: countWithin(
          westernAegeanActiveGroundwaterFacilities,
          lat,
          lng,
          3
        ),
        km5: countWithin(
          westernAegeanActiveGroundwaterFacilities,
          lat,
          lng,
          5
        ),
        km10: countWithin(
          westernAegeanActiveGroundwaterFacilities,
          lat,
          lng,
          10
        ),
      },

      westernAegeanChemicalMonitoring: {
        km5: countWithin(
          westernAegeanChemicalMonitoring,
          lat,
          lng,
          5
        ),
        km10: countWithin(
          westernAegeanChemicalMonitoring,
          lat,
          lng,
          10
        ),
        km50: countWithin(
          westernAegeanChemicalMonitoring,
          lat,
          lng,
          50
        ),
      },

      westernAegeanQuantitativeMonitoring: {
        km5: countWithin(
          westernAegeanQuantitativeMonitoring,
          lat,
          lng,
          5
        ),
        km10: countWithin(
          westernAegeanQuantitativeMonitoring,
          lat,
          lng,
          10
        ),
        km50: countWithin(
          westernAegeanQuantitativeMonitoring,
          lat,
          lng,
          50
        ),
      },

      westernAegeanHydrogeologicalInvestigations: {
        km5: countWithin(
          westernAegeanHgpInvestigations,
          lat,
          lng,
          5
        ),
        km10: countWithin(
          westernAegeanHgpInvestigations,
          lat,
          lng,
          10
        ),
        km50: countWithin(
          westernAegeanHgpInvestigations,
          lat,
          lng,
          50
        ),
      },

      westernAegeanMineralWaterFacilities: {
        km5: countWithin(
          westernAegeanMineralWaterFacilities,
          lat,
          lng,
          5
        ),
        km10: countWithin(
          westernAegeanMineralWaterFacilities,
          lat,
          lng,
          10
        ),
        km50: countWithin(
          westernAegeanMineralWaterFacilities,
          lat,
          lng,
          50
        ),
      },
    },
  };
}
