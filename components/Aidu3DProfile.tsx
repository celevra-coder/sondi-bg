"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { AiduParsedFile } from "../lib/aidu-parser";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050d16",
          borderRadius: 12,
          color: "#9db4c8",
        }}
      >
        {
          "\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 3D \u0432\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f\u0442\u0430..."
        }
      </div>
    ),
  }
);

type ParsedFileEntry = {
  file: File;
  parsed: AiduParsedFile;
};

type Props = {
  files: ParsedFileEntry[];
  analysisResult?: any;
};

type ViewMode = "client" | "raw";

/*
  Temporary local visualization mode.
  This does NOT call OpenAI.

  Set to false when the visual design is approved.
*/
const SHOW_LOCAL_TEST_INTERPRETATION = false;

const LOCAL_TEST_HORIZONS = [
  {
    label: "\u041e\u0441\u043d\u043e\u0432\u043d\u0430 \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0430 \u0437\u043e\u043d\u0430",
    fromM: 55,
    toM: 80,
    confidence: "\u0441\u0440\u0435\u0434\u043d\u0430",
  },
  {
    label: "\u0412\u0442\u043e\u0440\u0438\u0447\u043d\u0430 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0430 \u0437\u043e\u043d\u0430",
    fromM: 40,
    toM: 50,
    confidence: "\u043d\u0438\u0441\u043a\u0430",
  },
];

const LOCAL_TEST_RECOMMENDED_POINT = 3;

function uniqueSorted(values: number[]) {
  return Array.from(new Set(values)).sort(
    (a, b) => a - b
  );
}

function buildSection(parsed: AiduParsedFile) {
  const points = parsed.points.map(
    item => item.point
  );

  const depths = uniqueSorted(
    parsed.points.flatMap(point =>
      point.measurements.map(
        measurement => measurement.depthM
      )
    )
  );

  const values = depths.map(depth =>
    points.map(pointNumber => {
      const profile = parsed.points.find(
        item => item.point === pointNumber
      );

      const measurement =
        profile?.measurements.find(
          item => item.depthM === depth
        );

      return measurement
        ? measurement.valueE
        : null;
    })
  );

  const validValues = values
    .flat()
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value)
    );

  const minE =
    validValues.length
      ? Math.min(...validValues)
      : 0;

  const maxE =
    validValues.length
      ? Math.max(...validValues)
      : 1;

  const range =
    Math.max(maxE - minE, 1e-9);

  const normalized = values.map(row =>
    row.map(value => {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        return null;
      }

      return (value - minE) / range;
    })
  );

  /*
    Vertical geological curtain:
    X = survey point
    Z = real depth
    Y = very small relief only to preserve 3D
    Color = measured E
  */

  const x = depths.map(() => [...points]);

  const z = depths.map(depth =>
    points.map(() => -depth)
  );

  const y = normalized.map(row =>
    row.map(value =>
      typeof value === "number"
        ? value * 0.24
        : null
    )
  );

  return {
    points,
    depths,
    values,
    normalized,
    x,
    y,
    z,
    minE,
    maxE,
  };
}

function extractPointNumber(
  value: unknown
) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /(?:\u0442\u043e\u0447\u043a\u0430|point)\s*(\d+)/i
  );

  if (match) {
    return Number(match[1]);
  }

  const simple =
    value.match(/\b(\d+)\b/);

  return simple
    ? Number(simple[1])
    : null;
}

function extractRecommendedPoint(
  analysisResult: any
) {
  const raw =
    analysisResult?.recommendedPoint?.point;

  if (typeof raw !== "string") {
    return null;
  }

  return extractPointNumber(raw);
}

function getCandidateHorizons(
  analysisResult: any
) {
  if (
    !Array.isArray(
      analysisResult?.candidateHorizons
    )
  ) {
    return [];
  }

  return analysisResult.candidateHorizons
    .map((item: any) => ({
      label:
        typeof item?.label === "string"
          ? item.label
          : "\u0418\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0438\u0440\u0430\u043d\u0430 \u0437\u043e\u043d\u0430",
      fromM: Number(item?.fromM),
      toM: Number(item?.toM),
      confidence:
        typeof item?.confidence === "string"
          ? item.confidence
          : "",
    }))
    .filter(
      (item: any) =>
        Number.isFinite(item.fromM) &&
        Number.isFinite(item.toM)
    );
}

