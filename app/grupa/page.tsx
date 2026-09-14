import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facebook група на SONDI.BG | Подземни води, сондажи и геология",
  description:
    "Присъединете се към Facebook общността на SONDI.BG за въпроси, опит и дискусии за подземни води, сондажи, геология и реални случаи от България.",
  alternates: {
    canonical: "https://www.sondi.bg/grupa",
  },
};

const GROUP_URL =
  "https://www.facebook.com/groups/1384411913062426";

const buttonStyle = {
  display: "inline-block",
  padding: "18px 34px",
  borderRadius: "12px",
  background: "#1877f2",
  color: "#fff",
  textDecoration: "none",
  fontSize: "19px",
  fontWeight: 700,
  boxShadow: "0 12px 35px rgba(24,119,242,.25)",
} as const;

export default function GroupPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07151d 0%, #0b202a 55%, #07151d 100%)",
        color: "#fff",
        padding: "70px 20px",
      }}
    >
      <section
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "7px 14px",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: "999px",
            fontSize: "14px",
            marginBottom: "25px",
            color: "#b8dce8",
          }}
        >
          SONDI.BG • Facebook общност
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.05,
            margin: "0 0 24px",
            fontWeight: 800,
          }}
        >
          Присъедини се към
          <br />
          Facebook общността на SONDI.BG
        </h1>

        <p
          style={{
            maxWidth: "740px",
            margin: "0 auto 18px",
            fontSize: "clamp(17px, 2vw, 21px)",
            lineHeight: 1.65,
            color: "#c8d9df",
          }}
        >
          Място за въпроси, опит и дискусии за подземни води,
          сондажи, геология и реални случаи от България.
        </p>

        <p
          style={{
            margin: "0 auto 34px",
            color: "#8fb6c4",
            fontSize: "15px",
          }}
        >
          Участието в групата е безплатно.
        </p>

        <a
          href={GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={buttonStyle}
        >
          Посетете Facebook групата →
        </a>

        <div
          style={{
            marginTop: "68px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            textAlign: "left",
          }}
        >
          {[
            [
              "Задавайте въпроси",
              "Попитайте за сондажи, вода, терени, геология и всичко свързано с темата.",
            ],
            [
              "Споделяйте опит",
              "Покажете реален случай, снимки, резултат от сондаж или проблем, който сте срещнали.",
            ],
            [
              "Обсъждайте с други",
              "Четете мнения и опит на хора от различни райони на България.",
            ],
            [
              "Следете SONDI.BG",
              "Получавайте полезна информация, новини и ново съдържание от платформата.",
            ],
          ].map(([title, text]) => (
            <div
              key={title}
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,.055)",
                border: "1px solid rgba(255,255,255,.09)",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  margin: "0 0 10px",
                }}
              >
                {title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#aebfc5",
                  lineHeight: 1.55,
                  fontSize: "15px",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "55px",
            padding: "30px 24px",
            borderRadius: "18px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "26px",
            }}
          >
            Имаш въпрос? Влез в групата и го задай.
          </h2>

          <p
            style={{
              margin: "0 auto 24px",
              maxWidth: "680px",
              color: "#b7c9cf",
              lineHeight: 1.65,
            }}
          >
            Групата е мястото за разговори и реални казуси.
            Ако търсиш информация за сондаж, подземни води или конкретен
            терен, можеш директно да се включиш в дискусиите.
          </p>

          <a
            href={GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            Влез във Facebook групата →
          </a>
        </div>

        <div
          style={{
            marginTop: "42px",
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "22px",
            }}
          >
            Част от SONDI.BG
          </h2>

          <p
            style={{
              margin: "0 auto",
              maxWidth: "700px",
              color: "#9eb2ba",
              lineHeight: 1.65,
            }}
          >
            SONDI.BG събира на едно място информация за подземните води,
            геологията, сондажите и свързаните услуги в България.
            Facebook групата допълва платформата с общност, въпроси,
            мнения и споделен практически опит.
          </p>
        </div>

        <p
          style={{
            marginTop: "45px",
            fontSize: "14px",
            color: "#8299a1",
          }}
        >
          SONDI.BG — Подземни води, геология и сондажи в България
        </p>
      </section>
    </main>
  );
}
