export type AiduMeasurement = {
  point: number;
  depthM: number;
  valueE: number;
  time: string;
};

export type AiduPointProfile = {
  point: number;
  measurements: AiduMeasurement[];
};

export type AiduParsedFile = {
  project: string;
  model: string;
  detectorType: string;
  deviceId: string;
  line: string;
  testLineNum: string;

  pointCount: number;
  measurementCount: number;

  minDepthM: number | null;
  maxDepthM: number | null;

  points: AiduPointProfile[];
};

const REQUIRED_COLUMNS = [
  "survey-point",
  "depth",
  "E",
];

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (char === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}

export function parseAiduDat(
  input: string
): AiduParsedFile {
  const lines = input
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "AIDU файлът не съдържа достатъчно данни."
    );
  }

  const headers = parseCsvLine(lines[0]).map(
    value => value.trim()
  );

  for (const required of REQUIRED_COLUMNS) {
    if (!headers.includes(required)) {
      throw new Error(
        `Липсва задължителната колона: ${required}`
      );
    }
  }

  const index = Object.fromEntries(
    headers.map((name, position) => [
      name,
      position,
    ])
  );

  const measurements: AiduMeasurement[] = [];

  let project = "";
  let model = "";
  let detectorType = "";
  let deviceId = "";
  let lineValue = "";
  let testLineNum = "";

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const cells = parseCsvLine(lines[rowIndex]);

    const point = Number(
      cells[index["survey-point"]]
    );

    const rawDepth = Number(
      cells[index["depth"]]
    );

    const valueE = Number(
      cells[index["E"]]
    );

    if (
      !Number.isFinite(point) ||
      !Number.isFinite(rawDepth) ||
      !Number.isFinite(valueE)
    ) {
      continue;
    }

    const depthM = Math.abs(rawDepth);

    measurements.push({
      point,
      depthM,
      valueE,
      time:
        index["time"] !== undefined
          ? String(cells[index["time"]] || "").trim()
          : "",
    });

    if (!project && index["project"] !== undefined) {
      project = String(
        cells[index["project"]] || ""
      ).trim();
    }

    if (!model && index["model"] !== undefined) {
      model = String(
        cells[index["model"]] || ""
      ).trim();
    }

    if (
      !detectorType &&
      index["detectorType"] !== undefined
    ) {
      detectorType = String(
        cells[index["detectorType"]] || ""
      ).trim();
    }

    if (
      !deviceId &&
      index["deviceId"] !== undefined
    ) {
      deviceId = String(
        cells[index["deviceId"]] || ""
      ).trim();
    }

    if (!lineValue && index["line"] !== undefined) {
      lineValue = String(
        cells[index["line"]] || ""
      ).trim();
    }

    if (
      !testLineNum &&
      index["testLineNum"] !== undefined
    ) {
      testLineNum = String(
        cells[index["testLineNum"]] || ""
      ).trim();
    }
  }

  if (measurements.length === 0) {
    throw new Error(
      "Не са намерени валидни AIDU измервания."
    );
  }

  const grouped = new Map<
    number,
    AiduMeasurement[]
  >();

  for (const measurement of measurements) {
    const current =
      grouped.get(measurement.point) || [];

    current.push(measurement);
    grouped.set(
      measurement.point,
      current
    );
  }

  const points = Array.from(
    grouped.entries()
  )
    .sort(
      ([firstPoint], [secondPoint]) =>
        firstPoint - secondPoint
    )
    .map(([point, values]) => ({
      point,
      measurements: values.sort(
        (a, b) => a.depthM - b.depthM
      ),
    }));

  const depths = measurements.map(
    item => item.depthM
  );

  return {
    project,
    model,
    detectorType,
    deviceId,
    line: lineValue,
    testLineNum,

    pointCount: points.length,
    measurementCount: measurements.length,

    minDepthM:
      depths.length > 0
        ? Math.min(...depths)
        : null,

    maxDepthM:
      depths.length > 0
        ? Math.max(...depths)
        : null,

    points,
  };
}
