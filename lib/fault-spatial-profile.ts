import "server-only";

import fs from "node:fs";
import path from "node:path";

type GeoFeature = {
  type?: string;
  properties?: Record<string, any>;
  geometry?: {
    type?: string;
    coordinates?: any;
  };
};

type MasterRecord = {
  fault_id?: string | null;
  mrrb?: {
    record?: number | null;
    name?: string | null;
  } | null;
  scientific?: {
    name?: string | null;
    system?: string | null;
    fault_type?: string | null;
  } | null;
  international_crosswalk?: {
    bgcs?: string | null;
  } | null;
  correspondence?: {
    type?: string | null;
    confidence?: string | null;
    exact_trace_identity?: boolean | null;
  } | null;
  source_ids?: string[];
  notes?: string[];
  open_items?: string[];
};

function readJson(filename: string) {
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

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function toRad(value: number) {
  return value * Math.PI / 180;
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const r = 6371.0088;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    r *
    Math.asin(
      Math.min(1, Math.sqrt(a))
    )
  );
}

function pointToSegmentDistanceKm(
  pointLat: number,
  pointLng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const lat0 =
    pointLat * Math.PI / 180;

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

  const len2 =
    sx * sx +
    sy * sy;

  if (len2 === 0) {
    return Math.sqrt(
      x * x +
      y * y
    );
  }

  let t =
    (
      x * sx +
      y * sy
    ) /
    len2;

  t = Math.max(
    0,
    Math.min(1, t)
  );

  const dx =
    x -
    t * sx;

  const dy =
    y -
    t * sy;

  return Math.sqrt(
    dx * dx +
    dy * dy
  );
}

