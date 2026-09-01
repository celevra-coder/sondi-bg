const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:3000";

const report = JSON.parse(
  fs.readFileSync("qa/bg3-browser-report.json", "utf8")
);

const rawProfiles = JSON.parse(
  fs.readFileSync(
    "public/geology-map/data/bd_ibr_section4_pro_profiles.json",
    "utf8"
  )
);

const profiles =
  Array.isArray(rawProfiles)
    ? rawProfiles
    : rawProfiles.profiles ||
      rawProfiles.records ||
      rawProfiles.items ||
      rawProfiles.data ||
      [];

const geologyRaw = JSON.parse(
  fs.readFileSync(
    "public/geology-map/data/groundwater_geology_profiles.json",
    "utf8"
  )
);

const geologyProfiles =
  Array.isArray(geologyRaw)
    ? geologyRaw
    : geologyRaw.profiles ||
      geologyRaw.records ||
      geologyRaw.items ||
      geologyRaw.data ||
      [];

function norm(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*,\s*/g, ",")
    .trim()
    .toLowerCase();
}

(async () => {
  const warnings = report.results.filter(
    r => r.status === "WARN"
  );

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });

  const results = [];

  console.log("======================================");
  console.log("BG3 OVERLAP QA");
  console.log("TARGETS:", warnings.length);
  console.log("======================================");

  for (const item of warnings) {
    const code = item.code;

    const profile = profiles.find(
      p =>
        String(p.code || "")
          .trim()
          .toUpperCase() === code.toUpperCase()
    );

    const failures = [];
    const runtimeErrors = [];

    if (!profile) {
      results.push({
        code,
        status: "FAIL",
        failures: ["PROFILE NOT FOUND"]
      });

      console.log(
        "FAIL |",
        code,
        "| PROFILE NOT FOUND"
      );

      continue;
    }

    const hits = item.point?.hits || [];

    const lat =
      Number(item.point.lat).toFixed(8);

    const lng =
      Number(item.point.lng).toFixed(8);

    const params =
      `lat=${lat}` +
      `&lng=${lng}` +
      `&gwb=${encodeURIComponent(code)}` +
      `&gwbs=${encodeURIComponent(hits.join(","))}`;

    const page =
      await context.newPage();

    page.on("pageerror", e => {
      runtimeErrors.push(
        "PAGEERROR: " + e.message
      );
    });

    page.on("response", r => {
      if (r.status() >= 500) {
        runtimeErrors.push(
          `HTTP ${r.status()}: ${r.url()}`
        );
      }
    });

    try {
      await page.goto(
        `${BASE}/pro?${params}`,
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

      if (
        !norm(pro).includes(
          norm(profile.name)
        )
      ) {
        failures.push(
          "PRO MISSING PRIMARY NAME"
        );
      }

      for (const hit of hits) {
        if (!pro.includes(hit)) {
          failures.push(
            "PRO MISSING INTERSECTING GWB: " +
            hit
          );
        }
      }

      await page.goto(
        `${BASE}/geology/report?${params}`,
        {
          waitUntil: "networkidle",
          timeout: 60000
        }
      );

      const driller =
        await page.locator("body").innerText();

      const geologyProfile = geologyProfiles.find(
        p =>
          String(p.code || "")
            .trim()
            .toUpperCase() === code.toUpperCase()
      );

      if (!geologyProfile) {
        failures.push(
          "DRILLER PRIMARY GEOLOGY PROFILE NOT FOUND"
        );
      } else {
        const waterType =
          String(geologyProfile.water_type || "").trim();

        const horizon =
          String(
            geologyProfile.hydrogeological_horizon || ""
          ).trim();

        if (
          waterType &&
          !norm(driller).includes(norm(waterType))
        ) {
          failures.push(
            "DRILLER WRONG/MISSING PRIMARY WATER TYPE"
          );
        }

        if (
          horizon &&
          !norm(driller).includes(norm(horizon))
        ) {
          failures.push(
            "DRILLER WRONG/MISSING PRIMARY HORIZON"
          );
        }
      }

      if (runtimeErrors.length) {
        failures.push(
          "RUNTIME ERRORS: " +
          runtimeErrors.length
        );
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
      name: profile.name,
      status,
      hits,
      point: { lat, lng },
      failures,
      runtimeErrors
    });

    console.log(
      status,
      "|",
      code,
      "|",
      hits.join(", "),
      "|",
      failures.length
        ? failures.join("; ")
        : "PRIMARY OK"
    );

    await page.close();
  }

  await browser.close();

  const pass =
    results.filter(
      r => r.status === "PASS"
    ).length;

  const fail =
    results.filter(
      r => r.status === "FAIL"
    ).length;

  console.log("");
  console.log("======================================");
  console.log("BG3 OVERLAP QA SUMMARY");
  console.log("TOTAL:", results.length);
  console.log("PASS :", pass);
  console.log("FAIL :", fail);
  console.log("======================================");

  fs.writeFileSync(
    "qa/bg3-overlap-report.json",
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),
        pass,
        fail,
        results
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "REPORT:",
    path.resolve(
      "qa/bg3-overlap-report.json"
    )
  );

  if (fail > 0) {
    process.exitCode = 1;
  }
})();
