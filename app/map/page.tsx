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

  return (
    <>
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
