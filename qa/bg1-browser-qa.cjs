const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT = process.cwd();
const BASE = "http://localhost:3000";

const PROFILE_FILE = path.join(
  ROOT,
  "public/geology-map/data/bd_danube_section1_profiles.json"
);

const GWB_FILE = path.join(
  ROOT,
  "public/geology-map/data/bd_danube_groundwater_bodies.geojson"
);

const OUT_DIR = path.join(ROOT, "qa", "bg1-browser-failures");

const profiles =
  JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8")).profiles || [];

const gwb =
  JSON.parse(fs.readFileSync(GWB_FILE, "utf8")).features || [];

function codeOf(f) {
  const p = f.properties || {};
  return String(
    p.canonical_code ||
    p.code ||
    p.gwb_code ||
    p.INSPIREID ||
    p.localId ||
    ""
  ).trim().toUpperCase();
}

function pointInRing(x, y, ring) {
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      ((yi > y) !== (yj > y)) &&
      (
        x <
        ((xj - xi) * (y - yi)) /
          ((yj - yi) || Number.EPSILON) +
          xi
      );

    if (intersect) inside = !inside;
  }

  return inside;
}

function contains(f, x, y) {
  const g = f.geometry || {};

  let polys = [];

  if (g.type === "Polygon") {
    polys = [g.coordinates];
  } else if (g.type === "MultiPolygon") {
    polys = g.coordinates;
  } else {
    return false;
  }

  for (const poly of polys) {
    if (!poly?.length) continue;

    if (!pointInRing(x, y, poly[0])) continue;

    const inHole =
      poly.slice(1).some(
        hole => pointInRing(x, y, hole)
      );

    if (!inHole) return true;
  }

  return false;
}

function findControlPoint(target) {
  const geom = target.geometry || {};

  const polys =
    geom.type === "Polygon"
      ? [geom.coordinates]
      : geom.type === "MultiPolygon"
        ? geom.coordinates
        : [];

  let best = null;

  for (const poly of polys) {
    const ring = poly?.[0];
    if (!ring?.length) continue;

    const xs = ring.map(p => p[0]);
    const ys = ring.map(p => p[1]);

    const minx = Math.min(...xs);
    const maxx = Math.max(...xs);
    const miny = Math.min(...ys);
    const maxy = Math.max(...ys);

    for (const n of [16, 32, 64, 96]) {
      for (let iy = 1; iy < n; iy++) {
        const y =
          miny + ((maxy - miny) * iy) / n;

        for (let ix = 1; ix < n; ix++) {
          const x =
            minx + ((maxx - minx) * ix) / n;

          if (!contains(target, x, y)) continue;

          const hits = gwb.filter(
            f =>
              codeOf(f).startsWith("BG1") &&
              contains(f, x, y)
          );

          const candidate = {
            lat: y,
            lng: x,
            hits: hits.map(codeOf),
          };

          if (candidate.hits.length === 1) {
            return candidate;
          }

          if (
            !best ||
            candidate.hits.length < best.hits.length
          ) {
            best = candidate;
          }
        }
      }
    }
  }

  return best;
}

function expectedClass(profile) {
  const name =
    String(profile.name || "").toLowerCase();

  const typ = profile.typology || {};
  const det = profile.detailed || {};

  const collector =
    String(
      typ.collector_type ||
      det.collector_type ||
      ""
    ).toLowerCase();

  if (name.includes("\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432")) {
    return "mixed-karst-pore";
  }

  if (
    collector.includes("\u043a\u0430\u0440\u0441\u0442") ||
    name.includes("\u043a\u0430\u0440\u0441\u0442")
  ) {
    return "karst";
  }

  if (
    collector.includes("\u043f\u043e\u0440\u043e\u0432") ||
    name.includes("\u043f\u043e\u0440\u043e\u0432")
  ) {
    return "pore";
  }

  return "other";
}

function safeName(s) {
  return String(s)
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .slice(0, 100);
}

