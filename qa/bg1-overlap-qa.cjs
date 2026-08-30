const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:3000";

const report = JSON.parse(
  fs.readFileSync("qa/bg1-browser-report.json", "utf8")
);

const profiles = JSON.parse(
  fs.readFileSync(
    "public/geology-map/data/bd_danube_section1_profiles.json",
    "utf8"
  )
).profiles || [];

function norm(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function expectedClass(profile) {
  const name = norm(profile?.name);

  const collector = norm(
    profile?.typology?.collector_type ||
    profile?.detailed?.collector_type
  );

  if (name.includes("\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432")) {
    return "mixed";
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
  console.log("BG1 OVERLAP QA");
  console.log("TARGETS:", warnings.length);
  console.log("======================================");

  for (const item of warnings) {
    const code = item.code;

    const profile = profiles.find(
      p => String(p.code).toUpperCase() === code.toUpperCase()
    );

    const failures = [];
    const runtimeErrors = [];

    if (!profile) {
      results.push({
        code,
        status: "FAIL",
        failures: ["PROFILE NOT FOUND"]
      });

      console.log("FAIL |", code, "| PROFILE NOT FOUND");
      continue;
    }

    const hits = item.point?.hits || [];
    const lat = Number(item.point.lat).toFixed(8);
    const lng = Number(item.point.lng).toFixed(8);

    const params =
      `lat=${lat}` +
      `&lng=${lng}` +
      `&gwb=${encodeURIComponent(code)}` +
      `&gwbs=${encodeURIComponent(hits.join(","))}`;

    const page = await context.newPage();

    page.on("pageerror", e => {
      runtimeErrors.push("PAGEERROR: " + e.message);
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

      const pro = await page.locator("body").innerText();

      if (!pro.includes(code)) {
        failures.push("PRO MISSING PRIMARY CODE");
      }

      if (!norm(pro).includes(norm(profile.name))) {
        failures.push("PRO MISSING PRIMARY NAME");
      }

      for (const hit of hits) {
        if (!pro.includes(hit)) {
          failures.push(
            "PRO MISSING INTERSECTING GWB: " + hit
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

      if (!norm(driller).includes(norm(profile.name))) {
        failures.push("DRILLER WRONG/MISSING PRIMARY NAME");
      }

      const lith =
        profile?.detailed?.lithology || "";

      if (
        lith &&
        !norm(driller).includes(norm(lith))
      ) {
        failures.push(
          "DRILLER WRONG/MISSING PRIMARY LITHOLOGY"
        );
      }

      const cls = expectedClass(profile);

      if (
        cls === "mixed" &&
        !norm(driller).includes(
          norm("\u0421\u043c\u0435\u0441\u0435\u043d\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432\u0430")
        )
      ) {
        failures.push("WRONG MIXED INTERPRETATION");
      }

      if (
        cls === "karst" &&
        !norm(driller).includes(
          norm("\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430")
        )
      ) {
        failures.push("WRONG KARST INTERPRETATION");
      }

      if (
        cls === "pore" &&
        norm(driller).includes(
          norm("\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430")
        )
      ) {
        failures.push("PORE PRIMARY MISCLASSIFIED AS KARST");
      }

      if (runtimeErrors.length) {
        failures.push(
          "RUNTIME ERRORS: " + runtimeErrors.length
        );
      }

    } catch (e) {
      failures.push("EXCEPTION: " + e.message);
    }

    const status =
      failures.length ? "FAIL" : "PASS";

    results.push({
      code,
      name: profile.name,
      status,
      hits,
      point: { lat, lng },
      classification: expectedClass(profile),
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
    results.filter(r => r.status === "PASS").length;

  const fail =
    results.filter(r => r.status === "FAIL").length;

  console.log("");
  console.log("======================================");
  console.log("BG1 OVERLAP QA SUMMARY");
  console.log("TOTAL:", results.length);
  console.log("PASS :", pass);
  console.log("FAIL :", fail);
  console.log("======================================");

  fs.writeFileSync(
    "qa/bg1-overlap-report.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
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
    path.resolve("qa/bg1-overlap-report.json")
  );

  if (fail > 0) {
    process.exitCode = 1;
  }
})();