function lineDistanceKm(
  feature: GeoFeature,
  lat: number,
  lng: number
) {
  const geometry =
    feature.geometry;

  if (!geometry) {
    return null;
  }

  const lines: any[] =
    geometry.type === "LineString"
      ? [geometry.coordinates]
      : geometry.type === "MultiLineString"
        ? geometry.coordinates
        : [];

  let best = Infinity;

  for (const line of lines) {
    if (
      !Array.isArray(line) ||
      line.length < 2
    ) {
      continue;
    }

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

      const aLng =
        Number(a[0]);

      const aLat =
        Number(a[1]);

      const bLng =
        Number(b[0]);

      const bLat =
        Number(b[1]);

      if (
        !Number.isFinite(aLng) ||
        !Number.isFinite(aLat) ||
        !Number.isFinite(bLng) ||
        !Number.isFinite(bLat)
      ) {
        continue;
      }

      const d =
        pointToSegmentDistanceKm(
          lat,
          lng,
          aLat,
          aLng,
          bLat,
          bLng
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

function pointOnRingBoundary(
  ring: any[],
  lat: number,
  lng: number
) {
  if (
    !Array.isArray(ring) ||
    ring.length < 2
  ) {
    return false;
  }

  for (
    let i = 0;
    i < ring.length - 1;
    i++
  ) {
    const a = ring[i];
    const b = ring[i + 1];

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

    if (d <= 0.001) {
      return true;
    }
  }

  return false;
}

function pointInRing(
  ring: any[],
  lat: number,
  lng: number
) {
  if (
    !Array.isArray(ring) ||
    ring.length < 4
  ) {
    return false;
  }

  if (
    pointOnRingBoundary(
      ring,
      lat,
      lng
    )
  ) {
    return true;
  }

  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const xi =
      Number(ring[i]?.[0]);

    const yi =
      Number(ring[i]?.[1]);

    const xj =
      Number(ring[j]?.[0]);

    const yj =
      Number(ring[j]?.[1]);

    if (
      !Number.isFinite(xi) ||
      !Number.isFinite(yi) ||
      !Number.isFinite(xj) ||
      !Number.isFinite(yj)
    ) {
      continue;
    }

    const intersects =
      (
        (yi > lat) !==
        (yj > lat)
      ) &&
      (
        lng <
        (
          (xj - xi) *
          (lat - yi)
        ) /
          (
            (yj - yi) ||
            Number.EPSILON
          ) +
          xi
      );

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygonCoordinates(
  polygon: any[],
  lat: number,
  lng: number
) {
  if (
    !Array.isArray(polygon) ||
    polygon.length === 0
  ) {
    return false;
  }

  if (
    !pointInRing(
      polygon[0],
      lat,
      lng
    )
  ) {
    return false;
  }

  for (
    let i = 1;
    i < polygon.length;
    i++
  ) {
    if (
      pointInRing(
        polygon[i],
        lat,
        lng
      )
    ) {
      return false;
    }
  }

  return true;
}

function polygonContainsPoint(
  feature: GeoFeature,
  lat: number,
  lng: number
) {
  const geometry =
    feature.geometry;

  if (!geometry) {
    return false;
  }

  if (
    geometry.type === "Polygon"
  ) {
    return pointInPolygonCoordinates(
      geometry.coordinates,
      lat,
      lng
    );
  }

  if (
    geometry.type === "MultiPolygon"
  ) {
    return (
      Array.isArray(
        geometry.coordinates
      ) &&
      geometry.coordinates.some(
        (polygon: any[]) =>
          pointInPolygonCoordinates(
            polygon,
            lat,
            lng
          )
      )
    );
  }

  return false;
}

function polygonBoundaryDistanceKm(
  feature: GeoFeature,
  lat: number,
  lng: number
) {
  if (
    polygonContainsPoint(
      feature,
      lat,
      lng
    )
  ) {
    return 0;
  }

  const geometry =
    feature.geometry;

  if (!geometry) {
    return null;
  }

  const polygons: any[] =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  let best = Infinity;

  for (
    const polygon of polygons
  ) {
    if (
      !Array.isArray(polygon)
    ) {
      continue;
    }

    for (
      const ring of polygon
    ) {
      if (
        !Array.isArray(ring) ||
        ring.length < 2
      ) {
        continue;
      }

      for (
        let i = 0;
        i < ring.length - 1;
        i++
      ) {
        const a = ring[i];
        const b = ring[i + 1];

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
  }

  return Number.isFinite(best)
    ? best
    : null;
}

function compactMasterRecord(
  record: MasterRecord | null
) {
  if (!record) {
    return null;
  }

  return {
    faultId:
      record.fault_id ?? null,

    mrrbRecord:
      record.mrrb?.record ?? null,

    mrrbName:
      record.mrrb?.name ?? null,

    scientificName:
      record.scientific?.name ?? null,

    scientificSystem:
      record.scientific?.system ?? null,

    scientificFaultType:
      record.scientific?.fault_type ?? null,

    bgcs:
      record.international_crosswalk
        ?.bgcs ?? null,

    correspondenceType:
      record.correspondence
        ?.type ?? null,

    confidence:
      record.correspondence
        ?.confidence ?? null,

    exactTraceIdentity:
      record.correspondence
        ?.exact_trace_identity === true,

    sourceIds:
      Array.isArray(
        record.source_ids
      )
        ? record.source_ids
        : [],

    notes:
      Array.isArray(
        record.notes
      )
        ? record.notes
        : [],

    openItems:
      Array.isArray(
        record.open_items
      )
        ? record.open_items
        : [],
  };
}

export function getFaultSpatialProfile(
  latValue: string | number | null,
  lngValue: string | number | null
) {
  if (
    latValue == null ||
    lngValue == null ||
    String(latValue).trim() === "" ||
    String(lngValue).trim() === ""
  ) {
    return null;
  }

  const lat =
    Number(latValue);

  const lng =
    Number(lngValue);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  const gemData =
    readJson(
      "gem_active_faults_bulgaria.geojson"
    );

  const mrrbData =
    readJson(
      "mrrb_active_faults_master.geojson"
    );

  const masterData =
    readJson(
      "active_faults_master.json"
    );

  const gemFeatures: GeoFeature[] =
    Array.isArray(
      gemData?.features
    )
      ? gemData.features
      : [];

  const mrrbFeatures: GeoFeature[] =
    Array.isArray(
      mrrbData?.features
    )
      ? mrrbData.features
      : [];

  const masterRecords: MasterRecord[] =
    Array.isArray(
      masterData?.records
    )
      ? masterData.records
      : [];

  const masterByMrrbRecord =
    new Map<
      number,
      MasterRecord
    >();

  const masterByBgcs =
    new Map<
      string,
      MasterRecord[]
    >();

  for (
    const record of masterRecords
  ) {
    const mrrbRecord =
      Number(
        record.mrrb?.record
      );

    if (
      Number.isFinite(mrrbRecord)
    ) {
      masterByMrrbRecord.set(
        mrrbRecord,
        record
      );
    }

    const bgcs =
      normalizeText(
        record
          .international_crosswalk
          ?.bgcs
      );

    if (bgcs) {
      const list =
        masterByBgcs.get(bgcs) ||
        [];

      list.push(record);

      masterByBgcs.set(
        bgcs,
        list
      );
    }
  }

  const gemCandidates =
    gemFeatures
      .map(feature => {
        const d =
          lineDistanceKm(
            feature,
            lat,
            lng
          );

        if (d == null) {
          return null;
        }

        const properties =
          feature.properties || {};

        const bgcs =
          normalizeText(
            properties.catalog_id
          );

        const matchedMaster =
          (
            masterByBgcs.get(
              bgcs
            ) || []
          ).map(
            compactMasterRecord
          );

        return {
          distanceKm: d,
          geometry:
            feature.geometry ?? null,
          properties,
          bgcs:
            properties.catalog_id ??
            null,
          validatedCrosswalks:
            matchedMaster,
        };
      })
      .filter(
        (item): item is NonNullable<
          typeof item
        > =>
          item !== null
      )
      .sort(
        (a, b) =>
          a.distanceKm -
          b.distanceKm
      );

  const mrrbCandidates =
    mrrbFeatures
      .map(feature => {
        const containsPoint =
          polygonContainsPoint(
            feature,
            lat,
            lng
          );

        const d =
          polygonBoundaryDistanceKm(
            feature,
            lat,
            lng
          );

        if (d == null) {
          return null;
        }

        const properties =
          feature.properties || {};

        const mrrbRecord =
          Number(
            properties.mrrb_record
          );

        const masterRecord =
          Number.isFinite(
            mrrbRecord
          )
            ? (
                masterByMrrbRecord.get(
                  mrrbRecord
                ) || null
              )
            : null;

        return {
          containsPoint,
          distanceKm: d,
          geometry:
            feature.geometry ?? null,
          properties,
          master:
            compactMasterRecord(
              masterRecord
            ),
        };
      })
      .filter(
        (item): item is NonNullable<
          typeof item
        > =>
          item !== null
      )
      .sort(
        (a, b) => {
          if (
            a.containsPoint !==
            b.containsPoint
          ) {
            return a.containsPoint
              ? -1
              : 1;
          }

          return (
            a.distanceKm -
            b.distanceKm
          );
        }
      );

  const nearestGem =
    gemCandidates[0] ??
    null;

  const mrrbAtPoint =
    mrrbCandidates.filter(
      item =>
        item.containsPoint
    );

  const nearbyGem =
    gemCandidates.filter(
      item =>
        item.distanceKm <= 25
    );

  const nearbyMrrb =
    mrrbCandidates.filter(
      item =>
        item.containsPoint ||
        item.distanceKm <= 10
    );

  const nearestGemBgcs =
    normalizeText(
      nearestGem
        ?.properties
        ?.catalog_id
    );

  const nearestGemRelatedMrrb =
    nearestGemBgcs
      ? mrrbCandidates.filter(
          item =>
            normalizeText(
              item.properties?.bgcs
            ) === nearestGemBgcs
        )
      : [];

  return {
    coordinates: {
      lat,
      lng,
    },

    nearestGem,

    nearbyGem:
      nearbyGem.slice(0, 12),

    mrrbAtPoint,

    nearbyMrrb:
      nearbyMrrb.slice(0, 12),

    nearestGemRelatedMrrb,

    counts: {
      gemWithin1Km:
        gemCandidates.filter(
          item =>
            item.distanceKm <= 1
        ).length,

      gemWithin5Km:
        gemCandidates.filter(
          item =>
            item.distanceKm <= 5
        ).length,

      gemWithin10Km:
        gemCandidates.filter(
          item =>
            item.distanceKm <= 10
        ).length,

      mrrbContainingPoint:
        mrrbAtPoint.length,

      mrrbWithin1Km:
        mrrbCandidates.filter(
          item =>
            item.containsPoint ||
            item.distanceKm <= 1
        ).length,

      mrrbWithin5Km:
        mrrbCandidates.filter(
          item =>
            item.containsPoint ||
            item.distanceKm <= 5
        ).length,
    },

    semantics: {
      nearestGemMeans:
        "distance_to_regional_gem_fault_geometry",

      mrrbAtPointMeans:
        "point_inside_official_buffered_mrrb_fault_corridor",

      crosswalkRule:
        "mrrb_and_gem_are_linked_only_when_validated_bgcs_crosswalk_exists",

      exactTraceRule:
        "exact_surface_trace_identity_is_never_inferred_from_proximity",
    },
  };
}