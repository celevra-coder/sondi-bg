"use client";

import {
  useEffect,
  useState,
} from "react";

import Aidu3DProfile from "./Aidu3DProfile";
import AiduIntro3D from "./AiduIntro3D";

type Props = {
  record: {
    location_label?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    client_text?: string | null;
    analysis: any;
    aidu_files: any[];
  };
};

function getShortLocation(
  label?: string | null
) {
  if (!label) {
    return "\u0422\u0435\u0440\u0435\u043d\u043d\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435";
  }

  const first =
    label
      .split(",")[0]
      ?.trim();

  return first || label;
}

export default function AiduSharedAnalysis({
  record,
}: Props) {
  const files =
    Array.isArray(record.aidu_files)
      ? record.aidu_files.map(
          (
            item: any,
            index: number
          ) => ({
            file: {
              name:
                item?.fileName ||
                `profile-${index + 1}.dat`,
            },
            parsed: item?.parsed,
          })
        )
      : [];

  const shortLocation =
    getShortLocation(
      record.location_label
    );



  const [showIntro, setShowIntro] =
    useState(files.length > 0);

  const [
    introReady,
    setIntroReady,
  ] = useState(false);

  const [
    fadeIntro,
    setFadeIntro,
  ] = useState(false);

  useEffect(() => {
    if (
      !showIntro ||
      !introReady ||
      files.length === 0
    ) {
      return;
    }

    const fadeTimer =
      window.setTimeout(
        () => {
          setFadeIntro(true);
        },
        6500
      );

    const endTimer =
      window.setTimeout(
        () => {
          setShowIntro(false);
        },
        7350
      );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [
    showIntro,
    introReady,
    files.length,
  ]);

  return (
    <>
      {/*
        REAL REPORT

        It is mounted immediately underneath
        the intro. Therefore the intro can
        fade directly into the finished
        report with no white/footer flash.
      */}
      <main
        style={{
          minHeight: "100vh",

          opacity:
            showIntro
              ? 0
              : 1,

          visibility:
            showIntro
              ? "hidden"
              : "visible",

          transition:
            "opacity 500ms ease",

          background:
            "linear-gradient(180deg, #07111f 0%, #0b1625 100%)",

          color:
            "#eef6ff",

          padding:
            "24px 14px 50px",
        }}
      >
        <div
          style={{
            width:
              "100%",

            maxWidth:
              1180,

            margin:
              "0 auto",
          }}
        >
          <section
            style={{
              background:
                "linear-gradient(180deg, #0d1c28 0%, #0b1721 100%)",

              border:
                "1px solid #2b6074",

              borderRadius:
                16,

              padding:
                18,

              overflow:
                "hidden",
            }}
          >
            <div
              style={{
                marginBottom:
                  16,
              }}
            >
              <div
                style={{
                  color:
                    "#72a8c4",

                  fontSize:
                    11,

                  fontWeight:
                    700,

                  letterSpacing:
                    "0.17em",

                  textTransform:
                    "uppercase",

                  marginBottom:
                    7,
                }}
              >
                {
                  "\u041f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438"
                }
              </div>

              <h1
                style={{
                  margin: 0,

                  fontSize:
                    "clamp(22px, 4vw, 30px)",
                }}
              >
                {
                  "\u0420\u0435\u0437\u0443\u043b\u0442\u0430\u0442 \u043e\u0442 \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435\u0442\u043e"
                }
              </h1>

              {record.location_label && (
                <div
                  style={{
                    marginTop:
                      6,

                    color:
                      "#9db4c7",

                    fontSize:
                      14,
                  }}
                >
                  {
                    record.location_label
                  }
                </div>
              )}
            </div>

            {files.length >
              0 && (
              <Aidu3DProfile
                files={
                  files as any
                }
                analysisResult={
                  record.analysis
                }
              />
            )}

            {record.client_text && (
              <div
                style={{
                  marginTop:
                    18,

                  padding:
                    "18px 20px",

                  borderRadius:
                    12,

                  background:
                    "#10291f",

                  border:
                    "1px solid #285f47",

                  color:
                    "#e6f3ec",

                  lineHeight:
                    1.7,

                  fontSize:
                    15,

                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {
                  record.client_text
                }
              </div>
            )}

            <div
              style={{
                marginTop:
                  14,

                color:
                  "#7894a8",

                fontSize:
                  12,

                lineHeight:
                  1.5,
              }}
            >
              {
                "\u0412\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f\u0442\u0430 \u0438 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u0441\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f \u043d\u0430 \u0442\u0435\u0440\u0435\u043d\u043d\u043e\u0442\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435. \u0420\u0435\u0430\u043b\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u043e\u043f\u0440\u0438\u0442\u043e\u0446\u0438, \u0434\u0435\u0431\u0438\u0442 \u0438 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u0442 \u043f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435 \u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u0432\u0430\u0449\u0438 \u0438\u0437\u043f\u0438\u0442\u0432\u0430\u043d\u0438\u044f."
              }
            </div>
          </section>
        </div>
      </main>

      {showIntro &&
        files.length > 0 && (
        <div
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex:
              999999,

            width:
              "100vw",

            height:
              "100dvh",

            overflow:
              "hidden",

            opacity:
              fadeIntro
                ? 0
                : 1,

            pointerEvents:
              "none",

            transition:
              "opacity 850ms ease",

            background:
              "#050d16",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity:
                introReady
                  ? 1
                  : 0,
              transition:
                "opacity 450ms ease",
            }}
          >
            <AiduIntro3D
              location={
                shortLocation
              }
              onReady={() =>
                setIntroReady(true)
              }
            />
          </div>
        </div>
      )}

    </>
  );
}
