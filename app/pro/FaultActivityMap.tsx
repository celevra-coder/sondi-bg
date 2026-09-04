type Props = {
  faultSpatial: any;
  lat: number;
  lng: number;
};

export default function FaultActivityMap({
  faultSpatial,
  lat,
  lng,
}: Props) {
  const nearestGem =
    faultSpatial?.nearestGem ?? null;

  const nearbyGem =
    Array.isArray(faultSpatial?.nearbyGem)
      ? faultSpatial.nearbyGem
      : [];

  const nearbyMrrb =
    Array.isArray(faultSpatial?.nearbyMrrb)
      ? faultSpatial.nearbyMrrb
      : [];

  const mrrbAtPoint =
    Array.isArray(faultSpatial?.mrrbAtPoint)
      ? faultSpatial.mrrbAtPoint
      : [];

  const validated =
    Array.isArray(nearestGem?.validatedCrosswalks)
      ? nearestGem.validatedCrosswalks
      : [];

  const nearestGemId =
    String(
      nearestGem?.properties?.catalog_id ?? ""
    ).trim();

  const nearestDistance =
    Number(nearestGem?.distanceKm);

  const radiusKm =
    Number.isFinite(nearestDistance)
      ? Math.min(
          50,
          Math.max(5, nearestDistance * 1.35)
        )
      : 10;

  const cx = 300;
  const cy = 180;
  const scale = 145 / radiusKm;

  const cosLat =
    Math.cos(lat * Math.PI / 180);

  function project(coord: any) {
    if (
      !Array.isArray(coord) ||
      coord.length < 2
    ) {
      return null;
    }

    const lon = Number(coord[0]);
    const pLat = Number(coord[1]);

    if (
      !Number.isFinite(lon) ||
      !Number.isFinite(pLat)
    ) {
      return null;
    }

    const xKm =
      (lon - lng) *
      111.320 *
      cosLat;

    const yKm =
      (pLat - lat) *
      110.574;

    return {
      x: cx + xKm * scale,
      y: cy - yKm * scale,
    };
  }

  function linePath(coords: any[]) {
    if (!Array.isArray(coords)) {
      return "";
    }

    const pts =
      coords
        .map(project)
        .filter(Boolean) as {
          x: number;
          y: number;
        }[];

    if (!pts.length) {
      return "";
    }

    return pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`
      )
      .join(" ");
  }

  function paths(geometry: any): string[] {
    if (!geometry) return [];

    if (geometry.type === "LineString") {
      const d = linePath(geometry.coordinates);
      return d ? [d] : [];
    }

    if (geometry.type === "MultiLineString") {
      return (geometry.coordinates || [])
        .map((line: any[]) => linePath(line))
        .filter(Boolean);
    }

    if (geometry.type === "Polygon") {
      return (geometry.coordinates || [])
        .map((ring: any[]) => linePath(ring))
        .filter(Boolean);
    }

    if (geometry.type === "MultiPolygon") {
      const out: string[] = [];

      for (const polygon of geometry.coordinates || []) {
        for (const ring of polygon || []) {
          const d = linePath(ring);
          if (d) out.push(d);
        }
      }

      return out;
    }

    return [];
  }

  function formatDistance(value: number) {
    if (!Number.isFinite(value)) {
      return "\u2014";
    }

    if (value < 1) {
      return Math.round(value * 1000) + " m";
    }

    return value.toFixed(2) + " km";
  }

  const sameBgcsAtPoint =
    mrrbAtPoint.filter(
      (item: any) =>
        nearestGemId &&
        String(item?.properties?.bgcs ?? "")
          .trim()
          .toUpperCase() ===
        nearestGemId.toUpperCase()
    );

  const pointNames =
    Array.from(
      new Set(
        mrrbAtPoint
          .map(
            (item: any) =>
              item?.properties?.mrrb_name
          )
          .filter(Boolean)
      )
    );

  let interpretation = "";

  if (mrrbAtPoint.length > 0) {
    interpretation =
      "\u0410\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 " +
      mrrbAtPoint.length +
      " \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u043e \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0440\u0430\u043d MRRB \u0431\u0443\u0444\u0435\u0440\u0438\u0440\u0430\u043d \u0440\u0430\u0437\u043b\u043e\u043c\u0435\u043d \u043a\u043e\u0440\u0438\u0434\u043e\u0440.";

    if (pointNames.length) {
      interpretation +=
        " \u041a\u043e\u0440\u0438\u0434\u043e\u0440: " +
        pointNames.join(", ") +
        ".";
    }

    if (
      sameBgcsAtPoint.length > 0 &&
      nearestGemId
    ) {
      interpretation +=
        " \u0418\u043c\u0430 \u0432\u0430\u043b\u0438\u0434\u0438\u0440\u0430\u043d\u043e \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u043e\u0432\u043e \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0441 GEM " +
        nearestGemId +
        ".";
    }
  } else if (
    nearestGem &&
    Number.isFinite(nearestDistance)
  ) {
    interpretation =
      "\u0422\u043e\u0447\u043a\u0430\u0442\u0430 \u0435 \u043d\u0430 " +
      formatDistance(nearestDistance) +
      " \u043e\u0442 \u043d\u0430\u0439-\u0431\u043b\u0438\u0437\u043a\u0430\u0442\u0430 GEM \u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0430 \u0433\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u044f " +
      nearestGemId +
      ".";

    if (validated.length > 0) {
      interpretation +=
        " \u0417\u0430 \u0442\u043e\u0437\u0438 GEM \u043a\u043e\u0434 \u0438\u043c\u0430 " +
        validated.length +
        " \u0432\u0430\u043b\u0438\u0434\u0438\u0440\u0430\u043d\u0438 MRRB/\u043d\u0430\u0443\u0447\u043d\u0438 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u043e\u0432\u0438 \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044f.";
    }
  } else {
    interpretation =
      "\u041d\u044f\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u0431\u043b\u0438\u0437\u043a\u0430 GEM \u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0430 \u0433\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u044f.";
  }

  return (
    <div>
      <div style={{
        border: "1px solid #ddd5d0",
        borderRadius: 14,
        overflow: "hidden",
        background: "#f7f7f4",
      }}>
        <svg
          viewBox="0 0 600 360"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        >
          <rect
            x="0"
            y="0"
            width="600"
            height="360"
            fill="#f7f7f4"
          />

          {nearbyMrrb.map(
            (item: any, i: number) =>
              paths(item?.geometry).map(
                (d, j) => (
                  <path
                    key={`m-${i}-${j}`}
                    d={d}
                    fill={
                      item?.containsPoint
                        ? "rgba(190,105,59,.28)"
                        : "rgba(201,151,111,.12)"
                    }
                    stroke={
                      item?.containsPoint
                        ? "#a8572f"
                        : "#b78362"
                    }
                    strokeWidth={
                      item?.containsPoint
                        ? 2.5
                        : 1.4
                    }
                  />
                )
              )
          )}

          {nearbyGem.map(
            (item: any, i: number) => {
              const isNearest =
                String(
                  item?.properties?.catalog_id ?? ""
                ) === nearestGemId;

              return paths(item?.geometry).map(
                (d, j) => (
                  <path
                    key={`g-${i}-${j}`}
                    d={d}
                    fill="none"
                    stroke={
                      isNearest
                        ? "#a02c2c"
                        : "#766060"
                    }
                    strokeWidth={
                      isNearest
                        ? 3.3
                        : 1.6
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              );
            }
          )}

          <circle
            cx={cx}
            cy={cy}
            r="12"
            fill="none"
            stroke="#176b8a"
            strokeWidth="1.5"
          />

          <circle
            cx={cx}
            cy={cy}
            r="7"
            fill="#176b8a"
            stroke="#fff"
            strokeWidth="3"
          />

          <text
            x={cx + 15}
            y={cy - 10}
            fontSize="12"
            fontWeight="800"
            fill="#174f64"
          >
            {"\u0410\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0430 \u0442\u043e\u0447\u043a\u0430"}
          </text>

          <text
            x="18"
            y="27"
            fontSize="12"
            fontWeight="800"
            fill="#435154"
          >
            {"\u0420\u0430\u0434\u0438\u0443\u0441: "}
            {radiusKm.toFixed(1)}
            {" km"}
          </text>
        </svg>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(190px,1fr))",
        gap: 10,
        marginTop: 13,
      }}>
        <div style={{
          padding: 12,
          borderRadius: 11,
          background: "#fff4ef",
          border: "1px solid #ecd4c8",
        }}>
          <strong>
            {"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u044a\u043a GEM \u0440\u0430\u0437\u043b\u043e\u043c"}
          </strong>

          <div style={{ marginTop: 6 }}>
            {nearestGemId || "\u041d\u044f\u043c\u0430 \u0434\u0430\u043d\u043d\u0438"}
          </div>

          <div style={{
            marginTop: 4,
            fontSize: 13,
          }}>
            {"\u0420\u0430\u0437\u0441\u0442\u043e\u044f\u043d\u0438\u0435: "}
            <strong>
              {formatDistance(nearestDistance)}
            </strong>
          </div>
        </div>

        <div style={{
          padding: 12,
          borderRadius: 11,
          background:
            mrrbAtPoint.length
              ? "#fff0e7"
              : "#f5f7f7",
          border:
            mrrbAtPoint.length
              ? "1px solid #e0b395"
              : "1px solid #dde4e4",
        }}>
          <strong>
            {"MRRB \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435"}
          </strong>

          <div style={{
            marginTop: 6,
            fontSize: 13,
          }}>
            {mrrbAtPoint.length
              ? "\u0422\u043e\u0447\u043a\u0430\u0442\u0430 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u0440\u0430\u0437\u043b\u043e\u043c\u0435\u043d \u043a\u043e\u0440\u0438\u0434\u043e\u0440"
              : "\u0422\u043e\u0447\u043a\u0430\u0442\u0430 \u0435 \u0438\u0437\u0432\u044a\u043d MRRB \u043a\u043e\u0440\u0438\u0434\u043e\u0440"}
          </div>
        </div>

        <div style={{
          padding: 12,
          borderRadius: 11,
          background: "#f1f6f8",
          border: "1px solid #d9e4e8",
        }}>
          <strong>
            {"\u0412\u0430\u043b\u0438\u0434\u0438\u0440\u0430\u043d\u0438 \u0432\u0440\u044a\u0437\u043a\u0438"}
          </strong>

          <div style={{
            marginTop: 6,
            fontSize: 22,
            fontWeight: 900,
          }}>
            {validated.length}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 13,
        padding: "13px 14px",
        borderRadius: 11,
        background: "#f7f4f2",
        border: "1px solid #e2d8d3",
        fontSize: 13,
        lineHeight: 1.65,
      }}>
        <strong>
          {"\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f. "}
        </strong>
        {interpretation}
      </div>
    </div>
  );
}