async function visibleText(page) {
  return await page.locator("body").innerText();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser =
    await chromium.launch({ headless: true });

  const context =
    await browser.newContext({
      viewport: {
        width: 1440,
        height: 1200,
      },
    });

  const results = [];

  const bg1Profiles =
    profiles.filter(
      p =>
        String(p.code || "")
          .toUpperCase()
          .startsWith("BG1")
    );

  console.log("======================================");
  console.log("BG1 FULL BROWSER QA");
  console.log("PROFILES:", bg1Profiles.length);
  console.log("======================================");

  for (let index = 0; index < bg1Profiles.length; index++) {
    const profile = bg1Profiles[index];

    const code =
      String(profile.code || "").trim();

    const name =
      String(profile.name || "").trim();

    const feature =
      gwb.find(f => codeOf(f) === code.toUpperCase());

    if (!feature) {
      results.push({
        code,
        status: "FAIL",
        reason: "NO POLYGON",
      });

      console.log(
        "FAIL",
        index + 1,
        "/",
        bg1Profiles.length,
        code,
        "| NO POLYGON"
      );

      continue;
    }

    const point = findControlPoint(feature);

    if (!point) {
      results.push({
        code,
        status: "FAIL",
        reason: "NO INTERNAL POINT",
      });

      console.log(
        "FAIL",
        index + 1,
        "/",
        bg1Profiles.length,
        code,
        "| NO INTERNAL POINT"
      );

      continue;
    }

    const exclusive =
      point.hits.length === 1 &&
      point.hits[0] === code.toUpperCase();

    if (!exclusive) {
      results.push({
        code,
        status: "WARN",
        reason: "NO EXCLUSIVE CONTROL POINT",
        point,
      });

      console.log(
        "WARN",
        index + 1,
        "/",
        bg1Profiles.length,
        code,
        "| overlap:",
        point.hits.join(",")
      );

      continue;
    }

    const page = await context.newPage();

    const runtimeErrors = [];

    page.on(
      "pageerror",
      error =>
        runtimeErrors.push(
          "PAGEERROR: " + error.message
        )
    );

    page.on(
      "console",
      msg => {
        if (msg.type() === "error") {
          runtimeErrors.push(
            "CONSOLE: " + msg.text()
          );
        }
      }
    );

    page.on(
      "response",
      response => {
        if (response.status() >= 500) {
          runtimeErrors.push(
            "HTTP " +
              response.status() +
              ": " +
              response.url()
          );
        }
      }
    );

    let status = "PASS";
    const failures = [];

    const lat = point.lat.toFixed(8);
    const lng = point.lng.toFixed(8);

    try {
      const proUrl =
        `${BASE}/pro?lat=${lat}&lng=${lng}`;

      await page.goto(proUrl, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      const pro = await visibleText(page);

      if (!pro.includes(code)) {
        failures.push("PRO MISSING CODE");
      }

      if (!pro.includes(name)) {
        failures.push("PRO MISSING NAME");
      }

      const drillerUrl =
        `${BASE}/geology/report?lat=${lat}&lng=${lng}`;

      await page.goto(drillerUrl, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      const driller = await visibleText(page);

      if (!driller.includes(name)) {
        failures.push("DRILLER MISSING NAME");
      }

      const lithology =
        String(
          profile.detailed?.lithology || ""
        ).trim();

      if (
        lithology &&
        !normalizeText(driller).includes(
          normalizeText(lithology)
        )
      ) {
        failures.push(
          "DRILLER MISSING OFFICIAL LITHOLOGY"
        );
      }

      const cls = expectedClass(profile);

      if (
        cls === "mixed-karst-pore" &&
        !driller.includes(
          "\u0421\u043c\u0435\u0441\u0435\u043d\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432\u0430"
        )
      ) {
        failures.push(
          "WRONG MIXED KARST-PORE INTERPRETATION"
        );
      }

      if (
        cls === "karst" &&
        !driller.includes(
          "\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430"
        )
      ) {
        failures.push(
          "WRONG KARST INTERPRETATION"
        );
      }

      if (
        cls === "pore" &&
        driller.includes(
          "\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430"
        )
      ) {
        failures.push(
          "PORE PROFILE MISCLASSIFIED AS KARST"
        );
      }

      if (runtimeErrors.length) {
        failures.push(
          "RUNTIME ERRORS: " +
            runtimeErrors.length
        );
      }

      if (failures.length) {
        status = "FAIL";

        const shot = path.join(
          OUT_DIR,
          safeName(code) + ".png"
        );

        await page.screenshot({
          path: shot,
          fullPage: true,
        });
      }
    } catch (error) {
      status = "FAIL";
      failures.push(
        "EXCEPTION: " + error.message
      );
    }

    results.push({
      code,
      name,
      status,
      classification: expectedClass(profile),
      point,
      failures,
      runtimeErrors,
    });

    console.log(
      status,
      index + 1,
      "/",
      bg1Profiles.length,
      code,
      "|",
      failures.length
        ? failures.join("; ")
        : "OK"
    );

    await page.close();
  }

  await browser.close();

  const counts = {
    PASS:
      results.filter(r => r.status === "PASS").length,
    WARN:
      results.filter(r => r.status === "WARN").length,
    FAIL:
      results.filter(r => r.status === "FAIL").length,
  };

  console.log("");
  console.log("======================================");
  console.log("BG1 QA SUMMARY");
  console.log("TOTAL:", results.length);
  console.log("PASS :", counts.PASS);
  console.log("WARN :", counts.WARN);
  console.log("FAIL :", counts.FAIL);
  console.log("======================================");

  const reportPath =
    path.join(ROOT, "qa", "bg1-browser-report.json");

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),
        counts,
        results,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("REPORT:", reportPath);

  if (counts.FAIL > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error("QA FATAL:", error);
  process.exit(2);
});
