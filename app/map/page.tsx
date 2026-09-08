export const metadata = {
  alternates: { canonical: "/map" },

  title: "Карта на подземните води в България",
  description: "Интерактивна карта с данни за подземни водни тела, геология, мониторинг, водовземане, сондажи и разломи в България.",
};

export default async function GeologyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const incoming = await searchParams;

  const iframeParams = new URLSearchParams();

  const lat =
    typeof incoming.lat === "string"
      ? incoming.lat.trim()
      : "";

  const lng =
    typeof incoming.lng === "string"
      ? incoming.lng.trim()
      : "";

  const label =
    typeof incoming.label === "string"
      ? incoming.label.trim()
      : "";

  if (lat && lng) {
    iframeParams.set("lat", lat);
    iframeParams.set("lng", lng);

    if (label) {
      iframeParams.set("label", label);
    }
  }

  const iframeSrc =
    iframeParams.size > 0
      ? `/geology-map/index.html?${iframeParams.toString()}`
      : "/geology-map/index.html";

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.sondi.bg/map#webpage",
    url: "https://www.sondi.bg/map",
    name: "\u041a\u0430\u0440\u0442\u0430 \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
    description:
      "\u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u0441 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435, \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u0440\u0430\u0437\u043b\u043e\u043c\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f.",
    inLanguage: "bg-BG",
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://www.sondi.bg/#website",
      name: "SONDI.BG",
      url: "https://www.sondi.bg",
    },
    about: {
      "@type": "Thing",
      name: "\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
    },
  };

  const mapSchema = {
    "@context": "https://schema.org",
    "@type": "Map",
    "@id": "https://www.sondi.bg/map#map",
    url: "https://www.sondi.bg/map",
    name: "\u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0432 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mapSchema) }}
      />

      <h1 className="sr-only">
        Карта на подземните води в България
      </h1>

      <iframe
        src={iframeSrc}
        title="Карта на подземните води"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: 0,
        }}
      />
    </>
  );
}