function confidenceOpacity(
  confidence: string
) {
  const value =
    confidence.toLowerCase();

  if (
    value.includes("\u0432\u0438\u0441\u043e\u043a")
  ) {
    return 0.34;
  }

  if (
    value.includes("\u0441\u0440\u0435\u0434")
  ) {
    return 0.24;
  }

  return 0.15;
}

export default function Aidu3DProfile({
  files,
  analysisResult,
}: Props) {
  const [viewMode, setViewMode] =
    useState<ViewMode>("client");

  const plotRefs =
    useRef<Record<string, any>>({});

  const [recordingKey, setRecordingKey] =
    useState<string | null>(null);

  const [videoError, setVideoError] =
    useState("");

  if (!files.length) {
    return null;
  }

  const aiRecommendedPoint =
    extractRecommendedPoint(
      analysisResult
    );

  const aiHorizons =
    getCandidateHorizons(
      analysisResult
    );

  const recommendedPoint =
    aiRecommendedPoint ??
    (
      SHOW_LOCAL_TEST_INTERPRETATION &&
      !analysisResult
        ? LOCAL_TEST_RECOMMENDED_POINT
        : null
    );

  const strongestAiduPoint =
    extractPointNumber(
      analysisResult
        ?.strongestAiduPoint
        ?.point
    );

  const bestCrossProfilePoint =
    analysisResult
      ?.bestCrossProfilePoint
      ?.available
      ? extractPointNumber(
          analysisResult
            ?.bestCrossProfilePoint
            ?.point
        )
      : null;

  const horizons =
    aiHorizons.length > 0
      ? aiHorizons
      : (
          SHOW_LOCAL_TEST_INTERPRETATION &&
          !analysisResult
            ? LOCAL_TEST_HORIZONS
            : []
        );

  async function download3DVideo(
    plotKey: string,
    fileName: string
  ) {
    if (recordingKey) {
      return;
    }

    const graphDiv =
      plotRefs.current[plotKey];

    if (!graphDiv) {
      setVideoError(
        "\u041d\u0435 \u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d 3D \u043c\u043e\u0434\u0435\u043b\u044a\u0442."
      );
      return;
    }

    setVideoError("");
    setRecordingKey(plotKey);

    let stream: MediaStream | null =
      null;

    try {
      const module =
        await import(
          "plotly.js-dist-min"
        );

      const Plotly =
        (module as any).default ??
        module;

      const canvases =
        Array.from(
          graphDiv.querySelectorAll(
            "canvas"
          )
        ) as HTMLCanvasElement[];

      if (!canvases.length) {
        throw new Error(
          "\u041d\u0435 \u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d WebGL \u0438\u0437\u0433\u043b\u0435\u0434\u044a\u0442."
        );
      }

      /*
        Plotly may create more than one canvas.
        The largest one is the actual 3D scene.
      */
      const canvas =
        canvases.reduce(
          (largest, current) =>
            (
              current.width *
                current.height >
              largest.width *
                largest.height
            )
              ? current
              : largest
        );

      if (
        typeof canvas.captureStream !==
        "function"
      ) {
        throw new Error(
          "\u0411\u0440\u0430\u0443\u0437\u044a\u0440\u044a\u0442 \u043d\u0435 \u043f\u043e\u0434\u0434\u044a\u0440\u0436\u0430 \u0437\u0430\u043f\u0438\u0441 \u043d\u0430 3D \u0432\u0438\u0434\u0435\u043e."
        );
      }

      stream =
        canvas.captureStream(30);

      const mimeCandidates = [
        "video/mp4;codecs=h264",
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      const mimeType =
        mimeCandidates.find(
          type =>
            typeof MediaRecorder !==
              "undefined" &&
            MediaRecorder.isTypeSupported(
              type
            )
        ) || "";

      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        throw new Error(
          "\u0411\u0440\u0430\u0443\u0437\u044a\u0440\u044a\u0442 \u043d\u0435 \u043f\u043e\u0434\u0434\u044a\u0440\u0436\u0430 MediaRecorder."
        );
      }

      const recorder =
        new MediaRecorder(
          stream,
          mimeType
            ? {
                mimeType,
                videoBitsPerSecond:
                  6_000_000,
              }
            : {
                videoBitsPerSecond:
                  6_000_000,
              }
        );

      const chunks: BlobPart[] =
        [];

      recorder.ondataavailable =
        event => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunks.push(
              event.data
            );
          }
        };

      const originalCamera =
        graphDiv?._fullLayout
          ?.scene?._scene
          ?.getCamera?.() ??
        graphDiv?._fullLayout
          ?.scene?.camera ??
        {
          eye: {
            x: 0.08,
            y: -2.45,
            z: 0.16,
          },
          center: {
            x: 0,
            y: 0,
            z: -0.04,
          },
          up: {
            x: 0,
            y: 0,
            z: 1,
          },
        };

      const finished =
        new Promise<Blob>(
          (resolve, reject) => {
            recorder.onerror =
              () => {
                reject(
                  new Error(
                    "\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u043f\u0438\u0441\u0430 \u043d\u0430 \u0432\u0438\u0434\u0435\u043e\u0442\u043e."
                  )
                );
              };

            recorder.onstop =
              () => {
                resolve(
                  new Blob(
                    chunks,
                    {
                      type:
                        recorder.mimeType ||
                        "video/webm",
                    }
                  )
                );
              };
          }
        );

      recorder.start(250);

      /*
        One smooth full orbit.
        The slight Z movement keeps the
        depth structure visible.
      */
      const durationMs =
        9000;

      const frameMs =
        70;

      const steps =
        Math.ceil(
          durationMs /
            frameMs
        );

      const radius =
        2.45;

      for (
        let step = 0;
        step <= steps;
        step++
      ) {
        const t =
          step / steps;

        const angle =
          t *
          Math.PI *
          2;

        const camera = {
          eye: {
            x:
              Math.sin(angle) *
              radius,

            y:
              -Math.cos(angle) *
              radius,

            z:
              0.28 +
              Math.sin(
                angle * 2
              ) *
                0.12,
          },

          center: {
            x: 0,
            y: 0,
            z: -0.04,
          },

          up: {
            x: 0,
            y: 0,
            z: 1,
          },
        };

        await Plotly.relayout(
          graphDiv,
          {
            "scene.camera":
              camera,
          }
        );

        await new Promise(
          resolve =>
            window.setTimeout(
              resolve,
              frameMs
            )
        );
      }

      /*
        Give the final frame a moment
        before closing the recorder.
      */
      await new Promise(
        resolve =>
          window.setTimeout(
            resolve,
            250
          )
      );

      recorder.stop();

      const blob =
        await finished;

      await Plotly.relayout(
        graphDiv,
        {
          "scene.camera":
            originalCamera,
        }
      );

      const extension =
        blob.type.includes(
          "mp4"
        )
          ? "mp4"
          : "webm";

      const cleanName =
        fileName
          .replace(
            /\.dat$/i,
            ""
          )
          .replace(
            /[^a-zA-Z0-9_-]+/g,
            "-"
          );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        cleanName +
        "-3d-video." +
        extension;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      window.setTimeout(
        () =>
          URL.revokeObjectURL(
            url
          ),
        2000
      );
    } catch (error) {
      setVideoError(
        error instanceof Error
          ? error.message
          : "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u044a\u0437\u0434\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 3D \u0432\u0438\u0434\u0435\u043e."
      );
    } finally {
      stream
        ?.getTracks()
        .forEach(
          track =>
            track.stop()
        );

      setRecordingKey(null);
    }
  }

  return (
    <section
      style={{
        marginTop: 20,
        padding: 18,
        borderRadius: 14,
        background: "#08131f",
        border: "1px solid #254563",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 21,
              color: "#eef7ff",
            }}
          >
            {
              "3D \u0433\u0435\u043e\u0444\u0438\u0437\u0438\u0447\u043d\u0430 \u0432\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f"
            }
          </h2>

          <div
            style={{
              marginTop: 7,
              maxWidth: 850,
              color: "#9fb4c8",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {
              "\u0420\u0430\u0437\u0440\u0435\u0437\u044a\u0442 \u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u043e \u043e\u0442 AIDU \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f\u0442\u0430. \u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u0435 \u0440\u0435\u0430\u043b\u043d\u0430\u0442\u0430 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u0430 \u0446\u0432\u0435\u0442\u044a\u0442 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u0433\u0435\u043e\u0435\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u043d \u043a\u043e\u043d\u0442\u0440\u0430\u0441\u0442."
            }
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setViewMode("client")
            }
            style={{
              minHeight: 38,
              padding: "8px 13px",
              borderRadius: 9,
              border:
                viewMode === "client"
                  ? "1px solid #58aeea"
                  : "1px solid #28445e",
              background:
                viewMode === "client"
                  ? "#123b59"
                  : "#07111d",
              color: "#e8f5ff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {
              "\u041a\u043b\u0438\u0435\u043d\u0442\u0441\u043a\u0438 \u0438\u0437\u0433\u043b\u0435\u0434"
            }
          </button>

          <button
            type="button"
            onClick={() =>
              setViewMode("raw")
            }
            style={{
              minHeight: 38,
              padding: "8px 13px",
              borderRadius: 9,
              border:
                viewMode === "raw"
                  ? "1px solid #58aeea"
                  : "1px solid #28445e",
              background:
                viewMode === "raw"
                  ? "#123b59"
                  : "#07111d",
              color: "#e8f5ff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {
              "\u0418\u0437\u043c\u0435\u0440\u0435\u043d\u0438 E \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438"
            }
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        {files.map(({ file, parsed }) => {
          const section =
            buildSection(parsed);

          const traces: any[] = [
            {
              type: "surface",
              x: section.x,
              y: section.y,
              z: section.z,
              surfacecolor:
                section.values,

              colorscale:
                viewMode === "client"
                  ? [
                      [0.0, "#172838"],
                      [0.16, "#20394a"],
                      [0.30, "#31566a"],
                      [0.43, "#507b82"],
                      [0.54, "#b3a86c"],
                      [0.67, "#bf803f"],
                      [0.82, "#98472f"],
                      [1.0, "#60202a"],
                    ]
                  : "Turbo",

              cmin: section.minE,
              cmax: section.maxE,

              opacity:
                viewMode === "client"
                  ? 0.96
                  : 1,

              showscale: true,

              colorbar: {
                title: {
                  text:
                    viewMode === "client"
                      ? "\u0413\u0435\u043e\u0435\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u043d \u043a\u043e\u043d\u0442\u0440\u0430\u0441\u0442"
                      : "\u0418\u0437\u043c\u0435\u0440\u0435\u043d\u0430 E",
                },
                tickfont: {
                  color: "#d6e4f0",
                },
                titlefont: {
                  color: "#d6e4f0",
                },
                thickness: 20,
                len: 0.66,
              },

              lighting: {
                ambient: 0.75,
                diffuse: 0.55,
                roughness: 0.85,
                specular: 0.08,
                fresnel: 0.05,
              },

              lightposition: {
                x: 100,
                y: -100,
                z: 100,
              },

              hovertemplate:
                "\u0422\u043e\u0447\u043a\u0430 %{x}<br>" +
                "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 %{z:.0f} m<br>" +
                "E %{surfacecolor:.4f}" +
                "<extra></extra>",
            },
          ];

          /*
            AI interpreted horizons.
            They appear only after an actual AI analysis.
          */
          if (
            viewMode === "client" &&
            horizons.length > 0
          ) {
            for (
              let h = 0;
              h < horizons.length;
              h++
            ) {
              const horizon =
                horizons[h];

              const fromM =
                Math.min(
                  horizon.fromM,
                  horizon.toM
                );

              const toM =
                Math.max(
                  horizon.fromM,
                  horizon.toM
                );

              const centerDepth =
                (fromM + toM) / 2;

              const halfThickness =
                Math.max(
                  (toM - fromM) / 2,
                  1
                );

              const xValues =
                section.points;

              /*
                Soft interpreted horizon:
                the band is narrowest at the profile edges
                and fuller around the centre.
              */
              const pointStrength =
                xValues.map(
                  pointNumber => {
                    const profileIndex =
                      section.points.indexOf(
                        pointNumber
                      );

                    if (profileIndex < 0) {
                      return 0.5;
                    }

                    const valuesInHorizon =
                      section.depths
                        .map(
                          (
                            depth,
                            depthIndex
                          ) => ({
                            depth,
                            value:
                              section.normalized[
                                depthIndex
                              ]?.[
                                profileIndex
                              ],
                          })
                        )
                        .filter(
                          item =>
                            item.depth >=
                              fromM &&
                            item.depth <=
                              toM &&
                            typeof item.value ===
                              "number"
                        )
                        .map(
                          item =>
                            Number(
                              item.value
                            )
                        );

                    if (
                      valuesInHorizon.length ===
                      0
                    ) {
                      return 0.5;
                    }

                    return (
                      valuesInHorizon.reduce(
                        (sum, value) =>
                          sum + value,
                        0
                      ) /
                      valuesInHorizon.length
                    );
                  }
                );

              /*
                Smooth neighbouring points so the zone
                does not look angular or artificial.
              */
              const smoothedStrength =
                pointStrength.map(
                  (_, index) => {
                    const values = [
                      pointStrength[
                        index - 1
                      ],
                      pointStrength[index],
                      pointStrength[
                        index + 1
                      ],
                    ].filter(
                      (
                        value
                      ): value is number =>
                        typeof value ===
                          "number"
                    );

                    return (
                      values.reduce(
                        (sum, value) =>
                          sum + value,
                        0
                      ) /
                      values.length
                    );
                  }
                );

              const topZ =
                xValues.map(
                  (_, index) => {
                    const strength =
                      smoothedStrength[
                        index
                      ] ?? 0.5;

                    const thicknessFactor =
                      0.18 +
                      Math.pow(
                        strength,
                        1.55
                      ) * 0.82;

                    const localWave =
                      Math.sin(
                        index * 1.15 +
                        h * 0.75
                      ) *
                      Math.min(
                        1.2,
                        halfThickness * 0.07
                      );

                    return -(
                      centerDepth -
                      halfThickness *
                        thicknessFactor +
                      localWave
                    );
                  }
                );

              const bottomZ =
                xValues.map(
                  (_, index) => {
                    const strength =
                      smoothedStrength[
                        index
                      ] ?? 0.5;

                    const thicknessFactor =
                      0.20 +
                      Math.pow(
                        strength,
                        1.35
                      ) * 0.80;

                    const localWave =
                      Math.cos(
                        index * 1.08 +
                        h * 0.65
                      ) *
                      Math.min(
                        1.4,
                        halfThickness * 0.08
                      );

                    return -(
                      centerDepth +
                      halfThickness *
                        thicknessFactor +
                      localWave
                    );
                  }
                );

              const zoneX = [
                ...xValues,
                ...[...xValues].reverse(),
              ];

              const zoneZ = [
                ...topZ,
                ...[...bottomZ].reverse(),
              ];

              /*
                Put the interpretation slightly in front
                of the measured curtain so both remain visible.
              */
              const zoneY =
                zoneX.map(
                  (_, index) => {
                    const count =
                      xValues.length;

                    const localIndex =
                      index < count
                        ? index
                        : (
                            count - 1 -
                            (index - count)
                          );

                    const t =
                      count <= 1
                        ? 0.5
                        : localIndex /
                          (count - 1);

                    return (
                      0.31 +
                      0.025 *
                        Math.sin(
                          Math.PI * t
                        )
                    );
                  }
                );

              const triangleI: number[] = [];
              const triangleJ: number[] = [];
              const triangleK: number[] = [];

              for (
                let index = 0;
                index <
                xValues.length - 1;
                index++
              ) {
                const topA = index;
                const topB =
                  index + 1;

                const bottomA =
                  zoneX.length -
                  1 -
                  index;

                const bottomB =
                  zoneX.length -
                  2 -
                  index;

                triangleI.push(
                  topA,
                  topA
                );

                triangleJ.push(
                  topB,
                  bottomB
                );

                triangleK.push(
                  bottomB,
                  bottomA
                );
              }

              /*
                Draw the interpreted horizon as separate
                translucent segments. This allows weak
                parts of the measured profile to fade,
                instead of showing one continuous band
                with uniform strength.
              */
              for (
                let segmentIndex = 0;
                segmentIndex <
                xValues.length - 1;
                segmentIndex++
              ) {
                const strengthA =
                  smoothedStrength[
                    segmentIndex
                  ] ?? 0;

                const strengthB =
                  smoothedStrength[
                    segmentIndex + 1
                  ] ?? 0;

                const segmentStrength =
                  (
                    strengthA +
                    strengthB
                  ) / 2;

                /*
                  Suppress weak areas strongly.
                  This is visual weighting only,
                  not a probability of water.
                */
                const visibility =
                  Math.max(
                    0,
                    Math.min(
                      1,
                      (
                        segmentStrength -
                        0.28
                      ) / 0.52
                    )
                  );

                if (visibility < 0.10) {
                  continue;
                }

                const xA =
                  xValues[
                    segmentIndex
                  ];

                const xB =
                  xValues[
                    segmentIndex + 1
                  ];

                const segmentTopA =
                  topZ[
                    segmentIndex
                  ];

                const segmentTopB =
                  topZ[
                    segmentIndex + 1
                  ];

                const segmentBottomA =
                  bottomZ[
                    segmentIndex
                  ];

                const segmentBottomB =
                  bottomZ[
                    segmentIndex + 1
                  ];

                const yFront =
                  0.315;

                traces.push({
                  type: "mesh3d",

                  x: [
                    xA,
                    xB,
                    xB,
                    xA,
                  ],

                  y: [
                    yFront,
                    yFront,
                    yFront,
                    yFront,
                  ],

                  z: [
                    segmentTopA,
                    segmentTopB,
                    segmentBottomB,
                    segmentBottomA,
                  ],

                  i: [0, 0],
                  j: [1, 2],
                  k: [2, 3],

                  color:
                    h === 0
                      ? "#37a9df"
                      : "#70bddf",

                  opacity:
                    Math.min(
                      0.40,
                      (
                        h === 0
                          ? 0.06
                          : 0.035
                      ) +
                      Math.pow(
                        visibility,
                        1.25
                      ) *
                        (
                          h === 0
                            ? 0.34
                            : 0.22
                        )
                    ),

                  flatshading: false,

                  lighting: {
                    ambient: 1,
                    diffuse: 0.1,
                    roughness: 1,
                    specular: 0,
                    fresnel: 0,
                  },

                  name:
                    segmentIndex === 0
                      ? horizon.label
                      : undefined,

                  showlegend:
                    segmentIndex === 0,

                  hovertemplate:
                    horizon.label +
                    "<br>" +
                    fromM +
                    "\u2013" +
                    toM +
                    " m" +
                    "<br>\u041e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u043d\u0430 \u0438\u0437\u0440\u0430\u0437\u0435\u043d\u043e\u0441\u0442: " +
                    Math.round(
                      segmentStrength *
                      100
                    ) +
                    "%" +
                    "<extra></extra>",

                  showscale: false,
                });
              }
            }
          }

          /*
            AI comparison points.

            Yellow = strongest AIDU point from instrument data.
            Cyan = best cross-profile confirmed point.
            White = final recommended drilling point.
          */

          if (
            viewMode === "client" &&
            analysisResult &&
            strongestAiduPoint !== null &&
            section.points.includes(
              strongestAiduPoint
            ) &&
            strongestAiduPoint !==
              recommendedPoint
          ) {
            traces.push({
              type: "scatter3d",
              mode: "lines",
              x: [
                strongestAiduPoint,
                strongestAiduPoint,
              ],
              y: [
                0.38,
                0.38,
              ],
              z: [
                0,
                -Math.max(
                  ...section.depths
                ),
              ],
              name:
                "\u041d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430 AIDU \u0442\u043e\u0447\u043a\u0430 " +
                strongestAiduPoint,
              line: {
                width: 5,
                color: "#f4d35e",
                dash: "dash",
              },
              hovertemplate:
                "\u041d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0441\u0430\u043c\u043e \u043f\u043e AIDU: " +
                strongestAiduPoint +
                "<extra></extra>",
            });
          }

          if (
            viewMode === "client" &&
            analysisResult &&
            bestCrossProfilePoint !== null &&
            section.points.includes(
              bestCrossProfilePoint
            ) &&
            bestCrossProfilePoint !==
              recommendedPoint &&
            bestCrossProfilePoint !==
              strongestAiduPoint
          ) {
            traces.push({
              type: "scatter3d",
              mode: "lines",
              x: [
                bestCrossProfilePoint,
                bestCrossProfilePoint,
              ],
              y: [
                0.40,
                0.40,
              ],
              z: [
                0,
                -Math.max(
                  ...section.depths
                ),
              ],
              name:
                "\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0435 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 " +
                bestCrossProfilePoint,
              line: {
                width: 5,
                color: "#48cae4",
                dash: "dot",
              },
              hovertemplate:
                "\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0435 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u043c\u0435\u0436\u0434\u0443 \u043f\u0440\u043e\u0444\u0438\u043b\u0438\u0442\u0435: " +
                bestCrossProfilePoint +
                "<extra></extra>",
            });
          }

          /*
            Recommended drilling point.
          */
          if (
            viewMode === "client" &&
            recommendedPoint !== null &&
            section.points.includes(
              recommendedPoint
            )
          ) {
            const maxDepth =
              Math.max(
                ...section.depths
              );

            traces.push({
              type: "scatter3d",
              mode: "lines+markers",
              x: [
                recommendedPoint,
                recommendedPoint,
              ],
              y: [
                0.42,
                0.42,
              ],
              z: [
                0,
                -maxDepth,
              ],
              name:
                "\u041f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0430\u043d \u0441\u043e\u043d\u0434\u0430\u0436 \u2013 \u0442\u043e\u0447\u043a\u0430 " +
                recommendedPoint,
              line: {
                width: 9,
                color: "#dff8ff",
              },
              marker: {
                size: 4,
                color: "#dff8ff",
              },
              hovertemplate:
                "\u041f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0430\u043d \u0441\u043e\u043d\u0434\u0430\u0436<br>" +
                "\u0422\u043e\u0447\u043a\u0430 " +
                recommendedPoint +
                "<extra></extra>",
            });
          }

          const plotKey =
            file.name +
            "::" +
            file.size +
            "::" +
            file.lastModified;

          return (
            <div
              key={
                file.name +
                file.size +
                file.lastModified
              }
              style={{
                padding: 14,
                borderRadius: 12,
                background: "#050d16",
                border:
                  "1px solid #1f3a54",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <strong
                  style={{
                    color: "#e6f1fa",
                  }}
                >
                  {file.name}
                </strong>

                <span
                  style={{
                    color: "#7893aa",
                    fontSize: 12,
                  }}
                >
                  {parsed.pointCount}
                  {
                    " \u0442\u043e\u0447\u043a\u0438 \u00b7 "
                  }
                  {parsed.minDepthM ?? 0}
                  {"\u2013"}
                  {parsed.maxDepthM ?? 0}
                  {" m"}
                </span>
              </div>

              <Plot
                data={traces}
                onInitialized={(
                  _figure: any,
                  graphDiv: any
                ) => {
                  plotRefs.current[
                    plotKey
                  ] = graphDiv;
                }}
                onUpdate={(
                  _figure: any,
                  graphDiv: any
                ) => {
                  plotRefs.current[
                    plotKey
                  ] = graphDiv;
                }}
                layout={{
                  autosize: true,
                  height: 650,

                  margin: {
                    l: 20,
                    r: 20,
                    t: 25,
                    b: 35,
                  },

                  paper_bgcolor:
                    "#050d16",
                  plot_bgcolor:
                    "#050d16",

                  font: {
                    color: "#d6e4f0",
                  },

                  showlegend:
                    viewMode === "client" &&
                    (
                      horizons.length > 0 ||
                      recommendedPoint !== null
                    ),

                  legend: {
                    x: 0.02,
                    y: 0.98,
                    bgcolor:
                      "rgba(5,13,22,0.72)",
                    bordercolor:
                      "#28445e",
                    borderwidth: 1,
                    font: {
                      size: 11,
                      color: "#d6e4f0",
                    },
                  },

                  scene: {
                    bgcolor: "#050d16",

                    xaxis: {
                      title: {
                        text:
                          "\u0422\u043e\u0447\u043a\u0438 \u043f\u043e \u043f\u0440\u043e\u0444\u0438\u043b\u0430",
                      },
                      tickmode: "array",
                      tickvals:
                        section.points,
                      ticktext:
                        section.points.map(
                          String
                        ),
                      gridcolor:
                        "#173249",
                      zerolinecolor:
                        "#173249",
                      showbackground: false,
                    },

                    yaxis: {
                      title: {
                        text: "",
                      },
                      showticklabels: false,
                      showgrid: false,
                      zeroline: false,
                      showbackground: false,
                      range: [
                        -0.12,
                        0.5,
                      ],
                    },

                    zaxis: {
                      title: {
                        text:
                          "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 (m)",
                      },
                      range: [
                        -Math.max(
                          ...section.depths
                        ),
                        0,
                      ],
                      gridcolor:
                        "#173249",
                      zerolinecolor:
                        "#173249",
                      showbackground: false,
                    },

                    aspectmode:
                      "manual",

                    aspectratio: {
                      x: 2.05,
                      y: 0.16,
                      z: 1.35,
                    },

                    camera:
                      viewMode === "client"
                        ? {
                            eye: {
                              x: 0.08,
                              y: -2.45,
                              z: 0.16,
                            },
                            center: {
                              x: 0,
                              y: 0,
                              z: -0.04,
                            },
                            up: {
                              x: 0,
                              y: 0,
                              z: 1,
                            },
                          }
                        : {
                            eye: {
                              x: 1.4,
                              y: -1.8,
                              z: 0.72,
                            },
                          },
                  },
                }}
                config={{
                  responsive: true,
                  displaylogo: false,
                  scrollZoom: true,
                  toImageButtonOptions: {
                    format: "png",
                    filename:
                      file.name.replace(
                        /\.dat$/i,
                        ""
                      ) +
                      "-3d-analysis",
                    height: 1200,
                    width: 1800,
                    scale: 2,
                  },
                }}
                style={{
                  width: "100%",
                  minHeight: 650,
                }}
                useResizeHandler
              />

              {analysisResult &&
                viewMode ===
                  "client" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap:
                        "wrap",
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      disabled={
                        recordingKey !==
                        null
                      }
                      onClick={() =>
                        void download3DVideo(
                          plotKey,
                          file.name
                        )
                      }
                      style={{
                        padding:
                          "9px 14px",
                        borderRadius:
                          9,
                        border:
                          "1px solid #3978a7",
                        background:
                          recordingKey ===
                          plotKey
                            ? "#173149"
                            : "#145d8b",
                        color:
                          "#ffffff",
                        fontWeight:
                          700,
                        cursor:
                          recordingKey
                            ? "default"
                            : "pointer",
                      }}
                    >
                      {recordingKey ===
                      plotKey
                        ? "\u23f3 \u0417\u0430\u043f\u0438\u0441\u0432\u0430 \u0441\u0435..."
                        : "\u25b6 \u0421\u0432\u0430\u043b\u0438 3D \u0432\u0438\u0434\u0435\u043e"}
                    </button>

                    {recordingKey ===
                      plotKey && (
                      <span
                        style={{
                          alignSelf:
                            "center",
                          color:
                            "#9eb9ce",
                          fontSize:
                            12,
                        }}
                      >
                        {
                          "\u041c\u043e\u0434\u0435\u043b\u044a\u0442 \u0441\u0435 \u0437\u0430\u0432\u044a\u0440\u0442\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e. \u041d\u0435 \u0434\u0432\u0438\u0436\u0438 \u0433\u0440\u0430\u0444\u0438\u043a\u0430\u0442\u0430 \u0434\u043e\u043a\u0430\u0442\u043e \u0442\u0440\u0430\u0435 \u0437\u0430\u043f\u0438\u0441\u044a\u0442."
                        }
                      </span>
                    )}
                  </div>
                )}

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: "#829bb1",
                }}
              >
                {viewMode === "client"
                  ? (
                    analysisResult
                      ? "\u0421\u0438\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u0441\u0430 AI \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0438\u0440\u0430\u043d\u0438 \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438, \u043d\u0430\u043b\u043e\u0436\u0435\u043d\u0438 \u0432\u044a\u0440\u0445\u0443 \u0440\u0435\u0430\u043b\u043d\u043e \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f AIDU \u0440\u0430\u0437\u0440\u0435\u0437. \u0411\u044f\u043b\u0430\u0442\u0430 \u043b\u0438\u043d\u0438\u044f \u0435 \u043a\u0440\u0430\u0439\u043d\u0430\u0442\u0430 AI \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436. \u0416\u044a\u043b\u0442\u0430\u0442\u0430 \u043b\u0438\u043d\u0438\u044f, \u0430\u043a\u043e \u0435 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u0430, \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u043d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u0441\u0430\u043c\u043e \u043f\u043e AIDU. \u0412\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f\u0442\u0430 \u043d\u0435 \u0435 \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u043e \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430 \u0432\u043e\u0434\u0430."
                      : "\u0412 \u043c\u043e\u043c\u0435\u043d\u0442\u0430 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0441\u0430\u043c\u043e \u0440\u0435\u0430\u043b\u043d\u043e \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f\u0442 AIDU \u0433\u0435\u043e\u0435\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437. \u0421\u043b\u0435\u0434 AI \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u0432\u044a\u0440\u0445\u0443 \u043d\u0435\u0433\u043e \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u0449\u0435 \u0441\u0435 \u0434\u043e\u0431\u0430\u0432\u044f\u0442 \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0438\u0442\u0435 \u0445\u043e\u0440\u0438\u0437\u043e\u043d\u0442\u0438 \u0438 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u0447\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430."
                  )
                  : "\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u0438\u0437\u0433\u043b\u0435\u0434 \u043d\u0430 \u0441\u0443\u0440\u043e\u0432\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438 E \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438."}
              </div>
            </div>
          );
        })}

        {videoError && (
          <div
            style={{
              marginTop: 12,
              padding: 11,
              borderRadius: 9,
              background: "#2a1118",
              border:
                "1px solid #713b46",
              color: "#ffb3bd",
              fontSize: 13,
            }}
          >
            {videoError}
          </div>
        )}
      </div>
    </section>
  );
}
