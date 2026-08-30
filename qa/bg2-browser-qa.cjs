const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT = process.cwd();
const BASE = "http://localhost:3000";

const PROFILE_FILE = path.join(
  ROOT,
  "public/geology-map/data/bd_bs_section1_profiles.json"
);

const GWB_FILE = path.join(
  ROOT,
  "public/geology-map/data/bd_bs_groundwater_bodies.geojson"
);

const OUT_DIR = path.join(
  ROOT,
  "qa",
  "bg2-browser-failures"
);

const profiles =
  JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8")).profiles || [];

const gwb =
  JSON.parse(fs.readFileSync(GWB_FILE, "utf8")).features || [];

function norm(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim()
    .toLowerCase();
}

function codeOf(f) {
  const p = f.properties || {};

  return String(
    p.gwb_code ||
    p.localId ||
    p.cod ||
    ""
  )
    .trim()
    .toUpperCase();
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

  const polys =
    g.type === "Polygon"
      ? [g.coordinates]
      : g.type === "MultiPolygon"
        ? g.coordinates
        : [];

  for (const poly of polys) {
    if (!poly?.length) continue;

    if (!pointInRing(x, y, poly[0])) {
      continue;
    }

    const inHole =
      poly
        .slice(1)
        .some(h => pointInRing(x, y, h));

    if (!inHole) return true;
  }

  return false;
}

function findControlPoint(target) {
  const g = target.geometry || {};

  const polys =
    g.type === "Polygon"
      ? [g.coordinates]
      : g.type === "MultiPolygon"
        ? g.coordinates
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

          const hits = gwb
            .filter(
              f =>
                codeOf(f).startsWith("BG2") &&
                contains(f, x, y)
            )
            .map(codeOf);

          const candidate = {
            lat: y,
            lng: x,
            hits,
          };

          if (
            hits.length === 1 &&
            hits[0] === codeOf(target)
          ) {
            return candidate;
          }

          if (
            !best ||
            hits.length < best.hits.length
          ) {
            best = candidate;
          }
        }
      }
    }
  }

  return best;
}

function safeName(s) {
  return String(s)
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .slice(0, 100);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const bg2Profiles =
    profiles.filter(
      p =>
        String(p.code || "")
          .toUpperCase()
          .startsWith("BG2")
    );

  const browser =
    await chromium.launch({ headless: true });

  const context =
    await browser.newContext({
      viewport: {
        width: 1440,
        height: 1200
      }
    });

  const results = [];

  console.log("======================================");
  console.log("BG2 FULL BROWSER QA");
  console.log("PROFILES:", bg2Profiles.length);
  console.log("======================================");

  for (
    let index = 0;
    index < bg2Profiles.length;
    index++
  ) {
    const profile = bg2Profiles[index];

    const code =
      String(profile.code || "").trim();

    const name =
      String(profile.name || "").trim();

    const feature =
      gwb.find(
        f => codeOf(f) === code.toUpperCase()
      );

    if (!feature) {
      results.push({
        code,
        name,
        status: "FAIL",
        failures: ["NO BG2 POLYGON"]
      });

      console.log(
        "FAIL",
        index + 1,
        "/",
        bg2Profiles.length,
        code,
        "| NO BG2 POLYGON"
      );

      continue;
    }

    const point =
      findControlPoint(feature);

    if (!point) {
      results.push({
        code,
        name,
        status: "FAIL",
        failures: ["NO INTERNAL POINT"]
      });

      console.log(
        "FAIL",
        index + 1,
        "/",
        bg2Profiles.length,
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
        name,
        status: "WARN",
        reason: "NO EXCLUSIVE CONTROL POINT",
        point
      });

      console.log(
        "WARN",
        index + 1,
        "/",
        bg2Profiles.length,
        code,
        "| overlap:",
        point.hits.join(",")
      );

      continue;
    }

    const page =
      await context.newPage();

    const failures = [];
    const runtimeErrors = [];

    page.on("pageerror", e => {
      runtimeErrors.push(
        "PAGEERROR: " + e.message
      );
    });

    page.on("response", r => {
      if (r.status() >= 400) {
        runtimeErrors.push(
          `HTTP ${r.status()} | ${r.request().resourceType()} | ${r.url()}`
        );
      }
    });

    const lat =
      point.lat.toFixed(8);

    const lng =
      point.lng.toFixed(8);

    try {
      await page.goto(
        `${BASE}/pro?lat=${lat}&lng=${lng}&gwb=${encodeURIComponent(code)}`,
        {
          waitUntil: "networkidle",
          timeout: 60000
        }
      );

      const pro =
        await page.locator("body").innerText();

      if (!pro.includes(code)) {
        failures.push(
          "PRO MISSING PRIMARY CODE"
        );
      }

      if (!norm(pro).includes(norm(name))) {
        failures.push(
          "PRO MISSING PRIMARY NAME"
        );
      }

      await page.goto(
        `${BASE}/geology/report?lat=${lat}&lng=${lng}&gwb=${encodeURIComponent(code)}`,
        {
          waitUntil: "networkidle",
          timeout: 60000
        }
      );

      const driller =
        await page.locator("body").innerText();

      if (!norm(driller).includes(norm(name))) {
        failures.push(
          "DRILLER MISSING PRIMARY NAME"
        );
      }

      const lithology =
        String(
          profile?.detailed?.lithology || ""
        ).trim();

      if (
        lithology &&
        !norm(driller).includes(norm(lithology))
      ) {
        failures.push(
          "DRILLER MISSING OFFICIAL LITHOLOGY"
        );
      }

      const horizon =
        String(
          profile?.typology?.vertical_horizon ||
          profile?.initial?.vertical_horizon ||
          ""
        ).trim();

      if (
        horizon &&
        !norm(driller).includes(norm(horizon))
      ) {
        failures.push(
          "DRILLER MISSING OFFICIAL HORIZON"
        );
      }

      if (runtimeErrors.length) {
        failures.push(
          "RUNTIME ERRORS: " +
          runtimeErrors.length
        );
      }

      if (failures.length) {
        await page.screenshot({
          path: path.join(
            OUT_DIR,
            safeName(code) + ".png"
          ),
          fullPage: true
        });
      }

    } catch (e) {
      failures.push(
        "EXCEPTION: " + e.message
      );
    }

    const status =
      failures.length
        ? "FAIL"
        : "PASS";

    results.push({
      code,
      name,
      status,
      point,
      failures,
      runtimeErrors
    });

    console.log(
      status,
      index + 1,
      "/",
      bg2Profiles.length,
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
      results.filter(
        r => r.status === "PASS"
      ).length,

    WARN:
      results.filter(
        r => r.status === "WARN"
      ).length,

    FAIL:
      results.filter(
        r => r.status === "FAIL"
      ).length
  };

  console.log("");
  console.log("======================================");
  console.log("BG2 QA SUMMARY");
  console.log("TOTAL:", results.length);
  console.log("PASS :", counts.PASS);
  console.log("WARN :", counts.WARN);
  console.log("FAIL :", counts.FAIL);
  console.log("======================================");

  const reportPath =
    path.join(
      ROOT,
      "qa",
      "bg2-browser-report.json"
    );

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),
        counts,
        results
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "REPORT:",
    reportPath
  );

  if (counts.FAIL > 0) {
    process.exitCode = 1;
  }
})();
