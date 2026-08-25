"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type Props = {
  location: string;
  onReady?: () => void;
};

const X = [
  1, 2, 3, 4, 5, 6, 7
];

const Z = [
  -10, -20, -30, -40, -50,
  -60, -70, -80, -90, -100
];

/*
  Fixed illustrative geophysical section.

  It is intentionally the same on every
  shared report and is NOT survey data.
*/
const VALUES = [
  [0.10,0.11,0.12,0.13,0.13,0.14,0.14],
  [0.11,0.12,0.13,0.14,0.15,0.16,0.15],
  [0.12,0.13,0.14,0.15,0.17,0.19,0.18],
  [0.13,0.14,0.15,0.17,0.21,0.25,0.22],
  [0.14,0.15,0.17,0.20,0.28,0.40,0.31],
  [0.15,0.18,0.20,0.24,0.36,0.54,0.41],
  [0.17,0.20,0.22,0.25,0.38,0.58,0.44],
  [0.18,0.21,0.25,0.27,0.34,0.46,0.39],
  [0.20,0.24,0.28,0.30,0.33,0.36,0.34],
  [0.23,0.28,0.31,0.33,0.34,0.35,0.33],
];

export default function AiduIntro3D({
  location,
  onReady,
}: Props) {
  const graphRef =
    useRef<any>(null);

  const frameRef =
    useRef<number | null>(null);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    if (!ready) {
      return;
    }

    let cancelled = false;

    async function run() {
      if (!graphRef.current) {
        return;
      }

      const module =
        await import(
          "plotly.js-dist-min"
        );

      const Plotly =
        (module as any).default ??
        module;

      const started =
        performance.now();

      const duration =
        7000;

      const animate = (
        now: number
      ) => {
        if (cancelled) {
          return;
        }

        const progress =
          Math.min(
            (now - started) /
              duration,
            1
          );

        const angle =
          progress *
          Math.PI *
          2;

        void Plotly.relayout(
          graphRef.current,
          {
            "scene.camera": {
              eye: {
                x:
                  Math.sin(angle) *
                  2.25,
                y:
                  -Math.cos(angle) *
                  2.25,
                z:
                  0.34,
              },
              center: {
                x: 0,
                y: 0,
                z: -0.05,
              },
              up: {
                x: 0,
                y: 0,
                z: 1,
              },
            },
          }
        );

        if (
          progress < 1
        ) {
          frameRef.current =
            requestAnimationFrame(
              animate
            );
        }
      };

      frameRef.current =
        requestAnimationFrame(
          animate
        );
    }

    void run();

    return () => {
      cancelled = true;

      if (
        frameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, [ready]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#050d16",

        opacity:
          ready
            ? 1
            : 0,

        transition:
          "opacity 450ms ease",
      }}
    >
      <Plot
        data={[
          {
            type: "surface",
            x:
              VALUES.map(
                () => X
              ),
            y:
              VALUES.map(
                row =>
                  row.map(
                    value =>
                      value * 0.22
                  )
              ),
            z:
              Z.map(
                depth =>
                  X.map(
                    () => depth
                  )
              ),
            surfacecolor:
              VALUES,
            cmin: 0.08,
            cmax: 0.60,
            colorscale: [
              [0.00, "#172b3b"],
              [0.22, "#31586b"],
              [0.42, "#6f8f91"],
              [0.60, "#d1bd77"],
              [0.76, "#c9783d"],
              [1.00, "#752b29"],
            ],
            showscale: false,
            hoverinfo: "skip",
          } as any,
        ]}
        layout={{
          autosize: true,
          margin: {
            l: 0,
            r: 0,
            t: 0,
            b: 0,
          },
          paper_bgcolor:
            "#050d16",
          plot_bgcolor:
            "#050d16",
          showlegend: false,

          scene: {
            bgcolor:
              "#050d16",

            xaxis: {
              visible: false,
              showgrid: false,
              showticklabels: false,
              zeroline: false,
              showbackground: false,
            },

            yaxis: {
              visible: false,
              showgrid: false,
              showticklabels: false,
              zeroline: false,
              showbackground: false,
            },

            zaxis: {
              visible: false,
              showgrid: false,
              showticklabels: false,
              zeroline: false,
              showbackground: false,
            },

            aspectmode:
              "manual",

            aspectratio: {
              x: 2.1,
              y: 0.25,
              z: 1.35,
            },

            camera: {
              eye: {
                x: 0.1,
                y: -2.25,
                z: 0.34,
              },
              center: {
                x: 0,
                y: 0,
                z: -0.05,
              },
              up: {
                x: 0,
                y: 0,
                z: 1,
              },
            },
          },
        }}
        config={{
          displayModeBar: false,
          displaylogo: false,
          responsive: true,
          scrollZoom: false,
          staticPlot: false,
        }}
        onInitialized={(
          _figure: any,
          graphDiv: any
        ) => {
          graphRef.current =
            graphDiv;

          requestAnimationFrame(
            () => {
              setReady(true);
              onReady?.();
            }
          );
        }}
        onUpdate={(
          _figure: any,
          graphDiv: any
        ) => {
          graphRef.current =
            graphDiv;
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        useResizeHandler
      />

      <div
        style={{
          position:
            "absolute",
          inset: 0,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          pointerEvents:
            "none",

          background:
            "radial-gradient(circle at center, rgba(2,8,14,.10), rgba(2,8,14,.44) 76%)",
        }}
      >
        <div
          style={{
            width:
              "min(92vw, 900px)",

            textAlign:
              "center",

            textShadow:
              "0 5px 30px rgba(0,0,0,.85)",
          }}
        >
          <div
            style={{
              color:
                "#8fc5df",

              fontSize:
                "clamp(11px, 1.6vw, 17px)",

              fontWeight:
                700,

              letterSpacing:
                "0.24em",

              marginBottom:
                16,
            }}
          >
            {
              "\u041f\u0420\u041e\u0423\u0427\u0412\u0410\u041d\u0415 \u0417\u0410 \u041f\u041e\u0414\u0417\u0415\u041c\u041d\u0418 \u0412\u041e\u0414\u0418"
            }
          </div>

          <div
            style={{
              color:
                "#f4f9fc",

              fontSize:
                "clamp(44px, 8vw, 82px)",

              fontWeight:
                800,

              lineHeight: 1,

              letterSpacing:
                "-0.045em",
            }}
          >
            {location}
          </div>

          <div
            style={{
              width: 86,
              height: 1,

              margin:
                "24px auto 18px",

              background:
                "linear-gradient(90deg, transparent, #76c6e9, transparent)",
            }}
          />

          <div
            style={{
              color:
                "#c9dbe5",

              fontSize:
                "clamp(14px, 2vw, 20px)",

              letterSpacing:
                "0.08em",
            }}
          >
            {
              "\u0033\u0044 \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0430 \u0442\u0435\u0440\u0435\u043d\u0430"
            }
          </div>
        </div>
      </div>

      <div
        style={{
          position:
            "absolute",

          left: "50%",
          bottom: 18,

          transform:
            "translateX(-50%)",

          color:
            "rgba(130,177,200,.72)",

          fontSize: 10,

          fontWeight: 600,

          letterSpacing:
            "0.18em",

          whiteSpace:
            "nowrap",

          pointerEvents:
            "none",
        }}
      >
        {
          "\u0422\u0415\u0420\u0415\u041d\u0415\u041d \u0410\u041d\u0410\u041b\u0418\u0417 \u00b7 SONDI.BG"
        }
      </div>
    </div>
  );
}
