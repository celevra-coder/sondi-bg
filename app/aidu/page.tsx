"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  parseAiduDat,
  type AiduParsedFile,
} from "../../lib/aidu-parser";
import Aidu3DProfile from "../../components/Aidu3DProfile";


type AiduChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AnyFeature = {
  type?: string;
  properties?: Record<string, any>;
  geometry?: {
    type?: string;
    coordinates?: any;
  };
};

function pointInRing(
  lon: number,
  lat: number,
  ring: number[][]
) {
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const xi = Number(ring[i]?.[0]);
    const yi = Number(ring[i]?.[1]);
    const xj = Number(ring[j]?.[0]);
    const yj = Number(ring[j]?.[1]);

    if (
      !Number.isFinite(xi) ||
      !Number.isFinite(yi) ||
      !Number.isFinite(xj) ||
      !Number.isFinite(yj)
    ) {
      continue;
    }

    const intersect =
      yi > lat !== yj > lat &&
      lon <
        ((xj - xi) * (lat - yi)) /
          ((yj - yi) || 1e-12) +
        xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygonGeometry(
  lon: number,
  lat: number,
  geometry: any
) {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates || [];

    if (
      !rings.length ||
      !pointInRing(lon, lat, rings[0])
    ) {
      return false;
    }

    for (let i = 1; i < rings.length; i++) {
      if (pointInRing(lon, lat, rings[i])) {
        return false;
      }
    }

    return true;
  }

  if (geometry.type === "MultiPolygon") {


  return (geometry.coordinates || []).some(
      (polygon: any) =>
        pointInPolygonGeometry(
          lon,
          lat,
          {
            type: "Polygon",
            coordinates: polygon,
          }
        )
    );
  }

  return false;
}

function groundwaterBodyCode(
  feature: AnyFeature
) {
  const p = feature.properties || {};

  return String(
    p.canonical_code ||
      p.localId ||
      p.localID ||
      p.gwb_code ||
      p.code ||
      p.cod ||
      ""
  )
    .trim()
    .toUpperCase();
}

function groundwaterBodyName(
  feature: AnyFeature
) {
  const p = feature.properties || {};

  return String(
    p.nameText ||
      p.nameTxtInt ||
      p.name_bg ||
      p.gwb_name ||
      p.name ||
      ""
  ).trim();
}

