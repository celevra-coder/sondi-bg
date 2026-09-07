export const metadata = {
  alternates: { canonical: "/map" },

  title: "Карта на подземните води в България",
  description: "Интерактивна карта с данни за подземни водни тела, геология, мониторинг, водовземане, сондажи и разломи в България.",
};

export default function GeologyPage() {
  return (
    <iframe
      src="/geology-map/index.html"
      title="Карта на подземните води"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
      }}
    />
  );
}
