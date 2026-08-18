import { ImageResponse } from "next/og";

export const alt =
  "Sondi.bg — Подземни води, геология и сондажи";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #f8fcfd 0%, #edf8fa 55%, #e5f4f7 100%)",
          color: "#17353d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -170,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              "rgba(113,186,203,0.16)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: -220,
            width: 460,
            height: 460,
            borderRadius: 9999,
            border: "2px solid rgba(22,125,150,.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 10,
            background:
              "linear-gradient(90deg, #167d96, #71bacb)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "70px 82px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            {/* LOGO */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 54,
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  display: "flex",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 26,
                    top: 10,
                    width: 40,
                    height: 54,
                    border: "6px solid #167d96",
                    borderRadius:
                      "70% 35% 70% 35%",
                    transform: "rotate(45deg)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 18,
                    width: 76,
                    height: 6,
                    borderRadius: 999,
                    background: "#71bacb",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 20,
                    bottom: 6,
                    width: 58,
                    height: 4,
                    borderRadius: 999,
                    background: "#9bd0db",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 56,
                    fontWeight: 700,
                    letterSpacing: -2,
                    color: "#17353d",
                    lineHeight: 1,
                  }}
                >
                  Sondi
                  <span
                    style={{
                      color: "#19839c",
                    }}
                  >
                    .bg
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 7,
                    fontSize: 15,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                    color: "#648894",
                    fontWeight: 600,
                  }}
                >
                  Underground Water
                </div>
              </div>
            </div>

            {/* MAIN TEXT */}
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                color: "#19839c",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Подземни води • Геология • Сондажи
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -2.5,
                maxWidth: 850,
                color: "#17353d",
              }}
            >
              Подземният свят
              <br />
              вече е видим.
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 24,
                lineHeight: 1.45,
                color: "#536f76",
                marginTop: 25,
                maxWidth: 850,
              }}
            >
              Карти, официални данни и професионални инструменти
              за подземни води, геология и сондажи в България.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 34,
                padding: "12px 22px",
                borderRadius: 999,
                background: "#17353d",
                color: "#ffffff",
                fontSize: 19,
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              www.sondi.bg
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}