function parseLocationCoordinates(value: string) {
  const raw = String(value || "")
    .trim()
    .replace(/[;|]/g, " ")
    .replace(/\s+/g, " ");

  let numbers: string[] | null = null;

  const decimalCommaFormat = raw.match(
    /(-?\d{1,3}),(\d+)\s+(-?\d{1,3}),(\d+)/
  );

  if (decimalCommaFormat) {
    numbers = [
      decimalCommaFormat[1] + "." + decimalCommaFormat[2],
      decimalCommaFormat[3] + "." + decimalCommaFormat[4],
    ];
  } else {
    numbers = raw.match(/-?\d+(?:\.\d+)?/g);
  }

  if (!numbers || numbers.length < 2) {
    return null;
  }

  let first = Number(numbers[0]);
  let second = Number(numbers[1]);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  let latitude = first;
  let longitude = second;

  if (
    first >= 20 &&
    first <= 30 &&
    second >= 40 &&
    second <= 45
  ) {
    latitude = second;
    longitude = first;
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function AiduPageContent() {

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [locationQuery, setLocationQuery] =
    useState("");
  const [locationLabel, setLocationLabel] =
    useState("");
  const [locationSearchLoading, setLocationSearchLoading] =
    useState(false);
  const [locationSearchError, setLocationSearchError] =
    useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [parsedAiduFiles, setParsedAiduFiles] =
    useState<
      {
        file: File;
        parsed: AiduParsedFile;
      }[]
    >([]);
  const [aiduFileError, setAiduFileError] =
    useState("");
  const [dowsingNotes, setDowsingNotes] = useState("");

  const [groundwaterBodies, setGroundwaterBodies] =
    useState<AnyFeature[]>([]);
  const [groundwaterLoading, setGroundwaterLoading] =
    useState(false);
  const [groundwaterError, setGroundwaterError] =
    useState("");

  const [spatialContext, setSpatialContext] =
    useState<any>(null);
  const [spatialContextLoading, setSpatialContextLoading] =
    useState(false);
  const [spatialContextError, setSpatialContextError] =
    useState("");

  const [analysisLoading, setAnalysisLoading] =
    useState(false);
  const [analysisError, setAnalysisError] =
    useState("");
  const [analysisResult, setAnalysisResult] =
    useState<any>(null);
  const [aiUsage, setAiUsage] =
    useState<any>(null);

  const [chatQuestion, setChatQuestion] =
    useState("");

  const [chatMessages, setChatMessages] =
    useState<AiduChatMessage[]>([]);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  const [chatUsageTotalUsd, setChatUsageTotalUsd] =
    useState(0);

  const [shareLoading, setShareLoading] =
    useState(false);

  const [shareError, setShareError] =
    useState("");

  const [shareUrl, setShareUrl] =
    useState("");




  useEffect(() => {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !lat ||
      !lng ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setGroundwaterBodies([]);
      setGroundwaterError("");
      return;
    }

    let cancelled = false;

    async function detectGroundwaterBodies() {
      setGroundwaterLoading(true);
      setGroundwaterError("");

      try {
        const [
          eastResponse,
          blackSeaResponse,
          westernResponse,
        ] = await Promise.all([
          fetch(
            "/geology-map/data/bd_ibr_groundwater_bodies_enriched.geojson"
          ),
          fetch(
            "/geology-map/data/bd_bs_groundwater_bodies.geojson"
          ),
          fetch(
            "/geology-map/data/bd_wabd_groundwater_bodies.geojson"
          ),
        ]);

        if (
          !eastResponse.ok ||
          !blackSeaResponse.ok ||
          !westernResponse.ok
        ) {
          throw new Error(
            "????????? ????????? ?? ??????????? ??? ??????."
          );
        }

        const [
          eastData,
          blackSeaData,
          westernData,
        ] = await Promise.all([
          eastResponse.json(),
          blackSeaResponse.json(),
          westernResponse.json(),
        ]);

        const allBodies: AnyFeature[] = [
          ...(eastData.features || []),
          ...(blackSeaData.features || []),
          ...(westernData.features || []),
        ];

        const matches = allBodies.filter(
          (feature: AnyFeature) =>
            pointInPolygonGeometry(
              longitude,
              latitude,
              feature.geometry
            )
        );

        if (!cancelled) {
          setGroundwaterBodies(matches);
        }
      } catch (error) {
        if (!cancelled) {
          setGroundwaterBodies([]);
          setGroundwaterError(
            error instanceof Error
              ? error.message
              : "\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u043d\u0435 \u043d\u0430 \u041f\u0412\u0422."
          );
        }
      } finally {
        if (!cancelled) {
          setGroundwaterLoading(false);
        }
      }
    }

    detectGroundwaterBodies();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);


  useEffect(() => {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !lat ||
      !lng ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setSpatialContext(null);
      setSpatialContextError("");
      return;
    }

    let cancelled = false;

    async function loadSpatialContext() {
      setSpatialContextLoading(true);
      setSpatialContextError("");

      try {
        const response = await fetch(
          "/api/aidu-context",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.error ||
              "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0437\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0441\u043a\u0438\u044f \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442."
          );
        }

        if (!cancelled) {
          setSpatialContext(
            result.spatialProfile ?? null
          );
        }
      } catch (error) {
        if (!cancelled) {
          setSpatialContext(null);
          setSpatialContextError(
            error instanceof Error
              ? error.message
              : "\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0441\u043a\u0438\u044f \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442."
          );
        }
      } finally {
        if (!cancelled) {
          setSpatialContextLoading(false);
        }
      }
    }

    loadSpatialContext();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  async function resolveLocation() {
    const query = String(locationQuery || "").trim();

    setLocationSearchError("");

    if (!query) {
      setLocationSearchError(
        "\u0412\u044a\u0432\u0435\u0434\u0438 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u043b\u0438 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438."
      );
      return;
    }

    const coordinates = parseLocationCoordinates(query);

    if (coordinates) {
      setLat(String(coordinates.latitude));
      setLng(String(coordinates.longitude));
      setLocationLabel(
        "\u0412\u044a\u0432\u0435\u0434\u0435\u043d\u0438 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438"
      );
      return;
    }

    setLocationSearchLoading(true);

    try {
      const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=jsonv2" +
        "&countrycodes=bg" +
        "&limit=5" +
        "&q=" +
        encodeURIComponent(query);

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "bg",
        },
      });

      if (!response.ok) {
        throw new Error("Place search failed.");
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        setLat("");
        setLng("");
        setLocationLabel("");
        setLocationSearchError(
          "\u041d\u0435 \u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u043e \u0442\u0430\u043a\u043e\u0432\u0430 \u043c\u044f\u0441\u0442\u043e \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f."
        );
        return;
      }

      const result = results[0];
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Invalid place coordinates.");
      }

      setLat(String(latitude));
      setLng(String(longitude));
      setLocationLabel(
        String(result.display_name || query)
      );
    } catch (error) {
      console.error("[AIDU place search]", error);
      setLat("");
      setLng("");
      setLocationLabel("");
      setLocationSearchError(
        "\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0442\u044a\u0440\u0441\u0435\u043d\u0435 \u043d\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e."
      );
    } finally {
      setLocationSearchLoading(false);
    }
  }

  const coordinatesLabel = useMemo(() => {
    if (!lat || !lng) {
      return "Няма подадени координати";
    }

    return `${lat}, ${lng}`;
  }, [lat, lng]);

  async function runAnalysis() {
    if (!canAnalyze) {
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError("");
    setAnalysisResult(null);
    setAiUsage(null);
    setChatQuestion("");
    setChatMessages([]);
    setChatError("");
    setChatUsageTotalUsd(0);

    try {
      const response = await fetch(
        "/api/aidu-analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: Number(lat),
            longitude: Number(lng),
            locationLabel,
            dowsingNotes,
            groundwaterBodies:
              groundwaterBodies.map((body) => ({
                code: groundwaterBodyCode(body),
                name: groundwaterBodyName(body),
                properties: body.properties ?? {},
              })),
            spatialContext,
            aiduFiles: parsedAiduFiles.map(
              ({ file, parsed }) => ({
                fileName: file.name,
                parsed,
              })
            ),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error ||
            "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u0435\u043d AIDU \u0430\u043d\u0430\u043b\u0438\u0437."
        );
      }

      setAnalysisResult(result.analysis);
      setAiUsage(result.aiUsage ?? null);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u0435\u043d AIDU \u0430\u043d\u0430\u043b\u0438\u0437."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  const canAnalyze =
    files.length > 0 &&
    parsedAiduFiles.length === files.length &&
    Boolean(lat) &&
    Boolean(lng) &&
    Boolean(spatialContext) &&
    !spatialContextLoading;

  async function sendChatMessage() {
  const question =
    chatQuestion.trim();

  if (
    !question ||
    !analysisResult ||
    chatLoading
  ) {
    return;
  }

  const userMessage: AiduChatMessage = {
    role: "user",
    content: question,
  };

  const historyForRequest =
    chatMessages;

  setChatMessages(
    current => [
      ...current,
      userMessage,
    ]
  );

  setChatQuestion("");
  setChatError("");
  setChatLoading(true);

  try {
    const response = await fetch(
      "/api/aidu-chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question,

          history:
            historyForRequest,

          analysis:
            analysisResult,

          latitude:
            Number(lat),

          longitude:
            Number(lng),

          locationLabel,

          groundwaterBodies:
            groundwaterBodies.map(
              feature => ({
                code:
                  groundwaterBodyCode(
                    feature
                  ),
                name:
                  groundwaterBodyName(
                    feature
                  ),
                properties:
                  feature.properties ??
                  {},
              })
            ),

          spatialContext,

          dowsingNotes,

          aiduFiles:
            parsedAiduFiles.map(
              item => ({
                fileName:
                  item.file.name,
                parsed:
                  item.parsed,
              })
            ),
        }),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result?.success
    ) {
      throw new Error(
        result?.error ||
          "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u0435\u043d AI \u043e\u0442\u0433\u043e\u0432\u043e\u0440."
      );
    }

    setChatMessages(
      current => [
        ...current,
        {
          role: "assistant",
          content:
            result.answer,
        },
      ]
    );

    const messageCost =
      Number(
        result?.aiUsage
          ?.estimatedCostUsd ??
          0
      );

    if (
      Number.isFinite(
        messageCost
      )
    ) {
      setChatUsageTotalUsd(
        current =>
          current +
          messageCost
      );
    }
  } catch (error) {
    setChatError(
      error instanceof Error
        ? error.message
        : "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u0435\u043d AI \u043e\u0442\u0433\u043e\u0432\u043e\u0440."
    );
  } finally {
    setChatLoading(false);
  }
  }

  async function createSharedAnalysis() {
    if (
      !analysisResult ||
      shareLoading
    ) {
      return;
    }

    setShareLoading(true);
    setShareError("");

    try {
      const response =
        await fetch(
          "/api/aidu-share",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              locationLabel,
              latitude:
                Number(lat),
              longitude:
                Number(lng),

              groundwaterBodies:
                groundwaterBodies.map(
                  body => ({
                    code:
                      groundwaterBodyCode(
                        body
                      ),
                    name:
                      groundwaterBodyName(
                        body
                      ),
                  })
                ),

              analysis:
                analysisResult,

              aiduFiles:
                parsedAiduFiles.map(
                  item => ({
                    fileName:
                      item.file.name,
                    parsed:
                      item.parsed,
                  })
                ),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043f\u043e\u0434\u0435\u043b\u044f\u043d\u0435."
        );
      }

      const shareOrigin =
        process.env.NODE_ENV ===
        "production"
          ? "https://www.sondi.bg"
          : window.location.origin;

      const url =
        shareOrigin +
        result.path;

      setShareUrl(url);

      try {
        await navigator.clipboard.writeText(
          url
        );
      } catch {}
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043f\u043e\u0434\u0435\u043b\u044f\u043d\u0435."
      );
    } finally {
      setShareLoading(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );
    } catch {}
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07111f 0%, #0b1625 100%)",
        color: "#eef6ff",
        padding: "28px 18px 60px",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#89a6c6",
              marginBottom: 6,
            }}
          >
            SONDI.BG
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.2,
            }}
          >
            AIDU анализ
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#a9bdd2",
              lineHeight: 1.6,
            }}
          >
            Анализ на AIDU измерване с използване на
            пространствените и хидрогеоложките данни за
            избраната локация.
          </p>
        </div>

        <section
          style={{
            background: "#0f1d2c",
            border: "1px solid #22384f",
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 18,
            }}
          >
            Избрана локация
          </h2>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={locationQuery}
              onChange={(event) =>
                setLocationQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  resolveLocation();
                }
              }}
              placeholder={"\u041d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u043b\u0438 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438"}
              style={{
                flex: "1 1 320px",
                minWidth: 220,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #2b435d",
                background: "#08121e",
                color: "#eef6ff",
                fontSize: 14,
              }}
            />

            <button
              type="button"
              onClick={resolveLocation}
              disabled={locationSearchLoading}
              style={{
                padding: "9px 14px",
                border: 0,
                borderRadius: 8,
                background: "#1f6feb",
                color: "#ffffff",
                cursor: locationSearchLoading ? "wait" : "pointer",
                fontWeight: 600,
              }}
            >
              {locationSearchLoading
                ? "\u0422\u044a\u0440\u0441\u0438..."
                : "\u0417\u0430\u0440\u0435\u0434\u0438 \u043b\u043e\u043a\u0430\u0446\u0438\u044f"}
            </button>
          </div>

          {locationSearchError && (
            <div
              style={{
                marginBottom: 12,
                color: "#ff9b9b",
                fontSize: 13,
              }}
            >
              {locationSearchError}
            </div>
          )}

          {locationLabel && (
            <div
              style={{
                marginBottom: 12,
                color: "#91a8be",
                fontSize: 13,
              }}
            >
              {locationLabel}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "#0a1522",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#7895b3",
                  marginBottom: 5,
                }}
              >
                Координати
              </div>

              <div>
                {coordinatesLabel}
              </div>
            </div>

            <div
              style={{
                background: "#0a1522",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#7895b3",
                  marginBottom: 5,
                }}
              >
                Подземно водно тяло
              </div>

              <div>
                {groundwaterLoading ? (
                  "\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0441\u0435..."
                ) : groundwaterError ? (
                  groundwaterError
                ) : groundwaterBodies.length === 0 ? (
                  "\u041d\u044f\u043c\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0430 \u043b\u043e\u043a\u0430\u0446\u0438\u044f"
                ) : (
                  <div>
                    {groundwaterBodies.map(
                      (body, index) => {
                        const code =
                          groundwaterBodyCode(body);
                        const name =
                          groundwaterBodyName(body);

                        return (
                          <div
                            key={
                              code ||
                              `gwb-${index}`
                            }
                            style={{
                              marginBottom:
                                index <
                                groundwaterBodies.length - 1
                                  ? 8
                                  : 0,
                            }}
                          >
                            <strong>
                              {code || "\u0411\u0435\u0437 \u043a\u043e\u0434"}
                            </strong>
                            {name
                              ? ` - ${name}`
                              : ""}
                          </div>
                        );
                      }
                    )}

                    {groundwaterBodies.length > 1 && (
                      <div
                        style={{
                          marginTop: 8,
                          color: "#91a8be",
                          fontSize: 12,
                        }}
                      >
                        \u0412 \u0442\u043e\u0447\u043a\u0430\u0442\u0430 \u0441\u0435 \u043f\u0440\u0438\u043f\u043e\u043a\u0440\u0438\u0432\u0430\u0442{" "}
                        {groundwaterBodies.length} \u041f\u0412\u0422.
                        \u0412\u0441\u0438\u0447\u043a\u0438 \u0449\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u0430\u0442 \u0432 AIDU
                        \u0430\u043d\u0430\u043b\u0438\u0437\u0430.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#0f1d2c",
            border: "1px solid #22384f",
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 18,
            }}
          >
            {"\u0410\u0418\u0414\u0423 \u0444\u0430\u0439\u043b\u043e\u0432\u0435"}
          </h2>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 14px",
              background: "#1f6feb",
              color: "#ffffff",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {"\u041a\u0430\u0447\u0438 AIDU .dat"}

            <input
              type="file"
              accept=".dat"
              multiple
              style={{
                display: "none",
              }}
              onChange={async (event) => {
                const selectedFiles =
                  Array.from(
                    event.target.files ?? []
                  );

                setAiduFileError("");

                if (selectedFiles.length === 0) {
                  return;
                }

                try {
                  const parsedFiles =
                    await Promise.all(
                      selectedFiles.map(
                        async (selectedFile) => {
                          const raw =
                            await selectedFile.text();

                          return {
                            file: selectedFile,
                            parsed:
                              parseAiduDat(raw),
                          };
                        }
                      )
                    );

                  setFiles((current) => {
                    const byKey = new Map(
                      current.map((item) => [
                        `${item.name}-${item.size}-${item.lastModified}`,
                        item,
                      ])
                    );

                    for (const item of selectedFiles) {
                      byKey.set(
                        `${item.name}-${item.size}-${item.lastModified}`,
                        item
                      );
                    }

                    return Array.from(byKey.values());
                  });

                  setParsedAiduFiles((current) => {
                    const byKey = new Map(
                      current.map((item) => [
                        `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
                        item,
                      ])
                    );

                    for (const item of parsedFiles) {
                      byKey.set(
                        `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
                        item
                      );
                    }

                    return Array.from(byKey.values());
                  });

                  event.target.value = "";
                } catch (error) {
                  setAiduFileError(
                    error instanceof Error
                      ? error.message
                      : "\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u0435 \u043d\u0430 AIDU \u0444\u0430\u0439\u043b."
                  );
                }
              }}
            />
          </label>

          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#91a8be",
            }}
          >
            {files.length === 0 ? (
              "\u041d\u044f\u043c\u0430 \u043a\u0430\u0447\u0435\u043d\u0438 .dat \u0444\u0430\u0439\u043b\u043e\u0432\u0435"
            ) : aiduFileError ? (
              <div>
                {"\u0413\u0440\u0435\u0448\u043a\u0430: "}
                {aiduFileError}
              </div>
            ) : parsedAiduFiles.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 6,
                }}
              >
                {parsedAiduFiles.map(
                  ({ file, parsed }) => (
                    <div key={file.name}>
                      <strong>
                        {file.name}
                      </strong>
                      {" - "}
                      {parsed.pointCount}
                      {" \u0442\u043e\u0447\u043a\u0438 - "}
                      {parsed.measurementCount}
                      {" \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f - "}
                      {parsed.minDepthM ?? "?"}
                      {"-"}
                      {parsed.maxDepthM ?? "?"}
                      {" m"}
                    </div>
                  )
                )}
              </div>
            ) : (
              "\u0424\u0430\u0439\u043b\u043e\u0432\u0435\u0442\u0435 \u0441\u0435 \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u0442..."
            )}
          </div>
        </section>

        <section
          style={{
            background: "#0f1d2c",
            border: "1px solid #22384f",
            borderRadius: 14,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 18,
            }}
          >
            {"\u041e\u0449\u0435 \u0434\u0430\u043d\u043d\u0438"}
          </h2>

          <textarea
            value={dowsingNotes}
            onChange={(event) =>
              setDowsingNotes(event.target.value)
            }
            placeholder="Допълнителна информация за обекта..."
            rows={6}
            style={{
              width: "100%",
              resize: "vertical",
              background: "#08121e",
              color: "#eef6ff",
              border: "1px solid #2b435d",
              borderRadius: 10,
              padding: 12,
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
        </section>

        <button
          type="button"
          disabled={!canAnalyze || analysisLoading}
          onClick={runAnalysis}
          style={{
            width: "100%",
            border: 0,
            borderRadius: 12,
            padding: "14px 18px",
            fontSize: 16,
            fontWeight: 700,
            cursor: canAnalyze
              ? "pointer"
              : "not-allowed",
            background: canAnalyze
              ? "#2c8cff"
              : "#263544",
            color: canAnalyze
              ? "#ffffff"
              : "#7e91a5",
          }}
        >
          Анализирай
        </button>

        {/* AIDU_ANALYSIS_LOADING_INDICATOR */}
        {analysisLoading && (
          <div
            style={{
              marginTop: 14,
              padding: "16px 18px",
              borderRadius: 12,
              background: "#102338",
              border: "1px solid #2c8cff",
              color: "#dcecff",
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              {"\u23f3 AIDU \u0430\u043d\u0430\u043b\u0438\u0437\u044a\u0442 \u0441\u0435 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0432\u0430..."}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#a9c8e8",
              }}
            >
              {"\u0418\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f\u0442\u0430, \u041f\u0412\u0422, \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0441\u043a\u0438\u044f\u0442 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u0438 \u0440\u0430\u0434\u0438\u0435\u0441\u0442\u0435\u0437\u0438\u044f\u0442\u0430 \u0441\u0435 \u0438\u0437\u043f\u0440\u0430\u0449\u0430\u0442 \u043a\u044a\u043c OpenAI. \u0410\u043d\u0430\u043b\u0438\u0437\u044a\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043e\u0442\u043d\u0435\u043c\u0435 \u043d\u044f\u043a\u043e\u043b\u043a\u043e \u043c\u0438\u043d\u0443\u0442\u0438."}
            </div>
          </div>
        )}

        {analysisError && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              border: "1px solid #713b46",
              background: "#2a1118",
              color: "#ffb3bd",
            }}
          >
            {analysisError}
          </div>
        )}

        {parsedAiduFiles.length > 0 &&
          !analysisResult && (
            <Aidu3DProfile
              files={parsedAiduFiles}
              analysisResult={null}
            />
          )}

        {analysisResult && (
          <section
            style={{
              marginTop: 18,
              background:
                "linear-gradient(180deg, #0d1c28 0%, #0b1721 100%)",
              border:
                "1px solid #2b6074",
              borderRadius: 16,
              padding: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  color: "#f2f8fc",
                }}
              >
                {
                  "\u0420\u0435\u0437\u0443\u043b\u0442\u0430\u0442 \u043e\u0442 \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435\u0442\u043e"
                }
              </h2>

              {locationLabel && (
                <div
                  style={{
                    marginTop: 5,
                    color: "#9db4c7",
                    fontSize: 13,
                  }}
                >
                  {locationLabel}
                </div>
              )}
            </div>

            {parsedAiduFiles.length > 0 && (
              <Aidu3DProfile
                files={parsedAiduFiles}
                analysisResult={analysisResult}
              />
            )}

            {analysisResult.clientText && (
              <div
                style={{
                  marginTop: 18,
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: "#10291f",
                  border:
                    "1px solid #285f47",
                  color: "#e6f3ec",
                  lineHeight: 1.7,
                  fontSize: 15,
                  whiteSpace: "pre-wrap",
                }}
              >
                {analysisResult.clientText}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
                marginBottom: 4,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  void createSharedAnalysis()
                }
                disabled={shareLoading}
                style={{
                  padding:
                    "10px 16px",
                  borderRadius: 10,
                  border:
                    "1px solid #3978a7",
                  background:
                    shareLoading
                      ? "#173149"
                      : "#145d8b",
                  color: "#fff",
                  fontWeight: 700,
                  cursor:
                    shareLoading
                      ? "default"
                      : "pointer",
                }}
              >
                {shareLoading
                  ? "\u0421\u044a\u0437\u0434\u0430\u0432\u0430 \u043b\u0438\u043d\u043a..."
                  : "\u0421\u043f\u043e\u0434\u0435\u043b\u0438 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0438\u044f \u0430\u043d\u0430\u043b\u0438\u0437"}
              </button>

              {shareUrl && (
                <button
                  type="button"
                  onClick={() =>
                    void copyShareUrl()
                  }
                  style={{
                    padding:
                      "10px 16px",
                    borderRadius: 10,
                    border:
                      "1px solid #496378",
                    background:
                      "#142332",
                    color: "#fff",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  {
                    "\u041a\u043e\u043f\u0438\u0440\u0430\u0439 \u043b\u0438\u043d\u043a\u0430"
                  }
                </button>
              )}
            </div>

            {shareUrl && (
              <div
                style={{
                  marginTop: 10,
                  padding: 11,
                  borderRadius: 9,
                  background: "#0a1b27",
                  border:
                    "1px solid #28536c",
                  color: "#a9d4ee",
                  fontSize: 13,
                  overflowWrap:
                    "anywhere",
                }}
              >
                <div
                  style={{
                    marginBottom: 5,
                    color: "#80c9a3",
                    fontWeight: 700,
                  }}
                >
                  {
                    "\u041b\u0438\u043d\u043a\u044a\u0442 \u0435 \u0433\u043e\u0442\u043e\u0432 \u0438 \u0435 \u043a\u043e\u043f\u0438\u0440\u0430\u043d."
                  }
                </div>

                {shareUrl}
              </div>
            )}

            {shareError && (
              <div
                style={{
                  marginTop: 10,
                  padding: 11,
                  borderRadius: 9,
                  background: "#2a1118",
                  border:
                    "1px solid #713b46",
                  color: "#ffb3bd",
                }}
              >
                {shareError}
              </div>
            )}

            <div
              style={{
                marginTop: 14,
                color: "#7894a8",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {
                "\u0412\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f\u0442\u0430 \u0438 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u0441\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f \u043d\u0430 \u0442\u0435\u0440\u0435\u043d\u043d\u043e\u0442\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u0438 \u043d\u0435 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u044f\u0432\u0430\u0442 \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u043e \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u0442\u0430 \u0432\u043e\u0434\u0430."
              }
            </div>
          </section>
        )}

        {analysisResult && (
          <section
            style={{
              marginTop: 18,
              background: "#0f1d2c",
              border: "1px solid #2b4d6d",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: 20,
              }}
            >
              {"\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u0430\u043d\u0430\u043b\u0438\u0437 \u2014 \u0437\u0430 \u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440"}
            </h2>

            {aiUsage && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 10,
                  background: "#08121e",
                  border: "1px solid #27415c",
                  color: "#a9bdd2",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <strong>
                    {"\u041c\u043e\u0434\u0435\u043b: "}
                  </strong>
                  {aiUsage.model}
                </div>

                <div>
                  <strong>
                    {"\u0422\u043e\u043a\u0435\u043d\u0438: "}
                  </strong>
                  {aiUsage.inputTokens}
                  {" input / "}
                  {aiUsage.outputTokens}
                  {" output"}
                  {aiUsage.cachedInputTokens > 0
                    ? ` / ${aiUsage.cachedInputTokens} cached`
                    : ""}
                </div>

                <div>
                  <strong>
                    {"\u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u044a\u0447\u0435\u043d API \u0440\u0430\u0437\u0445\u043e\u0434: "}
                  </strong>
                  {"$"}
                  {Number(
                    aiUsage.estimatedCostUsd ?? 0
                  ).toFixed(4)}
                </div>
              </div>
            )}

            {analysisResult.summary && (
              <div
                style={{
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  {"\u041e\u0431\u0449\u043e \u0437\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435: "}
                </strong>
                {analysisResult.summary}
              </div>
            )}

            {analysisResult.recommendedPoint && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 14,
                  background: "#0a1522",
                  borderRadius: 10,
                }}
              >
                <strong>
                  {"\u041f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0430\u043d\u0430 \u0442\u043e\u0447\u043a\u0430: "}
                </strong>
                {analysisResult.recommendedPoint.point}
                {analysisResult.recommendedPoint.confidence
                  ? ` (${analysisResult.recommendedPoint.confidence})`
                  : ""}
                <div
                  style={{
                    marginTop: 8,
                    color: "#b7c8d8",
                    lineHeight: 1.5,
                  }}
                >
                  {analysisResult.recommendedPoint.reasoning}
                </div>
              </div>
            )}

            {analysisResult.recommendedDrillingDepth && (
              <div
                style={{
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  {"\u041f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0438\u0442\u0435\u043b\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430: "}
                </strong>
                {analysisResult.recommendedDrillingDepth.fromM ?? "?"}
                {" - "}
                {analysisResult.recommendedDrillingDepth.toM ?? "?"}
                {" m"}
                {analysisResult.recommendedDrillingDepth.reasoning && (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#b7c8d8",
                    }}
                  >
                    {analysisResult.recommendedDrillingDepth.reasoning}
                  </div>
                )}
              </div>
            )}

            <details
              style={{
                marginTop: 18,
                color: "#a9bdd2",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#dceafa",
                }}
              >
                {
                  "\u041f\u043e\u0434\u0440\u043e\u0431\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437"
                }
              </summary>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {analysisResult.summary && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#0a1723",
                      border: "1px solid #29465f",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#eef7ff",
                      }}
                    >
                      {
                        "\u041e\u0431\u0449\u0430 \u043e\u0446\u0435\u043d\u043a\u0430"
                      }
                    </strong>

                    {analysisResult.summary}
                  </div>
                )}

                {analysisResult.strongestAiduPoint && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#0a1723",
                      border: "1px solid #29465f",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#f3d66b",
                      }}
                    >
                      {
                        "\u041d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u043f\u043e \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f\u0442\u0430"
                      }
                    </strong>

                    <div>
                      <b>
                        {
                          "\u0422\u043e\u0447\u043a\u0430: "
                        }
                      </b>
                      {
                        analysisResult
                          .strongestAiduPoint
                          .point
                      }
                    </div>

                    {analysisResult
                      .strongestAiduPoint
                      .reasoning && (
                      <div
                        style={{
                          marginTop: 6,
                        }}
                      >
                        {
                          analysisResult
                            .strongestAiduPoint
                            .reasoning
                        }
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.bestCrossProfilePoint && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#0a1723",
                      border: "1px solid #29465f",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#76cce5",
                      }}
                    >
                      {
                        "\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0435 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u043c\u0435\u0436\u0434\u0443 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f\u0442\u0430"
                      }
                    </strong>

                    {analysisResult
                      .bestCrossProfilePoint
                      .available ? (
                      <>
                        <div>
                          <b>
                            {
                              "\u0422\u043e\u0447\u043a\u0430: "
                            }
                          </b>
                          {
                            analysisResult
                              .bestCrossProfilePoint
                              .point
                          }
                        </div>

                        {analysisResult
                          .bestCrossProfilePoint
                          .reasoning && (
                          <div
                            style={{
                              marginTop: 6,
                            }}
                          >
                            {
                              analysisResult
                                .bestCrossProfilePoint
                                .reasoning
                            }
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        {
                          "\u041d\u044f\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u043a\u0440\u044a\u0441\u0442\u043e\u0441\u0430\u043d\u043e \u043f\u043e\u0442\u0432\u044a\u0440\u0436\u0434\u0435\u043d\u0438\u0435."
                        }
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.recommendedPoint && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#10271e",
                      border: "1px solid #2a674c",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#98e0ba",
                      }}
                    >
                      {
                        "\u041a\u0440\u0430\u0439\u043d\u0430 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436"
                      }
                    </strong>

                    <div>
                      <b>
                        {
                          "\u0422\u043e\u0447\u043a\u0430: "
                        }
                      </b>
                      {
                        analysisResult
                          .recommendedPoint
                          .point
                      }
                    </div>

                    {analysisResult
                      .recommendedPoint
                      .reasoning && (
                      <div
                        style={{
                          marginTop: 6,
                        }}
                      >
                        {
                          analysisResult
                            .recommendedPoint
                            .reasoning
                        }
                      </div>
                    )}

                    {analysisResult
                      .recommendedPoint
                      .whyPreferredOverStrongestAiduPoint && (
                      <div
                        style={{
                          marginTop: 8,
                          color: "#bcd7c8",
                        }}
                      >
                        <b>
                          {
                            "\u0417\u0430\u0449\u043e \u0435 \u0438\u0437\u0431\u0440\u0430\u043d\u0430: "
                          }
                        </b>

                        {
                          analysisResult
                            .recommendedPoint
                            .whyPreferredOverStrongestAiduPoint
                        }
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.mapComparison && (
                  <div
                    style={{
                      padding: 15,
                      borderRadius: 10,
                      background:
                        analysisResult
                          .mapComparison
                          .effectOnRecommendation ===
                        "supports"
                          ? "#10271e"
                          : analysisResult
                              .mapComparison
                              .effectOnRecommendation ===
                            "contradicts"
                          ? "#2a1717"
                          : "#15202b",

                      border:
                        analysisResult
                          .mapComparison
                          .effectOnRecommendation ===
                        "supports"
                          ? "1px solid #2a674c"
                          : analysisResult
                              .mapComparison
                              .effectOnRecommendation ===
                            "contradicts"
                          ? "1px solid #754147"
                          : "1px solid #3b5368",

                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontSize: 16,
                        color: "#eef7ff",
                      }}
                    >
                      {
                        "\u0412\u043b\u0438\u044f\u043d\u0438\u0435 \u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0432\u0438\u0442\u0435 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u043e\u0432\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u0438"
                      }
                    </strong>

                    <div
                      style={{
                        marginBottom: 8,
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {analysisResult
                        .mapComparison
                        .effectOnRecommendation ===
                      "supports"
                        ? "\u041f\u043e\u0442\u0432\u044a\u0440\u0436\u0434\u0430\u0432\u0430\u0442 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430\u0442\u0430"
                        : analysisResult
                            .mapComparison
                            .effectOnRecommendation ===
                          "contradicts"
                        ? "\u041e\u0442\u0441\u043b\u0430\u0431\u0432\u0430\u0442 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430\u0442\u0430"
                        : "\u041d\u0435\u0443\u0442\u0440\u0430\u043b\u043d\u0438 \u0441\u0430 \u0437\u0430 \u043a\u0440\u0430\u0439\u043d\u0438\u044f \u0438\u0437\u0431\u043e\u0440"}
                    </div>

                    {Array.isArray(
                      analysisResult
                        .mapComparison
                        .supportingEvidence
                    ) &&
                      analysisResult
                        .mapComparison
                        .supportingEvidence
                        .length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                          }}
                        >
                          <b>
                            {
                              "\u0414\u0430\u043d\u043d\u0438, \u043a\u043e\u0438\u0442\u043e \u043f\u043e\u0434\u043a\u0440\u0435\u043f\u044f\u0442 \u0438\u0437\u0431\u043e\u0440\u0430:"
                            }
                          </b>

                          <ul
                            style={{
                              margin:
                                "6px 0 0 20px",
                              padding: 0,
                            }}
                          >
                            {analysisResult
                              .mapComparison
                              .supportingEvidence
                              .map(
                                (
                                  item: string,
                                  index: number
                                ) => (
                                  <li
                                    key={
                                      "support-" +
                                      index
                                    }
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                          </ul>
                        </div>
                      )}

                    {Array.isArray(
                      analysisResult
                        .mapComparison
                        .contradictingEvidence
                    ) &&
                      analysisResult
                        .mapComparison
                        .contradictingEvidence
                        .length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                          }}
                        >
                          <b>
                            {
                              "\u0414\u0430\u043d\u043d\u0438, \u043a\u043e\u0438\u0442\u043e \u043e\u0442\u0441\u043b\u0430\u0431\u0432\u0430\u0442 \u0438\u0437\u0431\u043e\u0440\u0430:"
                            }
                          </b>

                          <ul
                            style={{
                              margin:
                                "6px 0 0 20px",
                              padding: 0,
                            }}
                          >
                            {analysisResult
                              .mapComparison
                              .contradictingEvidence
                              .map(
                                (
                                  item: string,
                                  index: number
                                ) => (
                                  <li
                                    key={
                                      "against-" +
                                      index
                                    }
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                          </ul>
                        </div>
                      )}

                    {analysisResult
                      .mapComparison
                      .details && (
                      <div
                        style={{
                          marginTop: 10,
                          color: "#b8c9d8",
                        }}
                      >
                        {
                          analysisResult
                            .mapComparison
                            .details
                        }
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.recommendedDrillingDepth && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "#0a1723",
                      border: "1px solid #29465f",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#eef7ff",
                      }}
                    >
                      {
                        "\u041f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0438\u0442\u0435\u043b\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"
                      }
                    </strong>

                    <div>
                      {analysisResult
                        .recommendedDrillingDepth
                        .fromM != null &&
                        analysisResult
                          .recommendedDrillingDepth
                          .toM != null && (
                          <b>
                            {
                              analysisResult
                                .recommendedDrillingDepth
                                .fromM
                            }
                            {" \u2013 "}
                            {
                              analysisResult
                                .recommendedDrillingDepth
                                .toM
                            }
                            {" m"}
                          </b>
                        )}
                    </div>

                    {analysisResult
                      .recommendedDrillingDepth
                      .reasoning && (
                      <div
                        style={{
                          marginTop: 6,
                        }}
                      >
                        {
                          analysisResult
                            .recommendedDrillingDepth
                            .reasoning
                        }
                      </div>
                    )}
                  </div>
                )}

                {Array.isArray(
                  analysisResult.limitations
                ) &&
                  analysisResult.limitations
                    .length > 0 && (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: "#171c24",
                        border:
                          "1px solid #4a5361",
                        lineHeight: 1.6,
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: 6,
                          color: "#d6dee8",
                        }}
                      >
                        {
                          "\u041e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f \u043d\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0430"
                        }
                      </strong>

                      <ul
                        style={{
                          margin:
                            "6px 0 0 20px",
                          padding: 0,
                        }}
                      >
                        {analysisResult
                          .limitations
                          .map(
                            (
                              item: string,
                              index: number
                            ) => (
                              <li
                                key={
                                  "limit-" +
                                  index
                                }
                              >
                                {item}
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  )}
              </div>
            </details>

            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop:
                  "1px solid #29455f",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 6px",
                  fontSize: 18,
                  color: "#eef7ff",
                }}
              >
                {
                  "\u0420\u0430\u0437\u0433\u043e\u0432\u043e\u0440 \u0441 AI \u0437\u0430 \u0442\u043e\u0437\u0438 \u0430\u043d\u0430\u043b\u0438\u0437"
                }
              </h3>

              <div
                style={{
                  marginBottom: 14,
                  color: "#94abc0",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {
                  "\u0414\u0430 \u043e\u0431\u0441\u044a\u0434\u0438\u043c \u043b\u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430?"
                }
              </div>

              {chatMessages.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {chatMessages.map(
                    (
                      message,
                      index
                    ) => (
                      <div
                        key={index}
                        style={{
                          justifySelf:
                            message.role ===
                            "user"
                              ? "end"
                              : "start",

                          maxWidth:
                            "88%",

                          padding:
                            "11px 13px",

                          borderRadius:
                            11,

                          background:
                            message.role ===
                            "user"
                              ? "#153a58"
                              : "#091722",

                          border:
                            message.role ===
                            "user"
                              ? "1px solid #326488"
                              : "1px solid #29455f",

                          color:
                            "#dce9f4",

                          lineHeight:
                            1.55,

                          whiteSpace:
                            "pre-wrap",
                        }}
                      >
                        <div
                          style={{
                            marginBottom: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                              message.role ===
                              "user"
                                ? "#8bc9f1"
                                : "#76d3ac",
                          }}
                        >
                          {message.role ===
                          "user"
                            ? "\u0410\u0437"
                            : "AI"}
                        </div>

                        {
                          message.content
                        }
                      </div>
                    )
                  )}
                </div>
              )}

              {chatLoading && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 9,
                    background:
                      "#0c2030",
                    color:
                      "#a9c8e8",
                    fontSize: 13,
                  }}
                >
                  {
                    "\u23f3 AI \u043f\u0440\u0435\u0433\u043b\u0435\u0436\u0434\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u0432\u044f \u043e\u0442\u0433\u043e\u0432\u043e\u0440..."
                  }
                </div>
              )}

              {chatError && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 9,
                    border:
                      "1px solid #713b46",
                    background:
                      "#2a1118",
                    color:
                      "#ffb3bd",
                  }}
                >
                  {chatError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems:
                    "stretch",
                  flexWrap: "wrap",
                }}
              >
                <textarea
                  value={chatQuestion}
                  onChange={event =>
                    setChatQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={event => {
                    if (
                      event.key ===
                        "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      void sendChatMessage();
                    }
                  }}
                  placeholder=""
                  disabled={
                    chatLoading
                  }
                  rows={3}
                  style={{
                    flex:
                      "1 1 480px",
                    minWidth: 0,
                    resize:
                      "vertical",
                    padding:
                      "11px 12px",
                    borderRadius: 10,
                    border:
                      "1px solid #34546f",
                    background:
                      "#06101a",
                    color:
                      "#eef7ff",
                    font:
                      "inherit",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    void sendChatMessage()
                  }
                  disabled={
                    chatLoading ||
                    !chatQuestion.trim()
                  }
                  style={{
                    minWidth: 135,
                    padding:
                      "10px 16px",
                    borderRadius: 10,
                    border:
                      "1px solid #3978a7",
                    background:
                      chatLoading
                        ? "#173149"
                        : "#145d8b",
                    color: "white",
                    fontWeight: 700,
                    cursor:
                      chatLoading
                        ? "default"
                        : "pointer",
                  }}
                >
                  {chatLoading
                    ? "\u041e\u0442\u0433\u043e\u0432\u0430\u0440\u044f..."
                    : "\u041f\u043e\u043f\u0438\u0442\u0430\u0439 AI"}
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 9,
                  background:
                    "#07111d",
                  color:
                    "#91a8bc",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <strong>
                  {
                    "\u0420\u0430\u0437\u0445\u043e\u0434 \u0437\u0430 \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440\u0430: "
                  }
                </strong>

                {"$"}
                {chatUsageTotalUsd.toFixed(
                  4
                )}

                {aiUsage && (
                  <>
                    {" \u00b7 "}

                    <strong>
                      {
                        "\u041e\u0431\u0449\u043e AI \u0437\u0430 \u043e\u0431\u0435\u043a\u0442\u0430: "
                      }
                    </strong>

                    {"$"}

                    {(
                      Number(
                        aiUsage
                          .estimatedCostUsd ??
                          0
                      ) +
                      chatUsageTotalUsd
                    ).toFixed(4)}
                  </>
                )}
              </div>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}

export default function AiduPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(180deg, #07111f 0%, #0b1625 100%)",
            color: "#eef6ff",
            padding: "28px 18px 60px",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
            }}
          >
            ????????? ?? AIDU ???????\u0430\u043d\u0430\u043b\u0438\u0437\u0430...
          </div>
        </main>
      }
    >
      <AiduPageContent />
    </Suspense>
  );
}



