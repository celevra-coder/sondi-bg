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
